/*
* This file is about request crypto value
*/
//Core
const coreModelAbstract = require('./../coreModelsAbstract')
// Interface
const GreymassInterface = require('./../../interfaces/greymasseInterface');
//Shema
const tktStackHistoryShema = require('./../../shemas/cryptoDynasty/tktStakeHistoryShema')
const SellShema = require('./../../shemas/cryptoDynasty/sellShema')
const SellScanPosition = require('./../../shemas/cryptoDynasty/sellScanPositionShema')
const poolRewardTKT = require('./../../shemas/cryptoDynasty/poolRewardTKT')
//Utils
const logs = require('./../../utils/logs')
const Logs = new logs

module.exports = class cryptoModels extends coreModelAbstract{
    
    async getTKTAmountAndPersistDB(){
        try{
            //construct specific payload for request
            var greymassInterface = new GreymassInterface("cryptodynasty", "tktstakestat", 1);
            await this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb)
            .then( 
                result => { 
                this.hTTPRequest.responseBody = result.body;
                return this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb);
            });

            var responseJSON = JSON.parse(this.hTTPRequest.responseBody)
            //refine data
            var staked = parseInt(responseJSON.rows[0].staked.replace("TKT",""))
            var unstaking = parseInt(responseJSON.rows[0].unstaking.replace("TKT",""))
            var lpest_staked = parseInt(responseJSON.rows[0].lpest_staked.replace("TKT",""))
            // persist data in DB
                const addData = new tktStackHistoryShema({
                staked: staked,
                lpest_staked: lpest_staked,
                unstaking: unstaking,
                date: Date.now()
            })
            addData.save(function (err, addDatas) {
                if (err) return console.error(err);
            })
        } catch( error ) {
            Logs.saveLogs("cryptoModels.getTKTAmountAndPersistDB : " + error,"Error")
        }
           
    }

    async getActionInfoFromGreymass(account, pos, direction){
        
        try{
            var posBeforeScan
            if(!pos){
                if(direction === "back"){
                    posBeforeScan = await SellScanPosition.findOne({direction: direction}).exec()
                }
                if(direction === "front"){
                    posBeforeScan = await SellScanPosition.findOne({direction: direction}).exec()
                } 
                if(!posBeforeScan){ pos= 10000000 
                } else {
                    pos = posBeforeScan.position
                }

            }
            //search history action 
            var greymassInterface = new GreymassInterface("cryptodynasty", account, pos); //limit = pos
    
            await this.hTTPRequest.query(greymassInterface.urlHistory, greymassInterface.payloadHistory, greymassInterface.HTTPVerb)
            .then( 
                result => { 
                    this.hTTPRequest.responseBody = result.body;
                    return this.hTTPRequest.query(greymassInterface.urlHistory, greymassInterface.payloadHistory, greymassInterface.HTTPVerb);
            });
            var resultJSON = JSON.parse(this.hTTPRequest.responseBody)
            //need this when we are at the end
            if(resultJSON.error === undefined){
    
                var result = await this.ScanSellMat(resultJSON);
                // refine data
                for(let i2=0; i2<result.length; i2++){
                    // object by each sell
                    var memoCutted = result[i2].memo.split(":");
                    var type = memoCutted[1].replace("-sale","");
                    
                    const UnicSell = new SellShema({
                        type: type,
                        id_element: memoCutted[2],
                        date: new Date(result[i2].date),
                        amount: parseFloat(result[i2].quantity),
                        seller: memoCutted[4],
                        buyer: result[i2].to,
                        id_sale: memoCutted[3],
                        pos : result[i2].pos
                    });
    
                    //faire un check si ça n'existe pas déjà
                    SellShema.find({ id_sale : memoCutted[3] }, function(err,result){
                        if(result.length === 0){
                            //on enregistre la vente
                            UnicSell.save(function (err, UnicSells) {
                                if (err) return console.error(err);
                            });
                        };
                    });
                } 
            } else {console.log(resultJSON.error)}
    
            var incr
            if(direction === "front"){incr = 100}
            if(direction === "back"){incr = -100}
            var PosAfterScan = pos+incr
            //cas ou on a rien en DB
            var resultPosInDB = await SellScanPosition.findOne({direction : direction})
            if(!resultPosInDB){
                const newPos = new SellScanPosition({
                    direction : direction,
                    position : pos
                })
                newPos.save(function (err, UnicSells) {
                    if (err) return console.error(err);
                });
            }
            //et après on l'update
            await SellScanPosition.updateOne({direction: direction},{position: PosAfterScan})
        } catch( error ) {
            Logs.saveLogs("cryptoModels.getTKTAmountAndPersistDB : " + error,"Error")
        }
    }

    async ScanSellMat(DataWork){
        var memoIndex = [] //sert uniquement à dédoublonner
        var Sales = [] //contenu des ventes
        //check toute les ventes
        for(let index=0;index<DataWork.actions.length;index++){// on cherche les ventes
            if(DataWork.actions[index].action_trace.act.data){
                if(DataWork.actions[index].action_trace.act.data.memo){//si ya un memo
                    if(DataWork.actions[index].action_trace.act.data.memo.match("eosdynasty:(material|item|prop)")){
                        if(memoIndex.indexOf(DataWork.actions[index].action_trace.act.data.memo) == -1){//on a pas le même memo        
                            memoIndex.push(DataWork.actions[index].action_trace.act.data.memo)//on ajoute la vente
                            var DataAndDate = DataWork.actions[index].action_trace.act.data
                            DataAndDate.date = DataWork.actions[index].block_time
                            DataAndDate.pos = DataWork.actions[index].account_action_seq
                            Sales.push(DataAndDate); //ajoute la vente
                        }
                    }
                }
            }
        }
        return Sales
    } 

    async getTKTPoolRewardStat(){
        try{
            //construct specific payload for request
            var greymassInterface = new GreymassInterface("cryptodynasty", "tktdividhist", 10000);
            await this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb)
            .then( 
                result => { 
                this.hTTPRequest.responseBody = result.body;
                
                return this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb);
            });
            if(this.hTTPRequest.responseBody){ //avoid error in case of bad request
                var responseJSON = JSON.parse(this.hTTPRequest.responseBody)
                responseJSON = responseJSON.rows
                //check in DB
                var poolReward = await poolRewardTKT.findOne({}).sort({dividend_time: -1}).exec()
                // update DB
                if(poolReward){
                    for( let i=0 ; i<responseJSON.length ; i++ ){
                        if(responseJSON[i].dividend_time < poolReward.dividend_time){
                            var poolRewardCheck = await poolRewardTKT.find({ dividend_time : responseJSON[i].dividend_time }).exec()
                            //check this date is not create
                            if(!poolRewardCheck){
                                var NewHistory = new poolRewardTKT({
                                    total_eos : parseFloat(responseJSON[i].total_eos),
                                    dividend_time : responseJSON[i].dividend_time
                                })
                                NewHistory.save(function (err, NewHistorys) {
                                    if (err) return console.error(err);
                                });
                            }
                        }
                    }
                } else { //starter
                    for( let i2=0 ; i2<responseJSON.length ; i2++ ){
                            var NewHistory = new poolRewardTKT({
                                total_eos : parseFloat(responseJSON[i2].total_eos),
                                dividend_time : responseJSON[i2].dividend_time
                            })
                            NewHistory.save(function (err, NewHistorys) {
                                if (err) return console.error(err);
                            });
                    }
                }
            }
        } catch(error) {
            Logs.saveLogs("cryptoModels.getTKTPoolRewardStat : " + error,"Error")
        }
        
        
    }
}