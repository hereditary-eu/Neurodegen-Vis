/**
 * Function to perform linear regression on two arrays of numbers
 */
function LinReg(xArray: number[], yArray: number[]): [number, number] {
  // Calculate Sums
  // console.log("linReg fun started");
  let xSum = 0,
    ySum = 0,
    xxSum = 0,
    xySum = 0;
  let count = xArray.length;

  // remove NaN values
  for (let i = 0; i < count; i++) {
    if (isNaN(xArray[i]) || isNaN(yArray[i])) {
      xArray.splice(i, 1);
      yArray.splice(i, 1);
      count--;
    }
  }

  for (let i = 0; i < count; i++) {
    xSum += xArray[i];
    ySum += yArray[i];
    xxSum += xArray[i] * xArray[i];
    xySum += xArray[i] * yArray[i];
  }
  let slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
  let intercept = ySum / count - (slope * xSum) / count;

  return [slope, intercept];
}

/**
 * Function to calculate the average line (slope=0) for given x and y arrays
 */
function CalcAverage(_xArray: number[], yArray: number[]): [number, number] {
  const slope = 0;
  let intercept = 0;

  const sum = yArray.reduce((acc, val) => acc + val, 0);
  const avg = sum / yArray.length;
  intercept = avg;

  return [slope, intercept];
}

export { LinReg, CalcAverage };
