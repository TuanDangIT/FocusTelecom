import { DoBootstrap, Injector, NgModule, ProviderToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { bootstrapCrtModule, CrtModule } from '@creatio-devkit/common';
import { WebphoneComponent } from './view-elements/webphone/webphone.component';
import { createCustomElement } from '@angular/elements';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@CrtModule({
  /* Specify that InputComponent is a view element. */
  viewElements: [WebphoneComponent],
})
@NgModule({
  declarations: [WebphoneComponent],
  imports: [BrowserModule, HttpClientModule, CommonModule],
  providers: [],
})
export class AppModule implements DoBootstrap {
  constructor(private _injector: Injector) {}

  ngDoBootstrap(): void {
    const element = createCustomElement(WebphoneComponent, {
      injector: this._injector,
    });

    customElements.define('dbx-webphone', element);

    bootstrapCrtModule('focus_telecom_webphone', AppModule, {
      resolveDependency: (token) =>
        this._injector.get(<ProviderToken<unknown>>token),
    });
  }
}
