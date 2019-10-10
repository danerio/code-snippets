import { isArray, isString } from "util";

/**
 * Returns true if passed in item is not empty
 * Returns false if item is empty
 */
export function isNotEmpty(item: any, additionalChecks?: {
    checkListEmpty?: boolean,
    checkStringEmpty?: boolean
}) {
    /**
     * Return false if undefined
     */
    if (item === undefined) {
        return false;
    }

    /**
     * Return false if 
     */
    if (item === null) {
        return false;
    }

    /**
     * Checking if additionalChecks is not empty
     */
    if (isNotEmpty(additionalChecks)) {

        // If checkListEmpty flag is set to true
        if (additionalChecks.checkListEmpty === true) {

            // Verify that the item is an array
            if (isArray(item)) {

                // Checking if length is 0, return false if empty array 
                if (item.length === 0) {
                    return false;
                }
            }
            // If checkListEmpty is true but item is not array, throw error
            else {
                throw `The "checkListEmpty" property was set to true, but the passed in item is of type "${typeof item}"`;
            }
        }
        // If checkStringEmtpy flag is set to true
        else if (additionalChecks.checkStringEmpty === true) {

            // Verify that the item type is a string
            if (isString(item)) {

                // Checking if string is empty
                if (item === "") {
                    return false;
                }

            }
            // If checkStringEmpty is true but item is not a string, throw error
            else {
                throw `The "checkStringEmpty" property was set to true, but the passed in item is of type "${typeof item}"`;
            }

        }

    }

    // If all checks have passed, return true
    return true;
}
