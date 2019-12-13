const puppeteer = require("puppeteer");
const $ = require("cheerio");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 4000;
app.use(cors());
var searchKey;
app.get("/gsearch", (req, res) => {
  res.send("Welcome to post Node API");
});
app.post("/postData", bodyParser.json(), (req, res) => {
  // res.json(req.body.input);
  searchKey = req.body.input;
  searchKey = searchKey.replace(/ /g, "+");
  var url = "https://www.google.co.in/search?q=" + searchKey + "&num=10";
  google_scrape(url, res);
});
var server = app.listen(PORT, () =>
  console.log("App listening on port " + PORT)
);
// var arr4 = [];

function google_scrape(url, res) {
  var arr = [];
  var arr1 = [];
  var output;
  puppeteer
    .launch({ args: ["--no-sandbox"] })
    .then(function(browser) {
      return browser.newPage();
    })
    .then(function(page) {
      return page.goto(url).then(function() {
        return page.content();
      });
    })

    .then(function(html) {
      $(" .LC20lb", html).each(function() {
        arr.push(
          $(this)
            .parent()
            .attr("href")
        );
        arr1.push($(this).text());
      });
      a = 0;
      // $("span.st", html).each(function() {
      //   arr4.push($(this).text());
      // });
    })

    .then(function() {
      // var arr2 = Array.from(new Set(arr));
      // var arr3 = Array.from(new Set(arr1));
      output = { link: url, titles: arr1, urls: arr };
      // console.log(output);
      res.json(output);
      //   process.exit();
      // console.log(output);
      // return output;
    })
    .then(function() {})

    .catch(function(err) {
      //handle error
      console.log(err);
    });
}

// console.log("hello");
