import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import GlueWeb from '@glue42/web';
import GlueDesktop from '@glue42/desktop';
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
      holdInit: true,
      web: {
        factory: GlueWeb
      },
      desktop: {
        factory: GlueDesktop,
        config: {
          appManager: 'full'
        }
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
