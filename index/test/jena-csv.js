const request = require('request');
const fs = require('fs');

const url = 'http://localhost:3030/flight_inst';
const query = [
  // 'PREFIX atm: <https://data.nasa.gov/ontologies/atmonto/ATM#>',
  'PREFIX nas: <https://data.nasa.gov/ontologies/atmonto/NAS#>',
  'select *',
  'where {',
  '  ?subject ?predicate ?object .',
  '}',
  // 'limit 500'
].join(' ');
const filePath = './nas.csv';

const csvQueryConstruct = (url, query) => {
  return `${url}?query=${encodeURIComponent(query)}&format=csv`;
}

request.post(csvQueryConstruct(url, query), (err, res, body) => {
  if (err) {
    console.log(err);
  } else {
    const csv = body;
    fs.writeFile(filePath, csv, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('file written');
      }
    })
  }
});
