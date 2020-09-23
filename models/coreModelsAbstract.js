/*
* This file is about common feature 
*/
const HTTPRequest = require('./../utils/HTTPRequestClass');

module.exports = class coreModelAbstract {

    constructor(){
        this.hTTPRequest = new HTTPRequest;
    }

}