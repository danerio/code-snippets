import { APIConnectorServiceConfig, BaseAPIConnector } from './../api-connector-base/base-api-connector';
/**
 * @author Danella Olsen
 * @description Service for connection to ONTrack Reference Data
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { findItemInListByProperty } from '../utils/search.util';


/*
 * Injection Token for the outside configuration of the service using the forRoot 
 * function in the ReferenceData module
 */
export const ReferenceDataConfigService = new InjectionToken<{
  apiUrl: string,
  apiVersion: number
}>("ReferenceDataConfigService");


@Injectable()
export class ReferenceDataService extends BaseAPIConnector {

  /**
   * @param config: {apiUrl: string}
   * @returns Instance of ReferenceDataService
   */
  constructor(@Inject(ReferenceDataConfigService) private config: APIConnectorServiceConfig, private httpClient: HttpClient) {
    super(config, httpClient);
  }


  /**
   * @param noCache Default value is false, if true, forces fetching of new data
   * @returns Observable<Array<{ name: string, id: string, readableName: string }>>, a list of ALL lists in ReferenceData with the name and ID
   */

  public getAllListDetails(noCache: boolean = false): Observable<Array<{ name: string, id: string, readableName: string }>> {
    let endpoint = this.apiUrl + "/DropDownList/GetAllNameID";

    // Cache key used in the 'dataObservables' map
    let cacheKey = "getAllNameID";

    return this.makeGetRequestWithCaching(endpoint, cacheKey, noCache).pipe(
      map(data => <Array<{ name: string, id: string, readableName: string }>>data)
    );
  }


  /**
   * 
   * @param id The id of the dropdown list
   * @param noCache true = forces new data, false = retrieves from cache if cache exists. Default value is false.
   */
  public getDropDownListById(id: string, noCache: boolean = false): Observable<{ applications: Array<string>, readableName: string, dataItems: Array<any>, id: string, name: string, version: string }> {
    if (id === null || id === undefined) {
      throw `Cannot fetch list with id value of "${id}"`;
    }
    let endpoint = this.apiUrl + `/DropDownList/${id}`;

    let cacheKey = `getDropDownListById-${id}`;

    return this.makeGetRequestWithCaching(endpoint, cacheKey, noCache).pipe(
      map(data => <{ applications: Array<string>, readableName: string, dataItems: Array<any>, id: string, name: string, version: string }>data)
    );

  }

  /**
   * 
   * @param id The id of the list you would like to delete.
   */
  public deleteDropDownListById(id: string): Observable<any> {
    if (id === null || id === undefined) {
      throw `Cannot delete list with if value of "${id}"`;
    }

    let endpoint = this.apiUrl + `/DropDownList/${id}`;
    return this.httpClient.delete(endpoint);

  }

  /**
   *
   * @param name the name of the dropdown list
   * @param language The language for the list. Default is English. Use Lanuage enum.
   * @param noCache true = forces new data, false = retrieves from cache if cache exists. Default value is false.
   * 
   * @description Returns a list of ReferenceDataItems for a specified list.
   */
  public getDropDownListItems(name: string, language: Language = Language.ENGLISH, noCache: boolean = false): Observable<Array<ReferenceDataItem>> {
    return this.getDropDownList(name, language, noCache).pipe(
      map(data => this.getItemsFromReferenceDataListObject(data))
    );
  }

  /**
   * 
   * @param name The name of the dropdown list.
   * @param language The language for the list. Default is English. Use Lanuage enum.
   * @param noCache true = forces new data, false = retrieves from cache if cache exists. Default value is false.
   */
  public getDropDownList(name: string | string[], language: Language = Language.ENGLISH, noCache: boolean = false): Observable<{ applications: Array<string>, readableName: string, dataItems: Array<{ items: Array<ReferenceDataItem> }>, id: string, name: string, version: string }> {

    if (name === null || name === undefined) {
      throw `Cannot get list with name "${name}"`;
    }

    let endpoint = this.apiUrl + `/DropDownList/${name}/${language}`;
    let cacheKey = `getDropDownList-${name}-${language}`;
    return this.makeGetRequestWithCaching(endpoint, cacheKey, noCache).pipe(
      map(data => <{ applications: Array<string>, readableName: string, dataItems: Array<{ items: Array<ReferenceDataItem> }>, id: string, name: string, version: string }>data)
    );
  }


  /**
   * Function to find an item in a list of ReferenceData Objects
   * @param property The field that you would like to match in your search.
   * @param searchValue The value that item should have
   * @param list A list of objects to be searched against. 
   * @returns ReferenceDataItem or null if no item found. 
   */
  public findItemInList(property: string, searchValue: any, list: ReferenceDataItem[]): ReferenceDataItem {

    let item = findItemInListByProperty(property, searchValue, list);

    // If value was found, cast to ReferenceDataItem and return, otherwise, return null.
    return item !== null ? <ReferenceDataItem>item : null;
  }

  /**
   * Function that fetches a reference data list given the name, and returns an object that matches a search against the list.
   * @param listName The name of the list to fetch
   * @param search { property: string, searchValue: string}, property is the name of the field to search against. searchValue is the expected value to be found.
   * @param language Lanauge Enum, defaults to English
   * @param noCache false = retrieve from cache if exists, true = forces new data to be retrieved.
   */
  public fetchAndFindItemInList(listName: string, search: { objectProperty: string, searchValue: any }, language: Language = Language.ENGLISH, noCache: boolean = false): Observable<ReferenceDataItem> {
    return this.getDropDownListItems(listName, language, noCache).pipe(
      map(items => {
        return this.findItemInList(search.objectProperty, search.searchValue, items);
      })
    )
  }

  /**
   * 
   * @param names An array of strings that contains the names of all the dropdown lists to be retrieved.
   * @param listItemsOnly Default is set to true. This will return only the list items of a list (not the list object).
   * @param language The language for the list. Default is English. Use Lanuage enum.
   * @param noCache true = forces new data, false = retrieves from cache if cache exists. Default value is false.
   */
  public getDropDownLists(names: string[], listItemsOnly: boolean = true, language: Language = Language.ENGLISH, noCache: boolean = false): Observable<Map<string, Object>> {

    // Retrieving an Observable for each listName, getDropDownList will handle the caching
    let observables = names.map(listName => {
      return this.getDropDownList(listName, language, noCache);
    });

    // Waiting for all Observables to come back
    return forkJoin(observables).pipe(map(lists => {
      var listMap: Map<string, Object> = new Map<string, Object>();
      lists.forEach(list => {

        /*
        * If listItemOnly is true, extract items from object to store in map
        * If listItemOnly is false, return the entire ReferenceData list object
        */
        let keyValue = listItemsOnly ? this.getItemsFromReferenceDataListObject(list) : list;

        // Adding item to map based on the ReferenceData List Name
        listMap.set(list.name, keyValue);
      });

      // Returning the mapped list of lists
      return listMap;
    }));
  }

  /**
   * @ignore
   */

  private getItemsFromReferenceDataListObject(listObject: any) {
    return listObject.dataItems[0].items;

  }

}


/**
 * Enum for supported languages
 * @readonly
 * @enum {string}
 */
export enum Language {
  ENGLISH = "english",
  FRENCH = "french"
}

/**
 * Creates a new ReferenceDataItem
 * @class
 */
export class ReferenceDataItem {
  id: string;
  name: string;
  value: string;
  description: string;
  displayOrder: number;
  active: boolean;
  acronym: string;
  evalue: number;
  metaData: any;

  constructor(options: {
    id: string,
    name: string,
    value: string,
    description: string,
    displayOrder: number,
    active: boolean,
    acronym: string,
    evalue: number,
    metaData: any
  }) {
    this.id = options.id;
    this.name = options.name;
    this.value = options.value;
    this.description = options.description;
    this.displayOrder = options.displayOrder;
    this.active = options.active;
    this.acronym = options.acronym;
    this.evalue = options.evalue;
    this.metaData = options.metaData;

  }

}