
//node-module
const schedule = require('node-schedule')
//Models
const CryptoModels = require('./../../models/cryptoDynasty/cryptoModels')
const cryptoModels = new CryptoModels
//Utils
const logs = require('./../logs')
const Logs = new logs

module.exports = class dispatchCronTypeManager {
    async launch(name,frequency,type){

        var splitType = type.split(".")
        var JobType = splitType[1]
        var SecondParams = splitType[2]
        var ThirdParams = splitType[3]

        switch(JobType){
            // data from TKT stat
            case "1": 
                var job = await schedule.scheduleJob(name,frequency, function() {
                    cryptoModels.getTKTAmountAndPersistDB()
                    Logs.saveLogs(name ,"Running")
                });
                if(job){return true} else {false}
            break;
            // get sell data
            case "2": 
                //check for not launch task without param
                if(SecondParams === undefined){return false}
                if(ThirdParams === undefined){return false}
                var job = await schedule.scheduleJob(name,frequency, function() {
                    cryptoModels.getActionInfoFromGreymass(SecondParams,"",ThirdParams)
                    Logs.saveLogs(name ,"Running")
                });
                if(job){return true} else {false}
            break;
            // get pool reward info
            case "3": 
                var job = await schedule.scheduleJob(name,frequency, function() {
                    cryptoModels.getTKTPoolRewardStat()
                    Logs.saveLogs(name ,"Running")
                });
                if(job){return true} else {false}  
            break;
            default: 
                return false
        }
    }
}