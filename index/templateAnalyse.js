/**
 * js file provides helper functions for operating a template
 */

const fs = require('fs');

/**
 * required labels (item ids in a template)
 */
const requiredFlightLabels = [
  'atm:Flight', 'atm:actualArrivalDay', 'atm:actualArrivalTime', 'atm:actualDepartureDay',
  'atm:actualDepartureTime', 'atm:callSign', 'atm:operatedBy', 'atm:arrivalAirport',
  'atm:departureAirport'
];
const requiredAirCarrierLabels = [
  'nas:airCarrierName', 'nas:airlineCallsign', 'nas:iataCarrierCode',
  'nas:icaoCarrierCode', 'nas:countryOfRegistry'
];
const requiredArrivalAirportLabels = [
  // 'nas:CONUSairport', 'nas:NonCONUSairport', 'nas:InternationalAirport',
  'nas:airportName', 'nas:airportLocation', 'nas:hoursOffsetFromUTC',
  'nas:iataAirportCode', 'nas:icaoAirportCode', 'nas:faaAirportCode'
];
const requiredDepartureAirportLabels = [
  // 'nas:CONUSairport', 'nas:NonCONUSairport', 'nas:InternationalAirport',
  'nas:airportName', 'nas:airportLocation', 'nas:hoursOffsetFromUTC',
  'nas:iataAirportCode', 'nas:icaoAirportCode', 'nas:faaAirportCode'
];
const requiredArrivalAirportConditionLabels = [
  'data:scheduledArrivals', 'data:scheduledDepartures', 'data:highWindWITIhourly',
  'data:lowCeilingWITIhourly', 'data:lowVisibilityWITIhourly', 'data:totalAirborneDelay'
];
const requiredTemplateLabels = {
  flightInfo: requiredFlightLabels,
  arrivalAirportInfo: requiredArrivalAirportLabels,
  departureAirportInfo: requiredDepartureAirportLabels,
  airCarrierInfo: requiredAirCarrierLabels,
  arrivalAirportConditionInfo: requiredArrivalAirportConditionLabels
};
const requiredQueryHeaders = {
  flightInfo: requiredFlightLabels.map(label => label.split(':')[1]),
  arrivalAirportInfo: requiredArrivalAirportLabels.map(label => { return 'nas:arrival'+label.split(':')[1][0].toUpperCase()+label.split(':')[1].slice(1)}),
  departureAirportInfo: requiredDepartureAirportLabels.map(label => { return 'nas:departure'+label.split(':')[1][0].toUpperCase()+label.split(':')[1].slice(1)}),
  airCarrierInfo: requiredAirCarrierLabels.map(label => label.split(':')[1]),
  arrivalAirportConditionInfo: requiredArrivalAirportConditionLabels.map(label => `data:arrivalAirportCondition${label.split(':')[1][0].toUpperCase()}${label.split(':')[1].slice(1)}`)
}

const getLabelTypeByQueryHeader = (header) => {
  console.log(`getLabelTypeByQueryHeader(): ${header}`);
  for (const labelType of Object.keys(requiredQueryHeaders)) {
    for (const labels of requiredQueryHeaders[labelType]) {
      if (labels.includes(header)) {
        return labelType;
      }
    }
  }
};

/**
 * consts for headers displaying on a rdforms
 */
const getTypeByTemplateLabel = (label) => {
  const convertedLabel = getItemIdWithoutPrefixByQueryHeader(label);
  for (const labelType of Object.keys(requiredTemplateLabels)) {
    for (const labels of requiredTemplateLabels[labelType]) {
      if (JSON.stringify(labels).includes(convertedLabel)) {
        return labelType;
      }
    }
  }
}

/**
* function to get the item id without the prefix
*/
const getItemIdWithoutPrefixByQueryHeader = (queryHeader) => {
  if (queryHeader.includes('arrival') && queryHeader != 'arrivalAirport') {
    const splitQueryHeader = queryHeader.split('arrival')[1];
    return `${splitQueryHeader[0].toLowerCase()}${splitQueryHeader.slice(1)}`;
  } else if (queryHeader.includes('departure') && queryHeader != 'departureAirport') {
    const splitQueryHeader = queryHeader.split('departure')[1];
    return `${splitQueryHeader[0].toLowerCase()}${splitQueryHeader.slice(1)}`;
  } else {
    return queryHeader;
  }
}

/**
* function to convert a query header into original template item id/label
*/
const getItemIdByQueryHeader = (header) => {
  for (const labelType of Object.keys(requiredTemplateLabels)) {
    for (const itemId of requiredTemplateLabels[labelType]) {
      if (header.startsWith('arrival') || header.startsWith('departure')) {
        // const
      } else {

      }
    }
  }
}

/**
 * object wrapping functions like getProperty() and getType()
 * @param template {String} a template in Json format
 */
function TemplateAnalyser(template) {
  this.template = template;
  this.property = (id) => {
    return getPropertyById(this.template, id);
  };
  this.type = (id) => {
    return getTypeById(this.template, id);
  };
  this.properties = (ids) => {
    return getPropertiesById(this.template, ids);
  };
  this.types = (ids) => {
    return getTypesById(this.template, ids);
  };
  /**
   * function to return a list of ids of items with a given {labelType}
   * @param Type {String}: data content type can be {flightInfo},
   * {routeInfo}, {airportInfo}, {airCarrierInfo} or undefined.
   * @return ids {Array}: a list of item ids
   */
  this.getItemIds = async (labelType) => {
    // if this.template hasn't set then set one
    if (this.template === undefined) {
      let path;
      if (labelType == 'flightInfo') {
        console.log('this.template set ' + labelType);
        path = this.atmTemplatePath;
        this.requiredLabels = requiredFlightLabels;
      } else if (labelType == 'airCarrierInfo') {
        console.log('this.template set ' + labelType);
        path = this.nasTemplatePath;
        this.requiredLabels = requiredAirCarrierLabels;
      } else if (labelType == 'arrivalAirportInfo') {
        console.log('this.template set ' + labelType);
        path = this.nasTemplatePath;
        this.requiredLabels = requiredArrivalAirportLabels;
      } else if (labelType == 'departureAirportInfo') {
        console.log('this.template set ' + labelType);
        path = this.nasTemplatePath;
        this.requiredLabels = requiredDepartureAirportLabels;
      } else if (labelType == 'arrivalAirportConditionInfo') {
        console.log('this.template set ' + labelType);
        path = this.dataTemplatePath;
        this.requiredLabels = requiredArrivalAirportConditionLabels;
      }

      this.template = await this.readTemplate(path);
      console.log(this.template.templates.length)
      console.log(this.requiredLabels);
    }
    let ids = [];
    if (labelType === undefined) {
      for (const item of this.template.templates) {
        ids.push(item.id);
      }
    } else {
      for (const item of this.template.templates) {
        if (this.requiredLabels.includes(item.id))
          ids.push(item.id);
      }
    }
    this.template = undefined;
    return ids;
  }

  /**
   * function to read a template file in json format
   */
  this.readTemplate = (path) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        }
        const templateJson = JSON.parse(data);
        resolve(templateJson);
      });
    });
  }

  /**
   * function to convert combined templates into one. check the templates/dcat.json
   * @params params {Dictionary}: params.id, params.label, params.templates, params.prefix
   */
  this.convertCombinedTemplate = (params, callback) => {
    const convertedTemplate = {
      templates: [{
        type: "group",
        id: params.id,
        label: {
          "en": params.label
        },
        items: []
      }]
    };
    for (const item of params.templates.templates) {
      const subItem = {
        "id": `${params.prefix}:${item.id}`
      }
      convertedTemplate.templates[0].items.push(subItem);
    }
    fs.writeFile(params.path, JSON.stringify(convertedTemplate), (err) => {
      if (err) {
        return callback(err);
      }
      callback();
    });
  }

  /**
   * function to write a file for a combined template
   */
  this.writeTemplate = (path, template, callback) => {
    fs.writeFile(path, template, err => {
      if (err) {
        return callback(err);
      }
      callback();
    });
  }

  /**
   * function to combine multiple templates into one template
   * @param templatePaths {Array}: a list of paths to templates
   * @param root {String}: a string of root of node containing items to use
   * @param description {String}: a description of the cmobined template
   * @param label {String}: a label for the combined template
   * @return template {JSON}: a combined template object as a JSON
   */
  this.combinedTemplates = (params) => {
    return new Promise(async (resolve, reject) => {
      const templatePaths = (params.templatePaths === undefined) ? [this.atmTemplatePath, this.nasTemplatePath, this.dataTemplatePath] : params.templatePaths;
      const templateJson = this.initedTemplateJson(params.root, params.label, params.description);
      const templates = await this.getTemplates(templatePaths);
      for (const template of templates) {
        for (const item of template.templates) {
          templateJson.templates.push(item);
        }
      }
      resolve(this.getFinalisedTemplateJson(templateJson, params.root, params.label));
    })
  }

  /**
   * function to init a template
   */
  this.initedTemplateJson = (root, label, description) => {
    return {
      "root": root,
      "label": {
        "en": label
      },
      "description": {
        "en": description
      },
      templates: []
    };
  }

  /**
   * function to finalise a template
   */
  this.getFinalisedTemplateJson = (template, root, label) => {
    let items = [];
    for (const item of template.templates) {
      items.push(item.id);
    }
    const lastItem = {
      "id": root,
      "type": "group",
      "label": {
        "en": label
      },
      "nodetype": "RESOURCE",
      "items": items
    };
    template.templates.push(lastItem);
    return template;
  }

  /**
   * function to read a list of templates
   */
  this.getTemplates = (templatePaths) => {
    return new Promise(async (resolve, reject) => {
      let templates = [];
      for (const templatePath of templatePaths) {
        const template = await this.getTemplate(templatePath);
        templates.push(template);
      }
      resolve(templates);
    });
  }
  this.getTemplate = (templatePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(templatePath, (err, data) => {
        if (err) {
          reject(err);
        }
        // console.log(JSON.parse(data));
        resolve(JSON.parse(data));
      });
    });
  }

  /**
   * default paths to the template files
   */
  this.atmTemplatePath = '/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/templates/atm.template.test.json';
  this.nasTemplatePath = '/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/templates/nas.template.test.json';
  this.dataTemplatePath = '/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/templates/data.template.test.json';

};

/**
 * function to get a property of a item from a template
 * sample templates are in directory /index/templates/
 * @param template {String-Json}
 * @param id {String}: an id in string
 * @return {String} property
 */
const getPropertyById = (template, id) => {
  // if template.templates already pass a @param template
  if (template.templates === undefined) {
    for (const item of template) {
      if (item.id == id) {
        const property = item.property;
        return property
      }
    }
  } else {
    for (const item of template.templates) {
      if (item.id == id) {
        const property = item.property;
        return property
      }
    }
  }
};

/**
 * function to get properties of a item from a template
 * sample templates are in directory /index/templates/
 * @param template {String-Json}
 * @param id {String}: an id in string
 * @return {String} properties
 */
const getPropertiesById = (template, ids) => {
  let properties = [];
  if (template.templates === undefined) {
    for (const item of template) {
      for (const id of ids) {
        if (item.id == id) {
          const property = item.property;
          properties.push(property);
        }
      }
    }
  } else {
    for (const item of template.templates) {
      for (const id of ids) {
        if (item.id == id) {
          const property = item.property;
          properties.push(property);
        }
      }
    }
  }
  return properties;
};

/**
 * function to get a type of a item from a template
 * sample templates are in directory /index/templates/
 * @param template {String-Json}
 * @param id {String}: an id in string
 * @return {String} type
 */
const getTypeById = (template, id) => {
  // if template.templates already pass a @param template
  if (template.templates === undefined) {
    for (const item of template) {
      if (item.id == id) {
        const type = item.nodetype.toLowerCase();
        return type;
      }
    }
  } else {
    for (const item of template.templates) {
      if (item.id == id) {
        const type = item.nodetype.toLowerCase();
        return type;
      }
    }
  }
};

/**
 * function to get types of a item from a template
 * sample templates are in directory /index/templates/
 * @param template {String-Json}
 * @param id {String}: an id in string
 * @return {String} types
 */
const getTypesById = (template, ids) => {
  let types = [];
  if (template.templates === undefined) {
    for (const item of template) {
      for (const id of ids) {
        if (item.id == id) {
          const type = item.nodetype.toLowerCase();
          types.push(type);
        }
      }
    }
  } else {
    for (const item of template.templates) {
      for (const id of ids) {
        if (item.id == id) {
          const type = item.nodetype.toLowerCase();
          types.push(type);
        }
      }
    }
  }
  return types;
};

module.exports = {
  TemplateAnalyser: TemplateAnalyser,
  getItemIdWithoutPrefixByQueryHeader: getItemIdWithoutPrefixByQueryHeader,
  getTypeByTemplateLabel: getTypeByTemplateLabel,
  getLabelTypeByQueryHeader: getLabelTypeByQueryHeader
};
