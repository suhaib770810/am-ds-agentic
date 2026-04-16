const dateHandler = {
    CSTstringToSqlUTCtimestamp: function(dateString) {
        // this will generate UTC 12am timestamp corresponding to the dateString
        const CSTtimestamp = new Date(dateString).getTime(); 
        // add 6 hours to correctly display the date in CST in the database
        const utcTimestamp = (CSTtimestamp + (6 * 60 * 60 * 1000))
        // convert to SQL timestamp
        const utcTimestampSQL = utcTimestamp / 1000;
        return utcTimestampSQL;
    },

    getCurrentSqlUTCtimestamp: function() {
        const currentUTCtimestamp = Date.now();
        const currentUTCtimestampSQL = currentUTCtimestamp / 1000;
        return currentUTCtimestampSQL;
    },


    // CHECK THE CALCULATION HERE; TIMEZONE ADJUSTMENT SHOULD BE IN SECONDS AND NOT IN MILLISECONDS
    SqlUTCtimestampToCSTstring: function(timestamp) {
        const CSTdateObject = new Date((timestamp - (6 * 60 * 60 * 1000))*1000);
        // Use ISO String to avoid timezone issues
        return CSTdateObject.toISOString().replace('T', ' ').split('.')[0];
    }, 

    dateObjectBehaviorTest: function(input) {
    // get Date Object from a time stamp
        console.log('Input:')
        console.log(input)
        console.log('\n')

        const dateObject = new Date(input);
        console.log('Date Object:')
        console.log(dateObject)
        console.log('\n')

        // convert Date Object to string using Date.toLocaleString()
        const dateObjectToLocaleString = dateObject.toLocaleString()
        console.log('Date Object to Locale String:')
        console.log(dateObjectToLocaleString)
        console.log('\n')

        // convert Date Object to string using Date.toISOString()
        const dateObjectToISOString = dateObject.toISOString()
        console.log('Date Object to ISO String:')
        console.log(dateObjectToISOString)
        console.log('\n')

        // convert Date Object to timestamp using Date.getTime()
        const dateObjectToTimeStamp = dateObject.getTime()
        console.log('Date Object to Time Stamp using Date.getTime():')
        console.log(dateObjectToTimeStamp)
        console.log('\n')
    }
}



/*
console.log('DATE OBJECT BEHAVIOR WHEN CONVERTING FROM DATE.NOW() TIMESTAMP')
dateHandler.dateObjectBehaviorTest(Date.now())

console.log('DATE OBJECT BEHAVIOR WHEN CONVERTING FROM A TIMESTAMP')
dateHandler.dateObjectBehaviorTest(1733702400000)

console.log('DATE OBJECT BEHAVIOR WHEN CONVERTING FROM A STRING')
dateHandler.dateObjectBehaviorTest('2024-12-09')

*/

export default dateHandler;
