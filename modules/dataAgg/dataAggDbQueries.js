const dataAggDbQueries = {

    async pullALLSorted(db, tableName, orderBy = 'dateTime ASC') {
        try {
            const sql = `SELECT * FROM ${tableName} ORDER BY ${orderBy}`;
            const rows = await db.all(sql);
            return rows
        } catch (error) {
            console.error('Error in pullALLSorted:', error);
            return error.message
        }
    }, 

    async pullAllFilteredSorted(db, tableName, timestamp, whereClause = 'dateTime > ?', orderBy = 'dateTime ASC') {
        try {
            const sql = `SELECT * FROM ${tableName} WHERE ${whereClause} ORDER BY ${orderBy}`;
            const rows = await db.all(sql, [timestamp]);
            const date = new Date(timestamp * 1000)
            if (rows.length === 0) {
                console.log(`dbQueryError: No data found from ${tableName} newer than ${date.toLocaleString()}\n`);
                return 'no data found'
            }
            console.log(`dbQuerySuccess: Data pulled from ${tableName} newer than ${date.toLocaleString()} successfully\n`);
            return rows
        } catch (error) {
            console.error('dbQueryError: Error in pullAllFilteredSorted:', error);
            return error.message
        }
    }, 

    // This function pulls the latest row from a specified table
    // To be used with the newer simpler method of just adding data newer than the latest row
    async pullLatestRow(db, tableName) {
        try {
            const sql = `SELECT * FROM ${tableName} ORDER BY dateTime DESC LIMIT 1`;
            const row = await db.get(sql);
            return row
        } catch (error) {
            console.error('Error in pullLatestRow:', error, `\n`);
            return error.message
        }
    },
    
}

export default dataAggDbQueries