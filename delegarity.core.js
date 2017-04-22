"use strict";

/**
 * namespace: delegarity
 */
(function(delegarity, $, undefined) {

    /**
     * Polls until the Clarity Workspace is loaded and then fires the callback 
     * @param {function} callback - function to call once the workspace is ready.
     * @param {string} url - only calls back if the loaded document matches the url. Case-insensitive.
     */
    delegarity.onClarityReady = function(callback, url) {

        var workspace = document.getElementById("ppm_workspace");

        if(workspace) {
            if(document.location.href.toLowerCase().startsWith(url)) {
                callback(workspace);
            }
        }
        else {
            window.setTimeout(function() {
                delegarity.onClarityReady(callback, url);
            }, 500)
        }
    };

    /**
     * Helper function to log more detail when ajax request fails
     */
    delegarity.logXhrError = function (jqXHR, exception) {
        var msg = '';

        if (jqXHR.status === 0) {
            msg = 'Not connected. Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }

        console.log("[delegarity] jQuery XHR Exception. Status: " + jqXHR.status + ". Exception: " + exception + ". Information: " + msg);
    }

})(window.delegarity = window.delegarity || {}, jQuery)