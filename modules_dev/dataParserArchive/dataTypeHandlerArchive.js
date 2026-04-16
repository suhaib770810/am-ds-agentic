const dataTypeHandler = {


    positionsObjectContractDesc: (positionsObject) => {
        // This function takes a positions object and returns a string with the contract description
        // The contract description is in the format: TICKER YYYYMMDD STRIKE
        // It uses the underlyingSymbol, expiry and strike fields from the positions object
        let symbolParts = positionsObject.symbol.split(' ')
        let underlyingSymbol = symbolParts[0]
        let expStrike = symbolParts[1]
        let expiry = expStrike.substring(0, 6)
        let descParts = positionsObject.description.split(' ')
        let strike = descParts[2]
        let contractDescCustom = `${underlyingSymbol} ${expiry} ${strike}`
        return {
            underlyingSymbol,
            expiry,
            strike,
            contractDescCustom
        }
    },

}

export default dataTypeHandler;

