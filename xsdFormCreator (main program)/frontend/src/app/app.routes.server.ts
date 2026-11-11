import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'formeditor/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'filledxml/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'fillform/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
