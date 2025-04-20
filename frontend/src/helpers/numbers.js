export function formatWithComma(num) {
  let numString = num.toString();
  let decimal = numString.split(".")[1];
  if (decimal) {
    if (decimal.split("").length === 1) {
      numString = numString + "0";
    }
  }

  return numString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
