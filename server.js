'use strict';
const conf = require('./config')
const express = require ('express') ;
const server = express() ;
const bodyparser = require('body-parser');
const matcher = require ('C:/Users/kanik/vanilla/matcher') ; // to use the matcher module here
const weather = require ("C:/Users/kanik/vanilla/weather"); // to use the weather module here
const forecast = require ("C:/Users/kanik/vanilla/forecast"); // to use the forecast module
const PORT = process.env.PORT || 3000;
//server.get('/', (req, res ) => res.send ("hello!!")) ;
server.listen (PORT, () => console .log ('The bot server is running on port', PORT)) ;
const fBeamer = require('./fbeamer');
const { createPrivateKey } = require('crypto');
const f = new fBeamer(conf.FB)
server.get ('/', (req , res )  => f.registerHook (req , res )) ;
server.post ('/', bodyparser.json ({
    verify : f.verifySignature.call(f)
    })) ;

server.post ('/', (req , res , next ) =>{
    // message will be received here if the signature is verified
    // the message will be passed to FBeamer for parsing
    return f.incoming(req, res,async data=>{
        data=f.messageHandler(data);
        console.log(data)
        try {
            matcher (data.content , async cb => {
                switch(cb.intent){
                    case 'Hello':
                        //console.log('BOT: Hello and welcome to chatbot!');
                        //console.log('Entities:',cb.entities.greeting)
                        await f.txt(data.sender , 'Welcome to chatbot! :)') ;
                        break;
                    case 'Exit':
                        //console.log('BOT: Bye Bye!')
                        await f.txt(data.sender , 'Bye Bye!') ;
                        process.exit(0)
                    case 'Current Weather':
                        weather(cb.entities.city).then(async result=> {
                            var  weaDesc = result.weather[0].description
                            var city = result.name
                            var countries = require("i18n-iso-countries");
                            var country = result.sys.country
                            var con = countries.getName(country, "en", {select: "official"})
                            var temp= result.main.temp
                            console.log("BOT: It is",weaDesc.red,"in",city.green,",",con.cyan,"with",temp,"degrees Celsius")
                            var output= `It is ${weaDesc} in ${city}, ${con} with ${temp} degrees Celsius`
                            await f.txt(data.sender , output) ;
                            }
                        )
                        .catch(async error => {
                            console.log(error.response.data.message.red)
                            await f.txt(data.sender , error.response.data.message) ;
                          });
                        
                        break;
                    case 'Weather Forecast':
                        //console.log('Entities:',cb.entities.weather,cb.entities.city,cb.entities.time);
                        forecast(cb.entities.weather,cb.entities.city,cb.entities.time).then(async result=> {
                            var city = result.city_name
                            var countries = require("i18n-iso-countries");
                            var country = result.country_code
                            var weatherCond=cb.entities.weather
                            var time=cb.entities.time
                            var con = countries.getName(country, "en", {select: "official"})
                            if(time.toLowerCase()==="today"){
                                var weaCon = result.data[0].weather.description
                                console.log(weaCon)
                                var temp = result.data[0].temp
                                var date = result.data[0].datetime
                                if(weatherCond==="cold" && temp<15.0){
                                    console.log("BOT: Yes, it's cold!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it's cold! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if((weatherCond.includes("sun")&&weaCon.toLowerCase()==="clear sky") && temp>15.0){
                                    console.log("BOT: Yes, it's sunny!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it's sunny! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond==="hot" && temp>30.0){
                                    console.log("BOT: Yes, it's hot!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it's hot! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond.includes("rain") && weaCon.includes("rain")){
                                    console.log("BOT: Yes, it's raining!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it's raining! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond.includes("cloud") && weaCon.includes("cloud")){
                                    console.log("BOT: Yes, it's cloudy!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it's cloudy! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else{
                                    console.log("BOT: It's",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `No, it's ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                            }
                            else if(time.toLowerCase()==="tomorrow"){
                                var weaCon = result.data[1].weather.description
                                var temp = result.data[1].temp
                                var date = result.data[1].datetime
                                if(weatherCond==="cold" && temp<15.0){
                                    console.log("BOT: Yes, it'll be cold!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be cold! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if((weatherCond.includes("sun")&&weaCon.toLowerCase()==="clear sky") && temp>15.0){
                                    console.log("BOT: Yes, it'll be sunny!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be sunny! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond==="hot" && temp>30.0){
                                    console.log("BOT: Yes, it'll be hot!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be hot! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond.includes("rain") && weaCon.includes("rain")){
                                    console.log("BOT: Yes, it'll be raining!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be raining! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond.includes("cloud") && weaCon.includes("cloud")){
                                    console.log("BOT: Yes, it'll be cloudy!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be cloudy! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else{
                                    console.log("BOT: It'll be",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `No, it'll be ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                        
                            }
                            else{
                                var weaCon = result.data[2].weather.description
                                var temp = result.data[2].temp
                                var date = result.data[2].datetime
                                if(weatherCond==="cold" && temp<15.0){
                                    console.log("BOT: Yes, it'll be cold!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be cold! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if((weatherCond.includes("sun")&&weaCon.toLowerCase()==="clear sky") && temp>15.0){
                                    console.log("BOT: Yes, it'll be sunny!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be sunny! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond==="hot" && temp>30.0){
                                    console.log("BOT: Yes, it'll be hot!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be hot! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else if(weatherCond.includes("rain") && weaCon.includes("rain")){
                                    console.log("BOT: Yes, it'll be raining!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be raining! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                    }
                                else if(weatherCond.includes("cloud") && weaCon.includes("cloud")){
                                    console.log("BOT: Yes, it'll be cloudy!",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `Yes, it'll be cloudy! ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                                else{
                                    console.log("BOT: It'll be",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `No, it'll be ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
                            }
                                    
                        })
                        .catch(async error => {
                            console.log("BOT: ","Invalid input, couldn't get data...")
                            await f.txt(data.sender , "Invalid input, couldn't get data...") ;
                        }); 
                        break;

                    case 'get weather':
                        //console.log('The weather in Paris is 4 degrees...')
                        //console.log('Entities:',cb.entities.city,',',cb.entities.time)
                        forecast("0",cb.entities.city,cb.entities.time).then(async result=> {
                            var city = result.city_name
                            var countries = require("i18n-iso-countries");
                            var country = result.country_code
                            var time=cb.entities.time
                            var con = countries.getName(country, "en", {select: "official"})
                                if(time.toLowerCase()==="today"){
                                    var weaCon = result.data[0].weather.description
                                    var temp = result.data[0].temp
                                    var date = result.data[0].datetime
                                    console.log("BOT: It's",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `It's ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                
                                }
                                else if(time.toLowerCase()==="tomorrow"){
                                    var weaCon = result.data[1].weather.description
                                    var temp = result.data[1].temp
                                    var date = result.data[1].datetime
                                    console.log("BOT: It'll be",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `It'll be ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                    
                                }
                                else{
                                    var weaCon = result.data[2].weather.description
                                    var temp = result.data[2].temp
                                    var date = result.data[2].datetime
                                    console.log("BOT: It'll be",weaCon.red,"in",city.green,"(",con.yellow,")", time,"(",date.cyan,")","with temperature",temp,"°C")
                                    var output= `It'll be ${weaCon} in ${city}, (${con}), ${time}, (${date}) with ${temp} °C`
                                    await f.txt(data.sender , output) ;
                                }
					
			            })
                        .catch(async error => {
                            console.log("BOT: ","Invalid input, couldn't get data...".red)
                            await f.txt(data.sender , "Invalid input, couldn't get data...") ;
                        }); 
                        break;
                        
                    default:
                        console.log('No intent identified');
                        await f.txt(data.sender , "Sorry! I couldn't understand... :(") ;
                }
            }) ;

            if (data.content === 'the given text in facebook !'){
                await f.txt(data.sender , 'hey there I finally recieved your message in my chatbot :)') ;
            }
            else if(data.type==='image') {
                await f.img(data.sender , 'https://cdn.fbsbx.com/v/t59.2708-21/141940992_1673743022797545_5723492576179060960_n.gif?_nc_cat=101&ccb=2&_nc_sid=041f46&_nc_ohc=Zv4VMPRykmQAX9pbuBN&_nc_ht=cdn.fbsbx.com&oh=b320bde74d0d07d64ab2a6e1cf356c22&oe=6011AD65') ;
            }
        }
        catch(e){
            console.log(e) ;
        }
    });
}) ;




