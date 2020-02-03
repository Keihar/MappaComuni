const csvToJson = require('convert-csv-to-json');
 
const input = './csv/comuni-lom.csv'; 
const output = './public/comdata.json';
 
csvToJson.fieldDelimiter(',')
         .formatValueByType()
         .generateJsonFileFromCsv(input, output);
