$(document).ready(function() {
  $('body').bootstrapMaterialDesign();
});

/**
 * sends a request to the specified url from a form. this will change the window location.
 * @param {string} path the path to send the post request to
 * @param {object} params the paramiters to add to the url
 * @param {string} [method=post] the method to use on the form
 */
function post(path, params, id, method = 'post') {
  // clear the form
  const previousForm = document.getElementById(id);
  if (previousForm != null) {
    previousForm.parentNode.removeChild(previousForm);
  }

  // create a form
  const form = document.createElement('form');
  form.id = 'rdforms-configuration-form';
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}

/**
* rdforms home form submission
*/
function getRdformsQueryData(inputClassName) {
  // selected query values
  let keyVal = {};
  // get the selection input
  const inputs = document.getElementsByClassName(inputClassName);
  Array.from(inputs).forEach((selection) => {
    const name = selection.name;
    const selectedValue = selection.options[selection.selectedIndex].value;
    keyVal[name] = selectedValue;
  });
  console.log(keyVal);
  return keyVal;
}

/**
* function to get inputs key and vlaues by input type (nodeName)
*/
function getFormData(formId, nodeName) {
  const form = document.getElementById(formId);
  const inputs = form.elements;
  let keyVal = {};
  Array.from(inputs).forEach((input) => {
    if (input.nodeName === nodeName) {
      const key = input.name;
      const value = input.options[input.selectedIndex].value;
      keyVal[key] = value;
      console.log(input);
    }
  });
  console.log(keyVal);
  return keyVal;
}

/**
* function to append inputs to a form
*/
function appendForm(formId, params) {
  const form = document.getElementById(formId);
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }
  return form;
}


/**
* function to return template labels stored by localStorage
*/
function getStoredLabels(labelTypes=['flightInfo', 'arrivalAirportInfo', 'departureAirportInfo', 'airCarrierInfo', 'arrivalAirportConditionInfo']) {
  let labels = {};
  labelTypes.forEach(labelType => {
    if (localStorage.getItem(labelType) === null) {
      labels[labelType] = [];
    } else {
      labels[labelType] = localStorage.getItem(labelType);
    }
  });
  return labels;
}

/**
* function to store template labels in localStorage
*/
function storeLabels(labels) {
  Object.keys(labels).forEach((labelType) => {
    localStorage.setItem(labelType, labels[labelType]);
  });
}

/**
* function to check if any template labels are stored in the localStorage
*/
function areTemplateLabelsStored() {
  if (localStorage.getItem('flightInfo') !== null) {
    return true;
  } else if (localStorage.getItem('arrivalAirportInfo') !== null) {
    return true;
  } else if (localStorage.getItem('departureAirportInfo') !== null) {
    return true;
  } else if (localStorage.getItem('airCarrierInfo') !== null) {
    return true;
  } else if (localStorage.getItem('arrivalAirportConditionInfo') !== null) {
    return true;
  }
  return false;
}

/**
* function to get queryLabels
*/
function getQueryLabels(labels=[
  'callSign',
  'arrivalAirport',
  'departureAirport',
  'actualArrivalDay',
  'actualDepartureDay'
]) {
  let queryLabels = {};
  labels.forEach(label => {
    queryLabels[label] = localStorage.getItem(label);
  });
  return queryLabels;
}

/**
* function to set localStorage items
*/
function storeQueryLabels(queryLabels) {
  Object.keys(queryLabels).forEach(queryLabel => {
    localStorage.setItem(queryLabel, queryLabels[queryLabel]);
  });
}

export {
  getRdformsQueryData,
  getFormData,
  appendForm,
  storeLabels,
  getStoredLabels,
  areTemplateLabelsStored,
  post,
  getQueryLabels,
  storeQueryLabels,
};
