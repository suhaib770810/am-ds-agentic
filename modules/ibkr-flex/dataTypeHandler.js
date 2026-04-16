const dataTypeHandler = {

    stringToNumber: (str) => {
        if (str === null || str === undefined || str === '') {
            return null;
        }
        if (typeof str === 'number') {
            return str;
        }
        if (typeof str === 'string') {
            const num = parseFloat(str);
            return isNaN(num) ? null : num;
        }
        return null;
    },

    dateTimeIbkrFQtoISOString: (dateTimeString) => {
        // Split the datetime string into date and time parts
        let [dateString, timeString] = dateTimeString.split(';');
        
        // Extract components from date string (YYYYMMDD)
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        
        // Extract components from time string (HHMMSS)
        const hours = timeString.substring(0, 2);
        const minutes = timeString.substring(2, 4);
        const seconds = timeString.substring(4, 6);
        
        // Create ISO string format (YYYY-MM-DDTHH:MM:SS.000Z)
        const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000-04:00`;
        
        return isoString;
    },

    dateIbkrFQToISOString: (dateString) => {
        // Extract components from date string (YYYYMMDD)
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        
        // Create ISO string format (YYYY-MM-DD)
        const isoString = `${year}-${month}-${day}T12:00:00.000-04:00`;
        
        return isoString;
    },

    ISOStringToSQLTimestamp: (isoString) => {
        // Convert ISO string to Date object
        const dateObject = new Date(isoString);
        
        // Get the timestamp in seconds
        const timestamp = Math.floor(dateObject.getTime() / 1000);
        
        return timestamp;
    },

    ContractDesc: (object) => {
        // This function takes a trade object and returns a string with the contract description
        // The contract description is in the format: TICKER YYYYMMDD STRIKE
        // It uses the underlyingSymbol, expiry and strike fields from the trade object
        const ticker = object.underlyingSymbol;
        const expiry = object.expiry;
        const strike = object.strike;
        return `${ticker} ${strike} ${expiry}`;
    },

    processFQPositionsObject: function (data) {
        let convertedObject = {};

        const textFields = ['accountId', 'acctAlias', 'symbol', 'description', 'underlyingSymbol', 'putCall']
        const numberFields = ['strike', 'position', 'positionValue', 'costBasisPrice', 'costBasisMoney', 'percentOfNAV', 'fifoPnlUnrealized']
        const dateFields = ['expiry']
        textFields.forEach((key) => {
            convertedObject[key] = data[key];
        })
        numberFields.forEach((key) => {
            convertedObject[key] = this.stringToNumber(data[key]);
        })
        dateFields.forEach((key) => {
            if (data[key] === '') {
                convertedObject[key] = null;
            }
            else    {
                convertedObject[key] = this.ISOStringToSQLTimestamp(this.dateIbkrFQToISOString(data[key]))
            };
        })
        convertedObject['contractDescCustom'] = this.ContractDesc(convertedObject);
        return convertedObject;     
    },

    processFQTradeObject: function (data) {
        let convertedObject = {};

        const textFields = ['underlyingSymbol', 'putCall', 'transactionType', 'buySell']
        const numberFields = ['strike', 'quantity', 'tradePrice', 'tradeMoney', 'proceeds', 'ibCommission', 'netCash', 'cost', 'fifoPnlRealized']
        const dateFields = ['expiry', 'tradeDate', 'holdingPeriodDateTime', 'whenRealized', 'whenReopened']
        const dateTimeFields = ['dateTime']
        textFields.forEach((key) => {
            convertedObject[key] = data[key];
        })
        numberFields.forEach((key) => {
            convertedObject[key] = this.stringToNumber(data[key]);
        })
        dateFields.forEach((key) => {
            if (data[key] === '') {
                convertedObject[key] = null;
            }
            else    {
                convertedObject[key] = this.ISOStringToSQLTimestamp(this.dateIbkrFQToISOString(data[key]))
            };
        })
        dateTimeFields.forEach((key) => {
            if (data[key] === '') {
                convertedObject[key] = null;
            }
            else {
                convertedObject[key] = this.ISOStringToSQLTimestamp(this.dateTimeIbkrFQtoISOString(data[key]));
            }
        })
        convertedObject['contractDescCustom'] = this.ContractDesc(convertedObject);
        return convertedObject;
        
    },

    processFQPositionsObjectFromCSV: function (data) {
        let convertedObject = {};

        const textFields = ['accountId', 'acctAlias', 'symbol', 'description', 'underlyingSymbol', 'putCall']
        const numberFields = ['strike', 'position', 'positionValue', 'costBasisPrice', 'costBasisMoney', 'percentOfNAV', 'fifoPnlUnrealized', 'expiry']

        textFields.forEach((key) => {
            convertedObject[key] = data[key];
        })
        numberFields.forEach((key) => {
            convertedObject[key] = this.stringToNumber(data[key]);
        })
        return convertedObject;     
    },

}

export default dataTypeHandler;

