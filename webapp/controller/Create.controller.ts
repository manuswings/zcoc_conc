import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import Base from "./Base.controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Context from "sap/ui/model/Context";
import Model from "sap/ui/model/Model";
import List from "sap/m/List";
import FeedListItem from "sap/m/FeedListItem";
import DateFormat from "sap/ui/core/format/DateFormat";

/**
 * @namespace lam.zcoc_conc.controller
 */
export default class Create extends Base {
    context: Context;
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        Base.prototype.onInit.apply(this);
        //Attaching the handler for pattern matched
        (this?.getOwnerComponent() as UIComponent)?.getRouter().getRoute("RouteCreate")?.attachPatternMatched(this?._onPatternMatched, this);
    }

    //@reason : Pattern Matched Function for the Create Page
    public _onPatternMatched(): void {
        // //Lets set the deferred entitysets
        // (this?.getView()?.getModel() as ODataModel).setChangeGroups({
        //     "MasterType": {
        //         groupId: "to_master"
        //     },            
        //     "CommentType": {
        //         groupId: "to_comment"
        //     },
        // });
        // //Setting this the comments to be submitted only after the submitting of default change
        // (this?.getView()?.getModel() as ODataModel).setDeferredGroups(["changes","to_master","to_comment"]);
        (this?.getView()?.getModel() as ODataModel).setDeferredGroups(["changes"]);


        this.context = ((this?.getView()?.getModel() as ODataModel)?.createEntry("MasterSet", {
            properties: {
                request_no: "10001",
                customer: "Samsung",
                request_status: "In-Draft",
                time_elapsed: "4 days",

                pg_csbg_bd_alignment: "No",             //Default Value
                coc_applicable_quarter: "",
                coc_applicable_year: "",
                commitment_level: "Non-Binding",    //Default Value
                fab_and_geo_region: "",
                process_module: "",
                technology_node: "",
                application: "",
                competitive_benchmark: "",
                conc_needed: "No",             //Default Value
                partfamily_included_conc: "",
                previous_commitment: "",


                submitted_by: "Manu Sebastin",
                date_submitted: new Date(),
                date_requested: null,
                date_completed: null
            }
        })) as Context;
        //Deep Entity
        (this?.getView()?.getModel() as ODataModel)?.createEntry("to_comment", {
            context: this.context,
            properties: {
                request_no: "10001",
                timestamp: "/Date(1466268050000+0000)/",
                text: "Comments are entered here!",
                info: "Requestor",
                description: "Manu Sebastin"
            }
        });
        //Lets bind it to the view
        this?.getView()?.setBindingContext(this.context);
    }
    //@reason : Lets add in a new entry to to_comment
    public handleAddComment(e: any): void {
        let oContext = ((this?.getView()?.getModel() as ODataModel)?.createEntry("to_comment", {
            context: this.context,
            properties: {
                request_no: "10001",
                submitted_timestamp: DateFormat.getDateTimeWithTimezoneInstance({ pattern: "yyyy-MM-ddTHH:mm:ss.SSS", strictParsing: true }).format(new Date()),
                // submitted_timestamp: "/Date(1466268050000+0000)/",                
                submitted_date: DateFormat.getDateTimeWithTimezoneInstance({ pattern: "yyyy-MM-dd", strictParsing: true }).format(new Date()),
                submitted_time: DateFormat.getTimeInstance({pattern:"HHmmss"}).format(new Date()),  
                text: e.getParameter('value'),
                info: "Requestor",
                description: this.currentUserInfo.getFullName()
            }
        }) as Context);
        //Lets create feeditem
        let oFeedListItem = new FeedListItem({
            sender: "{description}",
            // icon: "sap-icon://employee",
            iconDensityAware: false,
            iconDisplayShape:"Square",
	        iconInitials:"DU",
            iconSize:"S",
            info: "{info}",
            timestamp: "{ path : 'submitted_timestamp' , type : 'sap.ui.model.odata.type.DateTimeOffset' ,  formatOptions: { pattern: 'MMMM dd YYYY, h:mm:ss a', UTC: true }, constraints : { displayFormat : 'Date' } }",
            text: "{text}",
            convertLinksToAnchorTags: "All"
        });
        //lets bind the context the the list
        oFeedListItem.setBindingContext(oContext);
        //Add it to the existing list
        (this?.getView()?.byId("CommentsFeed") as List).addItem(oFeedListItem);
    }
}