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

var youtubeQuery = "Minecraft";
query = youtubeQuery.replace(/ /g, "+");
// console.log(query);
var url = "https://www.youtube.com/results?search_query=" + query;
youtube_scrape(url);
function youtube_scrape(url) {
  let arr = [];
  let arr1 = [];
  let arr2 = [];
  //   let arr3 = [];
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2"
    });
    //   var str = "";
    var HTML = await page.content();
    $("a#video-title", HTML).each(function() {
      arr.push($(this).attr("title"));
      arr1.push($(this).attr("href"));
    });
    // $("a#thumbnail yt-img-shadow img", HTML).each(function() {
    //   // arr.push($(this).attr("title"));
    //   arr3.push($(this).attr("src"));
    // });
    for (i = 0; i < arr1.length; i++) {
      arr2.push(arr1[i].substring(9, arr1[i].length));
    }
    console.log(arr);
    console.log(arr1);
    console.log(arr2);
    console.log(arr2.length);
    // console.log(arr3.length);
    // console.log(arr3);

    let yt_results = { title: arr, url: arr1 };
    browser.close();
    return;
  })();
}
