/*
* This file is about CRON DB function
*/

const mongooseDB = require('../orm/mongoose');
const MongooseDB = new mongooseDB(process.env.DB_URL);
const cronJobShema = require('../shemas/cronJobShema')

module.exports = class cronJobCRUD {

    async list(){
        return cronJobShema.find({}).exec()
    }

    async insertNewCron(name, freq, type){

        const addingCronJob = new cronJobShema({
            "name": name,
            "frequency": freq,
            "status": "Run",
            "type": type,
            "launching_date": Date.now()
        });
        addingCronJob.save(function (err, addingCronJobs) {
            if (err) return console.error(err);
        });
    }

    async deleteCron(name){
        cronJobShema.deleteOne({ name : name}, function(err, result){
            if (err) return console.error(err);
        })
    }
}


