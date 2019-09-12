$("[data-toggle=popover]").popover();

/**
 * once loaded change the three-dots menu items
 */
const pages = [
  '/',
  '/report',
  '/blocker',
  '/blocker_list'
];
const pathname = window.location.pathname;
const className = 'drawer-item';
const active = 'active';

// offset left for the dropdown menu
$('#dropdown-menu').on('show.bs.dropdown', () => {
  const parentDiv = document.getElementById('dropdown-menu');
  const div = document.getElementById('dropdown-menu-right');
  div.style.left = '-135px';
});

// reset drawer item style
resetDrawerItemStyle(className, active);

// check whihc page is rendered and determine what to render
switch (pathname) {
  case '/report':
    document.getElementsByClassName(className)[1].classList.add('active');
    document.getElementsByClassName(className)[1].classList.replace('text-secondary', 'text-light');
    showDropdownItem('/report');
    break;
  case '/blocker':
    document.getElementsByClassName(className)[2].classList.add('active');
    document.getElementsByClassName(className)[2].classList.replace('text-secondary', 'text-light');
    showDropdownItem('/blocker');
    break;
  case '/blocker_list':
    document.getElementsByClassName(className)[2].classList.add('active');
    document.getElementsByClassName(className)[2].classList.replace('text-secondary', 'text-light');
    showDropdownItem('/blocker');
    break;
  default:
    document.getElementsByClassName(className)[0].classList.add('active');
    document.getElementsByClassName(className)[0].classList.replace('text-secondary', 'text-light');
    showDropdownItem('/');
    break;
};

/**
 * function to reset drawer item style
 */
function resetDrawerItemStyle(className, active) {
  Array.from(document.getElementsByClassName(className)).forEach(item => {
    item.classList.remove(active);
    item.classList.replace('text-light', 'text-secondary');
  });
};

/**
 * function to add dropdown item based on the current page rendered
 */
function showDropdownItem(path, childElementClassNames = [
  'dropdown-home-item', 'dropdown-report-item', 'dropdown-blocker-item'
], dropdownItems = [
  ['<div class="dropdown-divider dropdown-home-item"> </div>', '<a class="dropdown-item dropdown-home-item disabled" href="#">Settings</a>'],
  ['<a class="btn dropdown-item dropdown-report-item" id="rdforms-config-btn">Configuration</a>', '<div class="dropdown-divider dropdown-report-item"> </div>', '<a class="dropdown-item dropdown-report-item disabled" href="#">Settings</a>'],
  ['<a class="btn dropdown-item dropdown-blocker-item" href="/blocker">Blocker Form</a>', '<a class="btn dropdown-item dropdown-blocker-item" href="/blocker_list">View</a>', '<div class="dropdown-divider dropdown-report-item"> </div>', '<a class="dropdown-item dropdown-report-item disabled" href="#">Settings</a>']
]) {
  const dropdownMenu = document.getElementsByClassName('dropdown-menu')[0];
  let childElementIndex;
  switch (path) {
    case '/report':
      childElementIndex = 1;
      break;
    case '/blocker':
      childElementIndex = 2;
      break;
    default:
      childElementIndex = 0;
      break;
  }
  childElementClassNames.forEach(className => {
    if (className != childElementClassNames[childElementIndex]) {
      // remove un related child elements
      const childElements = document.getElementsByClassName(className);
      Array.from(childElements).forEach(childElement => dropdownMenu.removeChild(childElement));
      // create child element
      let childInnerHTML = '';
      dropdownItems[childElementIndex].forEach(item => childInnerHTML += item);
      // append to the dropdown menu
      dropdownMenu.innerHTML = childInnerHTML;
    }
  });
}
