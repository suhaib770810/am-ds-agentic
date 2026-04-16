# Decisions

This file tracks the current architectural and design decisions for `am-ds-agentic`.

## Current Implementation Status
The system is a functional Node.js (ESM) data service that aggregates financial data from Interactive Brokers (IBKR) into a central SQLite database.

- **Data Sources**: 
  - **IBKR Flex Queries**: Used for bulk trade data (Trades).
  - **IBKR Client Portal Gateway (CPGW)**: Used for real-time position data (Positions).
- **Storage**: SQLite3 database with tables for `Trades` and `Positions`.
- **Scheduling**: A weekday scheduler runs at 08:00 to refresh data.
- **API**: Express server providing endpoints:
  - `GET /positions`: Returns current positions.
  - `GET /trades`: Returns all trades.
  - `GET /tradesNew`: Returns trades newer than a provided timestamp.

---

## Technical Evaluations & Major Decisions

### 1. Choice of SQLite3 for Storage
**Context**: Used as the primary data store for aggregated financial data.
- **Pros**:
  - Zero configuration; file-based, making it easy to manage and back up.
  - Sufficient performance for the scale of data processed (individual portfolios).
  - Great for local analytical engines (`am-algos-agentic`) to read directly or via the service.
- **Cons**:
  - Concurrent write limitations (though not a major issue for a single-scheduled-puller architecture).
  - Lack of advanced features like stored procedures or complex user management found in PostgreSQL.

### 2. Modular Architecture with ESM
**Context**: The project uses ES Modules and a directory-based module system.
- **Pros**:
  - Native Node.js support for modules.
  - Clear separation of concerns (e.g., `ibkr-flex` vs `fmp`).
- **Cons**:
  - **Fragility**: Some modules have missing imports (e.g., `dataAgg.js` missing `ibkr_cpgw_calls`), which only surface at runtime.
  - **Complexity**: Deep nesting and relative imports (`../../modules_com/...`) can be hard to maintain without aliasing.

### 3. Use of `modules_com` as a Git Submodule
**Context**: Shared utilities are stored in a separate repository.
- **Pros**:
  - Code reuse across multiple projects (e.g., `am-algos-agentic`).
  - Centralized updates for common logic (DB wrappers, schedulers).
- **Cons**:
  - **Maintenance Overhead**: Requires extra steps (`git submodule update --init`) that can lead to broken environments if forgotten.
  - **Hidden Logic**: Developers cannot easily see shared logic without navigating the submodule.

### 4. IBKR Flex Query Retry Logic (1019 Error)
**Context**: The `ibkr-flex.js` module implements a recursive retry with a 5-minute wait when IBKR reports a "1019" (processing) status.
- **Pros**:
  - Resilience: Handles the asynchronous nature of IBKR Flex reports without failing the entire task.
- **Cons**:
  - **Blocking**: Long waits (up to 20 minutes) can block the thread if not handled carefully, though it is `await`ed in an async flow.

---

## Proposed Technical Improvements

### 1. Reliability & Quality
- **Import Fixes**: Immediately resolve missing imports in `dataAgg.js`.
- **Environment Validation**: Implement a schema (e.g., `zod`) to validate `.env` variables at startup. Currently, missing keys lead to cryptic runtime errors.
- **Logging**: Replace `console.log` with a structured logger (e.g., `pino` or `winston`) to support log levels and better observability.

### 2. Architecture & Performance
- **Unified Error Handling**: Standardize on throwing `Error` objects rather than returning strings (found in `dataParser.js` and `ibkr-flex.js`).
- **Timezone Awareness**: In `dataTypeHandler.js`, the `-04:00` offset is hardcoded. This should be moved to configuration or made dynamic based on the exchange/server time.
- **Dependency Management**: Consider using `npm` workspaces or local packages instead of git submodules if the overhead becomes too high.

### 3. Feature Integration
- **FMP & TrendAnalyzer**: These modules are currently skeletons. They should be either fully integrated into the `dataAgg` flow or moved to an `experimental/` folder to reduce noise.

---

## Critical Evaluation
The current architecture is **"Modular but Fragile"**. The separation of concerns is well-intended, but the execution suffers from a lack of automated testing and strict type/import checking. The heavy reliance on environment variables and hardcoded offsets makes it sensitive to environment changes. However, for a single-developer or small-scale financial tool, it provides a very high "speed-to-delivery" and is easy to debug due to its simplicity.
