const fs = require('fs');
const ta = require('../templateAnalyse');

(async () => {
  const taer = new ta.TemplateAnalyser();
  const templates = await taer.combinedTemplates({
    root: "test",
    description: "this is a combined templates",
    label: "combined template"
  });
  taer.writeTemplate('./templates/aviation.template.test.json', JSON.stringify(templates), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Template written');
    }
  });
  // taer.convertCombinedTemplate({
  //   id: "aviation",
  //   label: "converted template",
  //   templates: templates,
  //   prefix: 'avi',
  //   path: 'index/aviation.template.test.json'
  // }, (err) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log('template written');
  //   }
  // });

})();
