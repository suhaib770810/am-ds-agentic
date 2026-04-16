import axios from 'axios';
import xml2js from 'xml2js';



const ibkr_FlexQuery_singleAttempt = async (queryId) => {
  try {
    // Step 1: Get refCode

    let token = process.env.IBKR_TOKEN

    const getRefCode = await axios.post(`https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService/SendRequest?t=${token}&q=${queryId}&v=3`);
    const RefCodeJSON = await xml2js.parseStringPromise(getRefCode.data, { explicitArray: false });
    const refCode = RefCodeJSON.FlexStatementResponse.ReferenceCode

    // Step 2: Get statement


    const getFlexData = await axios.post(`https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService/GetStatement?t=${token}&q=${refCode}&v=3`)
    const parsedData = await xml2js.parseStringPromise(getFlexData.data, { explicitArray: false });
    return parsedData;
    
  } catch (err) {
    console.error('Error fetching Flex Query:', err.message);
  }
}

export default ibkr_FlexQuery_singleAttempt;