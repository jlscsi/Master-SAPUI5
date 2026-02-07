import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Component from "sap/ui/core/Component";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import Router from "sap/ui/core/routing/Router";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import History from "sap/ui/core/routing/History";
import EventBus from "sap/ui/core/EventBus";
/**
 * @namespace com.logaligroup.employees.controller
 */

export default class BaseController extends Controller{

   public getRouter() : Router{
    return (this.getOwnerComponent() as Component).getRouter();
   }

   public getModel(name?: string) : Model{

    return (this.getView() as View).getModel(name) as Model;
   }

   public setModel(model:Model, name?:string) : View | undefined{
    return (this.getView() as View).setModel(model,name);
   }

   public getResourceBundle () : ResourceBundle{

    let model = ((this.getOwnerComponent() as Component).getModel("i18n") as ResourceModel);
    return model.getResourceBundle() as ResourceBundle;
   }

    public onNavToBack(): void{
        let sPreviosHash = History.getInstance().getPreviousHash
        if (sPreviosHash!==undefined){
            history.go(-1);
        } else{
            this.getRouter().navTo("RouteMain")
        }

    }

    public getEventBus(): EventBus{

        return this.getEventBus() as EventBus;
    }

}