const puppeteer = require("puppeteer");
const $ = require("cheerio");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
// const translate = require("@vitalets/google-translate-api");
const request = require("request");
const app = express();
const PORT = 8080;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var wikiquery = "hello world";
query = query.replace(/ /g, "+");
// console.log(query);
var url = "https://en.wikipedia.org/w/index.php?search=" + query;
wiki_scrape(url);

function wiki_scrape(url) {
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2"
    });
    var str = "";
    var HTML = await page.content();
    $("#bodyContent p", HTML).each(function() {
      if ($(this).text() != "") {
        str += $(this).text() + "\n\n";
      }
    });
    console.log(str);
    let wiki = { content: str };
    browser.close();
    return;
  })();
}
