const N3 = require('n3');
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
// const myQuad = quad(
//   namedNode('https://ruben.verborgh.org/profile/#me'),
//   namedNode('http://xmlns.com/foaf/0.1/givenName'),
//   literal('Ruben', 'en'),
//   defaultGraph(),
// );
// console.log(myQuad.subject.value);         // https://ruben.verborgh.org/profile/#me
// console.log(myQuad.object.value);          // Ruben
// console.log(myQuad.object.datatype.value); // http://www.w3.org/1999/02/22-rdf-syntax-ns#langString
// console.log(myQuad.object.language);       // en
//
const writer = new N3.Writer({ prefixes: { c: 'http://example.org/cartoons#' } });
writer.addQuad(
  namedNode('http://example.org/cartoons#Tom'),
  namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
  namedNode('http://example.org/cartoons#Cat')
);
writer.addQuad(quad(
  namedNode('http://example.org/cartoons#Tom'),
  namedNode('http://example.org/cartoons#name'),
  literal('Tom')
));
writer.addQuad(quad(
  namedNode('http://example.org/cartoons#Tom'),
  namedNode('http://example.org/cartoons#age'),
  literal(5)
));
writer.end((error, result) => console.log(result));

const writer2 = new N3.Writer({ prefixes: { atm: 'https://data.nasa.gov/ontologies/atmonto/ATM#' } });
writer2.addQuad(
  namedNode('https://data.nasa.gov/ontologies/atmonto/ATM#AAL100-201407150030'),
  namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
  namedNode('https://data.nasa.gov/ontologies/atmonto/ATM#Flight')
);
writer2.addQuad(quad(
  namedNode('https://data.nasa.gov/ontologies/atmonto/ATM#AAL100-201407150030'),
  namedNode('https://data.nasa.gov/ontologies/atmonto/ATM#callSign'),
  namedNode('AAL100')
));
writer2.end((error, result) => console.log(result));
