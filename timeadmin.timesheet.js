"use strict";

// namespace: delegarity
(function(delegarity, $, undefined) {

    // namespace: delegarity.timeadmin
    (function(timeadmin) {

        // private constants
        const ACTION = "timeadmin.timesheetbrowser";
        const TARGET_URL = 'https://empower-sso.capgemini.com/niku/nu#action:' + ACTION;
        const LS_KEY_MY_DELEGEES = ACTION + ".myDelegees";

        // public data members
        timeadmin.resourceNameElement = null;

        // public: start monitoring when user navigates to timeadmin.timesheetbrowser and enhance it with Delegarity
        timeadmin.timesheetbrowser = function() {
            if( document.location.href.toLowerCase().startsWith(TARGET_URL)) {
                delegarity.onClarityReady(injectDelegees, TARGET_URL);
            }
        };

        // private: inject 'delegees' widget into timeadmin.timesheetbrowser
        function injectDelegees(workspaceElement)
        {
            var filterSection = workspaceElement.getElementsByClassName("ppm_filter_section")[0];
            var filterTable = filterSection.childNodes[1];
            var mainfilterRow = filterTable.getElementsByTagName("tr")[0];
            var delegarityCell = mainfilterRow.insertCell(1);

            mainfilterRow.childNodes[0].width="30%";
            mainfilterRow.childNodes[1].width="20%";
            mainfilterRow.childNodes[2].width="40%";

            delegarity.resourceNameElement = document.getElementsByName("ff_res_name")[0];

            var data = JSON.parse(localStorage.getItem(LS_KEY_MY_DELEGEES));

            var options = {
                "delegeesOptions":delegarity.useTemplatebyId("delegeesSelectOptions-template", data)
            }
            delegarityCell.innerHTML = delegarity.useTemplatebyId("delegeesSelect-template", options);

            //sync dropdown with actual value in 
            debugger;

            var val = (delegarity.resourceNameElement.value).trim();
            var selectElement = document.getElementById("delegarity-delegees");
            var opts = selectElement.options;
            for(var opt, j = 0; opt = opts[j]; j++) {
                if(opt.value == val) {
                    selectElement.selectedIndex = j;
                    break;
                }
            }
        }

    })(delegarity.timeadmin = delegarity.timeadmin || {})

})(window.delegarity = window.delegarity || {}, jQuery)