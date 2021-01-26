'use strict';
const crypto = require ('crypto') ;
const request = require ('request') ;
const apiVersion = 'v6.0';
class FBeamer {

    constructor({ pageAccessToken , VerifyToken, appSecret }) {
    // complete the constructor here
    try{
        if(pageAccessToken!=undefined && VerifyToken!=undefined && appSecret!=undefined){
            this.pageAccessToken=pageAccessToken;
            this.VerifyToken = VerifyToken;
            this.appSecret = appSecret;
        }
        else{
            throw new Error("Token is undefined")
        }
    }
    catch(error){
        console.log(error)
    }
    
    } 
    registerHook (req , res) {
        const params = req.query ;
        console.log(params)
        const mode = params ['hub.mode'] ,
        token = params ['hub.verify_token'] ,
        challenge = params ['hub.challenge'];
        try {
            if (mode === 'subscribe' && token === this.VerifyToken) { // condition should be written in the parentheses
                console.log("Webhook is registered!")
                return res.send(challenge) ;
            } else {
                throw "Could not register webhook!";
                return res.sendStatus(200) ;
        }
        } catch (e) {
        console.log (e) ;
        }
    }


    verifySignature(req , res , buf) {
        return (req , res , buf ) => {
            if(req.method === 'POST') {
                try {
                // get x-hub - signature here
                var expected = req.headers['x-hub-signature'];
                /* this code generates a hash using the given appSecret */
                let tempo_hash = crypto.createHmac('sha1', this.appSecret).update (buf , 'utf-8') ;
                let hash = tempo_hash.digest('hex') ;
                expected=expected.slice(5,)
                if(expected===hash){
                    console.log("Signatures verified successfully!",expected,hash)
                }
                else{
                    throw new Error("Could'nt match signatures!")
                }
                // complete the rest of code by yourself
                } 
                catch(e) {
                    console .log (e) ;
                }  
            }
        }
    }
    
    incoming(req , res , cb) {
        res.sendStatus(200) ;
        // Extract the body of the POST request
        if(req.body.object === 'page' && req.body.entry) {
        let data = req.body ;
        //console.log (data) ;
        // to be complete later
        // for on page objects
        // for on messageObj s if messaging of each page exists
        data.entry.forEach((entry) => {
            if(entry.messaging!=undefined){
                entry.messaging.forEach((messageObj) => {
                    if(messageObj.message.text){
                        console.log("Text message:",messageObj.message.text);
                    }
                    if(messageObj.postback) {
                        // handle postbacks
                       
                    }
                    else {
                        // handle messages
                        return cb(messageObj) ;
                    }
                  });
            }
                
        });
            

        }
    } 
    messageHandler(obj) {
        let sender = obj.sender.id;
        let message = obj.message ;
        if (message.text) {
        let obj = {
                    sender ,
                    type : 'text',
                    content : message.text
                }
        return obj;
        }
        else if(message.attachments){
            let obj = {
                sender ,
                type : 'image',
                url : message.attachments[0].payload.url
            }
        return obj;
        }
    }
    sendMessage(payload) {
        return new Promise ((resolve , reject ) => {
        request ({
        uri : `https://graph.facebook.com/${apiVersion}/me/messages` ,
        qs :{
        access_token : this.pageAccessToken
            } ,
        method : 'POST',
        json : payload
        }, (error , response , body ) => {
                if (!error && response.statusCode === 200) {
                    resolve ({
                    mid: body.message_id
                    }) ;
                }
                else {
                        reject (error) ;
                }
            }) ;
        });
    }
    

    txt (id , text , messaging_type = 'RESPONSE') {
        /* this is an object for creating the payload according
        to Table 1 in the following .*/
        let obj = {
        messaging_type ,
        recipient :{
                        id
                    } ,
        message : {
                        text
                    }
        }
        console.log(obj)
        return this.sendMessage (obj) ;
    }

    img (id , url , messaging_type = 'RESPONSE') {
        /* this is an object for creating the payload according
        to Table 1 in the following .*/
        let obj = {
        messaging_type ,
        recipient :{
                        id
                    } ,
        message : {
                        attachment :{
                                        type : 'image',
                                        payload : {
                                                url
                                        }

                        }
                    }
        }
        return this.sendMessage (obj) ;
    }
}
module.exports = FBeamer ;