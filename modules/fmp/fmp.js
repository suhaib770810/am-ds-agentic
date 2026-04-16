import fetch from 'node-fetch';

/**
 * A wrapper for the Financial Modeling Prep API.
 */
class FMP {
  /**
   * @param {string} apiKey - Your API key for Financial Modeling Prep.
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://financialmodelingprep.com/stable/';
  }

  /**
   * A generic method to fetch economic indicator data.
   * Full list of indicators can be found here: https://site.financialmodelingprep.com/developer/docs#economics-indicators
   * @param {string} indicatorName - The name of the indicator (e.g., 'GDP').
   * @returns {Promise<any>}
   */
  async getEconomicIndicator(indicatorName) {
    if (!indicatorName) {
      throw new Error('Indicator name is required.');
    }
    const url = `${this.baseUrl}economic-indicators?name=${indicatorName}&apikey=${this.apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${indicatorName}:`, error);
      throw error;
    }
  }

  /**
   * Fetches Gross Domestic Product (GDP).
   * @returns {Promise<any>}
   */
  async getGdp() {
    return this.getEconomicIndicator('GDP');
  }

  /**
   * Fetches Real GDP.
   * @returns {Promise<any>}
   */
  async getRealGdp() {
    return this.getEconomicIndicator('realGDP');
  }

  /**
   * Fetches Nominal GDP.
   * @returns {Promise<any>}
   */
  async getNominalGdp() {
    return this.getEconomicIndicator('nominalGDP');
  }

    /**
   * Fetches GDP Deflator.
   * @returns {Promise<any>}
   */
  async getGdpDeflator() {
    return this.getEconomicIndicator('gdpDeflator');
  }

  /**
   * Fetches Unemployment Rate.
   * @returns {Promise<any>}
   */
  async getUnemploymentRate() {
    return this.getEconomicIndicator('unemploymentRate');
  }

  /**
   * Fetches CPI (Consumer Price Index).
   * @returns {Promise<any>}
   */
  async getCpi() {
    return this.getEconomicIndicator('CPI');
  }

  /**
   * Fetches Inflation Rate.
   * @returns {Promise<any>}
   */
  async getInflationRate() {
    return this.getEconomicIndicator('inflationRate');
  }

    /**
   * Fetches Consumer Sentiment.
   * @returns {Promise<any>}
   */
  async getConsumerSentiment() {
    return this.getEconomicIndicator('consumerSentiment');
  }

  /**
   * Fetches Retail Sales.
   * @returns {Promise<any>}
   */
  async getRetailSales() {
    return this.getEconomicIndicator('retailSales');
  }

  /**
   * Fetches Durable Goods Orders.
   * @returns {Promise<any>}
   */
  async getDurableGoods() {
    return this.getEconomicIndicator('durableGoods');
  }

  /**
   * Fetches Initial Claims.
   * @returns {Promise<any>}
   */
  async getInitialClaims() {
    return this.getEconomicIndicator('initialClaims');
  }

  /**
   * Fetches Industrial Production.
   * @returns {Promise<any>}
   */
  async getIndustrialProduction() {
    return this.getEconomicIndicator('industrialProduction');
  }

  /**
   * Fetches New Privately-Owned Housing Units Started.
   * @returns {Promise<any>}
   */
  async getNewHousingStarts() {
    return this.getEconomicIndicator('newPrivatelyOwnedHousingUnitsStarted');
  }

  /**
   * Fetches Total Private Establishments.
   * @returns {Promise<any>}
   */
  async getTotalPrivateEstablishments() {
    return this.getEconomicIndicator('totalPrivateEstablishments');
  }

  /**
   * Fetches Total Households.
   * @returns {Promise<any>}
   */
  async getTotalHouseholds() {
    return this.getEconomicIndicator('totalHouseholds');
  }

  /**
   * Fetches Federal Funds Rate.
   * @returns {Promise<any>}
   */
  async getFederalFundsRate() {
    return this.getEconomicIndicator('federalFunds');
  }

  /**
   * Fetches Treasury Yield.
   * @param {'2year' | '5year' | '10year' | '30year'} maturity - The treasury maturity.
   * @returns {Promise<any>}
   */
  async getTreasuryYield(maturity) {
      let indicatorName;
      switch (maturity) {
          case '2year':
              indicatorName = 'twoYearTreasuryYield';
              break;
          case '5year':
              indicatorName = 'fiveYearTreasuryYield';
              break;
          case '10year':
              indicatorName = 'tenYearTreasuryYield';
              break;
          case '30year':
              indicatorName = 'thirtyYearTreasuryYield';
              break;
          default:
              throw new Error('Invalid maturity for treasury yield. Use one of: 2year, 5year, 10year, 30year');
      }
      return this.getEconomicIndicator(indicatorName);
  }
}

export default FMP;