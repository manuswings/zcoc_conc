import Router from "sap/m/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace lam.zcoc_conc.controller
 */
export default class Base extends Controller {
    utility:{
        "moment": (moment:String)=>{

        },
        "Sebastin":()=>{

        }
    }
    Router: Router;
    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(this:any): void {
        this.Router = (this?.getView()?.getController().getOwnerComponent() as UIComponent ).getRouter();
    }

    public fnGoToHome() :void{
        this.Router.navTo("RouteHome");
    }
}