const express = require('express')
const app = express()
require('dotenv').config();

const port = process.env.PORT

const cronJobController = require('./controllers/cronJobController')
var CronJob = new cronJobController


/*
* Cette route va lister tous les jobs cron en service
*/
app.get('/', (req, res) => {
  CronJob.empty(res)
})

/*
* Cette route va lancer les jobs cron 
*/
app.get('/create', (req, res) => {
  CronJob.create(req,res)
})

/*
* Cette route va stopper les jobs cron par leur nom
*/
app.get('/delete', (req, res) => {
  CronJob.deleteCron(req, res)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})