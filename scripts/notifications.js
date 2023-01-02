function createNotification(title, body) {

    var today = new Date();
    var time;

    if (today.getMinutes() < 10) {

        time = today.getHours() + ":0" + today.getMinutes()

    } else {

        time = today.getHours() + ":" + today.getMinutes()

    }

    var notData = {

        title: title,
        body: body,
        time: time

    }

    $(".notifications").append(Mustache.to_html($(".notification-template").html(), notData))
    $('.notification:last-child').fadeIn();
    $(".notifications").addClass("gradient");
    $('.notifications').animate({
        scrollTop: $(".notification:last-child").offset().top - 30
    }, 500);

}
