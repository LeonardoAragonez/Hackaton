import { rethrowBootstrapFailure } from '@tractor-store/shared-catalog';

import('./bootstrap').catch(rethrowBootstrapFailure);
