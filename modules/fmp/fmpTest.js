import FMP from './fmp.js';

const fmpTest = async (key) => {

    let fmp = new FMP(key)
    let gdp = await fmp.getGdp()
    let cpi = await fmp.getCpi()
    let federalFunds = await fmp.getFederalFundsRate()

    console.log(
        gdp, 
        cpi, 
        federalFunds
    )

}

// call the test function with command line arguments
fmpTest(process.argv.slice(2)[0])

export default FMP;