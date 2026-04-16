# System Diagram

## Structure Manifest
- [Overview](#overview)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [File Map](#file-map)
- [Next](#next)

## Overview
`am-ds-agentic` is a data aggregation service. It is responsible for pulling data from various external and internal sources, processing it, and storing it in a central SQLite database.

## Architecture
Node.js Express application using ES Modules. It follows a modular structure where specific data aggregation logic is isolated in the `modules/` directory.

## Data Flow
1. **Pull**: Modules in `modules/` fetch data from sources (e.g., CSV, APIs).
2. **Process**: Data is parsed and normalized.
3. **Store**: Results are persisted in a central SQLite database.
4. **Serve**: Data is exposed via Express routes or accessed by sibling services.

## Tech Stack
- **Runtime**: Node.js 20+
- **Database**: SQLite3
- **Web Framework**: Express
- **Parsing**: csv-parse

## File Map
- `am_32.js`: Main entry point.
- `modules/`: Data aggregation modules.
- `modules_com/`: Shared communication and DB modules.
- `schema/`: Database schema definitions.

## Next
- Improve error handling in pull modules.
- Add more robust logging for scheduled tasks.
