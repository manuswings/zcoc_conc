import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import Base from "./Base.controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Context from "sap/ui/model/Context";

/**
 * @namespace lam.zcoc_conc.controller
 */
export default class Create extends Base {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        Base.prototype.onInit.apply(this);
        //Attaching the handler for pattern matched
        (this?.getOwnerComponent() as UIComponent)?.getRouter().getRoute("RouteCreate")?.attachPatternMatched(this?._onPatternMatched, this);
    }
    /**
     * @description Pattern Matched Function for the Create Page
     */
    public _onPatternMatched(): void {
        this?.getView()?.setBindingContext(((this?.getView()?.getModel() as ODataModel)?.createEntry("MasterSet", {

            properties:{
                request_no                  : "",
                customer                    : "Samsung",
                request_status              : "In-Draft",
                time_elapsed                : "4 days",

                pg_csbg_bd_alignment        : "No",             //Default Value
                coc_applicable_quarter      : "",
                coc_applicable_year         : "",
                commitment_level            : "Non-Binding",    //Default Value
                fab_and_geo_region          : "",
                process_module              : "",
                technology_node             : "",
                application                 : "",
                competitive_benchmark       : "",
                conc_needed                 : "No",             //Default Value
                partfamily_included_conc    : "",
                previous_commitment         : "",
                
            
                submitted_by                : "Manu Sebastin",
                date_submitted              : new Date(),
                date_requested              : null,
                date_completed              : null,

            }
        })) as Context);
    }
}