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
var serverlwm2m = require('lwm2m').createServer();
var mongoose = require('mongoose');
// const assert = require('assert');
var Schema = require('./node_modules/lwm2m/lib/schema.js');
var senml = require('./node_modules/lwm2m/lib/senml.js');
var formats = require('./node_modules/lwm2m/lib/contentFormats').formats;
var optionsTempperature = require('./OMA/schemaLwm2mTemperature.js');
var optionsDI = require('./OMA/schemaLwm2mDI.js');
var optionsLightControl = require('./OMA/schemaLwm2mLightControl.js');
var optionsDeviceInfo = require('./OMA/schemaLwm2mDeviceInfo.js');

app.set('port', process.env.PORT || 8080);

app.set('view engine', 'ejs');

// Connection URL
const urlDevices = 'mongodb://localhost:27017/Lwm2mDevicesList';
mongoose.connect(urlDevices,{ useNewUrlParser: true });
const schemaDevices = new mongoose.Schema({
   ep : 
   {
       type: String,
       required: true,
       unique: true
  }
})
var devices = mongoose.model('devices',schemaDevices)

const schemaDeviceInfo = new mongoose.Schema({
   manufacturer : String,
   modelNumber : String,
   serialNumber : String,
   frimwareVersion : String,
   deviceType : String
})
var DeviceInfo = mongoose.model('DeviceInfo', schemaDeviceInfo)

const schemaTemperature = new mongoose.Schema({
   value : Number,
   unit : String
})

var TemperatureDB = mongoose.model('Temperature', schemaTemperature)


// var endpoint;

io.on('connection', function(socket){
        console.log("Someone connected."); //show a log as a new client connects.

        socket.on('disconnect', function(){
            console.log('Someone disconnected');
        });
        socket.on('clickedDeviceInfo', function(){
          console.log('clicked');
          // console.log(endpoint);
            serverlwm2m.read(endpoint, '/3/0',optionsDeviceInfo, function(err,res){
                if(res){
                    io.sockets.emit('deviceInfo', res);
                }
            })  
        });
        socket.on('clickedLightControlLedGreen', function(){
          console.log('clicked');
            serverlwm2m.read(endpoint, '/3311/0', optionsLightControl, function(err, res) {
                if(res){
                    // console.log(res)
                    io.sockets.emit('LightControlLedGreen', res);
                }    
            });
        });
        socket.on('clickedLightControlLedRed', function(){
          console.log('clicked');
            serverlwm2m.read(endpoint, '/3311/1', optionsLightControl, function(err, res) {
                if(res){
                    // console.log(res)
                    io.sockets.emit('LightControlLedRed', res);
                }    
            });
        });
        socket.on('clickedLightControlLedBlue', function(){
          console.log('clicked');
            serverlwm2m.read(endpoint, '/3311/2', optionsLightControl, function(err, res) {
                if(res){
                    // console.log(res)
                    io.sockets.emit('LightControlLedBlue', res);
                }    
            });
        });
        socket.on('clickedTemp', function(){
          console.log('clicked');
            serverlwm2m.on('update', function(loc){

                serverlwm2m.read(endpoint, '/3303/0', optionsTempperature, function(err, res) {
                    if(err){
                        console.log(err);
                    }
                    if(res){
                        // console.log(res.value)
                        // console.log(res)
                        var temp = res.value;
                        // console.log(temp);
                        var today = new Date();
                        io.sockets.emit('Temperature', {date: today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:temp});
                    }    
                });
                done();
            })
        });
        socket.on('eventLedGreenOn', function(){
            console.log('true')
            var promise = serverlwm2m.write(endpoint, '/3311/0/5850', {onOff : true}, optionsLightControl)
            .then(res => console.log(res), err => console.log(err));
        });
        socket.on('eventLedGreenOff', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/0/5850', {onOff : false}, optionsLightControl)
            .then(res => console.log(res), err => console.log(err));
        });
        socket.on('eventLedRedOn', function(){
            console.log('true')
            var promise = serverlwm2m.write(endpoint, '/3311/1/5850', {onOff : true}, optionsLightControl)
            .then(res => console.log(res), err => console.log(err));
        });
        socket.on('eventLedRedOff', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/1/5850', {onOff : false}, optionsLightControl)
            .then(res => console.log(res), err => console.log(err));
        });
        socket.on('eventLedBlueOn', function(){
            console.log('true')
            var promise = serverlwm2m.write(endpoint, '/3311/2/5850', {onOff : true}, optionsLightControl)
            .then(res => console.log(res), err => console.log(err));
        });
        socket.on('eventLedBlueOff', function(){
            console.log('false')
            var promise = serverlwm2m.write(endpoint, '/3311/2/5850', {onOff : false}, optionsLightControl)
            .then(res => console.log(res), err => console.log(err));
        });
        
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
            devices.create(params)
            .then(res => console.log(res), err => console.log(err + ""));
    devices.find({}, function(err,dataDevice){
            // if (dataDevice.length == 0) {
            //     devices.create(params)
            //         .then(res => console.log(res), err => console.log(err + ''));
            // }else{
                for (var i = 0; i < dataDevice.length; i++) {
                if (params.ep == dataDevice[i].ep ) {  
                    var date = new Date();
                    // io.sockets.emit('timeDeviceRegisted', date);
                    var data={
                        ep : params.ep,
                        payload : params.payload,
                        date : date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+"  Time:"+(date.getHours())+":"+(date.getMinutes()),
                        lt : params.lt,
                        b : params.b
                    }
                    io.sockets.emit('DevicesList', data);
                    // accept();
                    // console.log(data);
                }else{
                     
                //     devices.create(params)
                //     .then(res => console.log(res), err => console.log(err + ''));
                }
            } 
            // }
        })
accept();
});

// serverlwm2m.on('register', function(params, accept) {
// /*----------------------------------------------------------------*/
//     // console.log(params);
//     devices.create(params)
//     .then(res => console.log(res), err => console.log(err + ""));
    
// /*----------------------------------------------------------------*/
// // accept();
// });

  

serverlwm2m.listen(5683, function(){
  console.log('Lwm2m server is listening port 5683');
});

server.listen(app.get('port'), function() {
  console.log('Web Server up: http://localhost:' + app.get('port'));
  console.log('---------------------------------------------------');
});








