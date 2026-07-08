# Stage 1: Build with JDK 25 + Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Install Maven manually (official Maven image not available for JDK 25 yet)
RUN apt update && apt install -y maven && rm -rf /var/lib/apt/lists/*

COPY pom.xml .
# Download dependencies first (cache layer)
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the app with JRE 25
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
