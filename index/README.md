The project uses the RDForms.js which are files in `/flight_planner` and the project is developed under the structure of RDForms.js which is `/flight_planner/index/`.

## How to run
`pwd`: `/Users/.../flight_planner`
- intsall [`Apaceh Jena Fuseki`](https://jena.apache.org/download/index.cgi) if you haven't 
- `fuseki-server`: run the command under directory `/Users/.../flight_planner` to activate the database
- `node index/app.js`: run the app
- Go to `localhost:3000`

## Convert a schema into RDF/JSON?
```
node index/converter.js --input=<path-to-input-file> --output=<output-file> --root=root --description=<text-description-for-the-schema>
```
Note: the script looks for schema file having:
- `rdfs:label` -> `label` element
- i.e. `atm:AbsoluteFix` -> `property` element (https://data.nasa.gov/ontologies/atmonto/ATM#AbsoluteFix)
- i.e. `atm:AbsoluteFix` text -> `id` element
- `rdfs:comment` -> `description` element
- if `rdfs:range` is a predicate of `xsd:dateTime`, `xsd:string` or `xsd:integer` -> `nodetype: "URI"`, else -> `nodetype: "LITERAL"`

The `root` element in the converted schema file is the name of the container for those element ids you want to refer on the form. so feel free to update them at `root.items`. Please see examples in [`flight_planner/index/templates/atm.template.test.json`](https://github.com/diaopk/flight_planner/blob/master/index/templates/atm.template.test.json).

## Merging issue
Fix the css issues conflict with latest version of Bootstrap by comment out the lines on the `flight_planner/dist/bmd.rdforms.js`, which is the one the project imports.
- Line 96455

- Line 96502

- Line 96549

## Screenshots
<p float="left">
  <img src="./screenshots/Screenshot%202019-07-26%20at%2021.00.11.png" width="220" height="400" />
  <img src="./screenshots/Screenshot%202019-07-26%20at%2021.01.07.png" width="220" height="400" />
  <img src="./screenshots/Screenshot 2019-07-26 at 21.01.49.png" width="220" height="400" />
  <img src="./screenshots/Screenshot 2019-07-26 at 21.02.36.png" width="220" height="400" />
 </p>

## Demo video
[Link](https://www.youtube.com/watch?v=w43w-xUsKb0)

## Project introduction and report
- [Introduction slides](https://drive.google.com/open?id=1Hu0tmkx5U1RkMI_QhqYyO27pj9ichIK5)
- [Paper](https://drive.google.com/open?id=122j-d-AjkpiMVHZuKYBilBzSdWFv55wM)
