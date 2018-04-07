// We'll be rewriting the table's data frequently, so let's make our code more DRY
// by writing a function that takes in 'animals' (JSON) and creates a table body
function displayResults(articles) {
  // First, empty the table
  $("tbody").empty();

  // Then, for each entry of that json...
  Article.forEach(function(articles) {
    // Append each of the animal's properties to the table
    $("tbody").append("<tr><td>" + Article.headline + "</td>" +
                         "<td>" + Article.summary + "</td>" +
                         "<td>" + Article.url + "</td></tr>");
  });
}

// 1: On Load
// ==========

// First thing: ask the back end for json with all animals
$.getJSON("/articles", function(data) {
  // Call our function to generate a table body
  displayResults(articles);
});
