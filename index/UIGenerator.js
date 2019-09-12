const prefix = require('./prefix');
const ta = require('./templateAnalyse');
const sparql = require('./sparql');
const dbCommunicator = new sparql.dbCommunicator();
const fs = require('fs');
const n3 = require('n3');

class RDFGraphCreator {
  /**
   * {this.vars}:
   * {this.sparql}:        a sparql module object
   * {this.queryLabels}:   a key-val pair object used to make a sparql query
   * {this.templateLabels}:a list of labels will be shown on the template /report
   * {this.rdfGraph}:     a json object used to represent a rdf graph of a form
   *                       on the web page It defines what data shown on a form.
   * {this.masterNode}:    a master/root node of string in {this.rdfGraph}
   *                       wrapping a entire graph.
   * {this.ids}:           a list of item ids from a template that is used to represent
   *                       the data on a form by (e.g.) item.id.property and item.id.type
   * {this.properties}:    a list of properties associated with {this.ids}
   * {this.types}:         a list of types associated with {this.ids}
   * {this.headers}:       a list of headers about queried data
   * {this.bindings}:      a list of bindings about queried data
   * {this.templateJson}:  a json object of loaded template
   */
  constructor(queryLabels = undefined, templateLabels = undefined) {
    this.sparql = require('./sparql');
    this.queryLabels = queryLabels;
    this.templateLabels = templateLabels;
    // default settings can be modofied later
    this.templatePath = this.defaultTemplatePath();
    this.graphPath = this.defaultGraphPath();

    // to be defined
    this.properties = [];
    this.types = [];
    this.headers;
    this.bindings;
    this.templateJson;
    console.log('RDFGraphCreator() initialised');
  };

  /**
   * function to make a query to get data from Jena
   * and set {this.headers} and {this.bindings}
   * @param queryLabels {Dictionary}: a key-value pair object used to be templating
   * a SPARQL query.
   */
  initQuery(queryLabels) {
    // run a query for queryLabels
    const query = this.sparql.postQueryArray(queryLabels);
    this.sparql.queryPromise(this.sparql.flightInstUrl, query)
      .then(results => {
        this.headers = results[0];
        this.bindings = results[1][0]; // for single instance of queried data
        console.log(`RDFGraphCreator() - sparql.queryPromise().then(): this.headers and this.bindings set`);
      })
      .catch(err => console.error(`RDFGraphCreator() - constructor() - sparql.queryPromise(): ${err}`));
  };

  finaliseRdfJson() {
    return `export default ${JSON.stringify(this.rdfGraph)};`;
  };

  /**
   * function to set the {this.rdfGraph}
   * {this.rdfGraph} is a @RDForms library-required format and component used to generate a {graph}
   * a {graph} is a json object used to represent a form on the web page.
   * {values} and {types} are written on the graph object based on their {labelType} (flightInfo..etc)
   * Sample please refer /index/rdf/graph
   */
  setRdfGraph(types, properties, noDataMsg='No data') {
    console.log(`UIGenerator - RDFGraphCreator() - setRdfGraph() - this.headers: ${this.headers}`);
    console.log(`UIGenerator - RDFGraphCreator() - setRdfGraph() - this.bindings: ${this.bindings}`);
    console.log(`UIGenerator - RDFGraphCreator() - setRdfGraph() - types: ${types}`);
    console.log(`UIGenerator - RDFGraphCreator() - setRdfGraph() - properties: ${properties}`);
    for (const [index, header] of this.headers.entries()) {
      const property = properties[index];
      const type = types[index];
      const value = (this.bindings[header] !== undefined) ? this.bindings[header].value : noDataMsg;
      const labelType = ta.getLabelTypeByQueryHeader(header);
      console.log(`${labelType}, ${header}, ${property}, ${value}`);
      // set rdfGraph
      // console.log(JSON.stringify(this.rdfGraph));
      this.rdfGraph[labelType][property] = [{
        "value": value,
        "type": type
      }];
    }
  };

  /**
   * function to set {this.properties} and {this.types}
   * {this.properties} is a list of properties from {this.templateJson} required
   * to represent properties of a graph on a form.
   * {this.types} is a list of types about corresponding {this.properties}. It
   * can be {uri}, {literal} or {blankNode} according to the @RDForms API
   */
  setItemAttributes(attributes) {
    let types = [];
    let properties = [];
    if (this.templateLabels === undefined) {
      console.error(`RDFGraphCreator() - setItemAttributes(): please set templateLabels`);
      return;
    }
    console.log(`UIGenerator - RDFGraphCreator() - setItemAttributes(): this.templateLabels ${this.templateLabels}`);
    for (const labelType of Object.keys(this.templateLabels)) {
      for (const label of this.templateLabels[labelType]) {
        if (label !== '') {
          console.log(`labelType: ${labelType}, label: ${label}`);
          const [property, type] = this.getAttributesByItemId(label, attributes);
          properties.push(property);
          types.push(type);
        }
      }
    }
    return [types, properties];
  };

  /**
   * function to get a property and a corresponding type
   * It takes a item id from a {this.templateJson} which is loaded from a template
   * file.
   * @param id {String}: a item id. Please refer templates of template files
   * @return [property, type] {Array}: a list of property and a type associated
   * with the given item id.
   */
  getAttributesByItemId(id, attributes) {
    // console.log(`UIGenerator - RDFGraphCreator() - getAttributesByItemId(): this.templateJson ${this.templateJson}`);
    for (const ele of this.templateJson.templates) {
      if (ele.id === id) {
        if (attributes === undefined) {
          return [ele.property, ele.nodetype.toLowerCase()];
        }
      }
    }
  };

  /**
   * function to set {this.queryLabels} used to create a SPARQL query array
   * @param labels {Array}: a list of labels
   */
  setQueryLabels(labels) {
    if (labels.callSign === undefined) {
      this.queryLabels = undefined;
    } else {
      this.queryLabels = labels;
    }
    // console.log(`after set this.queryLabels: ${JSON.stringify(this.queryLabels)}`);
  };

  /**
   * function to read a template
   * it first gets the queired data from Jena by {this.queryLabels}, which is set while constructing an object
   * then reads template into Json format.
   * @param templatePath {String}: a path to the template. It is set by default.
   * @return callback {Function}: callback with {err} error message if any
   */
  async readTemplate(params, callback) {
    // check params
    if (params.queryLabels !== undefined) {
      this.queryLabels = params.queryLabels;
      console.log(`UIGenerator - RDFGraphCreator() - readTemplate() this.queryLabels set ${this.queryLabels}`);
    }
    if (params.templateLabels !== undefined) {
      this.templateLabels = params.templateLabels
      console.log(`UIGenerator - RDFGraphCreator() - readTemplate() this.templateLabels set ${this.templateLabels}`);
    } else {
      this.templateLabels = this.defaultTemplateLabels();
      console.log(`UIGenerator - RDFGraphCreator() - readTemplate() this.templateLabels set by default ${this.templateLabels}`);
    }
    if (this.templatePath === undefined) {
      this.templatePath = params.templatePath;
      console.log(`UIGenerator - RDFGraphCreator() - readTemplate() this.templatePath set ${this.templatePath}`);
    }
    // init a query and get the queried determining how the template looks like
    const query = await this.sparql.postQueryArray(this.queryLabels, this.templateLabels);
    await this.sparql.queryPromise(this.sparql.flightInstUrl, query)
      .then(results => {
        this.headers = results[0];
        this.bindings = (results[1].length) ? results[1][results.length-1] : results[1]; // for single instance of queried data
        this.bindings.stringify = JSON.stringify(this.bindings);
        console.log(`RDFGraphCreator() - readTemplate() - sparql.queryPromise().then(): this.headers and this.bindings set`);
      })
      .catch(err => console.error(`RDFGraphCreator() - constructor() - sparql.queryPromise(): ${err}`));

    // init this.rdfGraph
    this.rdfGraph = this.defaultRdfGraph(Object.keys(this.templateLabels));
    const taer = new ta.TemplateAnalyser();
    this.templateJson = await taer.combinedTemplates({
      root: "test",
      label: "a combined template",
      description: "This is a combined template"
    });
    const [types, properties] = this.setItemAttributes();
    console.log('rdfGraphCreator - setItemAttributes(): done');
    this.setRdfGraph(types, properties);
    console.log('rdfGraphCreator - setRdfGraph(): done');
    return callback();
  };

  writeRdfGraph(params, callback) {
    this.readTemplate(params, (err) => {
      if (err) {
        return callback(err);
      }
      fs.writeFile(this.graphPath, finaliseRdfJson(this.rdfGraph), {
        flag: "w+"
      }, (err) => callback(err));
    });
  };

  /**
   * return defaults
   */
  defaultRdfGraph(labelTypes) {
    let rdfGraph = {};
    for (const labelType of labelTypes) {
      rdfGraph[labelType] = {};
    }
    return rdfGraph;
  };
  defaultMasterNode() {
    return "http://example.org/about";
  };
  defaultTemplatePath() {
    return "/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/templates/aviation.template.test.json";
  };
  defaultGraphPath() {
    return "/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/rdf/graph/rdf.test.js";
  };
  defaultIds() {
    return [
      "atm:Flight",
      "atm:callSign",
      "atm:operatedBy",
      "nas:airCarrierName",
      "atm:arrivalAirport",
      "atm:actualArrivalDay",
      "atm:departureAirport",
      "atm:actualDepartureDay"
    ];
  };
  defaultTemplateLabels() {
    return {
      flightInfo: ['atm:Flight', 'atm:actualArrivalTime', 'atm:actualDepartureTime'],
      arrivalAirportInfo: ['atm:arrivalAirport'],
      departureAirportInfo: ['atm:departureAirport'],
      airCarrierInfo: [],
      arrivalAirportConditionInfo: [],
    };
  };
};

const defaultRdfJson = {
  "http://example.org/about": {}
};
const defaultMasterNode = "http://example.org/about";
const defaultTemplatePath = "/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/templates/aviation.template.test.json";
const defaultGraphPath = "/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/rdf/graph/rdf.test.js";
const defaultIds = [
  "atm:Flight",
  "atm:callSign",
  "atm:operatedBy",
  "nas:airCarrierName",
  "atm:arrivalAirport",
  "atm:actualArrivalDay",
  "atm:departureAirport",
  "atm:actualDepartureDay"
];

const finaliseRdfJson = (rdfJson) => {
  return `export default ${JSON.stringify(rdfJson)};`;
};

const writeRdfGraph = (path, rdfJson, callback) => {
  const fs = require('fs');
  fs.writeFile(path, rdfJson, {
    flag: "w+"
  }, (err) => callback(err));
};

const readTemplate = (templatePath, callback) => {
  const fs = require('fs');
  fs.readFile(templatePath, (err, data) => {
    if (err) {
      console.error(`RDFGraphCreator() - readTemplate(): ${err}`);
    }
    const templateJson = JSON.parse(data);
    callback(templateJson);
  });
};
const getProperty = (templateJson, id) => {
  const templates = templateJson.templates;
  for (const ele of templates) {
    if (ele.id === id) {
      // console.log('found');
      return ele.property;
    }
  }
};

const getType = (templatesJson, id) => {
  const templates = templatesJson.templates;
  for (const ele of templates) {
    if (ele.id == id) return ele.nodetype.toLowerCase();
  }
};

const getter = (templateJson, id) => {
  const templates = templateJson.templates;
  for (const ele of templates) {
    if (ele.id == id) return [ele.property, ele.nodetype.toLowerCase()];
  }
};

/**
 * a class of RDF data writer with given data in req.body and schema path
 */
class RDFDataWriter {
  constructor(data, writeFilePath, schemaPath) {
    this.data = data;
    this.writeFilePath = (writeFilePath === undefined) ? this.defaultWriteFilePath() : writeFilePath;
    this.schemaPath = (schemaPath === undefined) ? this.defaultSchemaPath() : schemaPath;
    this.schemaItems = this.defaultTemplateItems();
    this.schemaJson;
  }

  /**
   * function to read a schema by {schemaPath}
   * @param schemaPath {String}: a path to the schema JSON file
   * @return {function}: a callback function with a schema template in JSON format.
   * a schem template is deinition of an array of resources. Using them by dotting
   */
  readSchema(callback, schemaPath = this.schemaPath) {
    fs.readFile(schemaPath, (err, data) => {
      if (err) {
        return callback(err);
      }
      this.schemaJson = JSON.parse(data);
      const schemaTemplate = this.schemaJson.templates;
      // create a tar after reading schema template
      this.tar = new ta.TemplateAnalyser(schemaTemplate);
      callback(undefined, schemaTemplate);
    });
  }

  /**
   * function to wrtie a RDF data to the {path}
   * @param path {String}: a path write to
   * @param schemaItems {Array}: a list of schema items required
   * @param {Function}: a callback function with error message {err} and writing results {results}
   * @return err {String}: error message
   * @return results {String}: a RDf writing results
   * @return res {Object}: a response object from Jena
   * @return body {String}: a response body from Jena
   */
  writeTemplate(data, callback, path = this.dataPath, schemaItems = this.schemaItems) {
    if (this.data === undefined) this.data = data;
    this.readSchema((err, schemaTemplate) => {
      if (err) {
        return callback(err);
      }
      schemaTemplate.forEach((item) => {

      });
      // import required components from n3
      const {
        DataFactory
      } = n3;
      const {
        namedNode,
        literal,
        defaultGraph,
        quad
      } = DataFactory;
      // create a N3 Writer
      const writer = new n3.Writer({
        prefixes: {
          ex: prefix.ex,
          dcterms: prefix.dcterms,
          atm: prefix.atm,
          nas: prefix.nas
        }
      });
      // start writing RDF/ttl
      writer.addQuad(
        namedNode(`ex:${this.data['id']}`),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode(this.templateAnalyser.property('ex:blocker'))
      );
      for (const [index, key] of Object.entries(Object.keys(this.data))) {
        const schemaId = this.schemaItems[index];
        writer.addQuad(
          namedNode(`ex:${this.data['id']}`),
          namedNode(this.templateAnalyser.property(this.schemaItems[index])),
          // namedNode(schemaId),
          literal(this.data[key])
        );
      }
      // end RDF writing and start file writing
      writer.end((err, results) => {
        if (err) {
          return callback(err);
        }
        console.log(results);
        console.log(typeof results);
        // write a file in ttl format
        fs.writeFile(this.writeFilePath, results, (err) => {
          if (err) {
            return callback(err);
          }
          // upload the RDF data to Jena
          new sparql.dbCommunicator().uploadRdfData(this.writeFilePath, 'blockerReport', (err, res, body) => {
            if (err) {
              return callback(err);
            }
            return callback(undefined, results, res, body);
          });
        });
      });
    });
  }

  /**
   * function to write a turtle file
   */

  /**
   * function to return an array of default schema items
   * schema items are used to write RDF data to a file that is able to upload to
   * the database. They should be in order mapping the order of a blocker report
   * schema items please refer to {@link}: https://rdforms.org/#!templateReference.md
   * template file of schema item is {@template} /index/templates/blocker.template.test.js
   */
  defaultTemplateItems() {
    return [
      "dcterms:title",
      "atm:callSign",
      "atm:actualArrivalDay",
      "atm:actualArrivalTime",
      "atm:actualDepartureDay",
      "atm:actualDepartureTime",
      "nas:iataAirportCode",
      "nas:airportName",
      "dcterms:description",
      "dcterms:identifier",
      "dcterms:created"
    ];
  }

  defaultSchemaPath() {
    return '/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/templates/blocker.template.test.json';
  }

  defaultWriteFilePath() {
    return '/Users/junli/workspace/masters/practicum/2019-mcm-master/src/rdforms/index/rdf/blocker_reports/blocker_report.test.ttl';
  }
};

module.exports = {
  RDFGraphCreator: RDFGraphCreator,
  RDFDataWriter: RDFDataWriter,
  readTemplate: readTemplate,
  getProperty: getProperty,
  getType: getType,
  getter: getter,
  finaliseRdfJson: finaliseRdfJson,
  writeRdfGraph: writeRdfGraph,
}
