const puppeteer = require("puppeteer");
const $ = require("cheerio");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const translate = require("@vitalets/google-translate-api");

const app = express();
const PORT = 8080;
app.use(cors());

var searchKey;
var translateQuery;
app.post("/translate", bodyParser.json(), (req, res) => {
  translateQuery = req.body.input;
  outLangCode = req.body.outLang;

  console.log("Input: " + translateQuery);
  gTranslate(res, translateQuery);
});

app.post("/google-search", bodyParser.json(), (req, res) => {
  searchKey = req.body.input;
  searchKey = searchKey.replace(/ /g, "+");
  console.log(searchKey);

  var url = "https://www.google.co.in/search?q=" + searchKey + "&num=10";

  google_scrape(url, res);
});
var server = app.listen(process.env.PORT || 8080, () =>
  console.log("App listening on port " + PORT)
);

function google_scrape(url, res) {
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2"
    });
    var arr = [],
      arr1 = [],
      arr2 = [];
    var HTML = await page.content();
    $(".rc .r .LC20lb", HTML).each(function() {
      arr.push(
        $(this)
          .parent()
          .attr("href")
      );
      arr1.push($(this).text());
    });
    // $(" .s .st", HTML).each(function() {
    //   arr2.push($(this).text());
    // });
    var output = { link: url, titles: arr1, urls: arr };
    // console.log(output);

    res.json(output);

    browser.close();
    return;
  })();
}

function gTranslate(res1, query, outLang) {
  translate(query, { to: outLang })
    .then(res => {
      console.log("Output: " + res.text);
      //=> I speak English
      //   console.log(res.from.language.iso);
      var output = { input: query, lang: res.from.language.iso, out: res.text };

      res1.json(output);
    })
    .catch(err => {
      console.error(err);
    });
}
