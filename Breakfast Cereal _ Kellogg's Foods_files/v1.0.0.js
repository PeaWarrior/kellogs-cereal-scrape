// dont pollute the global namespace (too much)


// https://stackoverflow.com/questions/9899372/pure-javascript-equivalent-of-jquerys-ready-how-to-call-a-function-when-t/9899701#9899701
(function(funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);


(function() {
	"use strict";

	var astuteBotMessengerLauncher = {
		version: "1.0.0",
		init: undefined,
        destroy: undefined,
        sendMessage: undefined,
        scriptSrc: document.currentScript.src,
        
        init: undefined,
        destroy: undefined,
        sync: undefined,

        defaultOptions: {
            host: {
                getUserInfo: function() {},
                getAstuteBotInfo: function() {},
                onMessage: function(message) {}
            },
            state: {
                // agent worksapce state:
                workspace: {
                    selectedView: 'NONE',
                    allowDragging: true,
                    windowAnchor: {
                        x: 'left',
                        y: 'bottom'
                    },
                    agentChatPanel: {
                        splitterSizes: [70, 30]
                    },
                },

                // launcher state:
                launcher: {
                    windowPosition: {
                        dx: 0,
                        dy: 0,
                        width: 1040,
                        height: 480,
                    },
                    restoreSizes: {
                        collapsed: {
                            width: 55,
                            height: 260
                        },
                        expanded: {
                            width: 640,
                            height: 480
                        }
                    },
                    expandCollapseMode: 'collapsed' // collapsed, expanded
                },
            },
            
            
            // custom on screen locations various edges can snap to.  intended to allow the top edge to snap to bottom of astute agent title bar
            snapLocations: { 
                left: [],
                right: [],
                top: [],
                bottom: []
            }
        }
	}, _globals;

    _globals = (function () { return this || (0, eval)("this"); }());

    var _options = null;
    var _localStorageSettings = {
        key: 'AstuteBotMessengerLauncher',
        version: 1
    }
    var _loadDependenciesPromise = null;

    var _destroyed = false;
    var _frameLoads = [];
    var _needRemoveFullscreenPageStyle = false;

    var _shouldQueueEvents = true;
    var _queuedEvents = [];

    var _minimized = true;
    
	if (typeof module !== "undefined" && module.exports) {
		module.exports = astuteBotMessengerLauncher;
	} else if (typeof define === "function" && define.amd) {
		define(function(){return astuteBotMessengerLauncher;});
	} else {
		_globals.astuteBotMessengerLauncher = astuteBotMessengerLauncher;
	}

    function loadDependencies() {        
        var scriptUrl = new URL(astuteBotMessengerLauncher.scriptSrc);

        var includeCss = function(url) {
            var cssElement = document.createElement("link");
            cssElement.rel = "stylesheet";
            cssElement.type = "text/css";
            cssElement.href = url;
            var head = document.getElementsByTagName('HEAD')[0];  
            head.appendChild(cssElement); 
        };

        var styleSheets = [
            '/components/Launchers/Messenger/v1.0.0.css'
            //'/ext/jqueryui/jquery-ui.min.css'
        ];
        for (var i = 0; i < styleSheets.length; i++){
            includeCss(scriptUrl.origin  + styleSheets[i]);
        }


        var includeJs = function(url) {
            return new Promise((resolve, reject) => {
                var jsElement = document.createElement("script");
                var body = document.getElementsByTagName('BODY')[0];  
                jsElement.type = "text/javascript";        
                jsElement.src = url;
                jsElement.async = true;
                jsElement.onload = function() {
                    resolve();
                }        
                body.appendChild(jsElement);         
            });
        };
                   

        var scripts = [
            //'/ext/theme/js/jquery-3.1.1.min.js',
            //'/ext/jqueryui/jquery-ui.min.js'
            //'/ext/interact/interact.min.js'
        ];
               
        return new Promise((resolve, reject) => {
            var i = 0;

            var loadNext = function() {
                if (i >= scripts.length) {
                    resolve();
                } else {
                    includeJs(scriptUrl.origin  + scripts[i]).then(function() {
                        i++;
                        loadNext();
                    });
                }
            }
            loadNext();
        });
    }

    function waitForAllFramesToBeReady() {
        return new Promise((resolve, reject) => {
            var i = 0;

            var loadNext = function() {
                if (i >= _frameLoads.length) {
                    resolve();
                } else {
                    _frameLoads[i].promise.then(function() {
                        i++;
                        loadNext();
                    });
                }
            }
            loadNext();
        });
    }



    function appendHtml(el, str) {
        var div = document.createElement('div');
        div.innerHTML = str;
        while (div.children.length > 0) {
            var domElement = el.appendChild(div.children[0]);
        }
    }

    function getUpdatedAstuteBotInfo() {
        var scriptUrl = new URL(astuteBotMessengerLauncher.scriptSrc);

        var astuteBotInfo = {
            tld: scriptUrl.hostname,
            origin: scriptUrl.origin
        };

        // strip off www./api. prefix from url to get tld:
        var hostParts = astuteBotInfo.tld.split('.');
        if (hostParts.length == 3) {
            astuteBotInfo.tld = hostParts[1] + '.' + hostParts[2];
        }        

        switch (astuteBotInfo.tld) {
            case 'localhost':
                astuteBotInfo.webBaseUrl = 'http://' + astuteBotInfo.tld + ':52007';
                astuteBotInfo.apiBaseUrl = 'http://' + astuteBotInfo.tld + ':54091/v1/';
                break;

            default:
                astuteBotInfo.webBaseUrl = 'https://www.' + astuteBotInfo.tld;
                astuteBotInfo.apiBaseUrl = 'https://api.' + astuteBotInfo.tld + '/v1/';
                break;
        }
        return astuteBotInfo;
    }


    function getFrameContainer(type) {
        var els = document.getElementsByClassName('AstuteBotMessengerContainer');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el.getAttribute('data-type') == type) return el;
        }
        return null;
    }

    function addIframe(type) {
        // to guarantee things work, we should wait until all frames are loaded/"ready".  so this fn returnsa  promise that is resolved
        // when the component inside the frame fires back a "frame ready" event
        var frameLoad = {
            type: type,
            resolveFn: null,
            promise: null
        };
        frameLoad.promise = new Promise((resolve, reject) => {
            frameLoad.resolveFn = resolve;
        });
        _frameLoads.push(frameLoad);


        // patch in web, api urls from provided host:
        var astuteBotInfo = getUpdatedAstuteBotInfo();

        // add  frame
        {
            var url = 'messengerRuntime' + type;
            var frameName = 'componentFrame' + type;

            getFrameContainer(type).innerHTML = 
                '<div class="BorderContainer"><iframe class="ComponentFrame" name="' + frameName + '" frameBorder="0" style="display: none;" allow="geolocation *; microphone *; camera *;"></iframe></div>';

            var method = 'post';
            var path = astuteBotInfo.webBaseUrl + '/components/messenger.aspx';

            var form = document.createElement('form');
            form.setAttribute('method', method);
            form.setAttribute('action', path);
            form.setAttribute('target', frameName);

            var hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', 'url');
            hiddenField.setAttribute('value', url);
            form.appendChild(hiddenField);

            hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', 'contextJson');
            hiddenField.setAttribute('value', encodeURIComponent(JSON.stringify(_options)));
            form.appendChild(hiddenField);

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        
            //document.getElementsByClassName('AstuteBotMessengerContainer')[0].style = "display: block;";
            getFrameContainer(type).getElementsByClassName('ComponentFrame')[0].style = "display: block;"; 
        }

       return frameLoad.promise;
    }


    astuteBotMessengerLauncher.broadcastEvent = function(event) {
        for (var i = 0; i < _frameLoads.length; i++) {
            var frame = getFrameContainer(_frameLoads[i].type).getElementsByClassName('ComponentFrame')[0].contentWindow;
            frame.postMessage(event, '*');
        }
    };    

    astuteBotMessengerLauncher.sendEvent = function(type, event) {
        var frame = getFrameContainer(type).getElementsByClassName('ComponentFrame')[0].contentWindow;
        frame.postMessage(event, '*');        
    };   

    
    function handleEvent(e) {
        var astuteBotInfo = getUpdatedAstuteBotInfo();

        if (e.origin != astuteBotInfo.webBaseUrl) return;

        switch (e.data.type) {
            case 'FRAME_READY':
                for (var i = 0; i < _frameLoads.length; i++) {
                    if (_frameLoads[i].type != e.data.frameType) continue;
                    _frameLoads[i].resolveFn();
                }
                break;

            case 'STYLE_FRAME_CONTAINER':
                getFrameContainer(e.data.frameType).style = e.data.styles;
                break;

            case 'SET_PANEL_VISIBILITY':
                if (window.astuteBotMessengerSettings.runtime.messenger.settings.general.fullScreenMobile &&
                    window.astuteBotMessengerSettings.viewSettings.isMobile) {
                    if (e.data.visible) {
                        setMessengerSizeFullscreen();
                        addFullscreenPageStyle();
                    } else {
                        removeFullscreenPageStyle();
                    }
                }                

                astuteBotMessengerLauncher.broadcastEvent(e.data); // broadcast this to all frames
                break;

            case 'MINIMIZE':
                astuteBotMessengerLauncher.broadcastEvent(e.data); // broadcast this to all frames                
                break;

            case 'ATTENTION_STARTED':
                astuteBotMessengerLauncher.broadcastEvent(e.data); // broadcast this to all frames
                break;

            case 'ALL_PANELS_INITIALIZED':
                _shouldQueueEvents = false;

                $.each(_queuedEvents, function (index, fullEvent) {
                    astuteBotMessengerLauncher.broadcastEvent(fullEvent);
                });

                _queuedEvents = [];
                break;

            case 'HIDDEN':
                _minimized = true;
                break;

            case 'MINIMIZED':
                _minimized = true;
                break;

            case 'MAXIMIZED':
                _minimized = false;
                break;
        }
    }

    function addFullscreenPageStyle() {
        if (document.body.style.overflow != 'hidden') {
            document.body.style.overflow = 'hidden';
            _needRemoveFullscreenPageStyle = true;
        }
    }

    function removeFullscreenPageStyle() {
        if (_needRemoveFullscreenPageStyle) {
            document.body.style.removeProperty('overflow');
            _needRemoveFullscreenPageStyle = false;
        }
    }

    function setMessengerSizeFullscreen() {
        var doSync = false;

        var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        if (window.astuteBotMessengerSettings.runtime.messenger.settings.dimensions.messengerHeight != windowHeight) {
            window.astuteBotMessengerSettings.runtime.messenger.settings.dimensions.messengerHeight = windowHeight;
            doSync = true;
        }

        var windowWidth = window.innerWidth;
        if (window.astuteBotMessengerSettings.runtime.messenger.settings.dimensions.messengerWidth != windowWidth) {
            window.astuteBotMessengerSettings.runtime.messenger.settings.dimensions.messengerWidth = windowWidth;
            doSync = true;
        }

        window.removeEventListener('resize', setMessengerSizeFullscreen);
        window.addEventListener('resize', setMessengerSizeFullscreen);

        if (doSync) {
            astuteBotMessengerLauncher.sync('settings');
        }
    }


	astuteBotMessengerLauncher.init = function() {        
        //var channelId = getUrlVars()['channelId'];
        //if (typeof channelId == 'undefined') return;

        _frameLoads = [];
        _destroyed = false;
        _shouldQueueEvents = true;

        window.astuteBotMessenger = {
            sendEvent(target, event) {
                var fullEvent = {
                    type: 'SEND_EVENT',
                    target: target,
                    event: event
                };

                if (_shouldQueueEvents) {
                    _queuedEvents.push(fullEvent);
                } else {
                    astuteBotMessengerLauncher.broadcastEvent(fullEvent);
                }       

                if (_minimized) {
                    var minimizeEvent = {
                        type: 'MINIMIZE',
                    };
                    astuteBotMessengerLauncher.broadcastEvent(minimizeEvent);
                }
            }
        };

        var settings = window.astuteBotMessengerSettings;
        if (typeof settings == 'undefined') return;
        if (typeof settings.viewOptions == 'undefined') {
            settings.viewOptions = {
                defaultView: 'MINIMIZED'
            };
        }
        if (settings.viewSettings == null) {
            settings.viewSettings = {};
        }
        if (settings.viewSettings.isMobile == null) {
            settings.viewSettings.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }

        if (settings.viewOptions.defaultView != 'MAXIMIZED') {
            _minimized = true;
        }
        
        _loadDependenciesPromise = loadDependencies();
        _loadDependenciesPromise.then(function() {
            //$(document).ready(function() {
            //document.addEventListener("DOMContentLoaded", function(event) { 
            docReady(function() {
                console.log(_destroyed);

                _options = settings;

                // try to read from local storage
                var persistedLocalStorageSettingsJson = window.localStorage.getItem(_localStorageSettings.key);
                if (persistedLocalStorageSettingsJson != null) {
                    _localStorageSettings = JSON.parse(persistedLocalStorageSettingsJson);
                }

                // persist userId if needed, otherwise copy persisted one into analytics info
                if (settings != null &&
                    settings.runtime != null &&
                    settings.runtime.analyticsInfo != null) {
                    if (_localStorageSettings.userId == null) {
                        _localStorageSettings.userId = settings.runtime.analyticsInfo.userId;
                        window.localStorage.setItem(_localStorageSettings.key, JSON.stringify(_localStorageSettings));
                    } else {
                        settings.runtime.analyticsInfo.userId = _localStorageSettings.userId;
                    }
                }                

                appendHtml(document.body, '<div class="AstuteBotMessengerContainer" data-type="Panel" style="display: none;"></div>');
                appendHtml(document.body, '<div class="AstuteBotMessengerContainer" data-type="Launcher" style="display: none;"></div>');

                var shouldLoadAttention = settings.runtime.messenger.settings.launcher.showAttention &&
                    settings.runtime.messenger.settings.launcher.attentionMessage != null &&
                    settings.runtime.messenger.settings.launcher.attentionMessage.length > 0;

                if (shouldLoadAttention) {
                    appendHtml(document.body, '<div class="AstuteBotMessengerContainer" data-type="Attention" style="display: none;"></div>');
                }


                window.addEventListener('message', handleEvent);


                // wait for frames to load before load
                addIframe('Launcher');
                addIframe('Panel');

                if (shouldLoadAttention) {
                    addIframe('Attention');
                }

                waitForAllFramesToBeReady().then(function() {
                    astuteBotMessengerLauncher.broadcastEvent({
                        type: 'ALL_FRAMES_READY',
                        settings: JSON.parse(JSON.stringify(settings)) // todo: figure out what non-cloneable garbage is in here
                    });                    
                });                
            });
        });
    };    

    astuteBotMessengerLauncher.destroy = function() {
        _destroyed = true;
        _loadDependenciesPromise.then(function() {
            window.removeEventListener('message', handleEvent);            

            // clean up DOM
            for (var i = 0; i < _frameLoads.length; i++) {                
                var frame = getFrameContainer(_frameLoads[i].type);
                if (frame == null) continue;
                frame.parentNode.removeChild(frame);                
            }
            _frameLoads = [];            
        });
    };
    
    // called by the preview/test page to update runtime data on the fly
    astuteBotMessengerLauncher.sync = function(changeType) {
        _loadDependenciesPromise.then(function() {
            var settings = window.astuteBotMessengerSettings;

            // todo: figure out whats wrong with appLayout that causes errors if not striped down
            settings.runtime.messenger.appLayout = JSON.parse(JSON.stringify(settings.runtime.messenger.appLayout));

            astuteBotMessengerLauncher.broadcastEvent({
                type: 'SYNC',
                changeType: changeType,
                state: {
                    runtime: settings.runtime,
                    messengerContext: settings.messengerContext,
                    viewSettings: settings.viewSettings,
                }
            });

        });
    }


    function getUrlVars() {
        var vars = [], hash;
        var hashes = document.currentScript.src.slice(document.currentScript.src.indexOf('?') + 1);

        hashes = hashes.split('#')[0].split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }


    astuteBotMessengerLauncher.init();
   
}());
