const keysToCamelCase = {
    // This function takes a string and converts it from JSON format to camel case
    // This is useless because apparently strings in camelcase cant be accessed via dot notation anyway  
    convertToCamelCase: (str) => {
            return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    },
    
    // This function takes an object and converts its keys from JSON format to camel case
    // It uses a regular expression to match the pattern of JSON keys and convert them to camel case
    // It returns a new object with the converted keys
    // This is useless because apparently strings in camelcase cant be accessed via dot notation anyway  
    convertKeys_bulk_FromJSONToCamelCase: function(data) {
        if (Array.isArray(data)) {
            return data.map(item => this.convertKeys_bulk_FromJSONToCamelCase(item));
        } else if (data && typeof data === 'object') {
            return Object.keys(data).reduce((acc, key) => {
                acc[this.convertToCamelCase(key)] = this.convertKeys_bulk_FromJSONToCamelCase(data[key]);
                return acc;
            }, {});
        }
        return data;
    },

    // This function takes a single object and converts its keys from JSON format to camel case
    // It does not use recursion, as it is designed for a single object
    // This is useless because apparently strings in camelcase cant be accessed via dot notation anyway  
    converKeys_singleObject_FromJSONToCamelCase: function (data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data type. Expected an object.');
        }

        return Object.keys(data).reduce((acc, key) => {
            acc[this.convertToCamelCase(key)] = data[key];
            return acc;
        }, {});
    }

}

export default keysToCamelCase;