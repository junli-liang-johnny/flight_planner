import rdfGraph from '../../rdf/graph/rdf.test.js';

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
window.onload = () => {
  console.log('/report page opens');
  if (areTemplateLabelsStored()) {
    // const labels = localStorage.getItem("templateLabels");
    // Template.setLabels(labels);
    const labels = getStoredLabels();
    Template.setLabels(labels);
    console.log(`onload() Template.setLabels ${labels}`);
  }
}

/**
 * before the web closes set selected labels on localStorage
 */
window.onbeforeunload = () => {
  console.log('/report page closes');
  if (!areTemplateLabelsStored()) {
    // localStorage.setItem('templateLabels', Template.templateLabels);
    storeLabels(Template.templateLabels);
    console.log(`onbeforeunload() localStorage.setItem() ${Template.templateLabels}`);
  }
};

const rdformsContainerId = 'rdforms-card-container';
// clear
clearCards(rdformsContainerId);

// list of templates
const bundles = [
  ['./index/templates/aviation.template.test.json'],
  ['./index/templates/atm.template.test.json'],
  ['./index/templates/nas.template.test.json'],
  ['./index/templates/data.template.test.json']
];

// get template label types
const labelTypes = Object.keys(Template.templateLabels);

// create rdforms
const graph = new rdfjson.Graph(rdfGraph);
const itemStore = new rdforms.ItemStore();

// create elements
Object.keys(rdfGraph).forEach(labelType => {
  if (Object.keys(rdfGraph[labelType]).length != 0 ) {
    console.log(labelType);
    console.log(rdfGraph[labelType]);
    console.log(Object.keys(rdfGraph[labelType]));
    createCard(labelType, rdformsContainerId);
  }
});

// populate data
Object.keys(rdfGraph).forEach(labelType => {
  if (Object.keys(rdfGraph[labelType]).length != 0) {
    let bundleIndex;
    if (labelType == 'flightInfo') {
      bundleIndex = 1;
    } else if (labelType == 'arrivalAirportConditionInfo'){
      bundleIndex = 3;
    } else {
      bundleIndex = 2;
    }
    rdforms.bundleLoader(itemStore, bundles, (bundles) => {
      new rdforms.Presenter({
        graph,
        resource: labelType,
        template: bundles[bundleIndex].getRoot(),
        compact: true
      }, labelType);
    });
  }
})

/**
 * ui function to generate and clear html cards for rdforms
 */
function clearCards(containerId) {
  document.getElementById(containerId).innerHTML = '';
}

function createCard(labelType, containerId) {
  const cardContainer = document.getElementById(containerId);
  const cardDiv = document.createElement('div');
  cardDiv.setAttribute('class', 'row justify-content-md-center mt-4');
  const cardInnerHTML = `
  <div class="col-lg-8">
    <div class="card">
      <div class="card-header">
        <p class="h3 lead text-secondary">${labelType}</p>
      </div>
      <div class="card-body">
        <div class="main">
          <div id="${labelType}"></div>
        </div>
      </div>
    </div>
  </div>
  `;
  cardDiv.innerHTML = cardInnerHTML;
  cardContainer.appendChild(cardDiv);
}
