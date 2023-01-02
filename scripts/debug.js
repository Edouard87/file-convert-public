// ################################
// This code manages the debugger.
// ################################
var debugmode = false;

$('#debug-toggle').on('click', function() {

    if (debugmode) {

        debugmode = false;
        
        $(this).text('Debug Mode: Off');
        $(".main-form").addClass("hidden")
        $(".main-form").removeClass("visible")
    } else {

        debugmode = true;
        $(this).text('Debug Mode: On');
        $(".main-form").removeClass("hidden")
        $(".main-form").addClass("visible")
        

    }
}); 