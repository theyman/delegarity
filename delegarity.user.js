// ==UserScript==
// @name         Delegarity
// @namespace    https://github.com/BartJolling/delegarity
// @version      0.1
// @description  Add list of delegees to Clarity Timesheets search criteria
// @author       Bart Jolling
// @match        https://empower-sso.capgemini.com/niku/nu
// @resource     delegaritycorejs delegarity.core.js
// @resource     timesheetsjs     timeadmin.timesheet.js
// @resource     timesheetshtml   timeadmin.timesheet.html
// @resource     getResourcesjs   projmgr.getResources.js
// @resource     getResourceshtml projmgr.getResources.html
// @run-at       document-idle
// @grant        GM_getResourceText
// ==/UserScript==

function injectScript(jsContent, scriptId) {

    var existingElement = document.getElementById(scriptId);

    if(existingElement !== null && existingElement.type === "text/javascript") {
        console.log("[delegarity][user] Script " + scriptId + " already injected. Skipping.");
        return;
    }

    var headElement =  document.getElementsByTagName("head")[0];
    var scriptElement = document.createElement('script');
    scriptElement.setAttribute("type", "text/javascript");
    scriptElement.setAttribute("id", scriptId);
    scriptElement.innerHTML = jsContent;
    headElement.appendChild(scriptElement);
}

function injectHtml(htmlContent) {

    var div = document.createElement('div');
    div.innerHTML = htmlContent;

    while (div.children.length > 0) {
         document.body.appendChild(div.children[0]);
    }
}

//Main function to inject @resources into the target page
(function() {
    'use strict';

    //executes a callback after performing the call to methodToWrap
    function addCallbackAfterFunctionCall(methodToWrap, callback){
        return function(){
            var result = methodToWrap.apply(this, arguments);
            callback(arguments);
            return result;
        };
    }

    //inject html templates
    injectHtml(GM_getResourceText("timesheetshtml"));

    //inject delegarity scripts
    injectScript(GM_getResourceText("delegaritycorejs"), "delegaritycorejs");
    injectScript(GM_getResourceText("timesheetsjs"), "timesheetsjs");

    // init delegarity when Clarity has loaded and rendered the shell
    requirejs.onResourceLoad = function (context, map, depArray) {
        if('uitk/js/shell' === map.name) {
            clarity.uitk.shell.render = addCallbackAfterFunctionCall(clarity.uitk.shell.render, function(args) {
                // var html = args[0];
                // var res  = args[1];
                var page = args[2];

                if("timeadmin.timesheetBrowser" === page.id) {
                    delegarity.timeadmin.timesheetbrowser();
                }
            });
        }
    };
})();