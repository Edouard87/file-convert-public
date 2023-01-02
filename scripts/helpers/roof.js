  // var slopeCodeEdit = $(".visible-form input[name='components[ceiling][measurements][slope][code]']");
  // var roofSlope = $(".visible-form input[name='components[ceiling][measurements][slope][value]']");

function slopeCodeEditChange() {

  $(".roofDropdown").val($(".visible-form input[name='components[ceiling][measurements][slope][code]']").val())
  // console.log('triggered!');

}

function roofTypeChange() {

  console.log("========================")
  console.log("Changing roof type!")
  console.log("========================")

  if ($("[name='components[ceiling][construction][type]']").val() == "5") {
    // Roof is Flat
    $(".roofDropdown").val(1);
    $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop('readonly',true)
    $(".roofDropdown").prop('disabled',true)
    $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val('0')
  } else {

    // Roof is not flat
    $(".roofDropdown").val(0);
    $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0)
    $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop('readonly',false)
    $(".roofDropdown").prop('disabled',false)
  }

}

function roofSlopeKeyup() {

  $(".roofDropdown").val(0);

}

function slopeCodeChange() {

  $(".visible-form input[name='components[ceiling][measurements][slope][code]']").val($(".roofDropdown").val())

  switch ($(".roofDropdown").val()) {
    case "0":
    // Roof is set to custom
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", false);
      break;
    case "1":
    // Roof is set to flat
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0);
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", true)
      break;
    case "2":
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0.167)
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", true)
      break;
    case "3":
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0.250)
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", true)
      break;
    case "4":
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0.333)
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", true)
      break;
    case "5":
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0.417)
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", true)
      break;
    case "6":
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0.500);
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", true);
      break;
    case "7":
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").val(0.583);
      $(".visible-form input[name='components[ceiling][measurements][slope][value]']").prop("readonly", true);
  }

}
