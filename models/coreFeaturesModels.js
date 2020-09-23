/*
* This file is about Core feature (scan crypto price)
*/
//Core
const coreModelAbstract = require('./coreModelsAbstract')
// Interface
const coinGeckoInterface = require('./../interfaces/coinGeckoInterface')
const CoinGeckoInterface = new coinGeckoInterface()
//Shema
const CryptoValueShema = require('./../shemas/cryptoValueShema')
//Utils
const logs = require('./../utils/logs')
const Logs = new logs

module.exports = class coreFeaturesModels extends coreModelAbstract{

    async getPriceAndPersistDB(symbolMain,symbolSecond,date,direction){
        try{
            var dateConverted
            var LimitedDate
            var lastDateExist = true
            var dateExisting
            
            if(direction === "back"){
                LimitedDate = new Date('2018-12-31')
                //use for before managment - construct date 1 day before the last 
                var lastAscValueInDB = await CryptoValueShema.findOne({ 'symbol_crypto' : symbolMain })
                .sort({ date: 1 }).exec()
                try{ var lastAscDate = lastAscValueInDB.date }catch{ lastDateExist = false } //need this for not crash by focus undefined
                //in case of start the scan
                if(lastDateExist){
                    date = lastAscDate.setDate(lastAscDate.getDate()-1) //return a number??
                    date = new Date(date)
                    dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
                } else {
                    var date = new Date()
                    dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
                }
            } 
            if(direction === "front") {
                //use for today managment
                if(date === ""){
                    var date = new Date()
                    dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
                } else {
                    dateConverted = date.getDate()+"-"+(date.getMonth()+1)+"-"+ date.getFullYear()
                }
                //verify Date in DB
                var lastDescValueInDB = await CryptoValueShema.findOne({ 'symbol_crypto' : symbolMain })
                .sort({ date: -1 }).exec()
                try{ var lastDescDate = lastDescValueInDB.date }catch{ lastDateExist = false }
                if(lastDateExist){
                    dateExisting = lastDescDate.getDate()+"-"+(lastDescDate.getMonth()+1)+"-"+ lastDescDate.getFullYear()
                }
            }
            if(!date){throw "Error date handling date undefined"}
    
            //case of before after limited date or date are always in DB
            if(date > LimitedDate || date === dateExisting){ 
    
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
                } else { throw " JSON error parsing : " +  JSONresponse.error }
            }
        } catch (error) {
            Logs.saveLogs("coreFeaturesModels.getPriceAndPersistDB : " + error,"Error")
        } 
    }
}