import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import Base from "./Base.controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Context from "sap/ui/model/Context";
import Model from "sap/ui/model/Model";
import List from "sap/m/List";
import FeedListItem from "sap/m/FeedListItem";
import DateFormat from "sap/ui/core/format/DateFormat";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import Dialog from "sap/m/Dialog";
import { ButtonType, DialogType, URLHelper } from "sap/m/library";
import Button from "sap/m/Button";
import MessageToast from "sap/m/MessageToast";
import DetailPage from "sap/m/semantic/DetailPage";
import Text from "sap/m/Text";
import ContextBinding from "sap/ui/model/ContextBinding";
import UploadCollectionParameter from "sap/m/UploadCollectionParameter";
import UploadSetItem from "sap/m/upload/UploadSetItem";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import UploadCollection from "sap/m/UploadCollection";
import UploadCollectionItem from "sap/m/UploadCollectionItem";

/**
 * @namespace lam.zcoc.controller
 */
export default class Detail extends Base {
    context: Context;
    view: {
        mode: ""
    }
    oSubmitDialog: any;
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        Base.prototype.onInit.apply(this);
        //Attaching the handler for pattern matched
        (this?.getOwnerComponent() as UIComponent)?.getRouter().getRoute("RouteCreate")?.attachPatternMatched(this?._onPatternMatched, this);
        (this?.getOwnerComponent() as UIComponent)?.getRouter().getRoute("RouteDisplay")?.attachPatternMatched(this?._onPatternMatched, this);
        //Default values in this view  

    }

    //@reason : Pattern Matched Function for the Create Page
    public _onPatternMatched(e: any): void {
        //Lets unbind element
        // @ts-ignore
        this.getView()?.unbindElement();
        //Lets bind the default view model to this
        this.getView()?.setModel(new JSONModel(this.view), "view");
        (this?.getView()?.getModel() as ODataModel).setDeferredGroups(["changes"]);

        //lets check if the user has creating an request or viewing an request
        //only way to find it is with the parameters
        if (e.getParameter('name') === "RouteCreate") {
            //Busy On
            this.BusyDialog.setText('Preparing Request Details... Please Wait...');
            this.BusyDialog.open();
            //Setting up the view as create
            (this.getView()?.getModel("view") as JSONModel).setProperty("/mode", "create");
            //Creating an Entry
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
                    previous_request_reference: "",
                    lam_cost_coc: "0.0",
                    lam_cost_coc_unit: "0.0",
                    customer_price_coc: "0.0",
                    customer_price_coc_unit: "",
                    submitted_by: "",
                    date_submitted: new Date(),
                    date_requested: new Date(),
                    date_completed: new Date()
                }
            })) as Context;
            //Lets bind it to the view
            this?.getView()?.setBindingContext(this.context);
            //Busy off
            this?.BusyDialog.close();
        } else if (e.getParameter('name') === "RouteDisplay") {
            //Setting up the view as display
            (this.getView()?.getModel("view") as JSONModel).setProperty("/mode", "display");
            //lets bind the view to the respective path    
            this?.getView()?.bindElement({
                path: `/ZCOC_DV('${e.getParameter('arguments')['request_no']}')`,
                parameters: {
                    // expand: "to_apr"
                },
                events: {
                    change: function (oEvent: Event) {

                    },
                    dataRequested: function (this: Detail) {
                        //Busy On
                        this.BusyDialog.setText('Fetching Request Details... Please Wait...');
                        this.BusyDialog.open();
                    }.bind(this),
                    dataReceived: function (this: Detail) {
                        //Busy OFF
                        this.BusyDialog.close();
                    }.bind(this)
                }
            });
            //Updating the binding context
            this.context = (this.getView()?.getBindingContext() as Context);
            //Busy On
            this.BusyDialog.setText('Fetching Attachmente Details... Please Wait...');
            this.BusyDialog.open();
            //Filtering the attachment                    
            (this.getView()?.byId("DetailUploadCollection")?.getBinding('items') as ODataListBinding).filter(
                [
                    new Filter("FileKey", FilterOperator.EQ, e.getParameter('arguments')['request_no'])
                ]
            );
            // this.getView()?.byId("DetailUploadCollection")?.bindAggregation('items',{
            //     path: '/AttachmentSet',
            //     filters : [
            //         new Filter("FileKey", FilterOperator.EQ, e.getParameter('arguments')['request_no'])
            //     ],
            //     //@ts-ignore
            //     template: this.getView()?.byId("DetailUploadCollection")?.getBindingInfo("items").template
            // });            
            //Lets turn off the busy
            this?.BusyDialog.close();
        }

    }
    //@reason : Lets add in a new entry to to_cmt
    public handleAddComment(e: any): void {
        //Updating the binding context
        this.context = (this.getView()?.getBindingContext() as Context);
        //Creating an entry in the comments entityset with the binding context
        let oContext = ((this?.getView()?.getModel() as ODataModel)?.createEntry("to_cmt", {
            context: this.context,
            properties: {
                request_no: "",
                creation_date: new Date(),
                creation_time: new Date().getTime().toString,
                created_by: this.currentUserInfo.getId(),
                comments: e.getParameter('value')
            }
        }) as Context);
        //Lets create feeditem
        let oFeedListItem = new FeedListItem({
            sender: this.currentUserInfo.getFullName(),
            icon: "sap-icon://employee",
            iconDensityAware: false,
            iconDisplayShape: "Square",
            // iconInitials:this.currentUserInfo.getId(),
            iconSize: "S",
            info: "{created_by}",
            // timestamp: "{ path : 'submitted_timestamp' , type : 'sap.ui.model.odata.type.DateTimeOffset' ,  formatOptions: { pattern: 'MMMM dd YYYY, h:mm:ss a', UTC: true }, constraints : { displayFormat : 'Date' } }",
            timestamp: "{ path : 'creation_date' , type : 'sap.ui.model.odata.type.DateTimeOffset' ,  formatOptions: { pattern: 'MMMM dd YYYY, h:mm:ss a', UTC: true }, constraints : { displayFormat : 'Date' } }",
            text: "{comments}",
            convertLinksToAnchorTags: "All"
        });
        //lets bind the context the the list
        oFeedListItem.setBindingContext(oContext);
        //Add it to the existing list
        (this?.getView()?.byId("DetailCommentsFeed") as List).addItem(oFeedListItem);
    }
    // # --------------------------------------------------------------------------------- #
    // # On action of reject button
    // # Objective : Lets handle the reject button action here
    // # --------------------------------------------------------------------------------- #	    
    public handleOnApprove(e:any):void{
        var sPath = this.getView()?.getBindingContext()?.getPath();
        (this.getView()?.getBindingContext()?.getModel() as ODataModel).setProperty(`${sPath}/user_action`,'approved');
        (this.getView()?.getBindingContext()?.getModel() as ODataModel).submitChanges({
            success: function (this: Detail, Event: Object) {
                debugger;
            }.bind(this),
            error: (Event: any) => {
                MessageBox.error(Event.toString());                
            }
        });
    }
    // # --------------------------------------------------------------------------------- #
    // # On action of reject button
    // # Objective : Lets handle the reject button action here
    // # --------------------------------------------------------------------------------- #	    
    public handleOnReject(e:any):void{
        var sPath = this.getView()?.getBindingContext()?.getPath();
        (this.getView()?.getBindingContext()?.getModel() as ODataModel).setProperty(`${sPath}/user_action`,'rejected');
        (this.getView()?.getBindingContext()?.getModel() as ODataModel).submitChanges({
            success: function (this: Detail, Event: Object) {
                debugger;
            }.bind(this),
            error: (Event: any) => {
                MessageBox.error(Event.toString());                
            }
        });
    }    
    // # --------------------------------------------------------------------------------- #
    // # On action of submit button
    // # Objective : Lets handle the submit button action here
    // # --------------------------------------------------------------------------------- #	
    public handleOnSubmit(e: any): void {
        //Busy On
        this.BusyDialog.setText('Submitting Request... Please Wait...');
        this.BusyDialog.open();
        (this.getView()?.getBindingContext()?.getModel() as ODataModel).submitChanges({
            success: function (this: Detail, Event: Object) {
                //Upload Collection
                (this.getView()?.byId("DetailUploadCollection") as UploadCollection).upload();
                try {
                    // @ts-ignore: Unreachable code error
                    if (Event.__batchResponses[0]['__changeResponses'][0]['data'].request_no) {
                        //Lets tell the user that the action is success and then lets move to the display page
                        if (!(this.oSubmitDialog)) {
                            this.oSubmitDialog = new Dialog({
                                type: "Message",
                                title: "Success",
                                content: [
                                    new Text({
                                        text: 'Request successfully created.'
                                    })
                                ],
                                beginButton: new Button({
                                    type: "Emphasized",
                                    icon: "sap-icon://detail-view",
                                    text: "Ok",
                                    press: function (this: Detail) {
                                        //Lets close the dialog
                                        this.oSubmitDialog.close();
                                        // @ts-ignore: Unreachable code error
                                        this?.getView()?.getController().getOwnerComponent().getRouter().navTo("RouteDisplay", { "request_no": Event.__batchResponses[0]['__changeResponses'][0]['data'].request_no });

                                    }.bind(this)
                                }),
                                endButton: new Button({
                                    text: "Home",
                                    icon: "sap-icon://home",
                                    press: function (this: Detail) {
                                        // @ts-ignore: Unreachable code error
                                        this?.getView()?.getController().getOwnerComponent().getRouter().navTo("RouteHome");
                                    }.bind(this)
                                })
                            });
                        }
                        //Opening the dialog box
                        this.oSubmitDialog.open();
                    }
                } catch (error) {
                    // @ts-ignore: Unreachable code error
                    this?.getView()?.getController().BusyDialog.close();
                }
            }.bind(this),
            error: (Event: any) => {
                MessageBox.error(Event.toString());   
            }
        });
    }
    public handleOnRequestStatus(e: any): number {
        return parseInt(e);
    }
    // # --------------------------------------------------------------------------------- #
    // # On selection change of FG
    // # Objective : Lets handle the token selection change in FG
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangeFG(e: any): void {
        if (!e.getParameter("selected")) {
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
        } else {
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_fg", {
                properties: {
                    request_no: e.getParameter('changedItem').getBindingContext().getObject()['request_no'],
                    fab_geo_reg: e.getParameter('changedItem').getBindingContext().getObject()['fab_geo_reg']
                },
                context: this.context
            });
        }
    }

    // # --------------------------------------------------------------------------------- #
    // # Formatter for boolean
    // # Objective : Formatter to turn the boolean value into string
    // # --------------------------------------------------------------------------------- #	    
    public formatter_boolean(e: any) {
        return e ? e.toString() : false;
    }
    // # --------------------------------------------------------------------------------- #
    // # On selection change of PM
    // # Objective : Lets handle the token selection change in PM
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangePM(e: any): void {
        if (!e.getParameter("selected")) {
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
        } else {
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_pm", {
                properties: {
                    request_no: e.getParameter('changedItem').getBindingContext().getObject()['request_no'],
                    process_module: e.getParameter('changedItem').getBindingContext().getObject()['process_module']
                },
                context: this.context
            });
        }
    }
    // # --------------------------------------------------------------------------------- #
    // # On download file
    // # Objective : Lets handle the download operation from the upload collection
    // # --------------------------------------------------------------------------------- #    
    public handleUploadCollectionItemOnDownloadFile(oEvent: Event): void {
        var Url = (oEvent.getSource() as UploadCollectionItem).getFileName();
        if (Url.indexOf("https://") > -1) {
            //@ts-ignore
            var URLHelper = URLHelper;
            URLHelper.redirect(Url, true);
        } else {
            (oEvent.getSource() as UploadCollectionItem).download(true);
        }
    }
    // # --------------------------------------------------------------------------------- #
    // # On upload change
    // # Objective : Lets handle the change operation here for the upload collection
    // # --------------------------------------------------------------------------------- #	    
    public handleUploadCollectionOnChange(oEvent: Event): void {
        var oView = this?.getView();
        var oModel = (oView?.getModel() as ODataModel);
        (oModel as ODataModel)?.refreshSecurityToken();
        var oHeaders = (oModel?.getHeaders() as object);
        //@ts-ignore
        var sToken = oHeaders['x-csrf-token'];
        var oUploadCollection = (oEvent.getSource() as UploadCollection);
        var oCustomerHeaderToken = new UploadCollectionParameter({
            name: "x-csrf-token",
            value: sToken
        });
        if (oEvent.getParameter("mParameters").newValue) {
            var oFilename = oEvent.getParameter("mParameters").newValue;
        } else if (oEvent.getParameter("mParameters").files[0].name) {
            oFilename = oEvent.getParameter("mParameters").files[0].name;
        }
        //@ts-ignore
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        if (oFilename.length > 44) {
            MessageBox.warning("File name of the attached item is more than 44 characters.File name will be truncated while saving.");
        }
    }
    // # --------------------------------------------------------------------------------- #
    // # On before upload start
    // # Objective : Lets handle it before of upload start
    // # --------------------------------------------------------------------------------- #    
    public handleUploadCollectionOnBeforeUploadStart(oEvent: Event): void {
        // Header Slug
        //@ts-ignore
        var requestId = this.getView()?.getBindingContext()?.getObject().request_no;
        var oCustomerHeaderSlug = new UploadCollectionParameter({
            name: "slug",
            value: requestId + "/" + oEvent.getParameter("fileName")
        });
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
    }
    // # --------------------------------------------------------------------------------- #
    // # On upload complete
    // # Objective : Lets handle the complete operation here for the upload collection
    // # --------------------------------------------------------------------------------- #	
    public handleUploadCollectionOnUploadComplete(oEvent: Event): void {
        var oView = this.getView();
        //@ts-ignore
        oView.getModel().refresh();
        var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
        var oUploadCollection = (oEvent.getSource() as UploadCollection);
        for (var i = 0; i < oUploadCollection.getItems().length; i++) {
            if ((oUploadCollection.getItems()[i] as UploadCollectionItem).getFileName() === sUploadedFileName) {
                oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
                break;
            }
        }
    }
    // # --------------------------------------------------------------------------------- #
    // # On selection change of TN
    // # Objective : Lets handle the token selection change in TN
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangeTN(e: any): void {
        if (!e.getParameter("selected")) {
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
        } else {
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_tn", {
                properties: {
                    request_no: e.getParameter('changedItem').getBindingContext().getObject()['request_no'],
                    technology_node: e.getParameter('changedItem').getBindingContext().getObject()['technology_node']
                },
                context: this.context
            });
        }
    }

    // # --------------------------------------------------------------------------------- #
    // # On selection change of AP
    // # Objective : Lets handle the token selection change in AP
    // # --------------------------------------------------------------------------------- #	
    public handleOnSelectionChangeAP(e: Event): void {
        if (!e.getParameter("selected")) {
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
        } else {
            //Adding the value to the odata model
            (this?.getView()?.getModel() as ODataModel)?.createEntry("to_ap", {
                properties: {
                    request_no: e.getParameter('changedItem').getBindingContext().getObject()['request_no'],
                    application: e.getParameter('changedItem').getBindingContext().getObject()['application']
                },
                context: this.context
            });
        }
    }
}