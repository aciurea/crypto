const lastDayColTxt = '24h %';
const last7DayColTxt = '7d %';
const lastMonthColTxt = '30d %';
const last2MonthsColTxt = '60d %';
const last3MonthsColTxt = '90d %';

const THREE_SECONDS = 3_000;

const positiveThreshold = 35;
const negativeThreshold = 35;
const BOTTOM_PXls = 6000;

function findElement() {
  const elements = document.querySelectorAll('th p');

  const lastDayElement = Array.from(elements).find(
    (el) => el?.innerText === lastDayColTxt
  );

  const last7DaysElement = Array.from(elements).find(
    (el) => el?.innerText === last7DayColTxt
  );

  return [lastDayElement, last7DaysElement];
}

function analyse(isNegative = false) {
  const nameIndex = 2;
  const lastDayIndex = 4;
  const last7DaysIndex = 5;
  const lastMonthIndex = 6;
  const last2MonthsIndex = 7;
  const last3MonthsIndex = 8;
  const negativeClassName = 'icon-Caret-down';

  const body = document.querySelector('tbody');

  if (!body?.children) {
    return null;
  }

  const report = Array.from(body.children).reduce((acc, tr) => {
    const name = tr.children[nameIndex]?.innerText;
    const link = tr.children[nameIndex].querySelector('a').href;

    if (!name) {
      return acc;
    }

    const className =
      tr.children[lastDayIndex]?.children[0]?.children[0]?.className ?? '';
    const hasNegativeClass = className.includes(negativeClassName);

    if (
      (isNegative && !hasNegativeClass) ||
      (!isNegative && hasNegativeClass)
    ) {
      return acc;
    }

    acc[name] = {
      link: link,
      [lastDayColTxt]: tr.children[lastDayIndex]?.innerText,
      [last7DayColTxt]: tr.children[last7DaysIndex]?.innerText,
      [lastMonthColTxt]: tr.children[lastMonthIndex]?.innerText,
      [last2MonthsColTxt]: tr.children[last2MonthsIndex]?.innerText,
      [last3MonthsColTxt]: tr.children[last3MonthsIndex]?.innerText,
    };

    return acc;
  }, {});

  return report;
}

function changePage(report) {
  const pagination = document.querySelector('ul.pagination');
  const HTML = document.querySelector('html');

  const nextBtn = pagination.querySelector('li.next');
  const [nextALink] = nextBtn.children;
  const [, page1] = pagination.children;

  function innerNavigation() {
    return new Promise((resolve) => {
      if (nextBtn.className.includes('disabled')) {
        // sendReport(report);
        download(report);
        const a = page1?.querySelector('a');
        a?.click();
      } else {
        nextALink.click();
      }

      let timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          HTML.scrollTop = BOTTOM_PXls;
          resolve(true);
          clearTimeout(timeoutId);
        }, THREE_SECONDS);
      }, THREE_SECONDS);
    });
  }

  return innerNavigation;
}

function run() {
  const [lastDayElement] = findElement();
  const HTML = document.querySelector('html');
  let start = false;
  const REPORT = { positive: [], negative: [] };
  const change = changePage(REPORT);

  async function buildReport(isOk, isNegative) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        const report = analyse(isNegative);
        const keys = Object.keys(report);
        const RESULT = keys
          .filter((key) => {
            const value = report[key];
            const num = parseInt(value[lastDayColTxt]);

            return isOk(num);
          })
          .reduce((acc, key) => ({ ...acc, [key]: report[key] }), {});

        clearTimeout(timeoutId);
        resolve(RESULT);
      }, THREE_SECONDS);
    });
  }

  async function log() {
    lastDayElement.click();
    let report = await buildReport((num) => num >= positiveThreshold);
    if (Object.keys(report).length) {
      REPORT.positive.push(report);
    } // push only if there is some data
    lastDayElement.click();
    report = await buildReport((num) => num >= negativeThreshold, true);
    if (Object.keys(report).length) {
      REPORT.negative.push(report);
    } // push only if there is some data
    innerRun();
  }

  function goToTheBottom() {
    return new Promise((resolve) => {
      HTML.scrollTop = BOTTOM_PXls;

      const timeoutId = setTimeout(() => {
        resolve(true);
        clearTimeout(timeoutId);
      }, THREE_SECONDS);
    });
  }

  async function innerRun() {
    if (start === false) {
      start = true;
      await goToTheBottom();
      log();
    } else {
      await change();
      log();
    }
  }

  return innerRun;
}

function sendReport(report) {
  console.log('report is', report);
  const page = window.open('http://localhost:3000/', '*');

  page.postMessage(report);

  const timeouId = setTimeout(() => {
    clearTimeout(timeouId);
    page.close();
  }, 5000);
}

function download(value) {
  console.log('report is ', value);
  const url = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(value)
  )}`;

  const A = document.createElement('a');
  A.setAttribute('href', url);
  A.setAttribute('download', 'data.json');
  document.body.appendChild(A);
  A.click();
  A.remove();
}
