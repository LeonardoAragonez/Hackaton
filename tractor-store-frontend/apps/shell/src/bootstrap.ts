import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

async function prepare(): Promise<void> {
  if (environment.useMsw) {
    const { startMockWorker } = await import('@tractor-store/shared-catalog');
    await startMockWorker();
  }
}

prepare()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch(console.error);
