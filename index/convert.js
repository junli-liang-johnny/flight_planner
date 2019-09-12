/*
 * this script is so stupid because the inherted library
 * does not provide any converting tools for converting
 * external RDF schema into RDF/JSON format and they have to
 * use that schema for data population.
 */
const fs = require('fs');
const n3 = require('n3');
const prefix = require('./prefix');
const yargs = require('yargs').argv;

function convert(namespace, path) {
  const jsonFile = JSON.parse(fs.readFileSync(path));
  const context = jsonFile['@context'];
  const graph = jsonFile['@graph'];

  graph.forEach(e => {
    console.log(e['@id']);
  })

}
const path = __dirname + '/templates/atm.template.json'
const path2 = '/Users/junli/workspace/masters/practicum/2019-mcm-master/data/ttl/ATM.ttl';
// const path = __dirname+'/templates/atm.template.json'
const namespace = 'atm';
const templatePath = `${__dirname}/templates/`;

function Predicates() {
  this.requiredPredicates = [
    'http://www.w3.org/2000/01/rdf-schema#comment',
    'http://www.w3.org/2000/01/rdf-schema#label',
    'http://www.w3.org/2000/01/rdf-schema#range'
  ];
  this.schemaRanges = [
    'http://www.w3.org/2001/XMLSchema#dateTime',
    'http://www.w3.org/2001/XMLSchema#string',
    'http://www.w3.org/2001/XMLSchema#integer',
    'http://www.w3.org/2001/XMLSchema#float'
  ];
  this.keyLabels = [
    "description",
    "label",
    "nodetype",
  ];
  this.isRequiredSchemaRange = function(object) {
    return this.schemaRanges.includes(object);
  };
  this.isRequiredPredicate = function(predicate) {
    return this.requiredPredicates.includes(predicate);
  };
  this.getKeyVal = function(quad) {
    const predicate = quad.predicate.id;
    const object = quad.object.id
    const index = this.requiredPredicates.indexOf(predicate);
    // console.log(`${quad.subject.id}    ->  ${quad.predicate.id}  ->   ${quad.object.id}`);
    if (index == 2) {
      if (this.isRequiredSchemaRange(object)) {
        return [this.keyLabels[index], 'LITERAL'];
      } else {
        return [this.keyLabels[index], 'URI'];
      }
    } else {
      return [this.keyLabels[index], {
        "en": object.split('"')[1]
      }];
    }
  };
}

function Converter() {
  const {
    DataFactory
  } = n3;
  const {
    namedNode,
    literal,
    defaultGraph,
    quad
  } = DataFactory;

  this.DataFactory = DataFactory;
  this.namedNode = namedNode;
  this.literal = literal;
  this.defaultGraph = defaultGraph;
  this.quad = quad;
};

function readTemplate(path) {
  return new Promise(async (resolve, reject) => {
    await fs.readFile(path, (err, data) => {
      if (err) {
        console.log(err);
        reject(undefined);
      } else {
        const atm = data.toString('utf-8');
        // console.log(atm);
        resolve(atm);
      }
    });
  });
}

async function getQuads(path) {
  let quads = [];
  let returnedPrefixes;
  const atm = await readTemplate(path);
  const parser = new n3.Parser();

  return new Promise(async (resolve, reject) => {
    if (atm === undefined) {
      reject(undefined);
    }
    await parser.parse(atm, (err, quad, prefixes) => {
      if (err) {
        console.error(err);
        reject(undefined);
      }
      if (quad) {
        quads.push(quad);
      } else {
        returnedPrefixes = prefixes;
        // console.log(prefixes);
      }
      const json = {
        quads: quads,
        prefixes: returnedPrefixes
      };
      resolve(json);
    });
  });
}

function getId(idUrl) {
  const subId = idUrl.split('#')[1];
  const pfx = getPrefix(idUrl);
  return `${pfx}:${subId}`;
}

function getPrefix(idUrl) {
  for (const [key, val] of Object.entries(prefix.prefixes)) {
    if (idUrl.includes(val)) {
      return key;
    }
  }
}

function getInitTemplate(root, label, description) {
  return {
    "root": root,
    "label": {
      "en": label
    },
    "description": {
      "en": description
    },
    "templates": []
  }
}

function getFinalisedTemplate(root, label, template) {
  let items = [];
  // add all item ids
  for (const item of template.templates) {
    // console.log(item.id);
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
  }
  template.templates.push(lastItem);
  return template;
}

function appendNodetype(currentQuad, nextQuad, template) {
  // console.log(template.templates);
  if (currentQuad != nextQuad) {
    for (const [index, item] of template.templates.entries()) {
      // console.log('different quad');
      if (item.nodetype === undefined) {
        console.log('append nodetype');
        template.templates[index].nodetype = 'URI';
      }
    }
  }
  return template;
}

function convert(root, label, description, quads) {
  const predicates = new Predicates();
  let template = getInitTemplate(root, label, description);
  let lastId;
  return new Promise((resolve, reject) => {
    let currentQuad;
    for (const quad of quads) {
      const subject = quad.subject.id;
      const id = getId(subject);
      const predicate = quad.predicate.id;
      const object = quad.object.id;
      // continue if the unrequired one got
      if (!predicates.isRequiredPredicate(predicate)) {
        continue;
      } else {
        // console.log(predicate);

      }

      if (template.templates.length == 0) {
        console.log('push');
        const newItem = {
          id: id,
          property: subject,
          type: "text"
        };
        template.templates.push(newItem);
      } else {
        for (const [index, item] of Object.entries(template.templates)) {
          // update
          if (item.id == id) {
            const [key, val] = predicates.getKeyVal(quad);
            // console.log(template.templates[index]);
            // console.log(object, quad.object.id);
            template.templates[index][key] = val;
            break
          } else if (index == template.templates.length - 1) {
            // append if reach the end of the array
            const [key, val] = predicates.getKeyVal(quad);
            const newItem = {
              id: id,
              property: subject,
              type: "text"
            };
            newItem[key] = val;
            template.templates.push(newItem);
          }
        }
      }
      // append nodetype if end of subject
      template = appendNodetype(currentQuad, quad, template);
      currentQuad = quad;
    }
    resolve(getFinalisedTemplate(root, label, template));
  });
}

function writeTemplate(filename, template) {
  fs.writeFile(filename, template, (err) => {
    // fs.writeFile(`${templatePath}/${filename}`, template, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('File written');
    }
  });
}

Converter.prototype.readTemplate = readTemplate;
Converter.prototype.getQuads = getQuads;
Converter.prototype.convert = convert;
Converter.prototype.writeTemplate = writeTemplate;

(async () => {
  console.log(yargs.input, yargs.output, yargs.label, yargs.description);
  const converter = new Converter();
  const json = await converter.getQuads(yargs.input);
  const quads = json.quads;
  // console.log(quads);
  const template = await converter.convert(yargs.root, yargs.label, yargs.description, quads);
  converter.writeTemplate(yargs.output, JSON.stringify(template));
  // console.log(json.quads[0]);
  // console.log('done');
  // quads.forEach((quad) => {
    // if (quad.predicate.id == 'http://www.w3.org/2000/01/rdf-schema#comment')
    // console.log(`${quad.subject.id}    ->  ${quad.predicate.id}  ->   ${quad.object.id}`);
  // });
})();

// require('yargs')
//   .scriptName("template-converter")
//   .usage('$0 <cmd> [args]')
//   .command('[input] [output] [root] [label] [description]', (yargs) => {
//     yargs.positional('input', {
//       type: 'string',
//       describe: 'the input path of the oringal template file'
//     });
//
//     yargs.positional('output' , {
//       type: 'string',
//       describe: 'the output path of the template'
//     });
//
//     yargs.positional('root', {
//       type: 'string',
//       default: 'test',
//       describe: 'the root container of the template items used'
//     });
//
//     yargs.positional('label', {
//       type: 'string',
//       default: 'a template',
//       describe: 'this is the template in rdf/json format'
//     });
//
//     yargs.positional('description', {
//       type: 'string',
//       default: 'a description of the template',
//       describe: 'this is the description of the template that is in rdf/json format'
//     });
//   }, async (argv) => {
//     const converter = new Converter();
//     const json = await converter.getQuads(argv.input);
//     const quads = json.quads;
//     const template = await converter.convert(argv.label, argv.description, quads);
//     converter.writeTemplate(argv.output, JSON.stringify(template));
//   })
//   .help()
//   .argv
