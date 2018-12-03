var Schema = require('../node_modules/lwm2m/lib/schema.js');
// object 3
var schema = Schema({
  manufacturer: { id: 0, type: "String" },
  modelNumber:{id: 1, type: "String"},
  serialNumber:{id: 2, type: "String"},
  frimwareVersion:{id: 3, type: "String"},
  deviceType:{id: 17, type: "String"},
  routing: { id: 7, type: "String" },
  networking:{id: 8, type: "String"},
  macLayer:{id: 9, type: "String"},
  panId:{id: 10, type: "Integer"},
  channel:{id: 11, type: "Integer"},
  nodeId:{id:12, type: "Integer"}
});
 
var optionsDeviceInfo = { 
  schema: schema, 
  format: 'json',
};

module.exports = optionsDeviceInfo;