/*
* This file is about routing of feature
*/

const cronJobCRUD = require('../models/cronJobModels')
var CronJobCRUD = new cronJobCRUD
const cronJobManager = require('../utils/cronJobManager')
var CronJobManager = new cronJobManager

module.exports = class cronJobController{

    async empty(res){
        var list = await CronJobCRUD.list()
        res.send(list)
    }

    async create(req,res){

        var name = req.param("name")
        var freq = req.param("freq")
        var type = req.param("type")
        //chek des paramètres
        if(name === undefined){return res.send("Name don't find") }
        if(freq === undefined){return res.send("Freq don't find") }
        if(type === undefined){return res.send("Type don't find") }

        //check des doublons
        var list = await CronJobCRUD.list()
        for(let i = 0; i < list.length; i++){
            if(list[i].name === name) {return res.send("Nom déjà existant")}
        } 

        //crée le process
        var launchingJob = await CronJobManager.launchJob(name,"*/"+ freq +" * * * *", type)
        
        if(launchingJob){
            //crée la tache en DB
            await CronJobCRUD.insertNewCron(name, freq, type)
            return res.send('all is okey')
        } else {
            return res.send('probleme durant le lancement')
        }
    }

    async deleteCron(req,res){
        if(name === undefined){return res.send("Name don't find") }
        //check de l'existant
        var list = await CronJobCRUD.list()
        var cpt = 0;
        for(let i = 0; i < list.length; i++){
            if(list[i].name === name) {cpt++}
        } 
        if(cpt === 0){return res.send("Aucune tâche à ce nom")}

        //crée le process
        var stoppingJob = await CronJobManager.stopJob(name)

        if(stoppingJob){
            //supprime la tache en DB
            await CronJobCRUD.deleteCron(name)
            return res.send('all is okey')
        } else {
            return res.send('probleme durant la suppression')
        }
    }
}