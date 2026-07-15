/* Parses the free-text pris field into a number of kronor.
   Handles "a + b = 12000", trailing öre ("12000,50" / "12000.50"),
   and discards values outside a plausible range. Returns undefined
   when no usable price can be extracted. */
export default function interpretPrice(price){

  let priceString = price ?? ""

  if (priceString.includes("=")){
    const equalsSplit = priceString.split("=");
    priceString = equalsSplit[equalsSplit.length-1];
  }

  if (priceString.includes(",")){
    const commaSplit = priceString.split(",");
    if (commaSplit[commaSplit.length-1].length === 2 && commaSplit[commaSplit.length-1].replace(/\D/g, "").length === 2){
      priceString = commaSplit.slice(0, -1).join("");
    }
  }

  if (priceString.includes(".")){
    const periodSplit = priceString.split(".");
    if (periodSplit[periodSplit.length-1].length === 2 && periodSplit[periodSplit.length-1].replace(/\D/g, "").length === 2){
      priceString = periodSplit.slice(0, -1).join("");
    }
  }

  const numericalPrice = Number(priceString.replace(/\D/g, ""));

  if (numericalPrice < 500 || numericalPrice > 100000){
    return
  }

  return numericalPrice;
}
