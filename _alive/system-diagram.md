# System Diagram

## Structure Manifest
- [Overview](#overview)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [File Map](#file-map)
- [Next](#next)

## Overview
`am-ds-agentic` is a Data Service (DS) designed to centralize financial data from multiple sources (primarily Interactive Brokers) into a structured SQLite database. It serves as a reliable data foundation for analytical and algorithmic trading engines.

## Architecture
The system is built as a **modular Node.js application** using **ES Modules (ESM)**. 

### Key Components:
- **Express Server (`am_32.js`)**: The entry point that handles HTTP requests and initiates the background scheduler.
- **Data Aggregator (`modules/dataAgg/`)**: The core logic that orchestrates data retrieval from various providers.
- **Service Integrations (`modules/ibkr-*`, `modules/fmp`)**: Specialized modules for interacting with external APIs (Flex Queries, CPGW, Financial Modeling Prep).
- **Storage Layer**: A SQLite3 database managed by a shared database wrapper in `modules_com/`.

## Data Flow
The system follows a cyclic **Pull-Process-Store-Serve** pattern:

1. **Trigger**: The `weekdayScheduler` triggers a data refresh (default: 08:00 on weekdays).
2. **Pull**: 
   - `ibkr-flex`: Requests trade reports from IBKR Flex Web Service.
   - `ibkr-cpgw-calls`: Fetches real-time position data from the IBKR Client Portal Gateway.
3. **Process**: 
   - `dataParser`: Extracts raw data from XML/JSON responses.
   - `dataTypeHandler`: Normalizes data types (strings to numbers, dates to SQL timestamps) and calculates custom fields (e.g., `contractDescCustom`).
4. **Store**: 
   - `dataAggDbQueries`: Performs delta updates by checking for the latest existing records and only inserting newer data.
5. **Serve**: 
   - Express routes (`/positions`, `/trades`) provide the aggregated data to consumers.

## Tech Stack
- **Runtime**: Node.js 20+ (ES Modules)
- **Database**: SQLite3
- **Web Framework**: Express 5.x
- **Utilities**: `axios` (HTTP), `xml2js` (XML parsing), `csv-parse` (CSV processing), `node-fetch` (REST calls).
- **Scheduling**: Custom `weekdayScheduler` in `modules_com`.

## File Map
- `am_32.js`: Server entry point and route definitions.
- `modules/`
  - `dataAgg/`: High-level orchestration and specialized DB queries.
  - `ibkr-flex/`: IBKR Flex Query integration (Reports/Trades).
  - `ibkr-cpgw-calls/`: IBKR Client Portal Gateway integration (Live Positions).
  - `fmp/`: Financial Modeling Prep API wrapper.
  - `trendAnalyzer/`: Utility for time-series analysis.
- `modules_com/`: (Submodule) Shared logic for Database, Scheduling, and common utilities.
- `schema/`: Defines the structure and mapping for database objects.
- `_alive/`: Living documentation (Decisions, Timeline, System Diagram).

## Next
- **Import Resolution**: Fix missing imports in `dataAgg.js`.
- **Environment Safety**: Add validation for all `process.env` dependencies.
- **UTC Standardization**: Transition date handling from hardcoded offsets to UTC timestamps.
- **Logging**: Implement a unified structured logging system.
