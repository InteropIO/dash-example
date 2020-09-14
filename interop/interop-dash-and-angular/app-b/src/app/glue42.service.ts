import { Injectable } from '@angular/core';
import { Glue42Store } from '@glue42/ng';
import { Glue42Web } from '@glue42/web';

@Injectable()
export class Glue42Service {
  constructor(private readonly glueStore: Glue42Store) { }

  public get glueAvailable(): boolean {
    return !this.glueStore.initError;
  }

  public registerMethod(
    methodDefinition: Glue42Web.Interop.MethodDefinition,
    callback: (args: any, caller: any) => void | any
  ): Promise<void> {
    if (!this.glueAvailable) {
      return Promise.reject('Glue42 was not initialized.');
    }

    return this.glueStore.glue.interop.register(methodDefinition, callback);
  }
}
