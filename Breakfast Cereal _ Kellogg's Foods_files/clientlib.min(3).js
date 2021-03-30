window.astuteBotMessengerSettings = {
   
    channelId: "o7nas4gYc9R8KExwtsvUwA"
};

 


function includeScript(e) {
    
    var t = document.createElement("script"),
        n = document.getElementsByTagName("script")[0];
    t.type = "text/javascript", t.src = e, t.async = !0, n.parentNode.insertBefore(t, n)
}
includeScript("https://www.astutebot.com/components/Launchers/Messenger/LauncherSelector.js");
$(function () {
  $(".accordion_head").on("click keypress",function(e){
        var accordion = $( e.currentTarget );

 

        if (accordion.attr( 'aria-expanded') === 'false') {
            $(this).attr( 'aria-expanded', 'true');
        } else {
            $(this).attr( 'aria-expanded', 'false');
        }
    });
});
