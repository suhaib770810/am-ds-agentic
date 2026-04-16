/**
 * Analyzes a time series to determine the reporting frequency and calculate the rate of change.
 * @param {Array<Object>} dataSeries - An array of data points with 'date' and 'value' properties.
 * @returns {Object} An object containing the frequency and the trend data.
 */
export function analyzeTrend(dataSeries) {
  if (!dataSeries || dataSeries.length < 2) {
    return {
      frequency: 'Unknown',
      trend: [],
    };
  }

  // Sort data by date ascending to make trend calculation easier
  const sortedData = [...dataSeries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const trends = [];
  let totalDays = 0;

  for (let i = 1; i < sortedData.length; i++) {
    const prev = sortedData[i - 1];
    const curr = sortedData[i];

    const datePrev = new Date(prev.date);
    const dateCurr = new Date(curr.date);

    const timeDiff = dateCurr.getTime() - datePrev.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);
    totalDays += dayDiff;

    const valueChange = curr.value - prev.value;
    const rateOfChange = (valueChange / prev.value) * 100;

    trends.push({
      startDate: prev.date,
      endDate: curr.date,
      valueChange: valueChange.toFixed(4),
      rateOfChange: rateOfChange.toFixed(4) + '%',
    });
  }

  const avgDays = totalDays / (sortedData.length - 1);
  let frequency = 'Irregular';
  if (avgDays > 89 && avgDays < 92) {
    frequency = 'Quarterly';
  } else if (avgDays > 28 && avgDays < 32) {
    frequency = 'Monthly';
  }

  return {
    frequency,
    trend: trends,
  };
}
