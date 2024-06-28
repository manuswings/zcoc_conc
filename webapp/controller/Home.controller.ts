import Controller from "sap/ui/core/mvc/Controller";
import Base from "./Base.controller";
import Event from "sap/ui/base/Event";
import SmartFilterBar from "sap/ui/comp/smartfilterbar/SmartFilterBar";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";

/**
 * @namespace lam.zcoc_conc.controller
 */
export default class Home extends Base {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        Base.prototype.onInit.apply(this);
    }
    // # --------------------------------------------------------------------------------- #
    // # On selection of create request in the home page
    // # Objective : Lets navigate to the detail page
    // # --------------------------------------------------------------------------------- #	
    public fnOnPressNewRequest(): void {
        //Lets add in the logic for the navigation to the details page
        this.Router.navTo("RouteCreate");

    }
    // # --------------------------------------------------------------------------------- #
    // # On change of filter in the home page
    // # Objective : Lets make some filters as contains
    // # --------------------------------------------------------------------------------- #	
    public fnOnFilterChange(e: Event): void {
        interface FilteredData {
            items: Array<any> | undefined;
            ranges: Array<any> | undefined
        }
        let oFilterData: any = (e.getSource() as SmartFilterBar).getFilterData();
        // lets make all the filter as contains
        // In order to do that lets transverse the strtucture
        for (var prop in oFilterData) {
            //if the items is available then lets clear the range
            if (((oFilterData[prop] as FilteredData)?.items?.length)) {
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