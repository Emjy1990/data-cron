/*
* This file is about function launched at the reload
*/

const cronJobShema = require('./../shemas/cronJobShema')
const CronManager = require('./../utils/dispatchCronTypeManager')
var cronManager = new CronManager

const logs = require('./logs')
const Logs = new logs

module.exports = class reloadAppManager {
    
    async reloadTaskAfterShutDown(){
        try{
            var cronActive = await cronJobShema.find({})
            for(let i = 0; i < cronActive.length; i++){
                cronManager.Work(cronActive[i].name, cronActive[i].frequency, cronActive[i].type)
            }
        } catch (error) {
            //this error is catched by trycatch in cron-manager
            Logs.saveLogs("reloadAppManager.reloadTaskAfterShutDown : " + error,"Error")
        }

    }
}