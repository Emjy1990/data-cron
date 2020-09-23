const logShema = require('../shemas/logShema')

module.exports = class Logs {
    
    saveLogs(content, status){
        const log = new logShema({
            content:  content,
            status: status,
            date: Date.now()
        })
        log.save(function (err, logs) {
            if (err) return console.error(err);
        })
    }
}