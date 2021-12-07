const axios = require('axios');

axios
  .get('https://coinmarketcap.com/?page=1')
  .then(({ data }) => {
    const [table] = getElementByTag(data, 'table', true);
    const [tbody] = getElementByTag(table, 'tbody');

    const elements = findAll(tbody, 'tr', true);
    elements.slice(0, 1).forEach((el) => console.log(el));
    // console.log(thead);
  })
  .catch((error) => {
    console.error(error);
  });

function getElementByTag(string, tag, hasAttributes = false) {
  const firstTag = hasAttributes ? `<${tag} ` : `<${tag}>`;
  const endTag = `</${tag}>`;
  const firstIndex = string.indexOf(firstTag);
  const endIndex = string.indexOf(endTag);

  const element = string.substring(firstIndex, endIndex + endTag.length);
  return [element, string.substring(endIndex + endTag.length)];
}

function findAll(string, tag, hasAttributes = false) {
  const arr = [];
  const [element, rest] = getElementByTag(string, tag, hasAttributes);
  if (element) {
    arr.push(element, ...findAll(rest, tag, hasAttributes));
  }

  return arr;
}

function findElement(document) {
  const lastDayColTxt = '24h %';
  const last7DayColTxt = '7d %';
  const lastMonthColTxt = '30d %';
  const last2MonthsColTxt = '60d %';
  const last3MonthsColTxt = '90d %';

  const elements = document.querySelectorAll('th p');

  const lastDayElement = Array.from(elements).find(
    (el) => el?.innerText === lastDayColTxt
  );

  const last7DaysElement = Array.from(elements).find(
    (el) => el?.innerText === last7DayColTxt
  );

  return [lastDayElement, last7DaysElement];
}
