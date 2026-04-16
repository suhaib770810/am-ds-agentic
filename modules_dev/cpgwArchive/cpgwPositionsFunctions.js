const cpgwPositionsFunctions = {
    // this function takes the contract description STRING from POSITIONS and parses it 
    // it returns ticker, expiry, strike and customContractDesc (which is a string of the ticker, expiry and strike)
    contractDescParser: (description) => {

        // Extract ticker (first 4 chars and trim)
        const ticker = description.substring(0, 4).trim();

        // Get the rest of the string after the ticker and spaces
        const restOfString = description.substring(4).trim();

        // Split the rest of the string by spaces, but handle the part in brackets
        const parts = restOfString.split(' ');

        let expiry = '';

        let strike = '' 

        let customContractDesc = '';

        // Find the index of the part containing the opening bracket '['
        const bracketStartIndex = parts.findIndex(part => part.includes('['));  

        if (bracketStartIndex !== -1) { // -1 means no bracket found
            // Parts before the bracket
            strike = parts[1];

            // Content inside the brackets
            const bracketContent = parts.slice(bracketStartIndex).join(' ').slice(1, -1); // Join and remove brackets
            const bracketParts = bracketContent.split(' ').filter(part => part !== ''); // Split and remove empty strings
            
            // parse internal code to get numeric expiry date
            let internalCode = bracketParts[1]
            let year2digit = internalCode.substring(0, 2);
            let year4digit = "20" + year2digit;
            let month = internalCode.substring(2, 4);
            let date = internalCode.substring(4, 6);
            expiry = year4digit + month + date;
            customContractDesc = `${ticker} ${expiry} ${strike}`;

        } else {
            // Handle cases without brackets if necessary, though the prompt implies they are always present
            // For now, assume brackets are always there based on the example
            console.error("Contract description format unexpected: missing brackets");
            return null;
        }

        return {
            ticker,
            expiry,
            strike,
            customContractDesc
        };
    },

    // takes an array of denested positions and sorts them by ticker and options
    // returns an object with tickers as keys and an array of trades as values
    positionsByTicker: async (positionsData) => {
        try {
            let sortedPositions = {}
            positionsData.forEach((position) => {
                //get ticker from contractDesc
                const ticker = contractDescParser(position["contractDesc"]).ticker;
                // push position to sorted positions object

                if (!sortedPositions[ticker]) {
                    sortedPositions[ticker] = [];
                }
                sortedPositions[ticker].push(position);
            })

            return sortedPositions;
        } 
        catch (error) {
            console.error(`Error sorting positions data by ticker: ${error}`);
            return ('Error getting trades by ticker:' + error.message)
        }
    },

    // takes an array of denested positions and sorts them by ticker and options
    // returns an object with tickers and options as keys and an array of trades as values
    positionsByTickerAndOptions: async (positionsData) => {
        try {
            let sortedPositions = {}
            positionsData.forEach((position) => {
                //get ticker from contractDesc

                let contractDesc = position["contractDesc"];
                let ticker = contractDescParser(contractDesc).ticker;
                let customContractDesc = contractDescParser(contractDesc).customContractDesc;

                // push position to sorted positions object

                if (!sortedPositions[ticker]) {
                    sortedPositions[ticker] = {};
                }

                if (!sortedPositions[ticker][customContractDesc]) {
                    sortedPositions[ticker][customContractDesc] = [];
                }

                sortedPositions[ticker][customContractDesc].push(position);
            })

            return sortedPositions;
        } 
        catch (error) {
            console.error(`Error sorting positions data by ticker: ${error}`);
            return ('Error getting positions by ticker and options:' + error.message)
        }
    },
}

export default cpgwPositionsFunctions;