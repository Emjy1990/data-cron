/*
* It's param structure for send request to Greymass - EOS blockchain explorer
*/
module.exports = class GreymassInterface {

    constructor(dapp, table, limit){

        //at the moment this param are always the same
        this.url = "https://eos.greymass.com/v1/chain/get_table_rows";
        this.urlHistory = "https://eos.greymass.com/v1/history/get_actions";
        this.HTTPVerb = 'POST';
        this.json = true;
        this.table_key = ""; 
        this.index_position = 1;
        this.key_type = "i64";

        //seems differents by dapp or eos account
        switch(dapp){
            case "cryptodynasty": 
                this.code = "eossanguodiv";
                this.scope = "eossanguodiv";
            break
        }
        
        this.table = table;
        this.lower_bound = null;
        this.upper_bound = null;
        this.limit = limit;
        this.reverse = false;
        this.show_payer = false;

        this.payload = {
            "json":this.json,
            "code":this.code,
            "scope":this.scope,
            "table":this.table,
            "table_key":this.table_key,
            "lower_bound":this.lower_bound,
            "upper_bound":this.upper_bound,
            "index_position":this.index_position,
            "key_type":this.key_type,
            "limit":this.limit,
            "reverse":this.reverse,
            "show_payer":this.show_payer
        };

        this.payloadHistory = {"account_name":this.table,"pos":this.limit,"offset":-100}
    }
}