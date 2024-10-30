import Controller from "sap/ui/core/mvc/Controller";
import Base from "./Base.controller";
import Event from "sap/ui/base/Event";
import SmartFilterBar from "sap/ui/comp/smartfilterbar/SmartFilterBar";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";
import Parameters from "sap/ui/core/theming/Parameters";

/**
 * @namespace lam.zcoc.controller
 */
export default class Home extends Base {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        Base.prototype.onInit.apply(this);
    }
    // # --------------------------------------------------------------------------------- #
    // # On before binding the smart table
    // # Objective : Lets handle the dataset before the binding
    // # --------------------------------------------------------------------------------- #	
    public handleOnBeforeRebindTable(e:any): void {
    }    
    // # --------------------------------------------------------------------------------- #
    // # On press of create request in the home page
    // # Objective : Lets navigate to the create page
    // # --------------------------------------------------------------------------------- #	
    public handlePressNewRequest(): void {
        //Lets add in the logic for the navigation to the details page
        this.Router.navTo("RouteCreate");

    }
    // # --------------------------------------------------------------------------------- #
    // # On selection of records in the home page
    // # Objective : Lets navigate to the display page
    // # --------------------------------------------------------------------------------- #	
    public handleSelectionChangeMasterTable(e:any): void {
        if (e.getParameter("listItem").getBindingContext().getProperty("request_no")) {
            //Lets add in the logic for the navigation to the display page
            this.Router.navTo("RouteDisplay",{"request_no":e.getParameter("listItem").getBindingContext().getProperty("request_no")});
        } else {
            //Lets notify the user

        }
    }    
    // # --------------------------------------------------------------------------------- #
    // # On change of filter in the home page
    // # Objective : Lets make some filters as contains
    // # --------------------------------------------------------------------------------- #	
    public handleFilterChange(e: Event): void {
        interface FilteredData {
            items: Array<any> | undefined;
            ranges: Array<any> | undefined
        }
        let oFilterData: any = (e.getSource() as SmartFilterBar).getFilterData();
        // lets make all the filter as contains
        // In order to do that lets transverse the strtucture
        for (var prop in oFilterData) {
            //if the items is available then lets clear the range
            
            if (((oFilterData[prop] as FilteredData)?.items?.length)
            //Issue with dropdown values in the filters, temp fix
            || ( ( prop === 'process_module' || prop === 'technology_node' ) && ((oFilterData[prop] as FilteredData)?.items?.length) == 0 && (oFilterData[prop] as FilteredData).ranges )
            ) {
                (oFilterData[prop] as FilteredData).ranges = [];
            }
            //lets fill the ranges from the item
            (oFilterData[prop] as FilteredData)?.items?.forEach(function (y: any) {
                oFilterData[prop]['ranges'].push(
                    {
                        "exclude": false,
                        "operation": "Contains",
                        "keyField": prop,
                        "value1": y.key,
                        "value2": null,
                        "tokenText": `*${y.key}*`
                    }
                );
            });
            // lets update all the ranges content to contains
            oFilterData[prop]?.ranges?.forEach(function (y: any) {
                y.operation = "Contains";
            });
        }
        //Lets update the filtered data
        (e.getSource() as SmartFilterBar).setFilterData(oFilterData, true);

        // if (oFilterData && oFilterData.technology_node && oFilterData.technology_node.items) {
        //     //Lets clear the ranges
        //     oFilterData.technology_node.ranges=[];
        //     //Lets update it from items to the range
        // oFilterData.technology_node.items.forEach(function (y) {
        //     oFilterData.technology_node.ranges.push(
        //         {
        //             "exclude": false,
        //             "operation": "Contains",
        //             "keyField": "technology_node",
        //             "value1": y.key,
        //             "value2": null,
        //             "tokenText": `*${y.key}*`
        //         }
        //     );

        // });
        //     //Lets remove the existing items
        //     // oFilterData.technician_involved.items=[];
        //     //Lets update
        //     (e.getSource() as SmartFilterBar).setFilterData(oFilterData,true);					
        // }
    }
}