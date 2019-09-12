/**
 * helper functions for handling requests
 */
const ta = require('./templateAnalyse');
const sparql = require('./sparql');

/*
 * consts
 */
// used to get item ids from a template
const defaultLabelTypes = ['flightInfo', 'arrivalAirportInfo', 'departureAirportInfo', 'airCarrierInfo', 'arrivalAirportConditionInfo'];
const defaultSetupQueryParams = [{
    url: sparql.flightInstUrl,
    query: sparql.getFlightModelQuery
  },
  {
    url: sparql.flightInstUrl,
    query: sparql.getAirportNameQuery
  },
  {
    url: sparql.flightInstUrl,
    query: sparql.getDateQuery
  }
];

/**
 * function to return required labels (ids in a template.templates)
 * @param labelTypes {Array}: a list of content types which are either {flightInfo},
 * {airportInfo} or {airCarrierInfo} that will be shown on {rdforms-config-modal}
 * element on the /report
 * @return callback {Function}: a callback function with retrieved labels
 */
const getLabels = async (callback, labelTypes = defaultLabelTypes) => {
  const taer = new ta.TemplateAnalyser();
  let labels = {};
  for (const labelType of labelTypes) {
    labels[labelType] = await taer.getItemIds(labelType);
  }
  callback(undefined, labels);
}

/**
 * function to get rdforms configuration form data
 * @param body {JSON}: a request body
 * @return json {JSON}: json.queryLabels, json.templateLabels and json.requestCode
 */
const getReqData = (body) => {
  const requestCode = body.requestCode;
  // if request code == 5 means the flight report form on the home page needs updated data
  if (requestCode == 5) {
    return {
      action: 'flightReportForm',
      requestCode: body.requestCode,
      queryLabels: {
        callSign: body.callSign,
        arrivalAirport: body.arrivalAirport,
        departureAirport: body.departureAirport,
        actualArrivalDay: body.actualArrivalDay,
        actualDepartureDay: body.actualDepartureDay
      }
    };
  }
  const queryLabels = JSON.parse(body.queryLabels);
  let templateLabels = (body.templateLabels) ? JSON.parse(body.templateLabels) : undefined;
  templateLabels = (isEmpty(templateLabels)) ? emptyTemplateLabels() : templateLabels;
  console.log(`templateLabels: ${JSON.stringify(templateLabels)}`);

  return {
    requestCode: requestCode,
    queryLabels: queryLabels,
    templateLabels: templateLabels
  };

  // helper functions
  function isEmpty(templateLabels) {
    for (const key of Object.keys(templateLabels)) {
      if (templateLabels[key].length > 0) {
        return false;
      }
    }
    console.log('is empty');
    return true;
  }

  function emptyTemplateLabels() {
    return {
      flightInfo: ['atm:Flight'],
      arrivalAirportInfo: [],
      departureAirportInfo: [],
      airCarrierInfo: [],
      arrivalAirportConditionInfo: []
    };
  }
};

/**
 * function to receive a body and return its blocker report data
 */
const getBlockerReportPostData = async (body) => {
  this.now = () => {
    const now = new Date();
    const nowDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    const nowTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    return `${nowDate}_${nowTime}`;
  };

  this.generateId = (param) => {
    if (param === undefined) {
      return `blockerReport-${this.now()}`;
    } else {
      return `${param}_${this.now()}`;
    }
  };

  if (body.body !== undefined) {
    console.error(`requestHandler.getBlockerReportData() - Please pass a request body`);
    return;
  }

  if (body.blockerTitle !== undefined) {
    console.log('request from a AJAX client');
    const [arrivalAirport, departureAirport] = await getAirport(body.arrivalAirportName, body.departureAirportName);
    // const arrivalAirportCode = await getAirportCode(body.arrivalAirportName);
    // const departureAirportCode = await getAirportCode(body.departureAirportName);
    // console.log(`arrival airport Code: ${arrivalAirportCode}`);
    // console.log(`departure airport Code: ${departureAirportCode}`);
    return {
      blockerTitle: body.blockerTitle,
      blockerCreator: body.blockerCreator,
      callSign: body.callSign,
      arrivalDay: body.arrivalDay,
      arrivalAirport: arrivalAirport,
      arrivalAirportName: body.arrivalAirportName,
      // arrivalFaaAirportCode: arrivalAirportCode.faaAirportCode,
      // arrivalIataAirportCode: arrivalAirportCode.iataAirportCode,
      // arrivalIcaoAirportCode: arrivalAirportCode.icaoAirportCode,
      departureAirport: departureAirport,
      departureAirportName: body.departureAirportName,
      // arrivalFaaAirportCode: departureAirportCode.faaAirportCode,
      // departureIataAirportCode: departureAirportCode.iataAirportCode,
      // departureIcaoAirportCode: departureAirportCode.icaoAirportCode,
      departureDay: body.departureDay,
      description: body.description,
      identifier: this.generateId(),
      created: this.now()
    };
  } else {
    return {
      blockerTitle: body['blocker-title'],
      blockerCreator: body['blocker-creator'],
      callSign: body['call-sign'],
      arrivalDay: body['arrival-day'],
      departureDay: body['departure-day'],
      airportCode: body['airport-code'],
      airportName: body['airport-name'],
      description: body['blocker-description'],
      identifier: this.generateId(),
      created: this.now()
    };
  }

  // function to get the associated airport code
  function getAirportCode(airportName) {
    return new Promise((resolve, reject) => {
      sparql.queryChain([{
          url: sparql.flightInstUrl,
          query: sparql.getIataAirportCodeQuery(airportName)
        }, {
          url: sparql.flightInstUrl,
          query: sparql.getFaaAirportCodeQuery(airportName)
        }, {
          url: sparql.flightInstUrl,
          query: sparql.getIcaoAirportCodeQuery(airportName)
        }])
        .then(results => resolve(results))
        .catch(err => reject(err));
    });
  }

  // get the arrival and departure airport by airportName
  function getAirport(arrivalAirportName, departureAirportName) {
    return new Promise((resolve, reject) => {
      sparql.queryChain([{
          url: sparql.flightInstUrl,
          query: sparql.getAirportQuery(arrivalAirportName, {
            queryLabel: '?arrivalAirport'
          })
        }, {
          url: sparql.flightInstUrl,
          query: sparql.getAirportQuery(departureAirportName, {
            queryLabel: '?departureAirport'
          })
        }])
        .then(results => resolve([results.arrivalAirport.arrivalAirport.value, results.departureAirport.departureAirport.value]))
        .catch(err => reject(err));
    });
  }
};

module.exports = {
  getBlockerReportPostData: getBlockerReportPostData,
  getReqData: getReqData,
  getLabels: getLabels,
  defaultSetupQueryParams,
};
