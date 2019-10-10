import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';
import { isNotEmpty } from '../utils/data-validation.util';

/**
 * @ignore
 */
const CACHE_SIZE = 1;

export class APIConnectorServiceConfig {
    apiUrl: string;
    apiVersion?: number = 1;
}


/**
 * Extendable class that allows for the caching of data from API calls
 * 
 */
export abstract class BaseAPIConnector {
    /**
  * @ignore
  * @description Caching map for Observables 
  */
    private dataObservables: Map<string, Observable<any>> = new Map();

    /**
     * @ignore
     */
    protected apiUrl: string;
    private http: HttpClient;

    constructor(config: APIConnectorServiceConfig, httpClient: HttpClient) {
        this.http = httpClient;

        // Verifying that config was set
        if (config != null && config !== undefined) {
            // Setting URL for API
            this.setApiURL(config.apiUrl, config.apiVersion);
        } else {
            // Throwing error if config not passed to the Service
            throw ("You must declare the API URL using the forRoot() function when using the ReferenceDataModule.");
        }
    }


    /**
     * @ignore
     */
    private setApiURL(url: string, version: number) {
        this.apiUrl = `${url}`;
        // If version is not empty
        if (isNotEmpty(version)) {
            this.apiUrl += `/v${version}`;
        }
    }

    /**
     * 
     * @param endpoint The endpoint for the get request
     * @param cacheKey A unique identifier for the cached data
     * @param noCache true = forces new data, false = retrieves from cache if cache exists. Default value is false.
     */
    protected makeGetRequestWithCaching(endpoint: string, cacheKey: string, noCache: boolean): Observable<any> {

        if (!this.dataObservables.has(cacheKey) || noCache === true) {
            let observable = this.http.get(endpoint).pipe(
                // Allows for the reuse of the observable (to prevent multiple calls)
                shareReplay(CACHE_SIZE)
            );

            // Storing current observable in the observable mapping
            this.dataObservables.set(cacheKey, observable);
        }

        // Returning the stored observable for the specified cacheKey
        return this.dataObservables.get(cacheKey);
    }

    /**
     * 
     * @param endpoint The endpoint for the POST request
     * @param body The body for the POST request
     * @param cacheKey A unique identifier for the cached data
     * @param noCache true = forces new data, false = retrieves from cache if cache exists. Default value is false.
     */
    protected makePostRequestWithCaching(endpoint: string, body: any, cacheKey: string, noCache: boolean): Observable<any> {

        if (!this.dataObservables.has(cacheKey) || noCache === true) {
            let observable = this.http.post(endpoint, body).pipe(
                // Allows for the reuse of the observable (to prevent multiple calls)
                shareReplay(CACHE_SIZE)
            );

            // Storing current observable in the observable mapping
            this.dataObservables.set(cacheKey, observable);
        }

        // Returning the stored observable for the specified cacheKey
        return this.dataObservables.get(cacheKey);
    }
}