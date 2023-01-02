function fillButton() {

  $("#streetMail").val($("#street").val())
  $("#postalCodeMail").val($("#postalCode").val())
  $("#cityMail").val($("#city").val())
  $("#provinceMail").val($("#province").val())
  $("#nameMail").val($("#firstName").val() + " " + $("#lastName").val());

}
