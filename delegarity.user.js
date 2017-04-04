// ==UserScript==
// @name         Delegarity
// @namespace    https://github.com/BartJolling/delegarity
// @version      0.1
// @description  Add list of delegees to Clarity Timesheets search criteria
// @author       Bart Jolling
// @match        https://empower-sso.capgemini.com/niku/nu
// @require      https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.6/handlebars.min.js
// @resource     delegaritycorejs delegarity.core.js
// @resource     timesheetsjs     timeadmin.timesheet.js
// @resource     timesheetshtml   timeadmin.timesheet.html
// @run-at       document-idle
// @grant        GM_getResourceText
// ==/UserScript==


/**
 * Injects a link to a javascript file in the HEAD of a document.
 * @param {string} url - location of the javascript file to inject.
 * */
function injectScriptLink(url, mimetype) {
    var scriptElement = document.createElement('script');
    scriptElement.setAttribute("type", mimetype);
    scriptElement.setAttribute("src", url);

    if (typeof scriptElement != "undefined")
        document.getElementsByTagName("head")[0].appendChild(scriptElement);
}

/**
 * Injects a link to a stylesheet in the HEAD of a document.
 * @param {string} url - location of the javascript file to inject.
 * */
function injectLinkStylesheet(url, mimetype) {
    var linkElement = document.createElement("link");
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", mimetype);
    linkElement.setAttribute("href", url);

    if (typeof linkElement != "undefined")
        document.getElementsByTagName("head")[0].appendChild(linkElement);
}

/**
 * Injects a block of javascript into a new script tag in the HEAD of a document.
 * @param {string} jsContent - javascript code to inject.
 * @param {string} scriptId - Id of the script tag that will be injected.
 * */
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

/**
 * Appends a block of HTML to the body tag
 * @param {string} htmlContent - HTML to inject.
 * */
function injectHtml(htmlContent) {

    var div = document.createElement('div');
    div.innerHTML = htmlContent;

    while (div.children.length > 0) {
         document.body.appendChild(div.children[0]);
    }
}

/**
 *Main function to inject @resources into the target page
 * */
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
                    delegarity.timeadmin.timesheetbrowser(Handlebars);
                }
            });
        }
    };
})();