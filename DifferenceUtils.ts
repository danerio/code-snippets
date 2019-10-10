import { isNotEmpty } from 'src/app/utilities/data-validatation';
import { isObject } from "util";
import { isArray } from "rxjs/internal/util/isArray";

export class DifferenceUtils {


    /**
     * A function that runs a deep comparision against two objects to find differences
     * @param objA The first object for comparison
     * @param objB The object that will be compared to the first object
     * @param compareLengthOnlyForArrays 
     */
    public static compareObjects(objA: any, objB: any, compareLengthOnlyForArrays: boolean = false): Change[] {
        // Array for storing changes
        var allChanges: Change[] = [];

        // Checking if both A and B are objects and that they are not arrays
        /** 
         * @todo Resolve second check for isArray
         */
        if ((!isArray(objA)) && isObject(objA) && isObject(objB)) {
            // Retrieving the keys for objA
            let keys = Object.keys(objA);

            keys.forEach(key => {

                // Retrieving the value of object A
                let value1 = objA[key];

                // Retrieving the value of object B
                let value2 = objB[key];

                // Recursing to check if the values from the objects are the same
                var changes = DifferenceUtils.compareObjects(value1, value2);

                // Looping through all of the changes returned from the function
                changes.forEach(change => {
                    change.path.splice(0, 0, key);
                });
                allChanges = allChanges.concat(changes);
            })

        } else if (isArray(objA) && isArray(objB)) { // if both A and B are arrays

            var changes;

            if (compareLengthOnlyForArrays === true) {
                // Compare the length only for the array (instead of the value)
                changes = DifferenceUtils.compareObjects(objA.length, objB.length);
                allChanges = allChanges.concat(changes);
            }
            else {
                // @todo - allow for dynamic comparision key to be passed into this function
                var arrayChanges = DifferenceUtils.compareObjectArrays(objA, objB, "id");

                // Verifying that the array is not empty
                if (isNotEmpty(arrayChanges)) {
                    changes = arrayChanges.changes;
                    if (isNotEmpty(arrayChanges.added)) {

                        // concatting the changes onto the existing array
                        changes = changes.concat(arrayChanges.added.map(changed => {
                            return new Change(null, changed);
                        }))
                    }
                }

            }
            if (isNotEmpty(changes)) {
                allChanges = allChanges.concat(changes);
            }
        } else {
            //If values are different
            if (objA !== objB) {
                var change = new Change(objA, objB);
                allChanges.push(change);
            }
        }

        return allChanges;
    }

    /**
     * A function that takes an array and compares if they are the same, if anything has been removed / added, or of values within the array have changed
     * @param oldArray Old array of objects
     * @param newArray New array of objects
     * @param comparingKey The key to use for matching objects. (eg. id, Id, itemId etc...);
     */
    public static compareObjectArrays(oldArray: any[] = [], newArray: any[] = [], comparingKey: string) {

        // Removed items from the array
        var removed = [];

        // Items that values have changed
        var changed = [];

        // Copying the arrays
        oldArray = DifferenceUtils.copyArray(oldArray);
        newArray = DifferenceUtils.copyArray(newArray)

        // Mapping the objects in the array by the comparision key (eg. id)
        var newArrayMappedByKey = newArray.map(data => data[comparingKey] || data[comparingKey.toLowerCase()]);

        /// Looping through all the items in the original array
        for (var i = 0; i < oldArray.length; i++) {
            // Copying the value from the original array
            var item1 = Object.assign({}, oldArray[i]);

            // Finding the itme in the new array
            var item2Index = newArrayMappedByKey.indexOf(item1[comparingKey] || item1[comparingKey.toLowerCase()])

            // If item in the new array is found
            if (item2Index >= 0) {

                // retrieving the value from the second array
                var item2 = newArray[item2Index];

                // Removing the item from the array now that it's been used
                newArray.splice(item2Index, 1);

                // Running a comparision on the values of the two objects
                var changes = DifferenceUtils.compareObjects(item1, item2, true);

                if (changes.length > 0) {
                    changed.push({
                        old: item1,
                        new: item2,
                        difference: changes
                    });
                }

                // Removing the item from the mapped array to prevent the value from slowing down the next search
                newArrayMappedByKey.splice(item2Index, 1);
            }
            else {

                // If value not found, the item has been removed
                removed.push(item1);
            }
        }

        return {
            removed: removed,
            added: newArray,
            changes: changed
        }

    }

    /**
     * 
     * @param array Takes an array and creates a copy (but kills reference to objects)
     */
    public static copyArray(array) {
        return JSON.parse(JSON.stringify(array));
    }

    public static compareStrings(string1: string, string2: string) {

        // Verifying that string one is not empty
        if (!isNotEmpty(string1)) {
            throw `"string1" cannot have a value of "${string1}"`;
        }

        // Verifying that string two is not empty
        if (!isNotEmpty(string2)) {
            throw `"string2" cannot have a value of "${string2}"`;
        }

        return string1.localeCompare(string2);

    }

}

/**
 * Change object
 */
export class Change {
    // The path to the change
    path: string[]; F

    // The original value
    oldValue: any;

    // The new value
    newValue: any;

    constructor(oldValue, newValue) {
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.path = [];
    }
}