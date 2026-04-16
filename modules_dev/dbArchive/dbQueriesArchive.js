const dbQueries = {

    // This function updates the database with new data
    // It checks if the data already exists based on unique fields
    // If it doesn't exist, it inserts the new data
    // If it exists, it can update the existing data (update logic not implemented)
    // It takes a database connection, table name, data array, and unique fields as parameters
    async dbUpdater(db, tableName, data, uniqueFields = []) {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Data must be a non-empty array');
            }

            if (!Array.isArray(uniqueFields) || uniqueFields.length === 0) {
                throw new Error('uniqueFields must be a non-empty array of field names');
            }

            // Verify all uniqueFields exist in the data
            const sampleData = data[0];
            uniqueFields.forEach(field => {
                if (!(field in sampleData)) {
                    throw new Error(`Unique field "${field}" not found in data`);
                }
            });

            let count = 0

            // sort data by dateTime ascending
            data = data.sort((a, b) => {
                return a.dateTime - b.dateTime
            })
            
            for (const row of data) {
                // Build WHERE clause for checking existence
                const whereConditions = uniqueFields
                    .map(field => `${field} = ?`)
                    .join(' AND ');
                const whereValues = uniqueFields.map(field => row[field]);
                
                // Check if record exists
                const existingRecord = await db.get(
                    `SELECT * FROM ${tableName} WHERE ${whereConditions}`,
                    whereValues
                );

                if (!existingRecord) {
                    // Insert new record if it doesn't exist
                    await this.singlePoster(db, tableName, row);
                    count++
                }
                // Note: Add your update logic here if needed
                /* 
                    TODO: Add update logic here if needed. Example structure:
                    else {
                        const updateColumns = Object.keys(row)
                            .filter(key => !uniqueFields.includes(key))
                            .map(key => `${key} = ?`);
                        const updateValues = [
                            ...Object.keys(row)
                                .filter(key => !uniqueFields.includes(key))
                                .map(key => row[key]),
                            ...whereValues
                        ];
                        const updateSql = `
                            UPDATE ${tableName} 
                            SET ${updateColumns.join(', ')} 
                            WHERE ${whereConditions}
                        `;
                        await db.run(updateSql, updateValues);
                    }
                */
            }

            return { 
                success: true, 
                count: count,
                message: `Database updated successfully. ${count} records updated` };
        } catch (error) {
            console.error('Error in dbUpdater:', error);
            return { success: false, error: error.message };
        }
    },

}

export default dbQueries;

