import ibkr_FlexQuery from '../ibkr-flex/ibkr-flex.js';
import dbQueries from '../db/dbQueries.js';
import dbTimeStampQueries from '../db/dbTimeStampQueries.js';
import dataTypeHandler from '../dataParser/dataTypeHandler.js';
import dataParser from '../dataParser/dataParser.js';
import schemaObjects from '../../schema/schemaObjects.js';

const dataAgg = {


    ibkrTradeFQSelectorOld: (timestamp) => {
        try {
            let statementQueryID;
            if (timestamp === undefined) {
                console.log('no timestamp found, will pull trades from last 365 days\n')
                statementQueryID = process.env.IBKR_FQ_TRADES_365D
            }
            else {
                console.log(`timestamp found: ${timestamp.timestamp}\n`)
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
                let secondsSinceTimestamp = todayInSeconds - timestamp.timestamp
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

    tradesDataSelectorAndUpdaterOld: async (db, customFQQueryID = undefined) => {
        try {
            let tradeData;
            if (process.env.TRADES_DATA_SOURCE === 'REAL') {
                // get last timestamp
                let timestamp = await dbTimeStampQueries.getLastTimestamp(db, 'timestamps', 'Trades');
                
                // select statement query id
                let statementQueryID;
                if (customFQQueryID === undefined) {
                    statementQueryID = dataAgg.ibkrTradeFQSelector(timestamp);
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
                        let tradeData = await dataAgg.pullIbkrFQTrades(statementQueryID[i]);
                        trades = trades.concat(tradeData);
                    }
                    tradeData = trades;
                } else {
                    tradeData = await dataAgg.pullIbkrFQTrades(statementQueryID);
                }
                
                // update trades in the database
                let tradesUpdateResponse = await dbQueries.dbUpdater(db, 'Trades', tradeData, schemaObjects.uniqueFieldsTrades)
                console.log(tradesUpdateResponse.message)
                console.log(`trades updated in the database successfully. ${tradesUpdateResponse.count} trades updated\n`)
                
                // pull all trades from the database
                let tradesAll = await dbQueries.pullALLSorted(db, 'Trades', 'dateTime ASC')
                console.log(`All trades loaded from database successfully. ${tradesAll.length} trades loaded\n`)

                let lastEntryID = tradesAll[tradesAll.length - 1].ID
                
                // update timestamp
                if (tradesUpdateResponse.count > 0) {
                    // insert timestamp
                    await dbTimeStampQueries.insertTimestamp(db, 'timestamps', tradesAll[tradesAll.length - 1])
                }
                
                return tradesAll

            } else if (process.env.TRADES_DATA_SOURCE === 'MOCK') {
                console.log('!!!!!!!!!!!!!!!Using mock data for flex query!!!!!!!!!!!!!!!!!\n');
                return 
            } else {
                throw new Error("Invalid data source env variable. Please set FLEX_DATA_SOURCE to 'REAL' or 'MOCK'.");
            }
        }
        catch (error) {
            console.error(`Error fetching trades data in the aggregator: ${error}`);
            throw error;
        }
    },

    // GET ALL DATA //
    pullDataFromAllSources: async (db) => {
        try {

            console.log('\nDataAggregator Started \n\nPulling data from all sources...\n');
            
            let positionsData, tradeData;

            // GET POSITIONS DATA //
            console.log('pulling positions data...\n')
            positionsData = await dataAgg.positionsDataSelector();


            // GET TRADES DATA //
            tradeData = await dataAgg.tradesDataSelectorAndUpdater(db);

            return {
                trades: tradeData,
                positions: positionsData
            }

        } catch (error) {
            console.error(`Error fetching data in the aggregator: ${error}`);
            throw error;
        }
    }
}

// export dataAgg object

export default dataAgg;

    