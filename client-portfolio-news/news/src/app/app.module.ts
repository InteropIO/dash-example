import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import GlueWeb from '@glue42/web';
import { Glue42Ng } from '@glue42/ng';
import { Glue42Service } from './glue.service';
import { DataService } from './data.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    Glue42Ng.forRoot({
      factory: GlueWeb,
      holdInit: true,
      config: {
        appManager: 'full',
        application: 'app-b'
      }
    })
  ],
  providers: [
    Glue42Service,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
