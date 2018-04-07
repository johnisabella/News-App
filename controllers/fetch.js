//FROM PATRICK
//should be used for the manual scrape function
//similar to sequelize controllers - these should be done separately, but pulled into one API file.

var express = require("express");

var router = express.Router();

// Import the model (Article.js) to use its database functions.
var article = require("../models/Article.js");

// Create all our routes and set up logic within those routes where required.
router.get("/articles", function(req, res) {
  Article.all(function(data) {
    var hbsObject = {
      Article: data
    };
    console.log(hbsObject);
    res.render("index", hbsObject);
  });
});

// Export routes for server.js to use.
module.exports = router;
