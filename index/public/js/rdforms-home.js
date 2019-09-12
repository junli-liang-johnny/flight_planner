import {
  Template
} from './rdforms-template.js';

// import './bootstrap-material-datetimepicker.js';

import {
  appendForm,
  getFormData,
  getRdformsQueryData,
  storeLabels,
  getStoredLabels,
  areTemplateLabelsStored,
  storeQueryLabels,
} from './common.js';

import './bootstrap-material-datetimepicker.js';

$('.datetimepicker').bootstrapMaterialDatePicker({
  time: false
}).on('beforeChange', (e, date) => {});

/**
 * event listener on the page loads
 */
window.onload = () => {
  console.log('/home page opens');
  if (areTemplateLabelsStored()) {
    const labels = getStoredLabels();
    Template.setLabels(labels);
    console.log(`home onload() Template.setLabels ${labels}`);
  }
}

/**
* when the home page is about to leave store the query labels
*/
window.onbeforeunload = () => {
  console.log('/home page closes');
  const formData = getFormData('rdforms-query-form', 'SELECT');
  storeQueryLabels(formData);
}

/**
 * event listener on when a the query button is clicked
 * append queryLabels and templateLabels to the form to be submitted
 */
document.getElementById('rdforms-query-btn').addEventListener('click', (e) => {
  const formData = getFormData('rdforms-query-form', 'SELECT');
  console.log(`formData: ${formData}`);
  const form = appendForm('rdforms-query-form', {
    queryLabels: JSON.stringify(formData),
    templateLabels: JSON.stringify(Template.templateLabels)
  });
  form.submit();

  // store the queryLabels which can be used by /report page for further query
  storeQueryLabels(formData);
});

/**
 * function to get the associated data when the flight number is selected
 */
document.getElementById('call-sign-select').addEventListener('change', (e) => {
  const jsonData = {
    requestCode: 5,
    callSign: e.target.value
  };
  const url = 'http://localhost:3000/report_data';
  sendXMLHttpRequest(url, jsonData, (err, status, res) => {
    if (err) {
      console.error(err);
    } else {
      const bindings = JSON.parse(res);
      updateFlightReportQueryForm(bindings);
    }
  });
});

/**
* funciton to update the select data
*/
function updateFlightReportQueryForm(data) {
  const arrivalAirportSelect = document.getElementById('arrival-airport-select');
  const departureAirportSelect = document.getElementById('departure-airport-select');
  const actualArrivalDay = document.getElementById('actual-arrival-day-datetimepicker');
  const actualDepartureDay = document.getElementById('actual-departure-day-datetimepicker');
  // clear options for two select
  while (arrivalAirportSelect.firstChild) {
    arrivalAirportSelect.removeChild(arrivalAirportSelect.firstChild);
  }
  while (departureAirportSelect.firstChild) {
    departureAirportSelect.removeChild(departureAirportSelect.firstChild);
  }
  // append options
  let arrivalAirportOptions = '';
  let departureAirportOptions = '';
  data.forEach((flightData) => {
    arrivalAirportOptions += `<option value="${flightData.arrivalAirportName.value}">${flightData.arrivalAirportName.value}</option>`;
    departureAirportOptions += `<option value="${flightData.departureAirportName.value}">${flightData.departureAirportName.value}</option>`;
  });
  // update select options
  arrivalAirportSelect.innerHTML = arrivalAirportOptions;
  arrivalAirportSelect.value = arrivalAirportSelect.options[0].value;
  departureAirportSelect.innerHTML = departureAirportOptions;
  departureAirportSelect.value = departureAirportSelect.options[0].value;
  // update date
  console.log(data[0].actualArrivalDate.value);
  // console.log(actualArrivalDay.value);
  actualArrivalDay.value = data[0].actualArrivalDate.value;
  actualDepartureDay.value = data[0].actualDepartureDate.value;

}

/**
 * XMLHttpRequest sender function
 */
function sendXMLHttpRequest(url, data, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

  xhr.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status == 200) {
        // response data like { callSign: ..., arrivalAirport: [...], ...}
        callback(undefined, 200, this.responseText);
      } else {
        callback(this.responseText, this.status, undefined);
      }
    }
  }
  xhr.send(JSON.stringify(data));
}
