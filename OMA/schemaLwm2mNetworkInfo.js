var Schema = require('../node_modules/lwm2m/lib/schema.js');
// object 1024
var schema = Schema({
  routing: { id: 0, type: "String" },
  networking:{id: 1, type: "String"},
  macLayer:{id: 2, type: "String"},
  panId:{id: 3, type: "Integer"},
  channel:{id: 4, type: "Integer"},
  nodeId:{id:5, type: "Integer"}
});
 
var optionsNetworkInfo = { 
  schema: schema, 
  format: 'json',
};

module.exports = optionsNetworkInfo;


