// load dotenv
import dotenv from 'dotenv'
dotenv.config({path: './.dotenv/.env'})

// load express
import express from 'express';
const app = express();
const port = process.env.PORT || 3001;

// load db
import path from 'path';
import Database from './modules_com/db/db.js'
let db = await Database.create(path.join(process.env.DB_DIR, process.env.DB_NAME))

// Load data Aggregator and Active Position Analysis modules
import dataAgg from './modules/dataAgg/dataAgg.js';
import dataAggDbQueries from './modules/dataAgg/dataAggDbQueries.js'; 

// load scheduler module
import weekdayScheduler from './modules_com/Scheduler/scheduler.js';


let data = {};


if (process.env.NODE_ENV === 'PROD') {

  // Function to refresh all data
  const refreshAllData = async () => {
    try {
        const newData = await dataAgg.pullDataFromAllSources(db);
        Object.assign(data, newData); // Updates existing object instead of reassigning
        console.log('Data refresh completed successfully\n');
    } catch (error) {
        console.error('Error refreshing data:', error, '\n');
    }
  };

  // Schedule regular updates
  weekdayScheduler(refreshAllData, '8:00');

}

if (process.env.NODE_ENV === 'DEV') {
  let devModule = await import('./sandbox.js');
  console.log('Sandbox environment loaded successfully');

  // Function to refresh all data in sandbox
  const refreshAllData = async () => {
    try {
        await devModule.default.sandboxMain(data);
        console.log('Sandbox data refresh completed successfully');
    } catch (error) {
        console.error('Error during sandbox data refresh:', error);
    }
  };

  // Schedule regular updates
  weekdayScheduler(refreshAllData, '8:00');

}

app.get('/positions', async (req, res) => {
  console.log('positions requested\n');
  if (!data.positions) {
    try {
      // If no positions data exists, try to fetch it
      const positions = await dataAgg.pullDataFromAllSources(db);
      data.positions = positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return res.status(500).send('Error fetching positions data');
    }
  }
  res.send(data.positions);
})

app.get('/trades', async (req, res) => {
  console.log('All trades requested, sending data now\n')
  const freshTrades = await dataAggDbQueries.pullALLSorted(db, 'Trades')
  res.send(freshTrades)
})

app.get('/tradesNew', async (req, res) => {
  let timeStamp = req.query.timestamp
  let tradesNew = await dataAggDbQueries.pullAllFilteredSorted(db, 'Trades', timeStamp)
  if (typeof tradesNew === 'string') {
    console.log('New Trades Route Error: no new trades found\n')
    res.status(500)
    res.send('no new trades found')
    return
  }
  console.log(`New Trades Route Success: trades requested, sending data newer than ${Date.toLocaleString(new Date(timeStamp))}\n`)
  res.status(200)
  res.send(tradesNew)
})

app.listen(port, () => {
  console.log(`AM3.2. server is running on port ${port}\n`);
})
