/*
* This file is about request crypto value
*/
const coinGeckoInterface = require('../interfaces/coinGeckoInterface')
const CoinGeckoInterface = new coinGeckoInterface()
const coreModelAbstract = require('./coreModelsAbstract')
const CryptoValueShema = require('../shemas/cryptoValueShema')

module.exports = class cryptoModels extends coreModelAbstract{
    
    async getPriceAndPersistDB(symbolMain,symbolSecond,date,direction){
        
        var dateConverted
        var lastDateExist = true
        if(direction){
            //use for before managment - construct date 1 day before the last 
            var lastValueInDB = await CryptoValueShema.findOne({ 'symbol_crypto' : symbolMain })
                                    .sort({ date: 1 }).exec()
            try{ var lastDate = lastValueInDB.date }catch{ lastDateExist = false } //need this for not crash by focus undefined
            //in case of start the scan
            if(lastDateExist){
                date = lastDate.setDate(lastDate.getDate()-1) //return a number??
                date = new Date(date)
                dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
            } else {
                var date = new Date()
                dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
            }
        } else {
            //use for today managment
            if(date === ""){
                var date = new Date()
                dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
            } else {
                dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
            }
        }

        var LimitedDate = new Date('2018-12-31')
        if(date > LimitedDate){
            var url = await CoinGeckoInterface.constructUrlPriceHistory(symbolMain,dateConverted)
            //manage request
            await this.hTTPRequest.query(url, "", "GET")
            .then( 
            result => { 
                this.hTTPRequest.responseBody = result.body
                return this.hTTPRequest.query(url, "", "GET")
            })
            var JSONresponse = JSON.parse(this.hTTPRequest.responseBody)
            if(!JSONresponse.error && JSONresponse.market_data){
                // persist data in DB
                const addData = new CryptoValueShema({
                    symbol_crypto: JSONresponse.symbol,
                    symbol_fiat: symbolSecond,
                    date: date,
                    fiat_value : JSONresponse.market_data.current_price[symbolSecond]
                })
                addData.save(function (err, addDatas) {
                    if (err) return console.error(err);
                })
            } else { console.log(JSONresponse.error) }
        }
    }
}