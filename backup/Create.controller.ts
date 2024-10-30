import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import Base from "../controller/Base.controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Context from "sap/ui/model/Context";
import Model from "sap/ui/model/Model";
import List from "sap/m/List";
import FeedListItem from "sap/m/FeedListItem";
import DateFormat from "sap/ui/core/format/DateFormat";
import Event from "sap/ui/base/Event";

/**
 * @namespace lam.zcoc.controller
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
        (this?.getView()?.getModel() as ODataModel).setDeferredGroups(["changes"]);


        this.context = ((this?.getView()?.getModel() as ODataModel)?.createEntry("/ZCOC_DV", {
            properties: {                
                // request_no: "Draft Request",
                customer: "Samsung",
                request_status: "0001",
                pg_csbg_bd_alignment: false,    //Default Value
                applicable_quarter: "",
                applicable_year: "",
                commitment_level: false,        //Default Value
                competitive_benchmark: "",
                conc_needed: false,             //Default Value
                conc_partfamilies: "",
                previous_commitment: "",
                previous_request_reference:"",
                lam_cost_coc:"0.0",
                lam_cost_coc_unit:"0.0",
                customer_price_coc:"0.0",
                customer_price_coc_unit:"",
                submitted_by: "",
                date_submitted: new Date(),
                date_requested: new Date(),
                date_completed: new Date()
            }
        })) as Context;
        // //Deep Entity
        // (this?.getView()?.getModel() as ODataModel)?.createEntry("to_cmt", {
        //     context: this.context,
        // });
        // (this?.getView()?.getModel() as ODataModel)?.createEntry("to_fg", {
        //     context: this.context
        // });   
        // (this?.getView()?.getModel() as ODataModel)?.createEntry("to_ap", {
        //     context: this.context
        // });             
        //Lets bind it to the view
        this?.getView()?.setBindingContext(this.context);
    }
    //@reason : Lets add in a new entry to to_cmt
    public handleAddComment(e: any): void {
        let oContext = ((this?.getView()?.getModel() as ODataModel)?.createEntry("to_cmt", {
            context: this.context,
            properties: {
                request_no: "",                             
                creation_date : new Date(),
                creation_time : new Date().getTime().toString,
                created_by    : this.currentUserInfo.getId(),
                comments      : e.getParameter('value')
            }
        }) as Context);
        //Lets create feeditem
        let oFeedListItem = new FeedListItem({
            sender: this.currentUserInfo.getFullName(),
            icon: "sap-icon://employee",
            iconDensityAware: false,
            iconDisplayShape:"Square",
	        // iconInitials:this.currentUserInfo.getId(),
            iconSize:"S",
            info: "{created_by}",
            // timestamp: "{ path : 'submitted_timestamp' , type : 'sap.ui.model.odata.type.DateTimeOffset' ,  formatOptions: { pattern: 'MMMM dd YYYY, h:mm:ss a', UTC: true }, constraints : { displayFormat : 'Date' } }",
            timestamp: "{ path : 'creation_date' , type : 'sap.ui.model.odata.type.DateTimeOffset' ,  formatOptions: { pattern: 'MMMM dd YYYY, h:mm:ss a', UTC: true }, constraints : { displayFormat : 'Date' } }",
            text: "{comments}",
            convertLinksToAnchorTags: "All"
        });
        //lets bind the context the the list
        oFeedListItem.setBindingContext(oContext);
        //Add it to the existing list
        (this?.getView()?.byId("CreateCommentsFeed") as List).addItem(oFeedListItem);
    }
    // # --------------------------------------------------------------------------------- #
    // # On action of submit button
    // # Objective : Lets handle the submit button action here
    // # --------------------------------------------------------------------------------- #	
    public handleOnSubmit(e:any): void {
        (this.getView()?.getBindingContext()?.getModel() as ODataModel).submitChanges();
    }   

    // # --------------------------------------------------------------------------------- #
    // # On selection change of FG
    // # Objective : Lets handle the token selection change in FG
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangeFG(e:any): void {
        if(!e.getParameter("selected")){
            //When the selection is unchecked then lets remove it from the odatamodel
            for (let key in e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()) {
                if (e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges().hasOwnProperty(key) && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key].hasOwnProperty("fab_geo_reg") && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key]["fab_geo_reg"] === e.getParameter('changedItem').getBindingContext().getObject()['fab_geo_reg']) {
                        //Removing the value from the odata pending changes
                        // (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).resetChanges([key],false,false);
                        // @ts-ignore
                        delete (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).mChangedEntities[key];
                        
                }
              }
        }else{
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_fg", {
                properties: {   
                    request_no : e.getParameter('changedItem').getBindingContext().getObject()['request_no'],             
                    fab_geo_reg : e.getParameter('changedItem').getBindingContext().getObject()['fab_geo_reg']
                },            
                context: this.context
            });              
        }     
    }      

    // # --------------------------------------------------------------------------------- #
    // # Formatter for boolean
    // # Objective : Formatter to turn the boolean value into string
    // # --------------------------------------------------------------------------------- #	    
    public formatter_boolean(e:any){
        return e? e.toString(): false;
    }
    // # --------------------------------------------------------------------------------- #
    // # On selection change of PM
    // # Objective : Lets handle the token selection change in PM
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangePM(e:any): void {
        if(!e.getParameter("selected")){
            //When the selection is unchecked then lets remove it from the odatamodel
            for (let key in e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()) {
                if (e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges().hasOwnProperty(key) && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key].hasOwnProperty("process_module") && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key]["process_module"] === e.getParameter('changedItem').getBindingContext().getObject()['process_module']) {
                        //Removing the value from the odata pending changes
                        // (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).resetChanges([key],false,false);
                        // @ts-ignore
                        delete (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).mChangedEntities[key];
                        
                }
              }
        }else{
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_pm", {
                properties: {   
                    request_no : e.getParameter('changedItem').getBindingContext().getObject()['request_no'],             
                    process_module : e.getParameter('changedItem').getBindingContext().getObject()['process_module']
                },            
                context: this.context
            });              
        }       
    }     

    // # --------------------------------------------------------------------------------- #
    // # On selection change of TN
    // # Objective : Lets handle the token selection change in TN
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangeTN(e:any): void {
        if(!e.getParameter("selected")){
            //When the selection is unchecked then lets remove it from the odatamodel
            for (let key in e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()) {
                if (e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges().hasOwnProperty(key) && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key].hasOwnProperty("technology_node") && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key]["technology_node"] === e.getParameter('changedItem').getBindingContext().getObject()['technology_node']) {
                        //Removing the value from the odata pending changes
                        // (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).resetChanges([key],false,false);
                        // @ts-ignore
                        delete (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).mChangedEntities[key];
                        
                }
              }
        }else{
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_tn", {
                properties: {   
                    request_no : e.getParameter('changedItem').getBindingContext().getObject()['request_no'],             
                    technology_node : e.getParameter('changedItem').getBindingContext().getObject()['technology_node']
                },            
                context: this.context
            });              
        }        
    }    
    
    // # --------------------------------------------------------------------------------- #
    // # On selection change of AP
    // # Objective : Lets handle the token selection change in AP
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangeAP(e:Event): void {
        if(!e.getParameter("selected")){
            //When the selection is unchecked then lets remove it from the odatamodel
            for (let key in e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()) {
                if (e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges().hasOwnProperty(key) && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key].hasOwnProperty("application") && 
                    e.getParameters().changedItem.getBindingContext().getModel().getPendingChanges()[key]["application"] === e.getParameter('changedItem').getBindingContext().getObject()['application']) {
                        //Removing the value from the odata pending changes
                        // (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).resetChanges([key],false,false);
                        // @ts-ignore
                        delete (e.getParameter("changedItem").getBindingContext().getModel() as ODataModel).mChangedEntities[key];
                        
                }
              }
        }else{
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_ap", {
                properties: {   
                    request_no : e.getParameter('changedItem').getBindingContext().getObject()['request_no'],             
                    application : e.getParameter('changedItem').getBindingContext().getObject()['application']
                },            
                context: this.context
            });              
        }
    }     
}