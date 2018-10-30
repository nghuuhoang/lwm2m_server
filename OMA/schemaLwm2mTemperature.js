var Schema = require('../node_modules/lwm2m/lib/schema.js');
// object 3303
var schemaTemp = Schema({
  value: { id: 5700, type: "Float" },
  unit:{id: 5701, type: "String"}
});
 
var optionsTempperature = { 
  schema: schemaTemp, 
  format: 'json',
};

module.exports = optionsTempperature;