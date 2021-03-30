(function() {
	"use strict";

    function loadDependencies(launcherJs) {        
        var includeJs = function(url) {            
            var jsElement = document.createElement("script");
            var body = document.getElementsByTagName('BODY')[0];  
            jsElement.type = "text/javascript";        
            jsElement.src = url;
            jsElement.async = true;
            jsElement.onload = function() {}        
            body.appendChild(jsElement);         
        };
        includeJs(launcherJs);
    }

    function getUpdatedAstuteBotInfo() {
        var scriptUrl = new URL(document.currentScript.src);

        var astuteBotInfo = {
            host: scriptUrl.hostname,
            origin: scriptUrl.origin
        };

        switch (astuteBotInfo.host) {
            case 'localhost':
                astuteBotInfo.webBaseUrl = 'http://' + astuteBotInfo.host + ':52007';
                astuteBotInfo.apiBaseUrl = 'http://' + astuteBotInfo.host + ':54091/v1/';
                break;

            default:
                astuteBotInfo.webBaseUrl = 'https://' + astuteBotInfo.host;
                astuteBotInfo.apiBaseUrl = 'https://' + astuteBotInfo.host.replace('www', 'api') + '/v1/';
                break;
        }
        return astuteBotInfo;
    }    


    function loadXMLDoc(url, onLoadedFn) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
               if (xmlhttp.status == 200) {
                   onLoadedFn(xmlhttp.responseText);
               } else if (xmlhttp.status == 400) {
               } else {
               }
            }
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    
	function init() {
        var settings = window.astuteBotMessengerSettings;

        var botInfo = getUpdatedAstuteBotInfo();
        var url = botInfo.apiBaseUrl + 'messengerChannel/' + settings.channelId;       

        // make some kind of api call that hands in a channel id and gets back a launcher version to use.  also returns data about messenger
        loadXMLDoc(url, function(data) {
            var result = JSON.parse(data);

            result.analyticsInfo.userAgent = navigator.userAgent;
            result.analyticsInfo.url = window.location.href;

            settings.runtime = result;
            //settings.launcher = result.launcher;
            //settings.messenger = result.messenger;
            //settings.appInstances = result.appInstances;
            var launcherJs = botInfo.webBaseUrl + '/components/Launchers/Messenger/' + settings.runtime.launcher.version;
            loadDependencies(launcherJs);
        });              
    };        

    init();
   
}());
