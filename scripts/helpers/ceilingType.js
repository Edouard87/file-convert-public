function updateCeilingCode() {

  if ($("#ceiling-code-select").val() == 0) {

    $("#ceiling-code-input").prop('disabled',false)

    // Invalidate the first form field so that it woll not be read

    $("#ceiling-code-select").attr('name','components[ceiling][type][no]')

  } else if ($("#ceiling-code-select").val() == "User specified") {

    $("#ceiling-code-input").prop('disabled',true)
    $("#ceiling-code-select").attr('name','components[ceiling][type][code]')

  }

}
