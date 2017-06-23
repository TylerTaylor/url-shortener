var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var dbUrl = process.env.MONGOLAB_URI;
mongoose.connect(dbUrl)
var Schema = mongoose.Schema;

var urlDataSchema = new Schema({
  original: {type: String, required: true, unique: true },
  shortened: {type: String, required: false}
}, {collection: 'url-data'})

var UrlData = mongoose.model('UrlData', urlDataSchema)

/* GET home page. */
router.get('/', function(req, res, next) {
  UrlData.find()
    .then(function(doc) {
      console.log(" ")
      console.log(doc)
      console.log(" ")
      res.render('index', { title: 'Express URL Shortener', items: doc });
    })
});

router.get('/new/:url', (req, res) => {
  var url = {
    original: req.params.url,
    shortened: null
  }

  var data = new UrlData(url)
  data.save()

  res.redirect('/')
})

router.get('/shortener/:url(*)', (req, res) => {
  var urlParam = req.params.url

  console.log("1.")
  console.log(req.params.url)

  if (validateURL(urlParam)) {
    // if the url is valid, do this
    var url;
    // try to find an existing record with the same url
    UrlData.find({ original: urlParam }, (err, data) => {
      if (err) throw err
      url = data
      console.log("2.")
      console.log("Inside validateUrl check, url is: " + url)
    })
    .then(function(data) {
      if (data.length > 0) {
        console.log("WE SHOULD HAVE SOME DATA HERE!!")

        var urlObj = { original: data[0]['original'], shortened: data[0]['shortened'] }

        res.json(urlObj)
      } else {
        // we don't have a match, so lets create a new short url
        console.log('didnt find a matching record, we will fire createShortUrl now')
        createShortUrl()
      }
    })
  } else {
    // if the url is invalid, do this
    res.send("This url is invalid for some reason")
  }

  function validateURL(textval) {
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
  }

  function createShortUrl() {
    console.log(" ")
    console.log("createShortUrl has been fired! we need to turn this urlParam into a new link")
    console.log(urlParam)

    // generate random number? start from 1 and go up?
    var newUrl = Math.floor(Math.random() * 2000)
    console.log("Hey it could be - " + newUrl)

    // here we have newUrl and need to check if we already have a record with that url
    checkForShortMatch(newUrl)
  }

  function checkForShortMatch(shortUrl) {
    // we have a random shortUrl
    //   need to check to see if this particular combo has been used already

    console.log("checkForShortMatch has been fired! Our url should end in: /" + shortUrl)

    UrlData.find({ shortened: 'https://vast-castle-33776.herokuapp.com/' + shortUrl }, (err, data) => {
      if (err) throw err

      if (data && data.length) {
        // res.redirect(data[0].url)

        // if we're here, we found a matching shortUrl
        //  and need to generate another
        console.log("need to create another shortUrl...")
        createShortUrl()
      } else {
        // if we're here, we didn't find a matching shortUrl. Proceed!
        createLinkPair(shortUrl)
      }

      console.log("we are in the UrlData.find query in checkForShortMatch")
      console.log("data is: " + data)
    }).then((data) => {
      console.log(data[0])
    })
  }

  function createLinkPair(shortUrl) {
    var urlObj = {
      original: urlParam,
      shortened: 'https://vast-castle-33776.herokuapp.com/' + shortUrl
    }

    saveAndDisplayData(urlObj)
  }

  function sendResults(data) {
    res.send("We found a matching short url, so try to generate another! We don't want to see this page again!")
  }

  function saveAndDisplayData(object) {
    let obj = new UrlData(object)
    obj.save()
    res.json(object)
  }


})

router.get('/:id', (req, res) => {
  // grab the id
  let id = req.params.id

  let url = "https://vast-castle-33776.herokuapp.com/" + id

  // locate the record
  UrlData.find({ shortened: url }, (err, data) => {
    if (err) throw err

    if (data && data.length) {
      res.redirect(data[0].original)
    } else {
      res.send("Can't find a shortened URL that matches your input.")
    }
  })
  // redirect to the original URL
})

module.exports = router;
