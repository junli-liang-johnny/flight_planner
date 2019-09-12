/**
 * event on typing on the search input
 */

// get the bindings data as an array
// const bindings = JSON.parse(document.getElementById('blocker-report-bindings').getAttribute('value'));
// console.log(bindings);
// default style style for search btn
// document.getElementById('blocker-search-btn').style.left = '10px';

// search input listener
document.getElementById('blocker-search').addEventListener('input', (e) => {
  if (e.target.value.toLowerCase().includes('title: ')) {
    Array.from(document.getElementsByClassName('blocker-report-title')).forEach(titleElement => {
      if (titleElement.innerHTML.toLowerCase().includes(e.target.value.toLocaleLowerCase().split(': ')[1])) {
        titleElement.parentElement.hidden = false;
      } else {
        titleElement.parentElement.hidden = true;
      }
    });
  } else if (e.target.value.toLowerCase().includes('created: ')) {
    Array.from(document.getElementsByClassName('blocker-report-created')).forEach(titleElement => {
      if (titleElement.innerHTML.toLowerCase().includes(e.target.value.toLocaleLowerCase().split(': ')[1])) {
        titleElement.parentElement.hidden = false;
      } else {
        titleElement.parentElement.hidden = true;
      }
    });
  } else if (e.target.value.toLowerCase().includes('creator: ')) {
    Array.from(document.getElementsByClassName('blocker-report-creator')).forEach(titleElement => {
      if (titleElement.innerHTML.toLowerCase().includes(e.target.value.toLocaleLowerCase().split(': ')[1])) {
        titleElement.parentElement.hidden = false;
      } else {
        titleElement.parentElement.hidden = true;
      }
    });
  }
});

// hide the text
$('#collapse-search').on('shown.bs.collapse', () => {
  document.getElementById('blocker-search-text').hidden = true;
  document.getElementById('blocker-search-btn').style.left = '0';
});
// show the text
$('#collapse-search').on('hidden.bs.collapse', () => {
  document.getElementById('blocker-search-text').hidden = false;
  document.getElementById('blocker-search-btn').style.left = '10px';
});
