
import dotenv from 'dotenv'
dotenv.config({path: './.dotenv/.env'})

// import data writer modules
  import csvEditor from './modules_com/csvEditor/csvEditor.js';
  import mockDataWriter from './modules_com/mockDataWriter/mockDataWriter.js';
  import { write } from 'fs';

// import schema objects
  import schemaObjects from './schema/schemaObjects.js';


// load DB modules
  import Database from './modules_com/db/db.js'
  import path from 'path';
  const db = await Database.create(path.join(process.env.DB_DIR, process.env.DB_NAME))
  import dbQueries from './modules_com/db/dbQueries.js';


// load ibkr query and parser modules
  import ibkr_FlexQuery from './modules/ibkr-flex/ibkr-flex.js';
  import dataAgg from './modules/dataAgg/dataAgg.js';
  import dataParser from './modules/ibkr-flex/dataParser.js';
  import dataTypeHandler from './modules/ibkr-flex/dataTypeHandler.js';


//------------------------------------------------------------------//

const mockObject =  {
    "underlyingSymbol": "GOOG",
    "strike": "200",
    "expiry": "20261218",
    "dateTime": "20240718;120801",
    "putCall": "C",
    "tradeDate": "20240718",
    "transactionType": "ExchTrade",
    "quantity": "1",
    "tradePrice": "31.12",
    "tradeMoney": "3112",
    "proceeds": "-3112",
    "ibCommission": "-1.04935",
    "netCash": "-3113.04935",
    "cost": "3113.04935",
    "fifoPnlRealized": "0",
    "buySell": "BUY",
    "holdingPeriodDateTime": "",
    "whenRealized": "",
    "whenReopened": ""
}

const mockLotObject = {
    "underlyingSymbol": "AAPL",
    "strike": "250",
    "expiry": "20261218",
    "dateTime": "20250411;114528",
    "putCall": "C",
    "tradeDate": "20250411",
    "transactionType": "",
    "quantity": "1",
    "tradePrice": "33.6105545",
    "tradeMoney": "",
    "proceeds": "",
    "ibCommission": "",
    "netCash": "",
    "cost": "3361.05545",
    "fifoPnlRealized": "-1741.740526",
    "buySell": "SELL",
    "holdingPeriodDateTime": "20241017;121518",
    "whenRealized": "",
    "whenReopened": ""
}

/* TESTING THE 30 DAY DATA WITH TYPEHANDLER AND UPDATER FUNCTION 
    // const writeBulkData = async () => {
    //   try {
    //     let bulkDataRawObject = dataAgg.trades

    //     console.log ('Writing bulk data to file...');

    //     await mockDataWriter.writeMockDataToFileJSON('trades_30d_20250518.js', bulkDataRawObject)


    //     console.log('Writing bulk data to database...');

    //     let trades = dataParser.flexStatementTradesExtractor(bulkDataRawObject)

    //     let tradesTypeConverted = trades.map((trade) => {
    //       return dataTypeHandler.processFQTradeObject(trade);
    //     })

    //     await dbQueries.dbUpdater(db, 'Trades', tradesTypeConverted, dataTypeHandler.uniqueFieldsTrades)
    //     console.log('Data written to database successfully.');
    //   }
    //   catch (error) {
    //     console.error(`Error writing bulk data: ${error}`);
    //   }
    // }
    // writeBulkData();
*/
    
/* CREATED NEW TABLE, TESTED TYPE HANDLER AND THEN COPIED ALL DATA TO THE NEW TABLE
    let appropriateFieldTableCreatorAndDataPoster = async (db, oldTableName, newTableName, tableFields) => {
      try {
        Create the table with appropriate fields
        await db.createTableSpecificFields(newTableName, tableFields);

        const currentData = await dbQueries.pullAll(db, oldTableName)
        
        const fieldsConverted = currentData.map((row) => {
          return dataTypeHandler.converKeys_singleObject_FromJSONToCamelCase(row);
        })

        Pretty print the first converted object to see the structure
        console.log('\nConverted object structure:');
        console.log(fieldsConverted[0]);

        const dataConverted = currentData.map((row) => {
          return dataTypeHandler.processFQTradeObject(row);
        })


        console.log(dataConverted[0]);
        Insert the data into the table
        const result = await dbQueries.bulkPoster(db, newTableName, dataConverted);
        console.log(result.message)

        return dataConverted;

      } catch (error) {
        console.error(`Error creating table and inserting data: ${error}`);
      }
    }

    Initialize testData immediately
    const testData = await appropriateFieldTableCreatorAndDataPoster(db, 'Trades', 'Trades', dataTypeHandler.tradeObjectWithFields);

*/

/* TESTING THE IBKR FLEX POSITIONS QUERY
  const writeBulkData = async () => {
    try {
      console.log('writeBulkData Loaded\n');

      let positionsDenested = dataParser.flexStatementPositionsExtractor(dataAgg.positions)
      let positionsTypeConverted = positionsDenested.map((position) => {
        return dataTypeHandler.processFQPositionsObject(position);
      })
      console.log(positionsTypeConverted);

      let tradesDenested = dataParser.flexStatementTradesExtractor(dataAgg.trades)
      let tradesTypeConverted = tradesDenested.map((trade) => {
        return dataTypeHandler.processFQTradeObject(trade);
      })
      console.log(tradesTypeConverted);
      console.log ('Writing bulk data to file...');
      await mockDataWriter.writeMockDataToFileJSON('positions_20250519_denested_typeConverted.js', positionsTypeConverted)

      await dbQueries.dbUpdater(db, 'Trades', tradesTypeConverted, dataTypeHandler.uniqueFieldsTrades)
      console.log('Data written to database successfully.');
    }
    catch (error) {
      console.error(`Error writing bulk data: ${error}`);
    }
  }
*/

/* TESTING LEGACY DATE HANDLER AND DATE BEHAVIOR
    console.log('DATE OBJECT BEHAVIOR WHEN CONVERTING FROM DATE.NOW() TIMESTAMP')
    dateHandler.dateObjectBehaviorTest(Date.now())

    console.log('DATE OBJECT BEHAVIOR WHEN CONVERTING FROM A TIMESTAMP')
    dateHandler.dateObjectBehaviorTest(1733702400000)

    console.log('DATE OBJECT BEHAVIOR WHEN CONVERTING FROM A STRING')
    dateHandler.dateObjectBehaviorTest('2024-12-09')

    console.log('DATE OBJECT BEHAVIOR WHEN CONVERTING IBKR STRING')
    dateHandler.dateObjectBehaviorTest(mockObject["dateTime"])
    let ibkrDateTime= new Date(dataTypeHandler.dateTimeIbkrFQtoISOString(mockObject["dateTime"]))
    console.log(ibkrDateTime)
    console.log(ibkrDateTime.toLocaleString())
*/

/* PULLING ALL DATA FROM THE DATABASE AND WRITING IT TO A CSV FILE
    const writeBulkData = async () => {
      try {
        let dbTrades = await dbQueries.pullAll(db, 'Trades')

        await csvEditor.writeCSV('dbTrades.csv', dbTrades)

        console.log('Data written to database successfully.');
      }
      catch (error) {
        console.error(`Error writing bulk data: ${error}`);
      }
    }
    writeBulkData()
*/

/* PULLING ALL DATA FROM THE DATABASE AND WRITING IT TO A CSV FILE
    const writeBulkData = async () => {
      try {
        let dbTrades = await dbQueries.pullAll(db, 'Trades')

        await csvEditor.writeCSV('dbTrades.csv', dbTrades)

        console.log('Data written to database successfully.');
      }
      catch (error) {
        console.error(`Error writing bulk data: ${error}`);
      }
    }
    writeBulkData()
*/

/* READING CSV FILE
  const readCSV = async () => {
    try {
      console.log('readCSV Loaded\n');
      let csvData = await csvEditor.readCSV('./modules_dev/mockData/trades_CY2024.csv')
      console.log(csvData[0])
    }
    catch (error) {
      console.error(`Error reading CSV file: ${error}`);
    }
  }
  // readCSV()
*/

// CUSTOM DATA UPDATE

const customDataUpdate = async () => {
  try {
    //  UPDATE TRADES TABLE USING THE DATAAGG METHOD
      // let trades = await dataAgg.tradesDataSelectorAndUpdater(db, process.env.IBKR_FQ_TRADES_30D)
      // console.log(`Data updated successfully.\n`)
      // let newTimestamp = await dbTimeStampQueries.getLastTimestamp(db, 'timestamps', 'Trades')
      // let dataOfUpdate = new Date(newTimestamp.timestamp)
      // console.log(`Time of update: ${dataOfUpdate.toLocaleString()}`)
    
      
    /* ADD TIMESTAMP FROM THE LATEST AVAILABLE DATA IN THE DATABASE
      let tradesAll = await dbQueries.pullALLSorted(db, 'Trades', 'dateTime ASC')
      await dbTimeStampQueries.insertTimestamp(db, 'timestamps', tradesAll[tradesAll.length - 1])
      console.log(`Timestamp updated successfully.\n`)
    */

    //  TEST 90D FLEX QUERY
      // let trades = await dataAgg.pullIbkrFQTrades(process.env.IBKR_FQ_TRADES_LQT)
      // console.log(`Number of trades in the last quarter: ${trades.length}`)
      // await csvEditor.writeCSV('trades_LQT_20250814.csv', trades)


    /* Add ID COLUMN TO TRADES TABLE  
      let schema = schemaObjects.tradeObjectWithFields;
      let columnNames = Object.keys(schema)
      let columnNamesAndTypesForTableCreation = columnNames.map((column) => {
        return `${column} ${schema[column].type}`
      })
      let sql1 = `
            CREATE TABLE Trades_new (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                ${columnNamesAndTypesForTableCreation.join(', ')}
            );`
      let sql2 = `
            INSERT INTO Trades_new (${columnNames.join(', ')})
            SELECT ${columnNames.join(', ')}
            FROM Trades;`
            
        let confirmation = await db.run(sql2)
        console.log('Data updated successfully.')
        console.log(confirmation)
    */

  }
  catch (error) {
    console.error(`Error updating data: ${error}`);
  }
}


/* SORT TRADES DATA AND POST TO NEW TABLE

    let sortDataAndPostToNewTable = async (db, oldTableName, newTableName, tableFields) => {
      try {
        // Create the table with appropriate fields
        await db.createTableSpecificFields(newTableName, tableFields);

        const currentData = await dbQueries.pullALLSorted(db, oldTableName)

        // drop ID column
        currentData.forEach((row) => {
          delete row.ID;
        })
        

        const result = await dbQueries.bulkPoster(db, newTableName, currentData);

        console.log(result.message)

      } catch (error) {
        console.error(`Error creating table and inserting data: ${error}`);
      }
    }
 */

// let confirmation = await sortDataAndPostToNewTable(db, 'Trades', 'TradesSorted', schemaObjects.tradeTableFields)



// import this file in the main file to make sure the functions here are executed. 

const sandbox = () => {
  console.log('this is a dummy function to make sure this script is loaded with the program')
}

export { sandbox }