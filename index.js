var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
const { contains } = require("cheerio/lib/static");
const { response } = require("express");

var app = express();
app.use(express.json());

const port = 3100;

app.listen(port, console.log(`i am listening at ${port} `));

app.get("/test", (request, response) => {
  response.json("testing");
});

const newspapers = [
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/environment/climate-change",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com/environment/climate-crisis",
  },
  {
    name: "nytimes",
    address: "https://www.nytimes.com/international/section/climate",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const news = cheerio.load(html);
    news('a:contains("climate")', html).each(function () {
      const title = news(this).text();
      const url = news(this).attr("href");

      articles.push({
        title,
        url,
        source: newspaper.name,
      });
    });
    //console.log(articles);
  });
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperid", (req, res) => {
  const newspaperId = req.params.newspaperid;
  //console.log(newspaperId);

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;
  //console.log(newspaperAddress)

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificNews = [];
      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        specificNews.push({
          title,
          url,
          source: newspaperId,
        });
      });
      //console.log(specificNews);
      res.json(specificNews);
    })

    .catch((err) => console.log(err));
});
