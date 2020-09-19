/*
* Routing between CRON and function need to be use
*/
const CryptoModels = require('../models/cryptoModels')
const cryptoModels = new CryptoModels
const schedule = require('node-schedule')

module.exports = class dispatchCronTypeManager {
    
    async Work(name,frequency,type){
        
        var splitType = type.split(".")
        var mainType = splitType[0]
        var symbolMain = splitType[1]
        var symbolSecond = splitType[2]

        switch(mainType){
            //Get EOS/EUR Value each day (false for today)
            case "1": 
                var job = await schedule.scheduleJob(name,frequency, function() {
                    cryptoModels.getPriceAndPersistDB(symbolMain,symbolSecond,"",false)
                });
                if(job){return true} else {false}
            break;
            //GET EOS/EUR past (true for before today)
            case "2": 
                var job = await schedule.scheduleJob(name,frequency, function() {
                    cryptoModels.getPriceAndPersistDB(symbolMain,symbolSecond,"",true)
                });
                if(job){return true} else {false}
            break;
            default: 
                return false
        }
    }
}