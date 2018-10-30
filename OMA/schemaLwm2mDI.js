var Schema = require('../node_modules/lwm2m/lib/schema.js');

var schemaDI = Schema({
  state: { id: 5500, type: 'Boolean' },
  sensorType :{id: 5751, type: 'String'}
});
 
var optionsDI = { 
  schema: schemaDI, 
  format: 'tlv',
};

module.exports = optionsDI;