/*
* This file is about mongoose function
*/

var mongooseDB = require('mongoose')

module.exports = class mongoose {

    constructor(dbUrl){
        this.dbUrl = dbUrl; 
        mongooseDB.connect(this.dbUrl , {useNewUrlParser: true, useUnifiedTopology: true });
        this.db = mongooseDB.connection;

        this.db.on('error', console.error.bind(console, 'connection error:'));
        
        this.db.once('open', function() {
            console.log("connected");
        });
    }
}