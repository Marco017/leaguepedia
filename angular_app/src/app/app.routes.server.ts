import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/edit/:id',
    renderMode: RenderMode.Client,
  },
  {
    // Dynamic param route: render on demand instead of prerendering.
    path: 'champions/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
