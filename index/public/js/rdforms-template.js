/**
 * global controller for configuriing rdforms
 */
'use strict';
function Template() {}

// default selected labels
Template.templateLabels = {
  flightInfo: ['atm:Flight', 'atm:actualArrivalTime', 'atm:actualDepartureTime', 'atm:arrivalAirport', 'atm:departureAirport'],
  arrivalAirportInfo: [],
  departureAirportInfo: [],
  airCarrierInfo: [],
  arrivalAirportConditionInfo: []
}

Template.includesLabel = (labelType, label) => {
  // console.log(`labelType: ${labelType}, label: ${label}`);
  // console.log(Template.templateLabels);
  return Template.templateLabels[labelType].includes(label);
};

Template.push = (labelType, label) => {
  // console.log(`labelType: ${labelType}`);
  // console.log(Template.templateLabels);
  Template.templateLabels[labelType].push(label);
};

Template.remove = (labelType, label) => {
  console.log(`labelType: ${labelType}, label: ${label}`);
  // console.log(Template.templateLabels);
  Template.templateLabels[labelType] = Template.templateLabels[labelType].filter((ele) => {
    return ele != label;
  });
};

Template.setLabels = (labels) => {
  // Template.templateLabels[labelType] = labels.split(',');
  console.log(labels);
  for (const labelType of Object.keys(labels)) {
    Template.templateLabels[labelType] = labels[labelType].split(',');
  }
}

export {
  Template
};
