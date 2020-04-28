const puppeteer = require("puppeteer");
const $ = require("cheerio");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const translate = require("@vitalets/google-translate-api");
const request = require("request");
const app = express();
const PORT = 8080;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var searchKey;
var translateQuery;
var outLangCode;
app.post("/translate", bodyParser.json(), (req, res) => {
  translateQuery = req.body.input;
  outLangCode = req.body.outCode;

  console.log("Input: " + translateQuery);

  gTranslate(res, translateQuery, outLangCode);
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
      waitUntil: "networkidle2",
    });
    var arr = [],
      arr1 = [],
      arr2 = [];
    var HTML = await page.content();
    $(".rc .r .LC20lb", HTML).each(function () {
      arr.push($(this).parent().attr("href"));
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
    .then((res) => {
      console.log("Output: " + res.text);
      //=> I speak English
      //   console.log(res.from.language.iso);
      var output = { input: query, lang: res.from.language.iso, out: res.text };

      res1.json(output);
    })
    .catch((err) => {
      console.error(err);
    });
}

//Weather
app.post("/news/weather", bodyParser.json(), function (req, res, next) {
  //if(err) throw err
  let apiKey = "fda279e459ede7124cf8b87abb94c20f";
  let city = req.body.input;
  let lat = req.body.lat;
  let lon = req.body.lon;
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  weatherDetails(url, res);
});

function weatherDetails(url, res) {
  request(url, function (err, response, body) {
    if (err) {
      console.log("error:", error);
    } else {
      // console.log('body:', body);
      let weather = JSON.parse(body);
      //  let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;

      console.log(weather);
      res.send(weather);
    }
  });
}

// Inshorts headlines
function inshort(url, res) {
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    var paras = [];
    var title = [];
    var imgUrl = [];
    let imger;

    let HTML = await page.content();
    $(".news-card-title.news-right-box .clickable span", HTML).each(
      function () {
        title.push($(this).text());
      }
    );
    $(".news-card-content.news-right-box div ", HTML).each(function () {
      if ($(this).attr("itemprop") == "articleBody") paras.push($(this).text());
    });
    $(".news-card-image", HTML).each(function () {
      imgUrl.push($(this).attr("style"));
    });

    for (i = 0; i < imgUrl.length; i++) {
      imger = imgUrl[i];
      imgUrl[i] = imger.substring(23, imger.length - 2);
    }
    var link = { content: paras, texts: title, imageCard: imgUrl };

    res.json(link);
    browser.close();
    return;
  })();
}

app.post("/news/newsLetter", bodyParser.json(), function (req, res, next) {
  var url = "https://inshorts.com/en/read";

  inshort(url, res);
});
//wiki
var wikiquery = "hello world";

app.post("/wikipedia", bodyParser.json(), (req, res) => {
  wikiquery = req.body.input;

  console.log("Input: " + wikiquery);
  wikiquery = wikiquery.replace(/ /g, "+");

  wiki_scrape(res, wikiquery);
});

function wiki_scrape(res, wikiquery) {
  var url = "https://en.wikipedia.org/w/index.php?search=" + wikiquery;

  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    var contents = [];
    var HTML = await page.content();
    $("#bodyContent p", HTML).each(function () {
      if ($(this).text() != "") {
        contents.push($(this).text());
      }
    });
    // console.log(str);
    let wiki = { content: contents };

    res.json(wiki);
    browser.close();
    return;
  })();
}

function gnews_scrape(url, res) {
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    var arr = [],
      arr1 = [],
      imgArr = [];
    var temp = "https://news.google.com";
    var HTML = await page.content();
    $(".DY5T1d", HTML).each(function () {
      arr.push($(this).attr("href"));
      arr1.push($(this).text());
      imgArr.push(
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .children()
          .first()
          .children()
          .first()
          .children()
          .first()
          .attr("src")
      );
    });
    for (i = 0; i < arr.length; i++) {
      arr[i] = arr[i].slice(1);
      arr[i] = temp.concat(arr[i]);
    }

    var outputNews = { titles: arr1, urls: arr, imgUrl: imgArr };

    res.json(outputNews);
    browser.close();
    return;
  })();
}

app.post("/news/gnews-search", bodyParser.json(), (req, res) => {
  searchKeyNews = req.body.input;
  searchKeyNews = searchKeyNews.replace(/ /g, "+");
  console.log(searchKeyNews);
  const url2 = "https://news.google.com/search?q=" + searchKeyNews;
  gnews_scrape(url2, res);
});

app.post("/youtube", bodyParser.json(), (req, res) => {
  youtubequery = req.body.input;
  youtubequery = youtubequery.replace(/ /g, "+");
  var url = "https://www.youtube.com/results?search_query=" + youtubequery;
  console.log("Input: " + youtubequery);

  youtube_scrape(res, url);
});
// var youtubeQuery = req.body.input;
// query = youtubeQuery.replace(/ /g, "+");
// // console.log(query);

// youtube_scrape(res, url);
function youtube_scrape(res, url) {
  let arr = [];
  let arr1 = [];
  let arr2 = [];
  //   let arr3 = [];
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    //   var str = "";
    var HTML = await page.content();
    $("a#video-title", HTML).each(function () {
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
    res.json(yt_results);
    browser.close();
    return;
  })();
}
