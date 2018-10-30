var Schema = require('../node_modules/lwm2m/lib/schema.js');
// object 3
var schema = Schema({
  manufacturer: { id: 0, type: "String" },
  modelNumber:{id: 1, type: "String"},
  serialNumber:{id: 2, type: "String"},
  frimwareVersion:{id: 3, type: "String"},
  deviceType:{id: 17, type: "String"}
});
 
var optionsDeviceInfo = { 
  schema: schema, 
  format: 'json',
};

module.exports = optionsDeviceInfo;