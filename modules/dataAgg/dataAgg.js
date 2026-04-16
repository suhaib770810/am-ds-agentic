import dbQueries from '../../modules_com/db/dbQueries.js';
import dataAggDbQueries from './dataAggDbQueries.js';
import ibkrDataAgg from '../ibkr-flex/ibkrDataAgg.js';

const dataAgg = {

    positionsDataSelector: async () => {
        try {
            let positionsData;

            if (process.env.POSITIONS_DATA_SOURCE === 'CPGW') {
                // get positions from cpgw
                positionsData = await ibkr_cpgw_calls.getPositions();
                console.log(`positions loaded and denested successfully. ${positionsData.length} positions loaded\n`)
            } 
            
            else if (process.env.POSITIONS_DATA_SOURCE === 'FLEX') {
                // use mock data
                positionsData = await ibkrDataAgg.pullIbkrFQPositions()
                console.log(`positions loaded and denested successfully. ${positionsData.length} positions loaded\n`)
            } 
            
            else if (process.env.POSITIONS_DATA_SOURCE === 'MOCK') {
                // use mock data
                console.log('!!!!!!!!!!!!!!!Using mock data for CPGW query!!!!!!!!!!!!!!!!!\n');
                return 
            } 
            
            else {
                throw new Error("Invalid data source env variable. Please set CPGW_DATA_SOURCE to 'REAL' or 'MOCK'.");
            }
            
            return positionsData
        }
        catch (error) {
            console.error(`Error fetching positions data in the aggregator: ${error}`);
            throw error;
        }
    },

    // this function was updated to just add the data newer than the last entry in the main trades table
    // previously it would pull all data and update the main trades table by querying the table for existing record for each row
    // previous method was missing entries for trades where quantity was split into multiple rows
    tradesDataSelectorAndUpdater: async (db, customFQQueryID = undefined) => {
        try {
            let tradeData;

            // This is actually FLEX but that is the only bulk data source
            if (process.env.TRADES_DATA_SOURCE === 'REAL') {
                // get last timestamp
                let latestRowInTable = await dataAggDbQueries.pullLatestRow(db, 'Trades');
                let timestamp = latestRowInTable.dateTime;

                tradeData = await ibkrDataAgg.ibkrTradePullerFilterSorter(timestamp, customFQQueryID)

                if (tradeData.length > 0) {
                    // add trades in the database
                    let tradesUpdateResponse = await dbQueries.bulkPoster(db, 'Trades', tradeData)
                    console.log(tradesUpdateResponse.message)
                }
                
                // pull all trades from the database
                let tradesAll = await dataAggDbQueries.pullALLSorted(db, 'Trades', 'dateTime ASC')
                console.log(`All trades loaded from database successfully. ${tradesAll.length} trades loaded\n`)
                
                return tradesAll

            } 
            
            // MOCK
            else if (process.env.TRADES_DATA_SOURCE === 'MOCK') {
                console.log('!!!!!!!!!!!!!!!Using mock data for flex query!!!!!!!!!!!!!!!!!\n');
                return 
            } 
            
            else {
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

    