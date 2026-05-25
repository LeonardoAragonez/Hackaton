import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { rethrowBootstrapFailure } from '@tractor-store/shared-catalog';

bootstrapApplication(AppComponent, appConfig).catch(rethrowBootstrapFailure);
