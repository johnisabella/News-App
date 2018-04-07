//required NPM packages
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");
var exphbs = require("express-handlebars");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "home" }));
app.set("view engine", "handlebars");

// // Routes

// //SCRAPE:
// // A GET route for scraping NPR.org - move to scrape.js file
app.get("/scrape", function(req, res) {
    console.log ("the scrape function has begun.");
// Make a request for NPR's homepage
request("https://www.npr.org/", function(error, response, html) {

  // Load the body of the HTML into cheerio
  var $ = cheerio.load(html);

  // Empty array to save our scraped data
  var results = [];

  // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
  $("article").each(function(i, element) {

    var article$ = cheerio.load(element);

    // Save the text of the h1-title as "headline"
    var headline = article$("h1.title").text();

    // Find the h1 tag's parent a-tag, and save it's teaser value as "summary"
    var summary = article$("p.teaser").text();

    // Find the h4 tag's parent a-tag, and save it's href value as "link"
    var url = article$("a").attr("href");

    // Make an object with data we scraped for this h4 and push it to the results array
    if (headline != "") {
    results.push({
      headline: headline,
      summary: summary,
      url: url
    });
    // Create a new Article using the `result` object built from scraping
    db.Article.create(results)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log("inside db.Article.create function: " + dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      return res.json(err);
    });
  };
  });
  console.log("get/scrape route: " + results);
  });
});

// Import the model (Article.js) to use its database functions.
var article = require("./models/Article.js");

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      // res.json(dbArticle);
      res.render(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
      console.log("/articles error");
    });
});

// // Main route (simple NPR News message)
// app.get("/", function(req, res) {
//   db.Article.find({}, function(error, found) {
//     // Log any errors if the server encounters one
//     if (error) {
//       console.log("get/ route error: " + error);
//     }
//     // Otherwise, send the result of this query to the browser
//     else {
//       res.render("index");
//       console.log("get/ route:" + found);
//     }
//   });
//
// });



// // 2. At the "/all" path, display every entry in the animals collection
// app.get("/articles", function(req, res) {
//   // Query: In our database, go to the animals collection, then "find" everything
//   db.Article.find({}, function(error, found) {
//     // Log any errors if the server encounters one
//     if (error) {
//       console.log("get/articles route error: " + error);
//     }
//     // Otherwise, send the result of this query to the browser
//     else {
//       res.json(found);
//       console.log("get/articles route:" + found);
//     }
//   });
// });
//
// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article.findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });
//
// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
