/**
* helper functions for response
*/
const sparql = require('./sparql');

/**
* function to extract a blocker report details by a given report identifier
* @param bindings {JSON/String}: a cached bindings of list of blocker reports
* @param identifier {String}: a report identifier
* @return callback {Function}: callback function with a gotten report data.
* ?blocker
* ?title
* ?callSign
* ?actualArrivalDay
* ?actualArrivalTime
* ?actualDepartureDay
* ?actualDepartureTime
* ?airportCode ?airportName
* ?description
* ?identifier
* ?created
*/
const blockerReportGetter = (bindings, identifier, callback) => {
  // console.log(bindings);
  // bindings.forEach((item) => {
  for (const item of bindings) {
    if (item.identifier.value == identifier) {
      console.log(`found item: ${JSON.stringify(item)}`);
      return callback({
        blocker: item.blocker.value,
        title: item.title.value,
        creator: item.creator.value,
        callSign: item.callSign.value,
        actualArrivalDay: item.actualArrivalDay.value,
        actualDepartureDay: item.actualDepartureDay.value,
        // arrival airport
        arrivalAirport: item.arrivalAirport.value,
        arrivalAirportName: item.arrivalAirportName.value,
        arrivalIataAirportCode: getNonEmptyAirportCode(item.arrivalIataAirportCode),
        arrivalFaaAirportCode: getNonEmptyAirportCode(item.arrivalFaaAirportCode),
        arrivalIcaoAirportCode: getNonEmptyAirportCode(item.arrivalIcaoAirportCode),
        // departure airport
        departureAirport: item.departureAirport.value,
        departureAirportName: item.departureAirportName.value,
        departureIataAirportCode: getNonEmptyAirportCode(item.departureIataAirportCode),
        departureFaaAirportCode: getNonEmptyAirportCode(item.departureFaaAirportCode),
        departureIcaoAirportCode: getNonEmptyAirportCode(item.departureIcaoAirportCode),
        description: item.description.value,
        identifier: identifier,
        created: item.created.value
      })
    }
  }

  function getNonEmptyAirportCode(airportCode) {
    const code = (airportCode) ? airportCode.value : '';
    return code;
  }
};

module.exports = {
  blockerReportGetter: blockerReportGetter,
};
