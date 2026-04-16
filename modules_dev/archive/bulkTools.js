const bulkTools = {
    // This function and takes and object and a function as arguments
    // It will iterate through the object and apply the function to each encountered array
    // it will return a new object with the same structure as the original
    convertAllArraysInAnObject: (data, converterFunction) => {
        // Handle arrays by applying the converter function
        if (Array.isArray(data)) {
            return converterFunction(data);
        }
        
        // Handle non-object or null values
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        // Create a new object to store transformed data
        const transformed = {};

        // Iterate through all keys in the object
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // Recursively process nested objects and arrays
                console.log(`Processing key: ${key}`);
                transformed[key] = tickerAndOptionsIterator(data[key], converterFunction);
            }
        }
        return transformed;
    },

    // This is a very simple function, that implements array.map functionality
    // It takes an array and a function as arguments
    // It will iterate through the array and apply the function to each element
    convertAllObjectsInAnArray: (data, converterFunction) => {
        try {
            if (!Array.isArray(data)) {
                throw new Error("Input data is not an array");
            }
            return data.map(item => converterFunction(item))
        }   
        catch (error) {
            console.error(`Error converting objects in array: ${error}`);
            return null;
        }   
    }
}
export default bulkTools;