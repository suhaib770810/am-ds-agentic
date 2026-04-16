
import dotenv from 'dotenv'
dotenv.config({path: './.dotenv/.env'})



// import schema objects
  import schemaObjects from './schema/schemaObjects.js';


// load DB modules
  import path from 'path';
  import Database from './modules_com/db/db.js'
  const db = await Database.create(path.join(process.env.DB_DIR, process.env.DB_NAME))

// Load data Aggregator and Active Position Analysis modules
  import dataAgg from './modules/dataAgg/dataAgg.js';
  import dataAggDbQueries from './modules/dataAgg/dataAggDbQueries.js'; 


// load scheduler module
  import weekdayScheduler from './modules_com/Scheduler/scheduler.js';


////  DEV MODULES
  // load ibkr query and parser modules
  import dbQueries from './modules_com/db/dbQueries.js';

  // import parsers for FQs
  import dataParser from './modules/ibkr-flex/dataParser.js';
  import dataTypeHandler from './modules/ibkr-flex/dataTypeHandler.js';

  // import CPGW modules
  import ibkr_FlexQuery from './modules/ibkr-flex/ibkr-flex.js';

  // import data writer modules
  import csvEditor from './modules_com/csvEditor/csvEditor.js';
  import mockDataWriter from './modules_com/mockDataWriter/mockDataWriter.js';
  import { write } from 'fs';


const sandboxMain = async (data) => {
  // Use the data object passed as parameter

  // Load Positions data
  if (process.env.DEV_POS_DATA === 'STORED') {
      let positionsFromCSV = await csvEditor.readCSV('./modules_dev/mockData/positionsStoredForDevEnv.csv')
      data.positions = positionsFromCSV.map((position) => {
          return dataTypeHandler.processFQPositionsObjectFromCSV(position);
      })
      console.log(`positions data loaded successfully from CSV \n`)
  } else if (process.env.DEV_POS_DATA === 'NEW') {
      data.positions = await dataAgg.positionsDataSelector()
      await csvEditor.writeCSV('./modules_dev/mockData/positionsStoredForDevEnv.csv', data.positions)
      console.log(`positions data written to csv successfully for dev use \n`)
  }


  // Load Trades data
  if (process.env.DEV_TRADES_DATA === 'STORED') {
      const trades = await dataAggDbQueries.pullALLSorted(db, 'Trades', 'dateTime ASC');
      Object.assign(data, { trades });  // Update using Object.assign
      console.log(`trades data loaded successfully from DB \n`)
  } else if (process.env.DEV_TRADES_DATA === 'NEW') {
      const trades = await dataAgg.tradesDataSelectorAndUpdater(db, process.env.IBKR_FQ_TRADES_QTD);
      Object.assign(data, { trades });  // Update using Object.assign
      await csvEditor.writeCSV('./modules_dev/mockData/tradesStoredForDevEnv.csv', data.trades)
      console.log(`trades data written to csv successfully for dev use \n`)
  }


  // Load CPGW Modules
  if (process.env.START_KEEP_ALIVE === "TRUE") {
    let {default: ibkr_cpgw_calls} = await import('./modules/ibkr-cpgw-calls/ibkr-cpgw-calls.js');
    const orders = ibkr_cpgw_calls.ordersCustomFilter(await ibkr_cpgw_calls.getOrders(), 'Submitted');
    // const trades = await ibkr_cpgw_calls.getTrades();
    Object.assign(data, { orders });  // Update using Object.assign
    console.log('CPGW data updated successfully \n');
  }
}



export default { sandboxMain }