#!/usr/bin/env node
/* Quickly hacked together script by @scazan
 */
const http = require('https');
const licenseCrawler = require('npm-license-crawler');

const renderLicenseList = (licenseDictionary) => {
  let returnString = '';

  Object.entries(licenseDictionary)
    .forEach((keyVal) => {
      const licenseGroup = keyVal[1];
      returnString += `${licenseGroup.licenseInfo.licenseID}, ${licenseGroup.licenseInfo.licenseURL}
        `;

      licenseGroup.softwares.forEach((software) => {
        returnString += `${software.name}, ${software.license.repository}
        `;
      });

      returnString += '\n';
    });

  return returnString;
};

const createLicenseText = (data, publicLicenseInformation) => {
  const licenses = data;
  const licenseDictionary = {};

  const addToDictionary = (key, licenseInfo, softwareWithLicense) => {
    if (licenseDictionary[key]) {
      licenseDictionary[key].softwares.push(softwareWithLicense);
    } else {
      licenseDictionary[key] = { licenseInfo, softwares: [softwareWithLicense] };
    }

    return licenseDictionary;
  };

  Object.entries(licenses).forEach((keyVal) => {
    const license = keyVal[1];
    const name = keyVal[0];
    const licenseID = license.licenses;

    if (typeof licenseID === 'string') {
      const sanitizedLicenseID = licenseID.split('*').join('');

      const publicLicense = publicLicenseInformation.licenses.find(
        publicLicenseInfo => publicLicenseInfo.licenseId === sanitizedLicenseID,
      );

      let licenseURL = '';
      if (publicLicense) {
        licenseURL = publicLicense.seeAlso.length > 0 ? publicLicense.seeAlso[0] : publicLicense.detailsUrl;
      }

      addToDictionary(sanitizedLicenseID, { licenseID, licenseURL }, { name, license });
    } else {
      licenseIDAndUrl = 'Unknown license';
      addToDictionary(
        'UNKNOWN',
        {
          licenseID: 'Unknown License',
          licenseURL: '',
        },
        {
          name,
          license,
        },
      );
    }
  });

  process.stdout.write(`${renderLicenseList(licenseDictionary)}\n`);
};

http.get('https://raw.githubusercontent.com/spdx/license-list-data/master/json/licenses.json', (response) => {
  response.setEncoding('utf8');
  let rawData = '';
  response.on('data', (chunk) => { rawData += chunk; });
  response.on('end', () => {
    try {
      const publicLicenseInformation = JSON.parse(rawData);

      const dumpFileName = 'LICENSE_DUMP.temp';
      licenseCrawler.dumpLicenses(
        {
          start: ['./'],
          json: dumpFileName,
          onlyDirectDependencies: true,
        },
        (error, data) => createLicenseText(data, publicLicenseInformation),
      );
    } catch (e) {
      console.error(e.message);
    }
  });
});
