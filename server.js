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

//Weather
app.post("/news/weather", bodyParser.json(), function(req, res, next) {
  //if(err) throw err
  let apiKey = "fda279e459ede7124cf8b87abb94c20f";
  let city = req.body.input;
  let lat = req.body.lat;
  let lon = req.body.lon;
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  weatherDetails(url, res);
});

function weatherDetails(url, res) {
  request(url, function(err, response, body) {
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
      waitUntil: "networkidle2"
    });
    var paras = [];
    var title = [];
    var imgUrl = [];
    let imger;

    let HTML = await page.content();
    $(".news-card-title.news-right-box .clickable span", HTML).each(function() {
      title.push($(this).text());
    });
    $(".news-card-content.news-right-box div ", HTML).each(function() {
      if ($(this).attr("itemprop") == "articleBody") paras.push($(this).text());
    });
    $(".news-card-image", HTML).each(function() {
      imgUrl.push($(this).attr("style"));
    });

    for (i = 0; i < imgUrl.length; i++) {
      imger = imgUrl[i];
      imgUrl[i] = imger.substring(23, imger.length - 2);
    }
    var link = { content: paras, texts: title, imageCard: imgUrl };
    // link = JSON.stringify(link);

    res.json(link);
    browser.close();
    return;
  })();
}

app.post("/news/newsLetter", bodyParser.json(), function(req, res, next) {
  var url = "https://inshorts.com/en/read";

  inshort(url, res);
});

// server sleeping stopper
// app.get("/sleepstop", (req, res) => {
//   res.send("hello");
// });

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
      waitUntil: "networkidle2"
    });
    var contents = [];
    var HTML = await page.content();
    $("#bodyContent p", HTML).each(function() {
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

function gnews_scrape(url) {
  (async () => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle2"
    });
    var arr = [],
      arr1 = [],
      imgArr = [],
      arr2 = [];
    var temp = "https://news.google.com";
    var HTML = await page.content();
    $(".DY5T1d", HTML).each(function() {
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
    let i = 0;
    // $(".tvs3Id", HTML).each(function() {
    //   imgArr.push($(this).attr("src"));
    // });

    for (i = 0; i < arr.length; i++) {
      arr[i] = arr[i].slice(1);
      arr[i] = temp.concat(arr[i]);
      //imgUrl[i] = imger.substring(23, 127);
    }

    console.log(imgArr);
    console.log(imgArr.length);
    // console.log(i);
    //console.log(arr1.length);

    // $(" .s .st", HTML).each(function() {
    //   arr2.push($(this).text());
    // });
    var outputNews = { titles: arr1, urls: arr };
    // console.log(output);

    res.json(outputNews);

    browser.close();
    return;
  })();
}

app.post("/gnews-search", bodyParser.json(), (req, res) => {
  searchKeyNews = req.body.input;
  searchKeyNews = searchKeyNews.replace(/ /g, "+");
  console.log(searchKey);

  const url2 = "https://news.google.com/search?q=" + searchKeyNews;

  // inshort(url);
  gnews_scrape(url2, res);
});
