export const formatNumber = (num:number) :string => {
  if (num === null || num === undefined || isNaN(num)) {
    return;
  }
  const isDecimal = num % 1 !== 0; // Check if number has decimal part
  const [intPart, decimalPart = ''] = num
    .toFixed(isDecimal ? 2 : 0)
    .split('.');

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return isDecimal ? `${formattedInt}.${decimalPart}` : formattedInt;
};