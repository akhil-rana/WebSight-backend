const puppeteer = require("puppeteer");
const $ = require("cheerio");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080;
app.use(cors());

var searchKey;
app.get("/gsearch", (req, res) => {
  res.send("Welcome to post Node API");
});
app.post("/postData", bodyParser.json(), (req, res) => {
  searchKey = req.body.input;
  searchKey = searchKey.replace(/ /g, "+");
  console.log(searchKey);

  var url = "https://www.google.co.in/search?q=" + searchKey + "&num=1";
  var url2 =
    "https://www.google.co.in/search?q=" + searchKey + "&num=10&&start=1";

  google_scrape(url, url2, res);
});
var server = app.listen(process.env.PORT || 8080, () =>
  console.log("App listening on port " + PORT)
);

function google_scrape(url, url2, res) {
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    const page1 = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2"
    });
    await page2.goto(url2, {
      waitUntil: "networkidle2"
    });
    var arr = [],
      arr1 = [],
      arr2 = [];
    var HTML = await page.content();
    var HTML2 = await page.content();

    $(".rc .r .LC20lb", HTML).each(function() {
      arr.push(
        $(this)
          .parent()
          .attr("href")
      );
      arr1.push($(this).text());
    });
    $(" .s .st", HTML).each(function() {
      arr2.push($(this).text());
    });
    $(".rc .r .LC20lb", HTML2).each(function() {
      arr.push(
        $(this)
          .parent()
          .attr("href")
      );
      arr1.push($(this).text());
    });
    $(" .s .st", HTML2).each(function() {
      arr2.push($(this).text());
    });
    var output = { link: url, titles: arr1, urls: arr, gist: arr2 };
    // console.log(output);

    res.json(output);

    browser.close();
    return;
  })();
}
