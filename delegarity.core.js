"use strict";

// namespace: delegarity
(function(delegarity, $, undefined) {

    //Polls until Clarity Workspace is loaded and then fires the callback
    delegarity.onClarityReady = function(callback, timesheetsUrl) {

        var workspace = document.getElementById("ppm_workspace");

        if(workspace) {
            if(document.location.href.toLowerCase().startsWith(timesheetsUrl)) {
                callback(workspace);
            }
        }
        else {
            window.setTimeout(function() {
                delegarity.onClarityReady(callback, timesheetsUrl);
            }, 500)
        }
    }; 

    // Creates HTML based on adding data to the provided HTML template
    delegarity.useTemplatebyId = function(templateId, data) {
        var template = document.getElementById(templateId).innerHTML;
        return delegarity.useTemplateByElement(template, data);
    }

    // Creates HTML based on adding data to the provided HTML template
    delegarity.useTemplateByElement = function(template, data) {

        if( template === null ||template === undefined)
            throw "Cannot find template " + templateId;

        // Replace the {{XXX}} with the corresponding property
        function replaceWithData(data_bit) {
            var html_snippet, prop, regex;
            for (prop in data_bit) {
                regex = new RegExp('{{' + prop + '}}', 'ig');
                html_snippet = (html_snippet || template).replace(regex, data_bit[prop]);
            }
            return html_snippet;
        }

        var html = '';
        
        if( Array.isArray(data) ) {
            // Go through each element in the array and add the properties to the template
            for (var i = 0; i < data.length; i++) {
                html += replaceWithData(data[i]);
            }
        } else {
            html = replaceWithData(data);
        }
        return html;   
    }

})(window.delegarity = window.delegarity || {}, jQuery)