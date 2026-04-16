import { analyzeTrend } from './trendAnalyzer.js';
import * as mockData from '../fmp/mockFmpData.js';

// Analyze the CPI data
const cpiTrend = analyzeTrend(mockData.cpi);
console.log('CPI Trend Analysis:', cpiTrend);

// Analyze the GDP data
const gdpTrend = analyzeTrend(mockData.gdp);
console.log('GDP Trend Analysis:', gdpTrend);

// Analyze the Federal Funds data
const federalFundsTrend = analyzeTrend(mockData.federalFunds);
console.log('Federal Funds Trend Analysis:', federalFundsTrend);
