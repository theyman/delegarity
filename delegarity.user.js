// ==UserScript==
// @name         Delegarity
// @namespace    https://github.com/theyman/delegarity
// @version      0.2
// @description  Add list of delegees to Clarity Timesheets search criteria
// @author       Bart Jolling
// @match        https://empower-sso.capgemini.com/niku/nu
// @require      https://raw.githubusercontent.com/theyman/injectsome/master/inject-some.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.6/handlebars.min.js
// @resource     delegaritycss    delegarity.css
// @resource     delegaritycorejs delegarity.core.js
// @resource     timesheetsjs     timeadmin.timesheet.js
// @resource     timesheetshtml   timeadmin.timesheet.html
// @run-at       document-idle
// @grant        GM_getResourceText
// ==/UserScript==

/**
 *Main function to inject @resources into the target page
 */
(function() {
    'use strict';

    /**
     * executes a callback after performing the call to notifyOnFunction 
     * @param {*} notifyOnFunction - redefines this function so that the callback is executed when it is finished
     * @param {*} callback - function will be called once notifyOnFunction has finished
     */
    function addCallbackAfterFunctionCall(notifyOnFunction, callback){
        return function(){
            var result = notifyOnFunction.apply(this, arguments);
            callback(arguments);
            return result;
        };
    }

    //inject css and html templates
    injectsome.content.css(GM_getResourceText("delegaritycss", "delegaritycss"));
    injectsome.content.html(GM_getResourceText("timesheetshtml"));

    //inject delegarity scripts
    injectsome.content.script(GM_getResourceText("delegaritycorejs"), "delegaritycorejs");
    injectsome.content.script(GM_getResourceText("timesheetsjs"), "timesheetsjs");

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
