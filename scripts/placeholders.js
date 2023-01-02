function cleanEmpty() {

// ############################################
// This function makes sure that all fields
// are properly formatted before they are sent
// to H2K.
// ############################################


  $(".main-form input").each(function () {

    // ###################################
    // Some values of 0 may be replaced
    // by the default values. This should
    // not be a problem for now...
    // ###################################

    if ($(this).attr('default') !== undefined) {

      if ($(this).val() === '0' || $(this).val() === '') {

        $(this).val($(this).attr("default"));

        

      }

    }

    if ($(this).attr('placeholder') == 'Nom de la Composante') {
      // ############################################################
      // This means the field is a name field. For now, the default
      // value should be kept.
      // ############################################################
    } else if ($(this).attr('type') === 'date') {
      // ############################################################
      // Dates cannot have 0s. Set a random date.
      // ############################################################
      $(this).attr('value', '2019-01-01')
    } else if ($(this).attr('type') === 'text' && $(this).val() === "0") {
      $(this).val("");
    } else if ($(this).attr('type') === 'number' && $(this).val() === "") {
      $(this).val(0);
    }

  });

}

$(document).ready(function () {

  cleanEmpty();

});
