
//node-module
const schedule = require('node-schedule')
//Models
const CoreFeaturesModels = require('./../../models/coreFeaturesModels')
const coreFeaturesModels = new CoreFeaturesModels
//Utils
const logs = require('./../logs')
const Logs = new logs

module.exports = class dispatchCronTypeManager {
    async launch(name,frequency,type){

        var splitType = type.split(".")
        var JobType = splitType[1]
        var SecondParams = splitType[2]
        var ThirdParams = splitType[3]
        var FourParams = splitType[4]

        switch(JobType){
            //Get crypto value
            case "1": 
                //check for not launch task without param
                if(SecondParams === undefined){return false}
                if(ThirdParams === undefined){return false}
                if(FourParams === undefined){return false}
                var job = await schedule.scheduleJob(name,frequency, function() {
                    coreFeaturesModels.getPriceAndPersistDB(SecondParams,ThirdParams,"",FourParams)
                    Logs.saveLogs(name ,"Running")
                });
                if(job){return true} else {false}
            break;
            default: 
                return false
        }
    }
}