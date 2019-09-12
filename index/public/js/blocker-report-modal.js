/*
 * js file display a report content when modal opens
 */
const modalBtns = document.getElementsByClassName('modal-btn');
Array.from(modalBtns).forEach((btn) => {
  btn.addEventListener('click', (e) => {

    // clear
    // const blockerReportDetail = document.getElementById('blocker-report-detail');
    // blockerReportDetail.innerHTML = '';
    // show the modal
    $('#blockerReportModal').modal('show')
    // get id
    const identifier = btn.querySelector('.identifier').innerHTML;
    console.log(`id: ${identifier}`);
    getBlockerReport(identifier);

    e.preventDefault();
  });
})

/**
* functiont to send an AJAX request to get the blocker report data by its id
*/
function getBlockerReport(identifier) {
  const json = JSON.stringify({
    identifier: identifier
  });
  const url = 'http://localhost:3000/blocker_view_post';
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);

  //Send the proper header information along with the request
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

  xhr.onreadystatechange = function() { // Call a function when the state changes.
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      const jsonRes = JSON.parse(this.responseText);
      console.log(jsonRes);
      modalUpdate(jsonRes);
    }
  }
  xhr.send(json);
}

function modalUpdate(json) {
  // clear
  const blockerReportModalBody = document.getElementById('blocker-report-modal-body');
  while (blockerReportModalBody.firstChild) {
    blockerReportModalBody.removeChild(blockerReportModalBody.firstChild);
  }
  // set modal title
  document.getElementById('blocker-report-modal-title').innerHTML = json['title'];
  // create a responsive table div
  const tableDiv = document.createElement('dvi');
  tableDiv.setAttribute('class', 'table-responsive');
  // create a table
  const table = document.createElement('table');
  table.setAttribute('class', 'table');
  // table header
  const thead = `
    <thead class="bg-secondary">
      <tr>
        <th scope="col" class="text-light">Key</th>
        <th scope="col" class="text-light">Value</th>
      </tr>
    </thead>
  `;
  // table body
  let tbody = '<tbody>';
  Object.keys(json).forEach((key, index) => {
    const tr = `
      <tr>
        <td>${key}</td>
        <td>${json[key]}</td>
      </tr>
    `;
    tbody += tr;
  });
  tbody += '</tbody>';

  // inner html
  table.innerHTML = thead+tbody;
  tableDiv.appendChild(table);
  blockerReportModalBody.appendChild(tableDiv);
  // add a style for modal body
  // $('.modal-body').css('overflow-x', 'auto'); // use responsive table instead of this
}
