import {
  Template
} from './rdforms-template.js';

import {
  post,
  getStoredLabels,
  storeLabels,
  areTemplateLabelsStored,
  getQueryLabels
} from './common.js';

/**
 * after the page opens recover selected labels from localStorage
 */
// window.onload = () => {
//   console.log('/report page opens');
//   if (areTemplateLabelsStored()) {
//     // const labels = localStorage.getItem("templateLabels");
//     // Template.setLabels(labels);
//     const labels = getStoredLabels();
//     Template.setLabels(labels);
//     console.log(`onload() Template.setLabels ${labels}`);
//   }
// }

/**
 * before the web closes set selected labels on localStorage
 */
// window.onbeforeunload = () => {
//   console.log('/report page closes');
//   if (!areTemplateLabelsStored()) {
//     // localStorage.setItem('templateLabels', Template.templateLabels);
//     storeLabels(Template.templateLabels);
//     console.log(`onbeforeunload() localStorage.setItem() ${Template.templateLabels}`);
//   }
// };

/**
 * event listener on when the {Configuration} button clicked
 */
document.getElementById('rdforms-config-btn').addEventListener('click', async (e) => {
  console.log('click');
  // clear
  clearRdformsModalBody();
  // show the panel
  showConfigurationPanel();
  // get labels and update UI
  getLabels();
});

// =============================== HELPER FUNCTIONS ============================
function showConfigurationPanel(labels) {
  // toggel the modal
  $('#rdforms-configuration-modal').modal({
    show: true,
    // keyboard: true
  })
}

function clearRdformsModalBody() {
  document.getElementById('rdforms-modal-body').innerHTML = '';
}

/**
* function to make an AJAX request to get the template labels
*/
function getLabels(labels, callback) {
  const xhr = new XMLHttpRequest();
  const url = "http://localhost:3000/labels";
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    // console.log(this.status);
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status == 200) {
        // update modal ui, adding buttons
        const labelJson = JSON.parse(this.responseText);
        console.log(labelJson);
        const optionButtons = updateRdformsModal(labelJson);
        // add event listeners for added buttons
        btnEventListener(optionButtons);
        // event listener for save button
        eventListenerForSaveButton();

      } else {
        console.log('Server error');
      }
    }
  }
  xhr.send();
}

/**
 * function to add buttons on the modal
 * @param labels {JSON}: a json object containing {flightInfo}, etc
 * @return optionButtons {Array}: a list of buttons added
 */
function updateRdformsModal(labels) {
  const rdformsModalBody = document.getElementById('rdforms-modal-body');
  Object.keys(labels).forEach((labelType, index) => {
    const row = getRow(index, labelType, labels[labelType]);
    rdformsModalBody.appendChild(row);
  });
  // return added buttons
  const optionButtons = document.getElementsByClassName('rdforms-option-btn');
  return optionButtons;
}

function getRow(rnum, labelType, labels) {
  // create a row element
  const rowDiv = document.createElement('div');
  rowDiv.setAttribute('class', 'row');
  // create a col element with option button
  const p = document.createElement('p');
  const pHTML = `<a class="head text-secondary btn btn-secondary" data-toggle="collapse" data-target="#${labelType}-collapse" aria-expanded="false" aria-controls="${labelType}-collapse">${labelType}<i class="material-icons">arrow_right</i></a>`;
  p.innerHTML = pHTML;
  // create a col of list of options
  const col = getColDiv(labelType, labels);
  // append cols to row
  rowDiv.appendChild(p)
  rowDiv.appendChild(col);

  return rowDiv;
}

function getColDiv(labelType, labels) {
  console.log(labelType);
  const colDiv = document.createElement('div');
  colDiv.setAttribute('class', 'col-12');
  let colHTML = `<div class="collapse" id="${labelType}-collapse">
  <div class="btn-group btn-group-lg flex-wrap border border-light" role="group">`;
  // assign labels for buttons
  labels.forEach((label) => {
    if (Template.includesLabel(labelType, label)) {
      colHTML += `<button type="button" class="btn btn-raised btn-primary rdforms-option-btn" value="${label}" data-label-type="${labelType}">${label}</button>`
    } else {
      colHTML += `<button type="button" class="btn btn-raised btn-secondary rdforms-option-btn" value="${label}" data-label-type="${labelType}">${label}</button>`
    }
  });
  colHTML += '</div></div>';
  colDiv.innerHTML = colHTML;

  return colDiv;
}

/**
 * function event listener for a list of buttons
 * templateLabels as a buttons. When they are clicked Template.templateLabels will be updated
 * append or remove
 */
function btnEventListener(btns) {
  Array.from(btns).forEach(btn => {
    btn.addEventListener('click', e => {
      const labelType = btn.dataset.labelType;
      console.log('click! ' + labelType);
      if (btn.classList.contains('btn-secondary')) {
        btn.classList.replace('btn-secondary', 'btn-primary');
        Template.push(labelType, btn.value);
      } else {
        btn.classList.replace('btn-primary', 'btn-secondary');
        Template.remove(labelType, btn.value);
      }
    });
  });
}

/**
 * event handler for save changes button
 * submit a form to update the rdforms
 */
function eventListenerForSaveButton() {
  const saveBtn = document.getElementById('rdforms-modal-save-btn');
  saveBtn.addEventListener('click', (e) => {
    const url = 'http://localhost:3000/report';
    const queryLabels = getQueryLabels();
    const formData = {
      requestCode: 0,
      queryLabels: JSON.stringify(queryLabels),
      templateLabels: JSON.stringify(Template.templateLabels)
    };
    post(url, formData, 'POST');
    // save templateLabels changes
    storeLabels(Template.templateLabels);
    console.log(`localStorage.setItem() ${Template.templateLabels}`);
  });
}
