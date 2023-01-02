// Global Variables

var automaticUpload = false
var autoRevert = true
var formSubmit = false
var debugmode = false;

// Global Functions

function uploadFile(x) {

  // ####################################################
  // Sends the provided file the server to be read 
  // and retrieves the JSON contents, which it
  // uses on the client side to populate the hidden
  // form. Expects a FormData object with the uploadData
  // element containing the file to be uploaded.
  // ####################################################

  $(".loading").fadeIn();

  $.ajax({
          type: "POST",
          enctype: 'multipart/form-data',
          url: "/uploadFile",
          data: x,
          processData: false,
          contentType: false,
          cache: false,
          timeout: 600000,
          success: function (returnData) {

              if (returnData === undefined) {

                createNotification("Fault","An unexpected error occured. Your file may be corrupted. Please check \
                your file and try again later. If the problem persists, contact the domain administrator at \
                at 514-325-2272 extension 205 and provide code UNDEFINED.")
                $(".loading").fadeOut();

              } else if (returnData == "NOCHECK") {

                createNotification("Fault","This file could not be imported because the data supplied could not be verified. \
                Please check your file and try again. If the problem persists, contact the domain administrator \
                at 514-325-2272 extension 205 and provide code NOCHECK.")
                $(".loading").fadeOut();

              } else if (returnData == "NOWRITE" ) {

                createNotification("Échec","Le fichier ne peut être converti car ce n'est pas un fichier .xlsm.")
                $(".loading").fadeOut();

              } else {

                if (returnData.length === 1) {
                  // ###############################################
                  // Before loading new data, it is important
                  // to make sure that the form is empty. to
                  // that end, a copy of the form is retrieved.
                  // The original form was saved in configuration.js
                  // ###############################################

                  var x = 0;
                  for (let prop in returnData[0]) {
                    if (Object.keys(returnData[0])[x].includes('info[id]')) {
                      createInfo();
                    }
                    $(`[name="${Object.keys(returnData[0])[x]}"]`).val(returnData[0][prop]);
                    x++;
                  }

                  // ##################################
                  // Make sure to change the rooftype
                  // after the roof values have been
                  // imported.
                  // ##################################

                  roofTypeChange()

                  if(debugmode) {

                    cleanEmpty();
                    validateForm();

                  } else {

                    cleanEmpty();
                    submitForm(); // Submit form to server at different endpoint to be converted.
                    
                  }

                }

              }

          },
          error: function (e) {

            $(".loading").fadeOut();
            createNotification("Fault","Your document could not be converted. Check your internet connection \
            and try again. If the problem persists, contact the domain administrator \
            at 514-325-2272 extension 205 and provide code NOUPLOAD.")

          }
      });
}

function submitForm() {

  // ###############################################
  // Submits the hidden form to the server to be
  // converted to an H2K file. Normally called after
  // the file has been converted to JSON and the 
  // appropriate values have been placed in the
  // hidden form. 
  // ###############################################

  if ($("[name='file[identification]']").val() === '') {

    $(".loading").fadeOut()
    return createNotification("Fault","Your report must have a file number. Please add a file number and try again.")

  }

  var url = $('#main-form').attr("action");
  var formData = $('#main-form').serializeArray();
  $.post(url, formData).done(function (data) {

    if (data === "NOPROCESS") {

      $(".loading").fadeOut();
      createNotification("Fault","Your document was not converted because it was refused by the server. \
      Please check your file and try again later. If the problem persists, contact the domain administrator \
      at 514-325-2272 extension 205 and provide code NOPROCESS.")

    } else if (data === "NODATA") {

      $(".loading").fadeOut();
      createNotification("Fault","Your document was converted, but the server concluded \
      it was corrupted. Please try again later. If the problem persists, contact the domain administrator \
      at 514-325-2272 extension 205 and provide code NODATA.")

    } else if (data === "NOWRITE") {
    
      createNotification("Fault", "Your document could not be converted due to an unknown error. \
      Please try again later. If the problem persists, contact the domain administrator \
      at 514-325-2272 extension 205 and provide code NOWRITE.")

    } else {

      // ###############################
      // File conversion was successful. 
      // Now download the file
      // in a seperate step.
      // ###############################

      resetForm();
      $.fileDownload('/download/' + data, {
        successCallback: function (url) {
          $(".loading").fadeOut();
          createNotification("Success", "The file was converted successfully and show now be downloading \
          to your computer.")
        },
        failCallback: function (html, url) {
          $(".loading").fadeOut();
          createNotification(`Your file download failed. Contact your domain administrator at \
          514-325-2272 extension 205 and provide the following: expected file at ${url} but got ${html}`)
        }
      });
    }

  });

}

function createInfo() {

  // #####################################
  // Formats the info section
  // for the file. Special requirement
  // of the H2K file format. TODO: remove.
  // #####################################

  var infoId = $("#infoId").val()
  var infoValue = $("#infoValue").val()

  var count = $('#info-body tr').length+1

  var moustacheTemplateData = {
    count: count,
    infoId: infoId,
    infoValue: infoValue
  }

  var template = Mustache.to_html($("#info-template").html(), moustacheTemplateData);
  $("#info-body").append(template);

  $("#infoId").val('')
  $("#infoValue").val('')

}

function setupForm() {

  // ###############################################
  // Copy the contents of the blank 
  // but visible main form
  // to the inivisble hidden duplicate
  // form. Normally done when the
  // site is first accessed. Allows the
  // original state of the visible form to
  // be restored at any time from the hidden.
  // duplicate form.
  // ###############################################

  $("#form-duplicate").html($("#main-form").html());

}

function resetForm() {

  // ###############################################
  // Copy the contents of the hidden duplicate
  // form to the visible main form.
  // Normally called to recover the original
  // original state of the visible form from the
  // saved snapshot stored in the hidden duplicate
  // in case of failure or cancellation.
  // ###############################################

  $("#main-form").html($("#form-duplicate").html());

}
