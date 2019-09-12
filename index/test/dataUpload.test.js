const request = require('request');
const fs = require('fs');
const route = "http://localhost:3030/test_upload/upload";
const message = "Filename: airlineInst.ttl, Content-Type=application/octet-stream, Charset=null => Turtle : Count=6436 Triples=6436 Quads=0";
const filePath = '/Users/junli/workspace/masters/practicum/2019-mcm-master/data/ttl/airlineInst.ttl';

const formData = {

};

// get a list of datasets
request.get('http://localhost:3030/$/server', (err, res, body) => {
  if (err) {
    console.error(err);
  }
  console.log(body);
});

// upload a file
fs.createReadStream(filePath)
  .pipe(request.post({
      url: 'http://localhost:3030/test_upload/data'), form: {
      Filename: filename,
      "Content-Type": "application/octet-stream"
    }
  }, (err, res, body) => {
    if (err) {
      console.error(err);
    }
    console.log(body);
  });

// create a new dataset
request.post({
  url: 'http://localhost:3030/$/datasets',
  form: {
    dbName: "test_upload",
    dbType: "tdb2"
  }
}, (err, res, body) => {
  if (err) {
    console.error(err);
  }
  console.log(body);
});
