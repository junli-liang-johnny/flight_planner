/*
 * helper functions for sparql
 */
const request = require('request');
const prefix = require('./prefix');
const fs = require('fs');

/**
 * codes
 */
const FLIGHT_REPORT_FORM_DATA = 5;

// ========================== Jena URLs =======================================
// Jena URL
const baseUrl = "http://localhost:3030";

// databasets
const sampleDataset = "flight_inst";
const flightDataset = "flight_inst";
const blockerReportDataset = "test";

// instance query URLs
const sampleUrl = `${baseUrl}/${sampleDataset}/query`;
const flightInstUrl = `${baseUrl}/${flightDataset}/query`;
const blockerReportInstUrl = `${baseUrl}/${blockerReportDataset}/query`;
const blockerReportGetUrl = `${baseUrl}/${blockerReportDataset}/query`;

// upload url
const blockerReportUploadUrl = `${baseUrl}/${blockerReportDataset}/data`;

// update url
const blockerReportUpdateUrl = `${baseUrl}/${blockerReportDataset}/update`;

// ================================ queries ====================================
const sampleQueryArray = [
  generatePrefix('atm', prefix.atm),
  generatePrefix('rdfs', prefix.rdfs),
  'SELECT ?subject ?label',
  'WHERE { ?subject a atm:Flight ; rdfs:label ?label .}',
  'LIMIT 25',
];
const sampleQueryArray2 = [
  generatePrefix('atm', prefix.atm),
  'SELECT ?flight',
  'WHERE { ?flight a atm:Flight . }',
  'LIMIT 25',
];
const getFlightModelQuery = [
  generatePrefix('atm', prefix.atm),
  'SELECT distinct ?callSign',
  'WHERE {',
  '?flight a atm:Flight ;',
  'atm:callSign ?callSign .',
  '}',
];
const getDateQuery = [
  generatePrefix('nas', prefix.nas),
  'SELECT distinct ?nasdate',
  'WHERE {',
  '?date a nas:NASday ;',
  'nas:date ?nasdate .',
  '}',
];

const getAirportNameQuery = [
  generatePrefix('nas', prefix.nas),
  'select * where {',
  '  {',
  '	    select distinct ?airportName',
  '	    where {',
  '  		   ?airport a nas:InternationalAirport ;',
  '        		      nas:airportName ?airportName .',
  '	    }',
  '  }',
  '  union',
  '  {',
  '  	  select distinct ?airportName',
  '  	  where { ',
  '         ?airport a nas:NonCONUSairport ;',
  '  				         nas:airportName ?airportName . ',
  '	    }',
  '  }',
  '  union {',
  '     select distinct ?airportName',
  '     where {',
  '         ?airport a nas:CONUSairport ;',
  '                  nas:airportName ?airportName .',
  '     }',
  '  }',
  '}'
]

// get all iata airport codes
const getIataAirportCodeQuery = (airportName) => {
  return [
    generatePrefix('nas', prefix.nas),
    'select ?iataAirportCode where {',
    '  {',
    '     select distinct ?airportName ?iataAirportCode',
    '     where {',
    '       ?airport a nas:InternationalAirport ;',
    '                nas:airportName ?airportName .',
    '       optional { ?airport	nas:iataAirportCode ?iataAirportCode .}',
    '     }',
    '  }',
    '  union',
    '  {',
    '	    select distinct ?airportName ?iataAirportCode',
    '    	where { ',
    '        ?airport a nas:NonCONUSairport ;',
    '                 nas:airportName ?airportName .',
    '        optional { ?airport nas:iataAirportCode ?iataAirportCode .}',
    '     }',
    '  }',
    '  union {',
    '     select distinct ?airportName ?iataAirportCode',
    '     where {',
    '       ?airport a nas:CONUSairport ;',
    '                 nas:airportName ?airportName .',
    '       optional { ?airport nas:iataAirportCode ?iataAirportCode .}',
    '     }',
    '  }',
    `  filter (?airportName = "${airportName}")`,
    '}',
  ];
}

// get all faa airport code
const getFaaAirportCodeQuery = (airportName) => {
  return [
    generatePrefix('nas', prefix.nas),
    'select ?faaAirportCode where {',
    '{',
    'select distinct ?airportName ?faaAirportCode',
    'where {',
    '    ?airport a nas:InternationalAirport ;',
    '             nas:airportName ?airportName .',
    '    optional { ?airport	nas:faaAirportCode ?faaAirportCode .}',
    '}',
    '}',
    'union',
    '{',
    '	select distinct ?airportName ?faaAirportCode',
    '	where { ',
    '    ?airport a nas:NonCONUSairport ;',
    '             nas:airportName ?airportName .',
    '    optional { ?airport nas:faaAirportCode ?faaAirportCode .}',
    '}',
    '}',
    'union {',
    ' select distinct ?airportName ?faaAirportCode',
    '  where {',
    '    ?airport a nas:CONUSairport ;',
    '             nas:airportName ?airportName .',
    '    optional { ?airport nas:faaAirportCode ?faaAirportCode .}',
    '  }',
    '}',
    `filter (?airportName = "${airportName}")`,
    '}',
  ];
}
// get all icao airport code
const getIcaoAirportCodeQuery = (airportName) => {
  return [
    generatePrefix('nas', prefix.nas),
    'select ?icaoAirportCode where {',
    '{',
    'select distinct ?airportName ?icaoAirportCode',
    'where {',
    '    ?airport a nas:InternationalAirport ;',
    '             nas:airportName ?airportName .',
    '    optional { ?airport	nas:icaoAirportCode ?icaoAirportCode .}',
    '}',
    '}',
    'union',
    '{',
    '	select distinct ?airportName ?icaoAirportCode',
    '	where { ',
    '    ?airport a nas:NonCONUSairport ;',
    '             nas:airportName ?airportName .',
    '    optional { ?airport nas:icaoAirportCode ?icaoAirportCode .}',
    '}',
    '}',
    'union {',
    ' select distinct ?airportName ?icaoAirportCode',
    '  where {',
    '    ?airport a nas:CONUSairport ;',
    '             nas:airportName ?airportName .',
    '    optional { ?airport nas:icaoAirportCode ?icaoAirportCode .}',
    '  }',
    '}',
    `filter (?airportName = "${airportName}")`,
    '}',
  ];
};

// get airport by airportName
const getAirportQuery = (airportName, params) => {
  const queryLabel = (params.queryLabel) ? params.queryLabel : '?airport';
  console.log(`queryLabel: ${params.queryLabel}`);
  return [
    generatePrefix('nas', prefix.nas),
    generatePrefix('atm', prefix.atm),
    `select ${queryLabel} where {`,
    '{',
    `select distinct ?airportName ${queryLabel}`,
    'where {',
    `    ${queryLabel} a nas:InternationalAirport ;`,
    '             nas:airportName ?airportName .',
    '}',
    '}',
    'union',
    '{',
    `	select distinct ?airportName ${queryLabel}`,
    '	where { ',
    `    ${queryLabel} a nas:NonCONUSairport ;`,
    '             nas:airportName ?airportName .',
    '}',
    '}',
    'union {',
    ` select distinct ?airportName ${queryLabel}`,
    '  where {',
    `    ${queryLabel} a nas:CONUSairport ;`,
    '             nas:airportName ?airportName .',
    '  }',
    '}',
    `filter (?airportName = "${airportName}")`,
    '}',
  ];
};

/**
 * get the updated data of flight report form on the home page
 */
const getFlightReportFormDataQueryArray = (params) => {
  return [
    generatePrefix('atm', prefix.atm),
    generatePrefix('nas', prefix.nas),
    'select * where {',
    '?flight a atm:Flight ;',
    '      atm:callSign ?callSign ;',
    '      atm:arrivalAirport ?arrivalAirportUri;',
    '      atm:departureAirport ?departureAirportUri ;',
    '      atm:actualArrivalDay ?actualArrivalDay ;',
    '    atm:actualDepartureDay ?actualDepartureDay .',

    '?arrivalAirportUri nas:airportName ?arrivalAirportName .',
    '?departureAirportUri nas:airportName ?departureAirportName .',
    '?actualArrivalDay nas:date ?actualArrivalDate .',
    '?actualDepartureDay nas:date ?actualDepartureDate .',
    filter('?callSign', params.callSign),
    filter('?arrivalAirportName', params.arrivalAirport),
    filter('?departureAirportName', params.departureAirport),
    filter('?actualArrivalDate', params.actualArrivalDay),
    filter('?actualDepartureDate', params.actualDepartureDay),
    '}'
  ]
}

/**
 * function to generate a query getting a particular flight/... from sample report page
 * @param queryLabels {JSON}:  define what to filter
 * @param templateLabels {JSON}: define what labels to show on the sample report page
 */
const postQueryArray = (queryLabels, templateLabels) => {
  return [
    generatePrefix('atm', prefix.atm),
    generatePrefix('rdfs', prefix.rdfs),
    generatePrefix('nas', prefix.nas),
    generatePrefix('dcterms', prefix.dcterms),
    generatePrefix('data', prefix.data),
    // select
    getSPARQLSelectClause(templateLabels),
    `WHERE {
      ?Flight a atm:Flight ;
              atm:callSign ?callSign ;
              rdfs:label ?label ;
      	      atm:arrivalAirport ?arrivalAirport ;
              atm:departureAirport ?departureAirport ;
              atm:actualArrivalDay ?actualArrivalDay ;
              atm:actualArrivalTime ?actualArrivalTime ;
              atm:actualDepartureDay ?actualDepartureDay ;
              atm:actualDepartureTime ?actualDepartureTime ;
              atm:operatedBy ?operatedBy .
    #  actual day
      ?actualArrivalDay rdfs:label ?actualArrivalDate .
      ?actualDepartureDay rdfs:label ?actualDepartureDate .
    #  air carrier
      ?operatedBy nas:airCarrierName ?airCarrierName ;
                  nas:airlineCallsign ?airlineCallsign ;
                  nas:iataCarrierCode ?iataCarrierCode ;
                  nas:icaoCarrierCode ?icaoCarrierCode ;
                  nas:countryOfRegistry ?countryOfRegistry .
    #  arrival airport
      ?arrivalAirport nas:airportName ?arrivalAirportName ;
                      nas:airportLocation ?arrivalAirportLocation ;
      OPTIONAL {
        ?arrivalAirport data:hasAirportData ?arrivalAirportData .
        # arrival airport data
        ?arrivalAirportData data:dataIntervalStartTime ?arrivalAirportConditionDataIntervalStartTime ;
                          data:dataIntervalStartDay ?arrivalAirportConditionDataIntervalStartDay ;
                          data:scheduledArrivals ?arrivalAirportConditionScheduledArrivals ;
                          data:scheduledDepartures ?arrivalAirportConditionScheduledDepartures ;
                          data:highWindWITIhourly ?arrivalAirportConditionHighWindWITIhourly ;
                  	      data:lowCeilingWITIhourly ?arrivalAirportConditionLowCeilingWITIhourly ;
                  	      data:lowVisibilityWITIhourly ?arrivalAirportConditionLowVisibilityWITIhourly ;
                  	      data:totalAirborneDelay ?arrivalAirportConditionTotalAirborneDelay .
      }
      OPTIONAL { ?arrivalAirport nas:hoursOffsetFromUTC ?arrivalHoursOffsetFromUTC }
      OPTIONAL { ?arrivalAirport nas:iataAirportCode ?arrivalIataAirportCode }
      OPTIONAL { ?arrivalAirport nas:icaoAirportCode ?arrivalIcaoAirportCode }
      OPTIONAL { ?arrivalAirport nas:faaAirportCode ?arrivalFaaAirportCode }

      ?departureAirport nas:airportName ?departureAirportName ;
                        nas:airportLocation ?departureAirportLocation .
      OPTIONAL { ?departureAirport nas:hoursOffsetFromUTC ?departureHoursOffsetFromUTC }
      OPTIONAL { ?departureAirport nas:iataAirportCode ?departureIataAirportCode }
      OPTIONAL { ?departureAirport nas:icaoAirportCode ?departureIcaoAirportCode }
      OPTIONAL { ?departureAirport nas:faaAirportCode ?departureFaaAirportCode }

      filter ( ?callSign = '${queryLabels.callSign}' )
      OPTIONAL {
        filter (
          ?actualArrivalDay = ?arrivalAirportDataIntervalStartDay &&
          ?arrivalAirportDataIntervalStartTime < ?actualArrivalTime
        )
      }
    }`,
  ];
};

const updateBlockerReportQueryArray = (params) => {
  return [
    generatePrefix('atm', prefix.atm),
    generatePrefix('rdfs', prefix.rdfs),
    generatePrefix('nas', prefix.nas),
    generatePrefix('ex', prefix.ex),
    generatePrefix('dcterms', prefix.dcterms),
    'INSERT DATA {',
    `ex:${params.identifier} a ex:blocker ;`,
    `   dcterms:title "${params.blockerTitle}" ;`,
    `   dcterms:creator "${params.blockerCreator}" ;`,
    `   atm:callSign "${params.callSign}" ;`,
    `   atm:actualArrivalDay "${params.arrivalDay}" ;`,
    `   atm:actualDepartureDay "${params.departureDay}" ;`,
    `   atm:arrivalAirport nas:${params.arrivalAirport.split('#')[1]} ;`,
    `   atm:departureAirport nas:${params.departureAirport.split('#')[1]} ;`,
    `   dcterms:description "${params.description}" ;`,
    `   dcterms:identifier "${params.identifier}" ;`,
    `   dcterms:created "${params.created}" .`,
    '}'
  ];
};

// query all blocker reports
const getBlockerReportQuery = [
  generatePrefix('atm', prefix.atm),
  generatePrefix('nas', prefix.nas),
  generatePrefix('dcterms', prefix.dcterms),
  generatePrefix('ex', prefix.ex),
  'SELECT * ',
  'WHERE {',
  '  ?blocker a ex:blocker ;',
  '           dcterms:title ?title ;',
  '           dcterms:creator ?creator ;',
  '           atm:callSign ?callSign ;',
  '           atm:actualArrivalDay ?actualArrivalDay ;',
  '           atm:actualDepartureDay ?actualDepartureDay ;',
  '           atm:arrivalAirport ?arrivalAirport ;',
  '           atm:departureAirport ?departureAirport ;',
  '           dcterms:description ?description ;',
  '           dcterms:identifier ?identifier ;',
  '           dcterms:created ?created .',
  // arrival airport code
  '  ?arrivalAirport nas:airportName ?arrivalAirportName .',
  '  OPTIONAL { ?arrivalAirport nas:iataAirportCode ?arrivalIataAirportCode }',
  '  OPTIONAL { ?arrivalAirport nas:icaoAirportCode ?arrivalIcaoAirportCode }',
  '  OPTIONAL { ?arrivalAirport nas:faaAirportCode ?arrivalFaaAirportCode }',
  // departure airport code
  '  ?departureAirport nas:airportName ?departureAirportName .',
  '  OPTIONAL { ?departureAirport nas:iataAirportCode ?departureIataAirportCode }',
  '  OPTIONAL { ?departureAirport nas:icaoAirportCode ?departureIcaoAirportCode }',
  '  OPTIONAL { ?departureAirport nas:faaAirportCode ?departureFaaAirportCode }',
  '}'
];

// !!careful to use
const deleteQueryArray = [
  'DELETE { ?subject ?predicate ?object }',
  'WHERE { ?subject ?predicate ?object }'
]

// ========================== SAMPLE DATA =====================================
const blockerReportSampleData = {

};

// home page init needed prarms
const initParams = [{
    url: flightInstUrl,
    query: getFlightModelQuery
  },
  {
    url: flightInstUrl,
    query: getAirportQuery
  },
  {
    url: flightInstUrl,
    query: getDateQuery
  }
];
// ============================= SPARQL OBJECTS ===============================
/**
 * Object to communicate with the Jena db server
 * provide helper functions like uploading
 */
function dbCommunicator() {
  /**
   * function to upload a file to Jena
   * @param filePath {String}: a path poitns to the file in string
   * @param action {String}: a string indicates what upload action is
   * @return callback {Function}: callback function with {err} error message and
   * {res} a response object and {body} a response body from the Jena
   */
  this.uploadRdfData = function(filePath, action, callback) {
    const url = (action == 'blockerReport') ? blockerReportUploadUrl : 'test:test';
    fs.createReadStream(filePath)
      .pipe(request.post({
        url: url,
      }, (err, res, body) => {
        if (err) {
          return callback(err);
        }
        console.log(`upload a blocker report to ${blockerReportUploadUrl}`);
        return callback(undefined, res, body);
      }));
  };

  /**
   * function to get a list of data from Jena
   * @param action {String}: indicate what get action is
   * @return callback {Function}
   * - {err} error message
   * - {headers} queried data headers
   * - {bindings} queried data
   */
  this.getData = function(params, callback) {
    console.log('getData().params: ', params);
    // set url and query array
    let url;
    let queryArray;
    if (params.action == 'blockerReport') {
      url = blockerReportInstUrl;
      queryArray = getBlockerReportQuery;
    } else if (params.action == 'flightReportForm') {
      url = flightInstUrl;
      queryArray = getFlightReportFormDataQueryArray(params.queryLabels);
    }
    console.log(`queryArray: ${queryArray}`);
    queryCallback(url, queryArray, (err, headers, bindings) => {
      if (err) {
        return callback(err);
      }
      return callback(undefined, headers, bindings);
    });
  };

};

// =========================== SPRAQL QUERY HELPER FUNCTIONS ===================

/**
 * function to generate filter statement for a SPARQL query
 */
const filter = (obj1, obj2) => {
  if (obj2 === undefined) {
    return '';
  } else {
    return `filter (${obj1} = "${obj2}")`;
  }
}
/**
 * function generate a prefix in string for a query
 * @param key {String}: a prefix key e.g. rdf
 * @oaram val {String}: a url of a prefix e.g. http://example.org/ex#
 * @return {String}: a prefix in string
 */
function generatePrefix(key, val) {
  return `PREFIX ${key}: <${val}>`;
}
/**
 * function to construct a query
 * @param url {String}: a sparql endpint url
 * @param queryArray {Array}: an array of strings. Please check the sample query
 * @return {String}: an error message or an validly constructed sparql query url
 */
const queryConstruct = (url, queryArray, option = 'query') => {
  if (typeof queryArray == 'object') {
    const query = queryArray.join(" ");
    if (option == 'update') {
      return `${url}?update=${encodeURIComponent(query)}`;
    } else {
      return url + "?query=" + encodeURIComponent(query) + "&format=json";
    }
  } else {
    const err = 'queryConstruct(): argument is not an object of array';
    return err;
  }
};

/**
 * function to sort the queried data
 * queried data usually comes in format like
 * [
 *    {airportname: { type: ..., value: ...}},
 *    {airportname: { type: ..., value: ...}},
 *    ...
 * ]
 */
/** function to sort queried bindings
 * sort for all possible queried data
 */
const getSortedBindings = (bindings) => {
  // if (bindings.length == 0) {
  //   return;
  // }
  // console.log(bindings);
  console.log('first element to sort: ' + bindings[0]);
  const bindingKey = getBindingKey(bindings);
  if (bindingKey) {
    return bindings.sort(getComparer);
  } else {
    return bindings;
  }

  // get the binding key like airportName etc
  function getBindingKey(bindings) {
    const possibleBindingKeys = ['airportName', 'callSign', 'airportCode'];
    for (const bindingKey of possibleBindingKeys) {
      if (bindings[0].hasOwnProperty(bindingKey)) {
        return bindingKey;
      }
    }
    return undefined;
  };

  // get the compare function
  function getComparer(obj1, obj2) {
    return obj1[bindingKey].value.localeCompare(obj2[bindingKey].value);
  }
};

/**
 * function to handle a query result, mapping the queried headers and bindings
 * @param headers {Array}: a list of headers
 * @param bindings {Array}: a list of bindings results
 * @return [mappedHeaders, mappedBindings]
 */
const getMappedResultes = (headers, bindings) => {
  for (const header of headers) {
    if (bindings[header] === undefined) {
      bindings[header] = {
        value: ''
      };
    }
  }
  return [headers, bindings];
}

/**
 * function to generate a SPARQL SELECT clause
 * @param templateLabels {JSON}: { airportInfo: [atm:Flighjt, ...], ...}
 */
const getSPARQLSelectClause = (templateLabels) => {
  console.log(`templateLabels: ${templateLabels}`);
  let clause = 'SELECT ';
  // const templateKeys = Object.keys(templateLabels);
  for (const labelType of Object.keys(templateLabels)) {
    for (const label of templateLabels[labelType]) {
      if (label !== '') {
        clause += getSPARQLSelectItem(label, labelType) + ' ';
      }
    }
  }
  return clause;
};

/**
 * function to generate SPARQL SELECT items
 * @param templateLabels {Array}: a list of item ids
 * @return SPARQLSelectItems {Array}: a list of transfered items id (e.g.) atm:Flight -> ?flight
 */
const getSPARQLSelectItems = (templateLabels) => {
  let items = [];
  for (const label of templateLabels) {
    items.push(getSPARQLSelectItem(label));
  }
  return items;
};

/**
 * function to convert a single item id into a SRARQL SELECT item
 */
const getSPARQLSelectItem = (templateLabel, labelType, labelTypePrefix = 'AirportInfo') => {
  let selectLabel;
  if (labelType.includes(labelTypePrefix) &&
    !templateLabel.startsWith('atm:arrivalAirport') &&
    !templateLabel.startsWith('atm:departureAirport')
  ) {
    const splitLabel = templateLabel.split(':')[1];
    selectLabel = `?${labelType.split(labelTypePrefix)[0]}${splitLabel[0].toUpperCase()}${splitLabel.slice(1)}`;
  } else if (labelType == 'arrivalAirportConditionInfo') {
    const splitLabel = templateLabel.split(':')[1];
    selectLabel = `?arrivalAirportCondition${splitLabel[0].toUpperCase()}${splitLabel.slice(1)}`;
  } else {
    selectLabel = `?${templateLabel.split(":")[1]}`;
  }
  console.log(`labelType: ${labelType}, templateLabel: ${templateLabel}, selectLabel: ${selectLabel}`);
  return selectLabel;
}

// =============================  QUERY FUNCTIONS ==============================
/**
 * function to run a query with url and queryArray
 * @param url {String}: a sparql endpint url
 * @param queryArray {Array}: is an array of string. Please check the sample query
 * @return {Promise}: resolve header and queried data as an array
 * reject an error message from request.post()
 */
const queryPromise = (url, queryArray) => {
  return new Promise((resolve, reject) => {
    console.log(queryArray);
    // construct a query
    const queryUrl = queryConstruct(url, queryArray);
    if (queryUrl.startsWith('q')) {
      reject(` - queryPromise() - ${queryUrl}`);
      // } else {
      //   console.log(url, queryArray);
    }
    // make request url
    request.post(queryUrl, (err, res, body) => {
      if (err) {
        reject(` - queryPromise() - request.post(): ${err}`);
      } else {
        const json = JSON.parse(body);
        if (json.results.bindings.length == 1) {
          const headers = json.head.vars;
          const bindings = json.results.bindings[0];
          resolve([headers, bindings]);
        } else {
          console.log(json);
          const headers = json.head.vars;
          const bindings = getSortedBindings(json.results.bindings);
          resolve([headers, bindings]);
        }
      }
    });
  });
};

/**
 * @param url {String}: a sparql endpint url
 * @param queryArray {Array}: is an array of string. Please check the sample query
 * @return {function}: a callback function to be returned with possible params
 * - {err} error message
 * - {headers} header
 * - {bindings} queried data
 */
const queryCallback = (url, queryArray, callback) => {
  const queryUrl = queryConstruct(url, queryArray);
  if (queryUrl.startsWith('q')) {
    return callback(`invalid query: ${queryUrl}`);
  }
  // make a request
  request.post(queryUrl, async (err, res, body) => {
    if (err) {
      return callback(err);
    } else {
      const json = JSON.parse(body);
      // const headers = new String(json.head.vars);
      const headers = json.head.vars;
      headers.stringify = JSON.stringify(json.head.vars);
      // console.log(`json body: ${body}`);
      if (headers.length > 1) {
        console.log("Note: the queried data have more than one header");
        console.log("       Please refer sparql.js - queryCallback()");
      }
      // const bindings = JSON.stringify(json.results.bindings);
      const bindings = json.results.bindings;
      bindings.stringify = JSON.stringify(json.results.bindings);
      return callback(undefined, headers, bindings);
    }
  });
};

/**
 * function to get an array of params
 * @param params {array}: in a format [{url: url, query: query},...]
 * @param callback {function}: posiible to have (err, results) params
 * results is a dictionary of queried data header and content
 * the length depends on the length of params
 */
async function forEachQuery(params, callback) {
  // dict to be returned
  let results = {};
  for (const param of params) {
    await queryPromise(param.url, param.query)
      .then(list => {
        const key = list[0];
        const val = list[1];
        results[key] = val;
      })
      .catch(err => {
        return callback(`forEachQuery() - queryPromise(): ${err}`);
      });
  }
  console.log('forEachQuery() done');
  callback(undefined, results);
};

/**
 * function runs a list of queries
 * @Params: queries {JSON}: an array of key-value pairs in [{url: url, query: query}, ...] format
 */
const queryChain = (params) => {
  const subParams = (params === undefined) ? initParams : params;
  // console.log(params);
  return new Promise((resolve, reject) => {
    forEachQuery(subParams, (err, results) => {
      if (err) {
        reject(err);
      }
      // console.log(JSON.stringify(results));
      // console.log(results);
      resolve(results);
    });
  });
};

/**
 * function to add rdf data to the Jena
 * @param url {String}: a sparql endpoint url
 * @param queryArray {Array}: an array of query. Please reder sample queries
 * @return callback {Function}: a callback function with
 * - err {String}: error message
 * - res {Object}: response object
 * - body {Object}: response object
 */
const updateCallback = (params, callback) => {
  const url = (params.url === undefined) ? blockerReportUpdateUrl : params.url;
  const data = (params.data === undefined) ? blockerReportSampleData : params.data;
  const queryArray = (params.action == 'delete') ? deleteQueryArray : updateBlockerReportQueryArray(data);
  console.log(queryArray);
  const queryUrl = queryConstruct(url, queryArray, 'update');
  if (queryUrl.startsWith('q')) {
    return callback(` - updatePromise() - ${queryUrl}`);
  }
  request.post({
    url: queryUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, (err, res, body) => {
    if (err) {
      return callback(err);
    }
    return callback(undefined, res, body);
  });
};

module.exports = {
  // sample data
  blockerReportSampleData: blockerReportSampleData,

  // URLs
  sampleUrl: sampleUrl,
  flightInstUrl: flightInstUrl,
  blockerReportUpdateUrl: blockerReportUpdateUrl,

  // queries
  sampleQueryArray: sampleQueryArray,
  sampleQueryArray2: sampleQueryArray2,
  getFlightModelQuery: getFlightModelQuery,
  getDateQuery: getDateQuery,
  getAirportQuery: getAirportQuery,
  getAirportNameQuery: getAirportNameQuery,
  getIataAirportCodeQuery: getIataAirportCodeQuery,
  getFaaAirportCodeQuery: getFaaAirportCodeQuery,
  getIcaoAirportCodeQuery: getIcaoAirportCodeQuery,
  postQueryArray: postQueryArray,
  updateBlockerReportQueryArray: updateBlockerReportQueryArray,
  deleteQueryArray: deleteQueryArray,

  // exported functions
  queryConstruct: queryConstruct,
  queryPromise: queryPromise,
  queryCallback: queryCallback,
  queryChain: queryChain,
  updateCallback: updateCallback,

  // exported objects
  dbCommunicator: dbCommunicator,
};
