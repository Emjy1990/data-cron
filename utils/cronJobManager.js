/*
* This file is about simple CRON function 
*/

const schedule = require('node-schedule')
const DispatchCronTypeManager = require('./../utils/DispatchCronTypeManager')
dispatchCronTypeManager = new DispatchCronTypeManager

module.exports = class cronJobManager {

    async launchJob(name, frequency, type){
        return dispatchCronTypeManager.Work(name, frequency, type)
    }

    async stopJob(name){
        var job = schedule.scheduledJobs[name]
        if(!job){return false}
        await job.cancel()
        return true
    }

    async nextTime(name){
        var job = schedule.scheduledJobs[name];
        if(!job){return false}
        job.nextInvocation()
    }
}