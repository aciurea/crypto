const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const FROM = process.env.FROM;
const TO = process.env.TO;
const PASSWORD = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: FROM,
    pass: PASSWORD,
  },
});

const folderName = `${__dirname}/downloads`;
function watch() {
  fs.watch(folderName, (eventType, filename) => {
    if (eventType === 'rename') {
      const filePath = `${folderName}/data.json`;
      fs.readFile(filePath, function (err, fileToRead) {
        if (!err) {
          const { negative, positive } = buildEmail(JSON.parse(fileToRead));

          const mailOptions = {
            from: FROM,
            to: TO,
            subject: 'Crypto updates',
            text: `${negative}
           --------------------------------------------------------------------------
            ${positive}
            `,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          fs.unlinkSync(filePath);
        } else {
          console.error('there is an error', err);
        }
      });
    }
    console.log(eventType, filename);
  });
}

watch();

function buildEmail(report) {
  const lastDayColTxt = '24h %';
  const last7DayColTxt = '7d %';
  const lastMonthColTxt = '30d %';
  const last2MonthsColTxt = '60d %';
  const last3MonthsColTxt = '90d %';

  if (!report) {
    return { negative: '', positive: '' };
  }

  const negative =
    report.negative?.reduce((acc, next) => {
      const [name] = Object.keys(next);
      const obj = next[name];

      acc += `
      NAME: ${name}
      LINK: ${obj?.link}
      lastDay: ${obj?.[lastDayColTxt]}
      lastWeek: ${obj?.[last7DayColTxt]}
  `;

      return acc;
    }, 'NEGATIVE ==> ') || '';

  const positive =
    report.positive?.reduce((acc, next) => {
      const [name] = Object.keys(next);
      const obj = next[name];

      acc += `
      NAME: ${name}
      LINK: ${obj?.link}
      lastDay: ${obj?.[lastDayColTxt]}
      lastWeek: ${obj?.[last7DayColTxt]}
  `;

      return acc;
    }, 'POSITIVE ==>') || '';

  return { negative, positive };
}
