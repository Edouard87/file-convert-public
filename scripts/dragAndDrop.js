// ####################################################
// This script manages the drag n' drop functionnality
// of the application.
// ####################################################

$(document).ready(function() {

  var dropArea = $('body')

  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.on(eventName, preventDefaults)
  });

  function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  dropArea[0].addEventListener('drop', handleDrop,false)

  function handleDrop(ev) {

    var file = ev.dataTransfer.files;
    var fd = new FormData();
    fd.append('uploadData', file[0]);
    uploadFile(fd);

  }

});
