import { Injectable } from '@angular/core';
import { Glue42Store } from '@glue42/ng';

@Injectable()
export class Glue42Service {
  constructor(private readonly glueStore: Glue42Store) { }

  public get glueAvailable(): boolean {
    return !this.glueStore.initError;
  }

  public subscribeToSelectedClient(handler: ({ clientId }: { clientId: string }) => void): Promise<() => void> {
    if (typeof handler !== 'function') {
      return Promise.reject('"handler" must be a function');
    }

    if (!this.glueAvailable) {
      return Promise.reject('Glue42 was not initialized.');
    }

    this.glueStore.glue.contexts.subscribe('SelectedClient', handler);
  }
}
