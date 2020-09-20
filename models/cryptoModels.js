/*
* This file is about request crypto value
*/
//Core
const coreModelAbstract = require('./coreModelsAbstract')
// Interface
const coinGeckoInterface = require('./../interfaces/coinGeckoInterface')
const CoinGeckoInterface = new coinGeckoInterface()
const GreymassInterface = require('./../interfaces/greymasseInterface');
//Shema
const CryptoValueShema = require('./../shemas/cryptoValueShema')
const tktStackHistoryShema = require('./../shemas/tktStakeHistoryShema')

module.exports = class cryptoModels extends coreModelAbstract{
    
    async getPriceAndPersistDB(symbolMain,symbolSecond,date,direction){
        
        var dateConverted
        var LimitedDate
        var lastDateExist = true
        var dateExisting

        if(direction){
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
        } else {
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
            } else { console.log(JSONresponse.error) }
        }
    }

    async getTKTAmountAndPersistDB(){

      //construct specific payload for request
      var greymassInterface = new GreymassInterface("cryptodynasty", "tktstakestat", 1);
      await this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb)
        .then( 
          result => { 
            this.hTTPRequest.responseBody = result.body;
            return this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb);
        });

        var responseJSON = JSON.parse(this.hTTPRequest.responseBody)
        //refine data
        var staked = parseInt(responseJSON.rows[0].staked.replace("TKT",""))
        var unstaking = parseInt(responseJSON.rows[0].unstaking.replace("TKT",""))
        var lpest_staked = parseInt(responseJSON.rows[0].lpest_staked.replace("TKT",""))
        // persist data in DB
            const addData = new tktStackHistoryShema({
            staked: staked,
            lpest_staked: lpest_staked,
            unstaking: unstaking,
            date: Date.now()
        })
        addData.save(function (err, addDatas) {
            if (err) return console.error(err);
        })
    }
}