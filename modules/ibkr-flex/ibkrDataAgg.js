import ibkr_FlexQuery from './ibkr-flex.js';
import dataTypeHandler from './dataTypeHandler.js';
import dataParser from './dataParser.js';

const ibkrDataAgg = {
    pullIbkrFQPositions: async () => {
        try {
            let positionsData = await ibkr_FlexQuery(process.env.IBKR_FQ_POSITIONS);
            let positionsDenested = dataParser.flexStatementPositionsExtractor(positionsData)
            let positionsTypeConverted = positionsDenested.map((position) => {
              return dataTypeHandler.processFQPositionsObject(position);
            })
            return positionsTypeConverted
        }
        catch (error) {
            console.error(`Error fetching data in the aggregator: ${error}`);
            throw error;
        }
    },

    // This was updated to use the dateTime of the last entry from the main trades table
    // Previously used the last timestamp row and timestamp was accessed via timestamp.timestamp
    ibkrTradeFQSelector: (timestamp) => {
        try {
            let statementQueryID;
            if (timestamp === undefined) {
                console.log('no timestamp found, will pull trades from last 365 days\n')
                statementQueryID = process.env.IBKR_FQ_TRADES_365D
            }
            else {
                console.log(`timestamp found: ${timestamp}\n`)
                let todayInSeconds = Date.now() / 1000
                // calculate seconds since the beginning of the quarter
                let findSecondsSinceQuarterStart = () => {
                    // Get the current date and time
                    const now = new Date();
                  
                    // Get the current month (0-11)
                    const currentMonth = now.getMonth();
                  
                    // Determine the start month of the current quarter
                    let quarterStartMonth;
                    if (currentMonth >= 0 && currentMonth <= 2) { // Q1: Jan, Feb, Mar
                      quarterStartMonth = 0;
                    } else if (currentMonth >= 3 && currentMonth <= 5) { // Q2: Apr, May, Jun
                      quarterStartMonth = 3;
                    } else if (currentMonth >= 6 && currentMonth <= 8) { // Q3: Jul, Aug, Sep
                      quarterStartMonth = 6;
                    } else { // Q4: Oct, Nov, Dec
                      quarterStartMonth = 9;
                    }
                  
                    // Create a new Date object for the beginning of the current quarter
                    const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
                  
                    // Calculate the difference in milliseconds
                    const differenceInMilliseconds = now.getTime() - quarterStart.getTime();
                  
                    // Convert milliseconds to seconds
                    const seconds = Math.floor(differenceInMilliseconds / 1000);
                  
                    return seconds;
                }
                let secondsSinceQuarterStart = findSecondsSinceQuarterStart()
                let secondsSinceLastQuarterStart = secondsSinceQuarterStart + (90 * 24 * 60 * 60)
                let secondsSinceTimestamp = todayInSeconds - timestamp
                if (secondsSinceTimestamp < 30 * 24 * 60 * 60) {
                    console.log('pulling trades from last 30 days\n')
                    statementQueryID = process.env.IBKR_FQ_TRADES_30D
                }
                else if (secondsSinceTimestamp < secondsSinceQuarterStart) {
                    console.log('pulling trades since quarter start\n')
                    statementQueryID = process.env.IBKR_FQ_TRADES_QTD
                } 
                else if (secondsSinceTimestamp < secondsSinceLastQuarterStart) {
                    console.log('pulling trades since last quarter start\n')
                    statementQueryID = [
                        process.env.IBKR_FQ_TRADES_QTD, 
                        process.env.IBKR_FQ_TRADES_LQT
                    ]
                }
                else {
                    console.log('pulling trades from last 365 days\n')
                    statementQueryID = process.env.IBKR_FQ_TRADES_365D
                }
            }
            return statementQueryID
        }
        catch (error) {
            console.error(`Error selecting FQ query ID: ${error}`);
            throw error;
        }
    },

    pullIbkrFQTrades: async (statementQueryID) => {
        try {
            let tradeData = await ibkr_FlexQuery(statementQueryID);   
            let tradesDenested = dataParser.flexStatementTradesExtractor(tradeData)
            let tradesTypeConverted = tradesDenested.map((trade) => {
              return dataTypeHandler.processFQTradeObject(trade);
            })
            return tradesTypeConverted
        }
        catch (error) {
            console.error(`Error running FQ query and denesting data: ${error}`);
            throw error;
        }
    },
    
    ibkrTradePullerFilterSorter: async (timestamp, customFQQueryID) => {
                    
        // select statement query id
        let statementQueryID;
        if (customFQQueryID === undefined) {
            statementQueryID = ibkrDataAgg.ibkrTradeFQSelector(timestamp);
        }
        else {
            statementQueryID = customFQQueryID;
        }
        console.log(`statementQueryID: ${statementQueryID}\n`)
            
        let tradeData;
        if (Array.isArray(statementQueryID)) {
            let trades = []
            for (let i = 0; i < statementQueryID.length; i++) {
                console.log(`pulling query number ${statementQueryID[i]}...\n`)
                let tradeData = await ibkrDataAgg.pullIbkrFQTrades(statementQueryID[i]);
                trades = trades.concat(tradeData);
            }
            tradeData = trades;
        } else {
            tradeData = await ibkrDataAgg.pullIbkrFQTrades(statementQueryID);
        }
        console.log(`rows received from IBKR: ${tradeData.length}\n`)


        // filter out trades that are older than the latest row in the table
        let filteredTradeData = tradeData.filter(trade => trade.dateTime > timestamp);
        console.log(`new rows after filtering: ${filteredTradeData.length}\n`)

        // sort trades by dateTime
        let sortedFilteredTrades = filteredTradeData.sort((a, b) => a.dateTime - b.dateTime);

        return sortedFilteredTrades
    },

}

// export ibkrDataAgg object

export default ibkrDataAgg;

    