export default {
  'http://example.org/about': {
    // 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [{
    //   'value': 'http://xmlns.com/foaf/0.1/Document',
    //   'type': 'uri'
    // }],
    'http://purl.org/dc/terms/title': [{
      'value': "Anna's Homepage",
      'type': 'literal',
      'lang': 'en'
    }],
    'http://purl.org/dc/terms/subject': [{
      'value': 'http://example.com/chemistry',
      'type': 'uri'
    }],
    'http://purl.org/dc/terms/creator': [{
      'value': '_:person',
      'type': 'bnode'
    }],
  },
  '_:person': {
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [{
      'value': 'http://xmlns.com/foaf/0.1/Person',
      'type': 'uri'
    }],
    'http://xmlns.com/foaf/0.1/firstName': [{
      'value': 'Anna',
      'type': 'literal'
    }],
    'http://xmlns.com/foaf/0.1/surname': [{
      'value': 'Wilder',
      'type': 'literal'
    }]
  },
  'http://example.org/about2': {
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [{
      'value': 'http://xmlns.com/foaf/0.1/Document',
      'type': 'uri'
    }]
  }
};

export const sampleRdf = {
  'http://example.org/about': {
    'http://purl.org/dc/terms/title': [{
      'value': "Anna's Homepage",
      'type': 'literal',
      'lang': 'en'
    }],
    'http://purl.org/dc/terms/subject': [{
      'value': 'http://example.com/chemistry',
      'type': 'uri'
    }],
    'http://purl.org/dc/terms/creator': [{
      'value': '_:person',
      'type': 'bnode'
    }],
  },
  '_:person': {
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [{
      'value': 'http://xmlns.com/foaf/0.1/Person',
      'type': 'uri'
    }],
    'http://xmlns.com/foaf/0.1/firstName': [{
      'value': 'Anna',
      'type': 'literal'
    }],
    'http://xmlns.com/foaf/0.1/surname': [{
      'value': 'Wilder',
      'type': 'literal'
    }]
  }
};
export const dctermsRdf = {
  'http://example.org/about': {
    "dcterms:title": [{
      "value": "Anna's Homepage",
      "type": "literal",
      "lang": "en"
    }]
  }
};

export const bookRdf = {
  "http://example.org/about": {
    "http://purl.org/dc/terms/title": [{
      "value": "This is my life",
      "type": "literal",
      // "lang": "en"
    }]
  }
};

export const flightRdf = {
  "http://example.org/about": {
    "https://data.nasa.gov/ontologies/atmonto/ATM#Flight": [{
      "value": "flight uri",
      "type": "uri"
    }],
    "https://data.nasa.gov/ontologies/atmonto/ATM#callSign": [{
      "value": "flight model",
      "type": "literal"
    }],
    "https://data.nasa.gov/ontologies/atmonto/ATM#operatedBy": [{
      "value": "operated by",
      "type": "uri"
    }],
    "https://data.nasa.gov/ontologies/atmonto/NAS#airCarrierName": [{
      "value": "air carrier name",
      "type": "literal"
    }],
    "https://data.nasa.gov/ontologies/atmonto/ATM#arrivalAirport": [{
      "value": "arrival airport",
      "type": "uri"
    }],
    "https://data.nasa.gov/ontologies/atmonto/ATM#departureAirport": [{
      "value": "departure airport",
      "type": "uri"
    }],
    "https://data.nasa.gov/ontologies/atmonto/ATM#actualArrivalDay": [{
      "value": "actual arrival day",
      "type": "uri"
    }],
    "https://data.nasa.gov/ontologies/atmonto/ATM#actualDepartureDay": [{
      "value": "actual departure day",
      "type": "uri"
    }]

  }
};
