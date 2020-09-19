/*
* This file is about coinGecko interface function
*/

module.exports = class coinGeckoInterface {
        async constructUrlPriceHistory(symbol, date){
            return "https://api.coingecko.com/api/v3/coins/" + symbol + "/history?date="+ date + "&localization=false";
        }
}