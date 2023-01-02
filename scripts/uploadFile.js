// ######################################################################
// Handles the file picker button to select a file to upload and begin
// the file type conversion process.
// ######################################################################

$(document).ready(function() {

    $('#upload-data').on('click touchstart' , function(){
      $(this).val('');
    });
  
    $("#upload-data").change(function(e) {
  
      e.preventDefault();
      var form = $("#uploadForm")[0];
      var uploadData = new FormData(form)
  
      uploadFile(uploadData);
  
    })
  
  });