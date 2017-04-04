"use strict";

// namespace: delegarity
(function(delegarity, $, undefined) {

    // namespace: delegarity.timeadmin
    (function(timeadmin) {

        // private constants
        const ACTION = "timeadmin.timesheetbrowser";
        const TARGET_URL = "https://empower-sso.capgemini.com/niku/nu#action:" + ACTION;
        const LS_KEY_MY_DELEGEES = ACTION + ".myDelegees";
        const WAIT_HEADER = "https://empower-sso.capgemini.com/niku/ui/uitk/images/wait_header.gif"
        var _workspaceElement = null;
        var _handlebars = null;

        // public data members
        timeadmin.resourceNameElement = null;
        timeadmin.uniqueNameElement = null;

        // public: start monitoring when user navigates to timeadmin.timesheetbrowser and enhance it with Delegarity
        timeadmin.timesheetbrowser = function(handlebars) {
            if( document.location.href.toLowerCase().startsWith(TARGET_URL)) {
                _handlebars = handlebars
                delegarity.onClarityReady(injectDelegees, TARGET_URL);
            }
        };           
            
        //private: apply templates and content to delegarity container
        function buildDelegarityWidget(data) {
            var delegarityContainer = document.getElementById("delegarityContainer");

            if( delegarityContainer === null || delegarityContainer === undefined) {
                var filterSection = _workspaceElement.getElementsByClassName("ppm_filter_section")[0];
                var filterTable = filterSection.childNodes[1];
                var mainfilterRow = filterTable.getElementsByTagName("tr")[0];              

                delegarityContainer = mainfilterRow.insertCell(1);
                delegarityContainer.id = "delegarityContainer";
                delegarityContainer.style.verticalAlign = "top";

                mainfilterRow.childNodes[0].width="30%";
                mainfilterRow.childNodes[1].width="20%";
                mainfilterRow.childNodes[2].width="40%";          
            }

            //build table using Handlerbar.js partials and templates
            var delegeesWidget = _handlebars.compile($("#delegee-widget").html());
            _handlebars.registerPartial("delegee", $("#delegee-partial").html());
            delegarityContainer.innerHTML = delegeesWidget(data);

            //register events
            var delegeeRows  = delegarityContainer.getElementsByClassName("delegeeLong");
            for (var index = 0; index < delegeeRows.length; ++index) {

                function getId(imgElement) {
                    return imgElement.parentNode.parentNode.getAttribute("data-delegee");
                }

                var row = delegeeRows[index];
                var filterCell = row.cells[0];
                var actionCell = row.cells[2];

                //auto fills Resource Name
                $(filterCell).children("img[name=selectDelegee]").click(function(){
                    delegarity.timeadmin.resourceNameElement.value=getId(this);
                    delegarity.timeadmin.uniqueNameElement.value="";
                });

                //auto fills Resource Name & submits filter form
                $(filterCell).children("img[name=filterTimesheets]").click(function(){
                    delegarity.timeadmin.resourceNameElement.value=getId(this);
                    delegarity.timeadmin.uniqueNameElement.value="";
                    submitForm('timesheetBrowser.xsl','timeadmin.timesheetBrowser&amp;sortColumn=FULL_NAME&amp;sortDirection=asc&amp;filter_collapsed=false','mode=approve');
                });

                //removes delegee from local storage
                $(actionCell).children("img[name=removeDelegee]").click(function(){
                    var resourceName = getId(this);
                    var data = JSON.parse(localStorage.getItem(LS_KEY_MY_DELEGEES));

                    if(data !== null && data !== undefined)
                    {
                        for(var i = 0; i < data.length; i++) {
                            if (data[i].value === resourceName) {
                                data.splice(i,1);
                                break;
                            }
                        }
                        localStorage.setItem(LS_KEY_MY_DELEGEES, JSON.stringify(data));
                        buildDelegarityWidget(data);                   
                    }
                });

                //navigates to employee details screen
                $(actionCell).children("img[name=viewDelegee]").click(function(){
                    delegarity.timeadmin.resourceNameElement.value=getId(this);
                });
            }
        }

        // private: inject 'My Delegees' widget into timeadmin.timesheetbrowser
        function injectDelegees(workspaceElement)
        {
            _workspaceElement = workspaceElement;
            timeadmin.resourceNameElement = document.getElementsByName("ff_res_name")[0];
            timeadmin.uniqueNameElement = document.getElementsByName("ff_unique_name")[0];

            var data = JSON.parse(localStorage.getItem(LS_KEY_MY_DELEGEES));
            buildDelegarityWidget(data);

            //add "Select my Delegee" image button to ff_res_name
            var resourceNameParent = timeadmin.resourceNameElement.parentNode;
            var selectImage = new Image(16, 16);
            selectImage.src="ui/uitk/images/s.gif"
            selectImage.className = "caui-ndePaginationLast x-icon-btn";
            selectImage.border = 0;
            selectImage.alt = "Select My Delegee";
            selectImage.title = "Select My Delegee";
            selectImage.style.verticalAlign = "middle";
            selectImage.style.marginLeft = "5px";
            selectImage.addEventListener("click", delegarity.timeadmin.selectMyDelegee)
            resourceNameParent.appendChild(selectImage);
            
            //set autocomplete to ff_res_name
            $(timeadmin.resourceNameElement).autocomplete({
                source: function( request, response ) {
                    $.ajax( {
                        url: "https://empower-sso.capgemini.com/niku/odata/GetSuggestionsForLookup",
                        method: "POST",
                        dataType: "json",
                        headers: {
                            Accept: "application/json, text/javascript, */*; q=0.01",
                            "Content-Type": "text/plain"
                        },
                        data: {
                            "LookupType": "LOOKUP_SEC_RESMGR", 
                            "SearchString": request.term, 
                            "ParameterValues": "attributeCode=manager_id:objectCode=:partitionCode=NIKU.ROOT:viewType=filter:"
                        },
                        success: function( data ) {
                            var results = $.map(data.d.lookupSuggestions.results, function(val, idx) {
                                return {
                                    id: val.keyAttribute,
                                    label: val.labelAttribute,
                                    value: val.labelAttribute
                                }
                            });
                            response( results );
                        },
                        error: delegarity.logXhrError
                    } );
                },
                minLength: 2,
                messages: {
                    noResults: '',
                    results: function() {}
                }
            })
        };

        //private: helper function to detect empty strings
        function isEmptyOrSpaces(str){
            return str === null || str.match(/^ *$/) !== null;
        }        

        // public: copy 'resource name' into 'My Delegees' widget
        timeadmin.selectMyDelegee = function () {
            var resourceName = delegarity.timeadmin.resourceNameElement.value;
            
            if(isEmptyOrSpaces(resourceName)) {
                return false;
            }
            
            var data = JSON.parse(localStorage.getItem(LS_KEY_MY_DELEGEES));
            var found = false;            
            var resourceItem = {
                value: resourceName,
                description: resourceName
            };

            if(data === null || data === undefined)
            {
                data = [resourceItem];
                localStorage.setItem(LS_KEY_MY_DELEGEES, JSON.stringify(data));
                buildDelegarityWidget(data);
                return true;
            } else {
                for(var i = 0; i < data.length; i++) {
                    if (data[i].value === resourceName) {
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    data.push(resourceItem);
                    data.sort(function(a,b) {
                        return a.value.localeCompare(b.value)
                    });
                    localStorage.setItem(LS_KEY_MY_DELEGEES, JSON.stringify(data));
                    buildDelegarityWidget(data);
                    return true;
                }
            }
            return false;
        };
        
    })(delegarity.timeadmin = delegarity.timeadmin || {})

})(window.delegarity = window.delegarity || {}, jQuery)