//node-module
const express = require('express')
const app = express()
require('dotenv').config();

const port = process.env.PORT

//Controller
const cronJobController = require('./controllers/cronJobController')
var CronJob = new cronJobController

//Utils
const reloadAppManager = require('./utils/reloadAppManager')
ReloadAppManager = new reloadAppManager()
const logs = require('./utils/logs')
const Logs = new logs


try{
  /*
  * Cette route va lister tous les jobs cron en service
  */
  app.get('/cron', (req, res) => {
    CronJob.empty(res)
  })

  /*
  * Cette route va lancer les jobs cron 
  */
  app.get('/cron/create', (req, res) => {
    CronJob.create(req,res)
  })

  /*
  * Cette route va stopper les jobs cron par leur nom
  */
  app.get('/cron/delete', (req, res) => {
    CronJob.deleteCron(req, res)
  })

  //need this part to reload existing launched task
  ReloadAppManager.reloadTaskAfterShutDown()

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

  Logs.saveLogs("App launched","Running")
} catch(error) {
  Logs.saveLogs("App crash at launch : " + error,"Error")
}
