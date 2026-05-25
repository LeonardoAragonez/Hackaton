declare module 'mfe-explore/Routes' {
  import { Route } from '@angular/router';
  export const remoteRoutes: Route[];
}

declare module 'mfe-decide/Routes' {
  import { Route } from '@angular/router';
  export const remoteRoutes: Route[];
}

declare module 'mfe-checkout/Routes' {
  import { Route } from '@angular/router';
  export const remoteRoutes: Route[];
}

declare module 'mfe-checkout/MiniCart' {
  import { Type } from '@angular/core';
  export const MiniCartHostComponent: Type<unknown>;
}
