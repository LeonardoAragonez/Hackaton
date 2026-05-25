import { bootstrapApplication } from '@angular/platform-browser';
import { rethrowBootstrapFailure, startMockWorker } from '@tractor-store/shared-catalog';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

async function prepare(): Promise<void> {
  if (environment.useMsw) {
    await startMockWorker();
  }
}

prepare()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch(rethrowBootstrapFailure);
