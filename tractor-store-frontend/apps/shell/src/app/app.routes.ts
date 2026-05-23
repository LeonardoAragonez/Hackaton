import { Route } from '@angular/router';
import { ShellLayoutComponent } from './shell-layout/shell-layout.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('mfe-explore/Routes').then((m) => m.remoteRoutes),
      },
      {
        path: 'products/:key',
        loadChildren: () => import('mfe-explore/Routes').then((m) => m.remoteRoutes),
      },
      {
        path: 'stores',
        loadChildren: () => import('mfe-explore/Routes').then((m) => m.remoteRoutes),
      },
      {
        path: 'product/:id',
        loadChildren: () => import('mfe-decide/Routes').then((m) => m.remoteRoutes),
      },
      {
        path: 'checkout',
        loadChildren: () => import('mfe-checkout/Routes').then((m) => m.remoteRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
