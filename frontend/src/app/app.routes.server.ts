import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
	{ path: '', renderMode: RenderMode.Server },
	{ path: 'posts', renderMode: RenderMode.Server },
	{ path: 'login', renderMode: RenderMode.Server },
	{ path: 'submit', renderMode: RenderMode.Server },
	{ path: 'admin', renderMode: RenderMode.Server },
	{ path: 'post/:id', renderMode: RenderMode.Server },
	{ path: '**', renderMode: RenderMode.Server },
];
