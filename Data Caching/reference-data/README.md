#ABOUT
Module / Service for connecting to ONTrack's Central Agency Reference Data Service

#SETUP
-------------------------
**STEP 0 - Dependencies**
-------------------------

Copy/Paste .npmrc file from the ng-on-global-lib project.
Please be sure that
-you have access to OnTrack-SHARED
-auth token is not expired (check content of .npmrc file)

Run: npm install ng-on-service-connectors@latest


-------------------------
**STEP 1 - Import ReferenceDataModule**
-------------------------

In app.module.ts (or module of your choosing), add import for "ReferenceDataModule" 

import { ReferenceDataModule } from 'ng-on-service-connectors';

import: [
    ReferenceDataModule
]


-------------------------
**STEP 2 - Configure the Import**
-------------------------

In order to use the ReferenceDataService, you will need to call the forRoot() function when importing the module

The forRoot function takes the following parameter:    
```
 { 
     apiUrl: string, // The URL for the api
     apiVersion?: number // Optional parameter for apiVersion, defaults to v2
}
 ```

In `app.module.ts` the import will look like this: 

```
import: [
    ReferenceDataModule.forRoot({
        apiUrl: environment.referenceDataServiceURL
    })
]
```

-------------------------
**STEP 3 - Inject the ReferenceDataService**
-------------------------

In any of the components (under the module where you imported the ReferenceDataModule) you may now inject the **ReferenceDataService**.

**_Note: There is no need to add the service in the providers, the module handles the providing of the service_**

```
import { ReferenceDataService } from "ng-on-service-connectors";

export class AppComponent{
    constructor(private referenceDataService: ReferenceDataService){



    }
}
```

-------------------------
**STEP 4 - Using the ReferenceDataService**
-------------------------
If all was properly configured, you may now use the ReferenceDataService

```
export class AppComponent{
    someListObservable: Observable<any>;

    constructor(private referenceDataService: ReferenceDataService){
        this.someListObservable = this.getDropdownListItems(listName)
    }

    getDropdownListItems(listName){
       return this.referenceDataService.getDropDownListItems(listName);
    }
}
```



