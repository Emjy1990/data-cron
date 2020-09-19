const request = require('request');

module.exports = class Request {
    
    constructor() {
        this.responseBody = {}
    }

    query( url, body, HTTPVerb ) {
        return new Promise( ( resolve, reject ) => {
            request({
                "method": HTTPVerb,
                "url": url,
                "body": JSON.stringify(body)
              }, function(err,result){
                if ( err )
                    return reject( err );
                resolve( result );
              });
        } );
    }
}