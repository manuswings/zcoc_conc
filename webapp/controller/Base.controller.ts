import BusyDialog from "sap/m/BusyDialog";
import Router from "sap/m/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";
import Container from "sap/ushell/Container";

/**
 * @namespace lam.zcoc.controller
 */
export default class Base extends Controller {

    currentUserInfo: any

    utility: {
        "moment": (moment: String) => {

        },
        "Sebastin": () => {

        }
    }
    Router: Router;
    BusyDialog: BusyDialog;
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(this: any): void {
        this.Router = (this?.getView()?.getController().getOwnerComponent() as UIComponent).getRouter();
        //Fetching the curren user details
        this.getCurrentUser();
        // Adding the busy Indicator
        this.BusyDialog = new BusyDialog({
            dependents:this
        });
    }

    public handleBackToHome(): void {
        this.Router.navTo("RouteHome");
    }

    public getCurrentUser(): void {
        if (!this.currentUserInfo) {
            // @ts-expect-error
            sap.ushell.Container.getServiceAsync("UserInfo").then((userInfo : any) => { 
                this.currentUserInfo = userInfo;
                var userId = userInfo.getId();
                var userName = userInfo.getFullName();
    
                // You can access other user details, such as email, first name, last name, etc.
            }).catch(function (error : any) {
                // Handle error
                console.error(error);
            })            
        }
    }
}