
import './bootstrap-material-datetimepicker.js';

$('.datetimepicker').bootstrapMaterialDatePicker({time: false}).on('beforeChange', (e, date) => {});


/**
 * event handler for the submit button
 */
document.getElementById('blocker-report-submit-btn').addEventListener('click', (e) => {
  // get all input values
  const form = document.getElementById('blocker-report-form-container');
  // get all values
  const formData = getInputValues(form);
  // define url
  const url = 'http://localhost:3000/blocker_post';
  // send data
  sendData(url, formData);

  e.preventDefault();
});

// function to get all input values and return them in JSON
function getInputValues(root) {
  const blockerTitle = root.querySelector('#blocker-title').value;
  const blockerCreator = root.querySelector('#blocker-creator').value;
  const callSign = root.querySelector('#call-sign').value;
  const arrivalDay = root.querySelector('#arrival-day').value;
  const departureDay = root.querySelector('#departure-day').value;
  const arrivalAirportName = root.querySelector('#arrival-airport-name').value;
  const deparairportAirportName = root.querySelector('#departure-airport-name').value;
  const description = root.querySelector('#blocker-description').value;

  const json = {
    blockerTitle: blockerTitle,
    blockerCreator: blockerCreator,
    callSign: callSign,
    arrivalDay: arrivalDay,
    departureDay: departureDay,
    arrivalAirportName: arrivalAirportName,
    departureAirportName: deparairportAirportName,
    description: description
  }
  return JSON.stringify(json);
}

function sendData(url, data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  //Send the proper header information along with the request
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  // xhr.setRequestHeader("Content-Type", "application/x-www-form-json");

  xhr.onreadystatechange = function() { // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status == 200) {
        console.log(this.responseText);
        toggleSnackbar('The blocker report uploaded!');
      } else {
        console.log(this.status);
        toggleSnackbar("The blocker report couldn't upload");
      }
    }
  }
  xhr.send(data);
}

function toggleSnackbar(message) {
  const options = {
    content: message, // text of the snackbar
    style: "toast", // add a custom class to your snackbar
    timeout: 2000 // time in milliseconds after the snackbar autohides, 0 is disabled
  }
  $.snackbar(options);
}
