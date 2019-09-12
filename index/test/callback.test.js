function calculate(num, callback) {
  if (num < 10) {
    callback("err: the input less than 10");
  } else {
    callback({ "num": num*3 });
  }
}

const fs = require('fs');

function read(path, callback) {
  fs.readFile(path, (err, data) => {
    if (err) {
      return callback(err);
    } else {
      callback(undefined, data);
    }
  });
}

read(`${__dirname}/array.test.js`, (err, data) => {
  if
    (err) console.error(err);
  else
    console.log(data);
});
