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
export default class Display extends Base {
    context: Context;
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        Base.prototype.onInit.apply(this);
        //Attaching the handler for pattern matched
        (this?.getOwnerComponent() as UIComponent)?.getRouter().getRoute("RouteDisplay")?.attachPatternMatched(this?.handlePatternMatched, this);
    }
    // # --------------------------------------------------------------------------------- #
    // # Formatter for the request_status
    // # Objective : Lets return the object that the status field expects
    // # --------------------------------------------------------------------------------- #	
    public formatter_request_status(e: any): any {
        switch (e) {
            case "Request Submitted":
                return [{ "state": "Positive", "value": "1" }, { "state": "Positive", "value": "1" }];
                break;
            case "PG Collecting Data":
                return [{ "state": "Positive", "value": "1" }, { "state": "Positive", "value": "1" }];
                break;
            case "Spares Marketing Analysis in Progress":
                return [{ "state": "Positive", "value": "1" }, { "state": "Positive", "value": "1" }];
                break;
            case "BD Review":
                return [{ "state": "Positive", "value": "1" }, { "state": "Positive", "value": "1" }];
                break;
            case "AT Review":
                return [{ "state": "Positive", "value": "1" }, { "state": "Positive", "value": "1" }];
                break;
            case "Completed":
                return [{ "state": "Positive", "value": "1" }, { "state": "Positive", "value": "1" }];
                break;
            default:
                break;
        }
    }

    // # --------------------------------------------------------------------------------- #
    // # Pattern Matched Function for the Display Page
    // # Objective : Lets this function handle the pattern matched
    // # --------------------------------------------------------------------------------- #	
    public handlePatternMatched(e: any): void {
        //Setting all the changes in the view as deferred, so that we can push the changes upon any actions
        (this?.getView()?.getModel() as ODataModel).setDeferredGroups(["changes"]);
        if (e.getParameter('arguments')['request_no']) {
            //Lets bind it to the view
            this?.getView()?.bindElement(`/MasterSet('${e.getParameter('arguments')['request_no']}')`);
        } else {
            //Should tell the user that we are going back to home
            this.handleBackToHome();
        }
    }

    // # --------------------------------------------------------------------------------- #
    // # Lets add in a new entry to to_comment
    // # Objective : Adding the object in context
    // # --------------------------------------------------------------------------------- #	    
    public handleAddComment(e: any): void {
        //Mapping the current context
        this.context = (this?.getView()?.getBindingContext() as Context);
        //Getting the context of the newly added comments
        let oContext = ((this?.getView()?.getModel() as ODataModel)?.createEntry("to_comment", {
            context: this.context,
            properties: {
                request_no: "10001",
                submitted_timestamp: DateFormat.getDateTimeWithTimezoneInstance({ pattern: "yyyy-MM-ddTHH:mm:ss.SSS", strictParsing: true }).format(new Date()),
                // submitted_timestamp: "/Date(1466268050000+0000)/",                
                submitted_date: DateFormat.getDateTimeWithTimezoneInstance({ pattern: "yyyy-MM-dd", strictParsing: true }).format(new Date()),
                submitted_time: DateFormat.getTimeInstance({ pattern: "HHmmss" }).format(new Date()),
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
            iconDisplayShape: "Square",
            iconInitials: "DU",
            iconSize: "S",
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