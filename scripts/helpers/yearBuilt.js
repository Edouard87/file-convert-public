$(document).ready(function() {

  console.log('loading yearbuilt');

  var constructionCode = $("[name='house[specifications][yearBuilt][code]']");
  var constructionValue = $("[name='house[specifications][yearBuilt][value]']");
  constructionCode.on('change', function() {
    if (constructionCode.val() === "1") {
      // User Specified
      constructionValue.prop('readonly', false);
    } else {
      // Anything else
      constructionValue.prop('readonly', true);
      constructionValue.val(0)
    }
  });

})
