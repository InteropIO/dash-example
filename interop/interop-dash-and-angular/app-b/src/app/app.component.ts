import { Component, NgZone, OnInit } from '@angular/core';
import { Glue42Web } from '@glue42/web';
import { Subject } from 'rxjs';
import { Glue42Service } from './glue42.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public appName;
  public message = '';

  constructor(public readonly glueService: Glue42Service, private readonly zone: NgZone) { }

  public ngOnInit(): void {
    if (!this.glueService.glueAvailable) {
      // Тhere has been an error during the Glue42 initialization.
      return;
    }

    this.registerSendMessage();
  }

  private registerSendMessage(): void {
    const methodDefinition: Glue42Web.Interop.MethodDefinition = {
      name: 'SendMessage'
    };
    const invocationHandler = this.sendMessageInvocationHandler.bind(this);

    this.glueService.registerMethod(methodDefinition, invocationHandler)
      .then(() => console.log(`Method ${methodDefinition.name} registered.`), () => console.warn(`Failed to register method ${methodDefinition.name}`));
  }

  private sendMessageInvocationHandler({ message }): void {
    this.zone.run(() => {
      this.message = message;
    });
  }
}
