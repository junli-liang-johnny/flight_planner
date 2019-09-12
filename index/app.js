const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require('fs');
const sparql = require('./sparql');
const ui = require('./UIGenerator');
const reqh = require('./requestHandler');
const resh = require('./responseHandler');
const ta = require('./templateAnalyse');

const app = express()
const port = 3000
const rootPath = '/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/';
const rdfWriter = new ui.RDFDataWriter();

// app server settings
app.use(express.urlencoded({
  extended: false
}));
app.use(express.static(rootPath));
app.use(bodyParser.json());

// view engine setup
app.set('views', rootPath + 'index/views');
app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultView: 'home',
  layoutsDir: rootPath + 'index/views/layouts',
  partialsDir: rootPath + 'index/views/paritals',
  helpers: {
    if_even: function(index) {
      if (index % 2) {
        return 'list-group-item-secondary';
      } else {
        return 'list-group-item-light';
      }
    },
    json: function(object) {
      return JSON.stringify(object);
    }
  }
}));
app.set('view engine', 'hbs');

// cached Variables
let cachedHeaders;
let cachedBindings;

// routes handler
// ==================================== GET ====================================
app.get('/', (req, res) => {
  // run a chain of queries
  sparql.queryChain(reqh.defaultSetupQueryParams)
    .then(results => {
      // render the web page
      // console.log(results.airportName);
      res.render('home', {
        layout: 'index',
        callSign: results.callSign,
        airportName: results.airportName,
        // nasdate: results.nasdate,
      });
      console.log('/ [GET] 200');
    })
    .catch(err => {
      console.error(`app.get() - sparql.queryChain: ${err}`);
      res.send('<h1>Server Error</h1>');
      console.log('/ [GET] 500');
    });
});

app.get('/labels', (req, res) => {
  // no need to require requestHandler
  reqh.getLabels((err, labels) => {
    if (err) {
      res.status(404).end();
      console.error(`/labels [GET] 500`);
    }
    console.log(labels);
    res.status(200).json(labels).end();
    console.log('/labels [GET] 200');
  });
});

app.get('/report', (req, res) => {
  res.render('report', {
    layout: 'index',
    rdforms: true
  });
  console.log('/report [GET] 200');
});

app.get('/blocker', (req, res) => {
  // run a chain of queries
  sparql.queryChain(reqh.defaultSetupQueryParams)
    .then(results => {
      // render the web page
      res.render('blocker', {
        layout: 'index',
        callSign: results.callSign,
        airportName: results.airportName,
        // nasdate: results.nasdate,
      });
      console.log('/blocker [GET] 200');
    })
    .catch(err => {
      console.error(`app.get() - sparql.queryChain: ${err}`);
      res.send('<h1>Server Error</h1>');
      console.log('/blocker [GET] 500');
    });
});

app.get('/read', async (req, res) => {
  let headers, bindings;
  let properties = [];
  let types = [];
  let rdfJson = ui.rdfJson;
  const topTag = "http://example.org/about";
  const flightModel = "AAL100";
  const query = sparql.postQueryArray({
    flightModel: flightModel
  });
  // make a request to get data
  await sparql.queryPromise(sparql.flightInstUrl, query)
    .then(results => {
      headers = results[0];
      bindings = results[1][0];
      // console.log(`queryPromise(): ${JSON.stringify(bindings)}`);
    })
    .catch(err => console.error(err));

  // create a path of a template json file
  const templatePath = `${__dirname}/templates/aviation.template.test.json`;
  // read a template
  ui.readTemplate(templatePath, async (templateJson) => {
    // define what to get
    // the order needs to map with queried data (headers and bindings) above
    const labels = [
      "atm:Flight",
      "atm:callSign",
      "atm:operatedBy",
      "nas:airCarrierName",
      "atm:arrivalAirport",
      "atm:actualArrivalDay",
      "atm:departureAirport",
      "atm:actualDepartureDay"
    ];
    // get a property and a type (uri or literal)
    for (const label of labels) {
      // const property = await ui.getProperty(templateJson, label);
      // const type = await ui.getType(templateJson, label);
      const [property, type] = ui.getter(templateJson, label);
      properties.push(property);
      types.push(type);
    }
    // create a rdf graph
    for (const [index, header] of headers.entries()) {
      const property = properties[index];
      const type = types[index];
      const value = bindings[header].value;
      // append rdfjson
      rdfJson[topTag][property] = [{
        "value": value,
        "type": type
      }];
    }
    // create a path for a rdf.js
    const rdfGraphPath = `${__dirname}/graph/rdf.test.js`;
    // write a graph into js file
    ui.writeRdfGraph(rdfGraphPath, ui.finaliseRdfJson(rdfJson), (err) => {
      if (err) {
        console.error(`ui.writeRdfGraph(): ${err}`);
        res.send('<h1>Server Error</h1>');
      }
      res.render('report', {
        layout: 'index'
      });
    });

  });
});

app.get('/test', async (req, res) => {
  // ========= TEST FOR GET BLOCKER REPORTS ===================
  new sparql.dbCommunicator().getData('blockerReport', (err, headers, bindings) => {
    if (err) {
      res.send('<h1>Testing failed</h1>');
    } else {
      // set cached data
      cachedHeaders = headers;
      cachedBindings = bindings;
      console.log(`headers: ${headers}`);
      console.log(`bindings.length: ${bindings.length}`);
      res.render('blockerView', {
        layout: 'index',
        title: headers[1].toUpperCase(),
        callSign: headers[2].toUpperCase(),
        created: headers[11].toUpperCase(),
        bindings: bindings
      });
    }
  });
});

app.get('/blocker_list', (req, res) => {
  if (cachedHeaders === undefined || cachedBindings === undefined) {
    new sparql.dbCommunicator().getData({ action: 'blockerReport' }, (err, headers, bindings) => {
      if (err) {
        res.send('<h1>Testing failed</h1>');
        console.error(`/blocker_list [GET] 500`);
      } else {
        // set cached data
        cachedHeaders = headers;
        cachedBindings = bindings;
        console.log(`headers: ${headers}`);
        console.log(`bindings.length: ${bindings.length}`);
        res.render('blocker-list', {
          layout: 'index',
          title: headers[1].toUpperCase(),
          creator: headers[2].toUpperCase(),
          created: headers[10].toUpperCase(),
          bindings: bindings
        });
        console.log('/blocker_list [GET] 200');
      }
    });
  } else {
    res.render('blocker-list', {
      layout: 'index',
      title: cachedHeaders[1].toUpperCase(),
      creator: cachedHeaders[2].toUpperCase(),
      created: cachedHeaders[10].toUpperCase(),
      bindings: cachedBindings
    });
    console.log('/blocker_list [GET] 200');
  }
})

app.get('/blocker_delete', (req, res) => {
  sparql.updateCallback({
    action: 'delete'
  }, (err, response, body) => {
    if (err || response.statusCode != 200) {
      console.error(err);
      res.send('Server Error');
      console.log(`/blocker_delete [GET] ${response.statusCode}`);
    } else {
      // render the home page
      sparql.queryChain()
        .then(results => {
          const models = results.model;
          const airports = results.airportName;
          const nasdate = results.nasdate;
          // render the web page
          res.render('home', {
            layout: 'index',
            models: models,
            airports: airports,
            nasdate: nasdate,
          });
          console.log('/blocker_delete [GET] 200');
        })
        .catch(err => {
          console.error(`app.get() - sparql.queryChain: ${err}`);
          res.send('<h1>Server Error</h1>');
          console.log('/blocker_delete [GET] 500');
        });
    }
  });
});

// ================================= POST ======================================
app.post('/report_data', (req, res) => {
  console.log(req.body);
  const reqData = reqh.getReqData(req.body);
  console.log(`reqData: ${reqData}`);
  new sparql.dbCommunicator().getData(reqData, (err, headers, bindings) => {
    if (err) {
      res.status(500).end();
      console.error(err);
      console.log('/report_data [POST] 500');
    } else {
      console.log('header: ', headers);
      console.log('bindings:', bindings);
      res.json(bindings).end();
      console.log('/report_data [POST] 200');
    }
  });
});

app.post('/report', (req, res) => {
  console.log('/report [POST]');
  console.log(req.body);
  const rdfGraphCreator = new ui.RDFGraphCreator();
  const reqData = reqh.getReqData(req.body);
  console.log(`reqData: ${JSON.stringify(reqData)}`);
  rdfGraphCreator.writeRdfGraph(reqData, err => {
    if (err) {
      console.error(err);
      res.status(500).end();
      console.log('/report [POST] 500');
    } else {
      res.status(200)
        .render('report', {
          layout: 'index',
          rdforms: true
        });
      console.log('/report [POST] 200');
    }
  });

  // rdfGraphCreator.readTemplate((err) => {
  //   if (err) {
  //     console.error(err);
  //     res.send('<h1>Server Error</h1>');
  //   }
  //   rdfGraphCreator.writeRdfGraph(err => {
  //     if (err) {
  //       console.error(err);
  //       res.send('<h1>Server Error</h1>');
  //     }
  //     res.render('report', {
  //       layout: 'index'
  //     });
  //     console.log("Report page rendered");
  //
  //   });
  // });
});

app.post('/blocker_post', async (req, res) => {
  console.log(`request body:${JSON.stringify(req.body)}`);
  const reportData = await reqh.getBlockerReportPostData(req.body);
  console.log(`report data: ${JSON.stringify(reportData)}`);

  // =========================== METHOD SPARQL UPDATE ==========================
  sparql.updateCallback({
    data: reportData
  }, (err, response, body) => {
    if (err || response.statusCode != 200) {
      console.error(`statusCode: ${response.statusCode}, err: ${err}`);
      res.sendStatus(response.statusCode).end();
      console.log('/blocker_post [POST] 500');
    } else {
      new sparql.dbCommunicator().getData({ action: 'blockerReport' }, (err, headers, bindings) => {
        if (err) {
          res.sendStatus(500).end();
          console.log('/blocker_post [POST] 500');
        } else {
          // set cached data
          cachedHeaders = headers;
          cachedBindings = bindings;
          res.sendStatus(200).end();
          console.log('/blocker_post [POST] 200');
        }
      });
    }
  });
  // ================== METHOD WRITING A TTL FILE ==============================
  // rdfWriter.writeTemplate(reportData, (err, results, res, body) => {
  //   if (err || res.statusCode != 200) {
  //     console.error(`statusCode: ${res.statusCode}, err: ${err}`);
  //     res.status(res.statusCode).end();
  //   } else {
  //     // send
  // res.status(200).end();
  //   }
  // });
});

app.post('/blocker_view_post', (req, res) => {
  const identifier = req.body.identifier;
  console.log(`identifier: ${identifier}`);

  resh.blockerReportGetter(cachedBindings, identifier, (json) => {
    res.status(200).json(json).end();
    console.log('/blocker_view_post [POST] 200');
  });
});

app.listen(port, () => console.log(`Flight Planner app listening on port ${port}!`));
