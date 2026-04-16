const dataParser = {

    // this function is used to extract the trades from the Flex statement json object
    // denester is built within the function
    flexStatementTradesExtractor: (dataObject) => {
        try {
            const statement = (dataObject.FlexQueryResponse.FlexStatements.FlexStatement); 
            const trades = statement.Trades.Trade
            let tradesArray = [];
            for (let i = 0; i < trades.length; i++) {
                let transaction = (trades[i]['$'])
                tradesArray.push(transaction)
            }
            return tradesArray;
        } catch (error) {
            console.error(`Error extracting trades from Flex Statement: ${error}`);
            return ('Error extracting trades from Flex Statement:' + error.message)
        }
    },

    flexStatementPositionsExtractor: (dataObject) => {
        try {
            const statement = (dataObject.FlexQueryResponse.FlexStatements.FlexStatement); 
            const trades = statement.OpenPositions.OpenPosition
            let tradesArray = [];
            for (let i = 0; i < trades.length; i++) {
                let transaction = (trades[i]['$'])
                tradesArray.push(transaction)
            }
            return tradesArray;
        } catch (error) {
            console.error(`Error extracting trades from Flex Statement: ${error}`);
            return ('Error extracting trades from Flex Statement:' + error.message)
        }
    },

}

export default dataParser;