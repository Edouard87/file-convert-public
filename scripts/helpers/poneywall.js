$(document).ready(function() {

  var poneyWallInput = $("[name='basement[wall][measurements][poenyWallHeight]']")
  var poneyWallMeta = $("[name='basement[wall][measurements][hasPoneyWall]']")
    poneyWallInput.on('keyup', function() {

      console.log(poneyWallInput.val().split().length);

      if (poneyWallInput.val().length > 0) {

        poneyWallMeta.val("true")

      } else {

        poneyWallMeta.val("false")

      }

    });

});
