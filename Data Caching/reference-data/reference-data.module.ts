import { APIConnectorServiceConfig } from './../api-connector-base/base-api-connector';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferenceDataService, ReferenceDataConfigService} from './reference-data.service';
import { HttpClientModule } from '@angular/common/http';

// Setting up a module with a forRoot
//https://medium.com/@michelestieven/angular-writing-configurable-modules-69e6ea23ea42 


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [],
  exports: [],
}
)
export class ReferenceDataModule {

  static forRoot(config: APIConnectorServiceConfig): ModuleWithProviders {
    return {
      ngModule: ReferenceDataModule,
      providers: [
        ReferenceDataService,
        {
          provide: ReferenceDataConfigService,
          useValue: config
        }
      ],

    }
  }
}

