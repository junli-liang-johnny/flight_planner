const graph = new rdfjson.Graph({
  "results": {
    "bindings": [
      {
        "subject": { "type": "uri" , "value": "https://data.nasa.gov/ontologies/atmonto/NAS#11IIoperationalRunway" } ,
        "predicate": { "type": "uri" , "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" } ,
        "object": { "type": "uri" , "value": "http://www.w3.org/2000/01/rdf-schema#Class" }
      }
    ]
  } 
});

const itemStore = new rdforms.ItemStore();
itemStore.createItem({
  'type': 'choice',
  'nodetype': 'URI',
  'id': 'ex:color',
  'property': 'http://example.com/terms/colorOfHouse',
  'label': {'en': 'Color of house', 'sv': 'FÃ¤rg pÃ¥ huset'},
  'choices': [
    {'value': 'http://example.com/color/blue', 'label': {'en': 'Blue'}},
    {'value': 'http://example.com/color/red', 'label': {'en': 'Red'}}
  ],
  'cardinality': {'min': 1, 'pref': 1, 'max': 1}
});

new rdforms.Editor({
  graph: graph,
  resource: 'http://example.org/about',
  template: itemStore.createTemplateFromChildren(['ex:color']),
}, 'node');
