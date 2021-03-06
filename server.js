//nghuu.hoang@outlook.com
var express = require('express');
app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const ejsLint = require('ejs-lint');
app.use(express.static("public"));
app.use(express.static('./views/home/images'));
// config = require('./server/configure');
// var bodyParser = require('body-parser')
var ejs = require('ejs');

var lwm2m = require('lwm2m');

var mongoose = require('mongoose');
// const assert = require('assert');
var Schema = require('./node_modules/lwm2m/lib/schema.js');
var senml = require('./node_modules/lwm2m/lib/senml.js');
var formats = require('./node_modules/lwm2m/lib/contentFormats').formats;
var optionsTempperature = require('./OMA/schemaLwm2mTemperature.js');
var optionsDI = require('./OMA/schemaLwm2mDI.js');
var optionsLightControl = require('./OMA/schemaLwm2mLightControl.js');
var optionsDeviceInfo = require('./OMA/schemaLwm2mDeviceInfo.js');
var optionsNetworkInfo = require('./OMA/schemaLwm2mNetworkInfo.js');
var schema = lwm2m.Schema({
    foo : { id: 5, type: 'String' },
    bar : { id: 6, type: 'Integer' },
  });
  var serverlwm2m =   lwm2m.createServer();
app.set('port', process.env.PORT || 8080);

app.set('view engine', 'ejs');
// Connection URL
const urlDevices = 'mongodb://localhost:27017/Lwm2mDevicesList';
mongoose.connect(urlDevices,{ useNewUrlParser: true }, function(){
    mongoose.connection.db.dropDatabase();
});
const schemaDevices = new mongoose.Schema({
   ep : String,
  lt : Number,
  payload : String,
  b : String,
  date : {type: Date, default: Date.now}
})
var devices = mongoose.model('devices',schemaDevices)


var endpoint;
var modeManualOn;
io.on('connection', function(socket){
        console.log("Someone connected."); //show a log as a new client connects.
        socket.on('disconnect', function(){
            console.log('Someone disconnected');
            endpoint = ""
        });
        readRelay1();
        readRelay2();
        readLedBlue();
        readLedGreen();
        readLedRed();
        observeRelay1();
        readStateModeRelay1();
        readDeviceInfo();

                setInterval(readTempValue, 13000);
                setInterval(readHumdValue, 33000);
                setInterval(readLightValue, 27000);
                setInterval(readPressValue, 49000);
       
            setInterval(function(){
                        observeRelay1();
            }, 5000);
        // });
/*--------------------------------------------------------------------------------------------------------------------- */

        
        socket.on('eventLedGreenOn', function(){
            console.log('true')
            var promise = serverlwm2m.write(endpoint, '/3311/0/5850', {onOff : true}, optionsLightControl)
            .then(res => console.log(res)&readLedGreen(), err => io.sockets.emit('responseMessage', err.message));
        });
        socket.on('eventLedGreenOff', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/0/5850', {onOff : false}, optionsLightControl)
            .then(res => console.log(res)&readLedGreen(), err => io.sockets.emit('responseMessage', err.message));
        });
        socket.on('eventLedRedOn', function(){
            console.log('true')
            var promise = serverlwm2m.write(endpoint, '/3311/1/5850', {onOff : true}, optionsLightControl)
            .then(res => console.log(res)&readLedRed(), err => io.sockets.emit('responseMessage', err.message));
        });
        socket.on('eventLedRedOff', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/1/5850', {onOff : false}, optionsLightControl)
            .then(res => console.log(res)&readLedRed(), err => io.sockets.emit('responseMessage', err.message));
        });
        socket.on('eventLedBlueOn', function(){
            console.log('true')
            var promise = serverlwm2m.write(endpoint, '/3311/2/5850', {onOff : true}, optionsLightControl)
            .then(res => console.log(res)&readLedBlue(), err => io.sockets.emit('responseMessage', err.message));
        });
        socket.on('eventLedBlueOff', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/2/5850', {onOff : false}, optionsLightControl)
            .then(res => console.log(res)&readLedBlue(), err => io.sockets.emit('responseMessage', err.message));
        });
        
        
            socket.on('eventOnRelay1', function(){
                observeRelay1();
                if(modeManualOn == 1){
                    console.log('on realy 1')
                var promise = serverlwm2m.write(endpoint, '/3311/3/5850', {onOff : true}, optionsLightControl)
                .then(res => console.log(res)&readRelay1()&io.sockets.emit('responseMessage', "Relay 1 On"), err => io.sockets.emit('responseMessage', err.message));
                }
            });
            socket.on('eventOffRelay1', function(){
                observeRelay1();
                if(modeManualOn == 1){
                    console.log('off relay 1')
                var promise = serverlwm2m.write(endpoint, '/3311/3/5850', {onOff : false}, optionsLightControl)
                .then(res => console.log(res)&readRelay1()&io.sockets.emit('responseMessage', "Relay 1 Off"), err => io.sockets.emit('responseMessage', err.message));
            }
            });
        
        
        socket.on('eventOnRelay2', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/4/5850', {onOff : true}, optionsLightControl)
            .then(res => console.log(res)&readRelay2(), err => io.sockets.emit('responseMessage', err.message));
        });
        socket.on('eventOffRelay2', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/4/5850', {onOff : false}, optionsLightControl)
            .then(res => console.log(res)&readRelay2(), err => io.sockets.emit('responseMessage', err.message));
        });
        socket.on('eventAutoModeRelay1', function(){
            setImmediate(function(){
                modeManualOn = 0;
                observeRelay1();
            })
                console.log('Relay1 in Auto mode')
            var promise = serverlwm2m.write(endpoint, '/3311/5/5850', {onOff: true}, optionsLightControl)
            .then(res => console.log(res)&readStateModeRelay1(), err => io.sockets.emit('responseMessage', err.message));
        
            })
        socket.on('eventModeManualRelay1', function(){
            setImmediate(function(){
                modeManualOn = 1;
                observeRelay1();
            })
                console.log('Relay1 in Manual mode')
                var promise = serverlwm2m.write(endpoint, '/3311/5/5850', {onOff: false}, optionsLightControl)
                .then(res => console.log(res)&readStateModeRelay1(), err => io.sockets.emit('responseMessage', err.message));
         })
        
})


app.get("/about",function(req,res){
      res.render('about');
    });

app.get("/", function(req,res){
    // if(res){

    // }
   devices.find({}, function(err,data){
      dataDevices = data;
      // console.log(dataDevices);
      res.render('./home/index', dataDevices);
   })
})

app.get('/:endpoint', function(req,res){
   //console.log(endpoint)
   devices.find({}, function(err,data){
      for (var i = 0; i < data.length; i++) {
            if (req.params.endpoint == data[i].ep) {  
                endpoint = req.params.endpoint;
                // console.log(endpoint)
                  var epname = data[i].ep;
                  res.render('./device/index',{epname : epname});
            }
      } 
   });
   
});


    serverlwm2m.on('register', function(params, accept) {
        var checkdevicename = 0;
        devices.find({}, function(err,dataDevice){
                if (dataDevice.length == 0) {
                    devices.create(params)
                        .then(res => console.log(res), err => console.log(err + ''));
                }else{
                    for (var i = 0; i < dataDevice.length; i++) {
                        if (params.ep == dataDevice[i].ep ) {
                            checkdevicename = 1;
                            devices.updateOne(params, {date :Date.now()})
                            .then(res => console.log(res), err => console.log(err + ''));
                        }
                    } 
                    if(checkdevicename != 0){
                        checkdevicename = 0;
                    }else{
                        devices.create(params)
                            .then(res => console.log(res), err => console.log(err + ''));
                    }
                }
            })
    accept();
    });
  

serverlwm2m.listen(5683, function(){
  console.log('Lwm2m server is listening port 5683');
});

server.listen(app.get('port'), function() {
  console.log('Web Server up: http://localhost:' + app.get('port'));
  console.log('---------------------------------------------------');
});

/*--------------------------------------------------------------------------------------------------------------------- */
function observeTemp(){
    serverlwm2m.observe(endpoint, '/3303/0/5700', function(err, stream) {
        if(err){
            io.sockets.emit('responseMessage', err.message + " when observe Temperature");
        }
        if(stream){
            stream.on('data', function(value){
                console.log(value)
            var today = new Date();
            io.sockets.emit('Temperature', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:value});
            })
            stream.on('end', function() {
                console.log('stopped observing');
              });
        
        }    
    });
}

function observeHumd(){
    serverlwm2m.observe(endpoint, '/3304/0/5700', function(err, stream) {
        if(err){
            io.sockets.emit('responseMessage', err.message + " when observe Humidity");
        }
        if(stream){
            stream.on('data', function(value){
                console.log(value)
            var today = new Date();
            io.sockets.emit('Humidity', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:value});
            })
            stream.on('end', function() {
                console.log('stopped observing');
              });
        
        }    
    });

}

function observePress(){
    serverlwm2m.observe(endpoint, '/3323/0/5700', function(err, stream) {
        if(err){
            io.sockets.emit('responseMessage', err.message + " when observe Pressure");
        }
        if(stream){
            stream.on('data', function(value){
                console.log(value)
            var today = new Date();
            io.sockets.emit('Pressure', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:value});
            })
            stream.on('end', function() {
                console.log('stopped observing');
              });
        
        }    
    });
}

function observeLight(){
    serverlwm2m.observe(endpoint, '/3301/0/5700', function(err, stream) {
        if(err){
            io.sockets.emit('responseMessage', err.message + " when observe Light Sensor");
        }
        if(stream){
            stream.on('data', function(value){
                console.log(value)
            var today = new Date();
            io.sockets.emit('Illuminance', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:value});
            })
            stream.on('end', function() {
                console.log('stopped observing');
              });
        
        }    
    });
}


function readLedGreen(){
    serverlwm2m.read(endpoint, '/3311/0', optionsLightControl, function(err, res) {
        if(res){
            console.log(res)
            io.sockets.emit('LightControlLedGreen', res);
        }   
        if(err){
            io.sockets.emit('responseMessage', err.message);
        } 
    });
}
function readLedRed(){
    serverlwm2m.read(endpoint, '/3311/1', optionsLightControl, function(err, res) {
        if(res){
            console.log(res)
            io.sockets.emit('LightControlLedRed', res);
        }   
        if(err){
            io.sockets.emit('responseMessage', err.message);
        } 
    });
}
function readLedBlue(){
    serverlwm2m.read(endpoint, '/3311/2', optionsLightControl, function(err, res) {
        if(res){
            console.log(res)
            io.sockets.emit('LightControlLedBlue', res);
        } 
        if(err){
            io.sockets.emit('responseMessage', err.message);
        }   
    });
}
function readRelay1(){
    serverlwm2m.read(endpoint, '/3311/3', optionsLightControl, function(err, res) {
        if(res){
            console.log(res)
            io.sockets.emit('stateRelay1', res);
        } 
        if(err){
            io.sockets.emit('responseMessage', err.message + " read relay 1");
        }   
    });
}
function readRelay2(){
    serverlwm2m.read(endpoint, '/3311/4', optionsLightControl, function(err, res) {
        if(res){
            console.log(res)
            io.sockets.emit('stateRelay2', res);
        } 
        if(err){
            io.sockets.emit('responseMessage', err.message + "read relay 2");
        }   
    });
}
function readStateModeRelay1(){
    serverlwm2m.read(endpoint, '/3311/5', optionsLightControl, function(err, res) {
        if(res){
            console.log(res)
            io.sockets.emit('ModeRelay1', res);
        } 
        if(err){
            io.sockets.emit('responseMessage', err.message + " read state relay 1");
        }   
    });
}
function readTempValue(){
    serverlwm2m.read(endpoint, '/3303/0',optionsTempperature, function(err,res){
        if(res){
                var today = new Date();
                io.sockets.emit('Temperature', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:res.value});
        }
        if(err){
            // io.sockets.emit('responseMessage', err.message + " when read Temperature Value");
        }
    }) 
}

function readHumdValue(){
    serverlwm2m.read(endpoint, '/3304/0',optionsTempperature, function(err,res){
        if(res){
            var today = new Date();
                io.sockets.emit('Humidity', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:res.value});
       
        }
        if(err){
            // io.sockets.emit('responseMessage', err.message + " when read Humidity Value");
        }
    }) 
}

function readPressValue(){
    serverlwm2m.read(endpoint, '/3323/0',optionsTempperature, function(err,res){
        if(res){
            var today = new Date();
                io.sockets.emit('Pressure', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:res.value});
        }
        if(err){
            // io.sockets.emit('responseMessage', err.message = " when read Pressure Value");
        }
    }) 
}

function readLightValue(){
    serverlwm2m.read(endpoint, '/3301/0',optionsTempperature, function(err,res){
        if(res){
            var today = new Date();
                io.sockets.emit('Illuminance', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:res.value});
        }
        if(err){
            // io.sockets.emit('responseMessage', err.message + " when read Light Sensor Value");
        }
    }) 
}

function observeRelay1(){
    serverlwm2m.observe(endpoint, '/3200/0/5500', function(err, stream) {
        if(err){
            io.sockets.emit('responseMessage', err.message + " when observe Relay 1");
        }
        if(stream){
            stream.on('data', function(value){
                // console.log(value)
                io.sockets.emit('readStateRelay1', value);
            })
            stream.on('end', function() {
        //     // done();
          }); 
        }   
        
    });
}




function readDeviceInfo(){
    serverlwm2m.read(endpoint, '/3/0',optionsDeviceInfo, function(err,res){
        if(res){
            io.sockets.emit('deviceInfo', res);
        }
        if(err){
            io.sockets.emit('responseMessage', err.message + " device info");
        }
    })  
}