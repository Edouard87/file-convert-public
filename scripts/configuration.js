// ###################################
// This code runs all functions
// that must be run at least once on
// application start.
// ###################################
$(document).ready(function() {

  // ######################################
  // Copy form so that it may be retrieved
  // using the resetForm() function.
  // ######################################

  setupForm();

  // ##################################
  // Make sure roof is the right type
  // on document load.
  // ##################################

  roofTypeChange()

});
