# The BoyCott List

A web application to track companies engaging in harmful practices.  
Users can browse, submit, and comment on boycott targets.  
The admin(me) can approve submissions and manage content.

**Tech Stack:**

- **Backend:** Spring Boot 3.4 (Java 21) + Spring Security + JWT + MongoDB
- **Frontend:** Angular 19+ with Server‑Side Rendering (SSR) and an Express proxy
- **Database:** MongoDB 7.0
- **Deployment:** Docker Compose on a Proxmox LXC container

---
## Deployment steps

### Local tests

Like always to test the frontend locally :: `ng serve` is all it takes.
Usually to run the backend locally I would run :: `mvn clean spring-boot:run`but this time I create a docker image that I run locally.

`docker-compose-test.yml` :
```bash 
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    networks:
      - testnet
  backend:
    image: boycott-list-backend:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/clientdb
    networks:
      - testnet
networks:
  testnet:
    driver: bridge
```

Then in the /backend build the image :`docker build --no-cache -t boycott-list-backend:latest .`
Afterwards, start the service :: `docker-compose -f docker-compose-test.yml up -d` (to stop it : `docker-compose -f docker-compose-test.yml down`)

Then, because the frontend is running locally, just checkout `http://localhost:4200/`


### For Proxmox deployment

There are a couple of repeated steps when deploying from the proxmox server and updating the webapp. 

### ssh into Proxmox
It is easily to create the front and backend docker images on the local machine and sending them through `ssh` to proxmox.

Creating the images ::

```bash
# Build backend image
cd backend
docker build -t boycott-list-backend:latest .

# Build frontend image
cd ../frontend
docker build -t boycott-list-frontend:latest .
```

Save the images in .tar files :
```bash
# in backend
docker save boycott-list-backend:latest -o backend.tar
# in frontend
docker save boycott-list-frontend:latest -o frontend.tar
```

Prepare to send the tar files to the ssh host, (NOT IN THE SSH TERMINAL, IN A REGULAR TERMINAL) :
```bash
# in backend
scp backend.tar root@192.168.1.55:/opt/boycott-list/
# login as root with the password
#in frontend
scp frontend.tar root@192.168.1.55:/opt/boycott-list/
# login as root with the password
```

I usually open on terminal for the frontend and another for the backend, to run the previous commands at once ::
frontend :
```bash
docker build -t boycott-list-frontend:latest . && docker save boycott-list-frontend:latest -o frontend.tar && scp frontend.tar root@192.168.1.55:/opt/boycott-list/
```
backend :
```bash
docker build -t boycott-list-backend:latest . && docker save boycott-list-backend:latest -o backend.tar && scp backend.tar root@192.168.1.55:/opt/boycott-list/
```

Copy the `docker-compose.yml` over to the host as well : `scp docker-compose.yml root@192.168.1.55:/opt/boycott-list/` 

In a terminal, making sure that the server is up and that the tailscale vpn is connected on the machine ::
```bash
ssh root@192.168.1.55
# login as root with the password
```

Even though the container exists on the proxmox server, and is visible on the proxmox browser, I cant directly send files to it. First I need to create a place to send the files on the ssh host, before sending it to the server itself. 
First create the `/opt/boycott-list` directory :: `mkdir -p /opt/boycott-list` (all while in the root ssh), this is where the machine will send the tar and docker-compose files.


On another terminal screen, open another ssh tunnel :: `ssh root@192.168.1.55`
List the LXC (linux containers) and find boycott-list (id 113) ::
```bash
root@dialloPavillion:/opt/boycott-list# pct list
VMID       Status     Lock         Name
100        running                 nginx-reverse-proxy
101        stopped    snapshot-delete immich-docker
107        stopped                 CT107
108        stopped    snapshot-delete vaultwarden
110        running                 Rex
111        stopped                 budget-manager
113        running                 boycott-list
200        running                 tailscale-vpn
301        running                 laSignare
999        stopped                 Template
```

Now is the time to sent the tar and docker compose files from the host to the LXC, now that we know the container id ::
Now send the files to the container :
```bash
pct push 113 /opt/boycott-list/backend.tar /opt/boycott-list/backend.tar
pct push 113 /opt/boycott-list/frontend.tar /opt/boycott-list/frontend.tar
pct push 113 /opt/boycott-list/docker-compose.yml /opt/boycott-list/docker-compose.yml
```
```bash
# all at once
pct push 113 /opt/boycott-list/backend.tar /opt/boycott-list/backend.tar && pct push 113 /opt/boycott-list/frontend.tar /opt/boycott-list/frontend.tar && pct push 113 /opt/boycott-list/docker-compose.yml /opt/boycott-list/docker-compose.yml
```
The first `/opt/boycott-list/docker-compose.yml` is the source on the host and the second is the destination in the LXC.

Then enter that container :: `pct enter 113`


Now in the LXC, laod the images and use them. ::
```bash
# check if there are images running
docker ps
# ensure the external network exists (if compose file uses it)
docker network create proxy-network
# load the images and create them and run them
docker load -i frontend.tar && docker-compose up -d frontend && docker load -i backend.tar && docker-compose up -d backend
# OR JUST :
docker-compose up -d
```

The app front and backend should be running without a hitch. But if problems arise, tear down the whole project and recreate the images ::
```bash
docker-compose down
docker load -i frontend.tar && docker-compose up -d frontend && docker load -i backend.tar && docker-compose up -d backend
```

Then view the app on :: 10.10.10.13:4200 (the LXC IP address)(if the cloudflare + nginx url isnt set up yet)

Security ::
- JWT stored in HttpOnly cookie – JavaScript cannot access the token, preventing XSS attacks.
- The cookie is set with SameSite=Lax and (when on HTTPS) Secure.
- All admin endpoints require ROLE_ADMIN and a valid JWT.
- Public endpoints are open.
- CSRF is disabled because the app uses stateless token authentication.
- Frontend uses a strict Content‑Security‑Policy header (including nonces).


## Troubleshooting

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Frontend build error: `getPrerenderParams is missing` | Angular tries to prerender dynamic route `/post/:id` | Already fixed in `app.routes.server.ts` – all routes use `RenderMode.Server`. |
| `403 Forbidden` on `/api/public/*` | Proxy or backend filter misconfigured | Check that `server.ts` has the proxy for `/api` targeting `http://backend:8080`. Ensure frontend is on `internal-app-network`. |
| `504 Gateway Timeout` on public API | Backend not reachable or slow response | Restart backend container. Test direct connectivity: `docker exec frontend_boycott_list wget -qO- http://backend:8080/api/public/posts`. |
| Login works but admin gets `403` | Cookie not sent (maybe `Secure` flag on HTTP) | Verify backend sets `Secure=false` for HTTP. Use browser DevTools to check cookie presence. |
| `docker-compose` `KeyError: 'ContainerConfig'` | Old docker-compose 1.29.2 bug | Run `docker-compose down && docker-compose up -d` to recreate containers from scratch. |
| Local Maven compilation error | JDK 25 vs Lombok | Ignore it. Build only via Docker, which uses JDK 21. |
| Can’t access `http://10.10.10.9:8080` from host | Containers are on isolated Docker network | Use iptables to forward ports, or access via the container’s IP on the Docker bridge (if on same host). For the LXC container, use `10.10.10.13:4200`. |

---


## URL SET UP WITH NGINX AND Cloudflare

### Adding a new secure reverse proxy
On the local machine (with tailscale active) terminal :
```bash
ssh connect : ssh -L 81:10.10.10.7:81 root@192.168.1.55

-- ---- -----
10.10.10.7:81 => login in browser
doctorabdou235@keemail.me //password in notes
```

Proxy Host set up - on website::

- Click the Add Proxy Host button on the right.
- Fill out the Details tab exactly like this:
- Domain Names: Enter a domain name : boycott-list.abdoudiallo.fr
- Scheme: http
- Forward Hostname / IP: 10.10.10.13 ==> the destination is going to be http://10.10.10.13:4200
- Forward Port: 4200
- toggle options then save
==> for future webapps just add a proxy host

### Adding url to Cloudflare 

Add the Subdomain to Cloudflare Zero Trust:
- Go to Cloudflare -> Zero Trust -> Networks -> Tunnels.
- Click on existing `Proxmox-Server` tunnel and hit EDIT.
- add route then Add published application
- add the subdomain name : boycott-list
- Domain: abdoudiallo.fr
- **Service:** `HTTP` -> `10.10.10.7:80` :: “http://10.10.10.7:80”
    - *(Crucial: Always point the tunnel to the Nginx Proxy Manager IP, NOT the new app's IP!)*

AFTER ALL THIS THE APP IS NOW ACCESSIBLE ON : [boycott-list.abdoudiallo.fr](https://boycott-list.abdoudiallo.fr/)