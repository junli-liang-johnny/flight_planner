/**
 * vars
 */
const states = [
  'NONE',
  'ASC',
  'DESC'
];
let rowStates = {
  'blocker-report-title': states[0],
  'blocker-report-creator': states[0],
  'blocker-report-created': states[0]
}

Array.from(document.getElementsByClassName('blocker-sort-btn')).forEach(sortBtn => {
  sortBtn.addEventListener('click', e => {
    if (sortBtn.id == 'blocker-title-sort-btn') {
      sort('blocker-report-title');
    } else if (sortBtn.id == 'blocker-creator-sort-btn') {
      sort('blocker-report-creator');
    } else {
      sort('blocker-report-created');
    }
  });
});

/**
 * function to sort td
 */
function getSortedTds(id) {
  const sortedTd = Array.from(document.getElementsByClassName(id)).sort((row1, row2) => {
    let compare;
    if (rowStates[id] == states[0]) {
      // get the row id
      const int1 = parseInt(row1.parentNode.firstElementChild.innerHTML);
      const int2 = parseInt(row2.parentNode.firstElementChild.innerHTML);
      compare = int1 - int2;
    } else if (rowStates[id] == states[1]) {
      compare = row1.innerHTML.toLowerCase().localeCompare(row2.innerHTML.toLowerCase());
    } else {
      compare = row2.innerHTML.toLowerCase().localeCompare(row1.innerHTML.toLowerCase());
    }
    return compare;
  });
  return sortedTd;
}

/**
 * function to get a row of sorted td
 */
function getSortedTrs(id) {
  const sortedTds = getSortedTds(id);
  let sortedTrs = [];
  sortedTds.forEach(td => sortedTrs.push(td.parentNode));
  return sortedTrs;
}

/**
 * function to replace the unsorted row with the sorted row
 */
function sort(id) {
  // change the state
  changeState(id);
  const tbody = document.querySelector('tbody');
  const sortedTrs = getSortedTrs(id);
  // append sorted rows
  Array.from(tbody.children).forEach((node, index) => {
    tbody.appendChild(sortedTrs[index]);
  });
}

/**
 * function to get the state index
 */
function getStateIndex(rowState) {
  for (const [index, state] of states.entries()) {
    if (rowState == state) {
      return index;
    }
  }
}

function changeState(id) {
  // change the state
  if (rowStates[id] != states[2]) {
    rowStates[id] = states[getStateIndex(rowStates[id]) + 1];
  } else {
    rowStates[id] = states[0];
  }
}
