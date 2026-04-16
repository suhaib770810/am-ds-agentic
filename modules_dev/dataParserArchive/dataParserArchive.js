const dataParser = {


    // this function is used to denest the trades data from the Flex statement
    // It takes an array of trades, each nested in a dollar sign object
    // it is already implement in the flexStatementTradesExtractor function
    // but it is kept here for separate use if needed
    denestTradesFromDollarSigns: async (tradesData) => {

        try {
            let denestedTrades = []
            tradesData.forEach((trade) => {
                denestedTrades.push(trade['$'])
            })
            return denestedTrades;
        }
        catch (error) {
            console.error(`Error denesting trades data: ${error}`);
            return ('Error denesting trades:' + error.message)
        }
    },



    
    // takes an array of denested trades and sorts them by ticker and options
    // returns an object with tickers as keys and an array of trades as values
    tradesByTicker: async (tradesData) => {
        try {
            let sortedTrades = {}
            tradesData.forEach((trade) => {
                //get ticker from contractDesc

                const ticker = trade.underlyingSymbol

                // push position to sorted positions object

                if (!sortedTrades[ticker]) {
                    sortedTrades[ticker] = [];
                }
                sortedTrades[ticker].push(trade);
            })

            return sortedTrades;
        } 
        catch (error) {
            console.error(`Error sorting positions data by ticker: ${error}`);
            return ('Error getting trades by ticker:' + error.message)
        }
    },

    // takes an array of denested trades and sorts them by ticker and options
    // returns an object with tickers and options as keys and an array of trades as values
    tradesByTickerAndOptions: async (tradesData) => {
        // returns an OBJECT
        try {
            let sortedTrades = {}
            tradesData.forEach((trade) => {
                //get ticker from contractDesc

                const ticker = trade.underlyingSymbol
                const customContractDesc = `${trade.underlyingSymbol} ${trade.expiry} ${trade.strike}`

                // push position to sorted positions object

                if (!sortedTrades[ticker]) {
                    sortedTrades[ticker] = {};
                }

                if (!sortedTrades[ticker][customContractDesc]) {
                    sortedTrades[ticker][customContractDesc] = [];
                }
                sortedTrades[ticker][customContractDesc].push(trade);
            })

            return sortedTrades;
        } 
        catch (error) {
            console.error(`Error sorting positions data by ticker: ${error}`);
            return ('Error getting trades by ticker and options:' + error.message)
        }
    },

}

export default dataParser;