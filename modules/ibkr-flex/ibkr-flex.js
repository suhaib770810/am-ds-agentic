import axios from 'axios';
import xml2js from 'xml2js';

const ibkr_FlexQuery = async (queryId, lockoutPeriod = 10) => {
    try {
        
        const token = process.env.IBKR_TOKEN // Replace with your actual token

        // Step 1: Get refCode
        const getRefCode = await axios.post(`https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService/SendRequest?t=${token}&q=${queryId}&v=3`);
        const RefCodeJSON = await xml2js.parseStringPromise(getRefCode.data, { explicitArray: false });
        const refCode = RefCodeJSON.FlexStatementResponse.ReferenceCode

        // Step 2: Get statement


        const flexDataAttempt = async () => {
          const getFlexData = await axios.post(`https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService/GetStatement?t=${token}&q=${refCode}&v=3`)
          const parsedData = await xml2js.parseStringPromise(getFlexData.data, { explicitArray: false });
          return parsedData;
        }
        

        // const flexDataAttempt = () => {return tradesMockErrors["1019"]} // Use mock data for testing

        const attemptHandler = async (attempt = 0) => {
            try {
                const queryResponse = await flexDataAttempt();
                if (queryResponse.FlexStatementResponse !== undefined) {
                    if (queryResponse.FlexStatementResponse.Status === 'Warn' && queryResponse.FlexStatementResponse.ErrorCode === '1019') {
                        console.log('Attempt:', attempt + 1, 'Flex statement is still being processed. Retrying in 5 minutes...');

                        if (attempt < 4) { // Check against 4 because attempt starts at 0
                            // Wait for 5 minutes before retrying
                            await new Promise(resolve => setTimeout(resolve, 300000));
                            return attemptHandler(attempt + 1); // Recursively call and return the result

                        } else {
                            throw new Error('Max attempts reached. Unable to fetch data.');
                        }

                    } else if (queryResponse.FlexStatementResponse.Status === 'Warn' && queryResponse.FlexStatementResponse.ErrorCode === '1018') {
                        throw new Error('Too many requests made. Server is busy)');

                    } else {
                        throw new Error(`IBKR Flex Query server error: ${queryResponse['FlexStatementResponse']['ErrorMessage']}`); // Throw error for clarity
                    } 
                } else {
                    return queryResponse; // Return the successful response
                }

            } catch (error) {
                console.error('Flex attempt handler error:', error.message);
                throw error; // Re-throw the error to be caught by the initial caller
            }
        };
      

        const dataObject = await attemptHandler();

        console.log('IBKR Flex Query successful \n')

        console.log(`Starting ${lockoutPeriod} second FQ lockout period...\n`)
        await new Promise(resolve => setTimeout(resolve, lockoutPeriod * 1000));
        console.log('FQ lockout period complete... releasing data...\n')

        return dataObject
        
    } catch (err) {
      console.error('Flex query main function error:', err.message);
      return ('Flex darta could not be obtained: ' + err.message) // Return the error message for clarity
    }
}

export default ibkr_FlexQuery;