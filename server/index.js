const nodemailer = require('nodemailer');
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios').default;
require('dotenv').config();

const APP_URL = process.env.APP_URL;
const APP_PORT = process.env.APP_PORT;
const FROM = process.env.FROM;
const TO = process.env.TO;
const PASSWORD = process.env.PASSWORD;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options('*', cors());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: FROM,
    pass: PASSWORD,
  },
});

const sendUrl = `/sendReport`;
app.listen(APP_PORT, () => {
  // transporter.verify().then(console.log).catch(console.error);
});

console.log(`API Gateway listening ${APP_URL} at:${APP_PORT} --> ${sendUrl}`);

app.post(sendUrl, async (req, res) => {
  const report = req.body.report;
  const { negative, positive } = buildEmail(report);
  const mailOptions = {
    from: FROM,
    to: TO,
    subject: 'Crypto updates',
    text: `NEGATIVE: ${negative}
    
    POSITIVE: ${positive}
    `,
  };

  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });

  try {
    res.json({ success: false });
  } catch (error) {}
});

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
      acc += `\n
  ${name} => ${next.link} lastDay: ${next[lastDayColTxt]} lastWeek: ${next[last7DayColTxt]}
  `;

      return acc;
    }, '') || '';

  const positive =
    report.positive?.reduce((acc, next) => {
      const [name] = Object.keys(next);
      acc += `\n
  ${name} => ${next.link} lastDay: ${next[lastDayColTxt]} lastWeek: ${next[last7DayColTxt]}
  `;

      return acc;
    }, '') || '';

  return { negative, positive };
}
// const start = `/start`;
// app.get(start, async (req, res) => {
//   axios
//     .get('https://coinmarketcap.com/?page=1')
//     .then(({ data }) => {
//       const [table] = getElementByTag(data, 'table', true);

//       return res.json({ data: table });
//     })
//     .catch((error) => {
//       res.status(500).json({ error });
//     });
// });

// function getElementByTag(string, tag, hasAttributes = false) {
//   const firstTag = hasAttributes ? `<${tag} ` : `<${tag}>`;
//   const endTag = `</${tag}>`;
//   const firstIndex = string.indexOf(firstTag);
//   const endIndex = string.indexOf(endTag);

//   const element = string.substring(firstIndex, endIndex + endTag.length);
//   return [element, string.substring(endIndex + endTag.length)];
// }

// function findAll(string, tag, hasAttributes = false) {
//   const arr = [];
//   const [element, rest] = getElementByTag(string, tag, hasAttributes);
//   if (element) {
//     arr.push(element, ...findAll(rest, tag, hasAttributes));
//   }

//   return arr;
// }
