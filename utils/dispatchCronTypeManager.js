/*
* Routing between CRON and function need to be use
*/

// Launcher
const cryptoDynastyLauncher = require('./launcher/cryptoDynastyLauncher')
const CryptoDynastyLauncher = new cryptoDynastyLauncher
const coreLauncher = require('./launcher/coreLauncher')
const CoreLauncher = new coreLauncher
//Utils
const logs = require('./logs')
const Logs = new logs


module.exports = class dispatchCronTypeManager {
    
    async Work(name,frequency,type){
        
        var splitType = type.split(".")
        var mainType = splitType[0]

        if(mainType === undefined){return false}

        switch(mainType){
            case "core": 
                return await CoreLauncher.launch(name,frequency,type)
            break;
            case "cryptodynasty": 
                return await CryptoDynastyLauncher.launch(name,frequency,type)
            break;
            default: 
                return false
        }
    }
}