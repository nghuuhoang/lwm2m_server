var Schema = require('../node_modules/lwm2m/lib/schema.js');

var schema = new Schema({
  // onTime:{ type: 'Interger',id: 5852},
  onOff: { type: 'Boolean' ,id: 5850,  required: true},
  colour:{  type: 'String', id: 5706}
});
 
var optionsLightControl = { 
  schema: schema, 
  format: 'tlv',
};

module.exports = optionsLightControl;