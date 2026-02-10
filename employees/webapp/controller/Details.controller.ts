import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "./BaseController";
import View  from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.logaligroup.employees.controller
 */

export default class Details extends BaseController{
public onInit(): void {
    const oRouter = this.getRouter();
    oRouter.getRoute("RouteDetails")?.attachPatternMatched(this.onBindElement.bind(this))    
}
private onBindElement(event:Route$PatternMatchedEvent):void {
    let arg = event.getParameter("arguments") as any;
    let index = arg.ID;
    const view = this.getView() as View;
    view.bindElement({path:'/Employees/'+index,
                      model: 'employees',
                    events:{
                        change:()=>{

                        },
                        dataRequested : ()=>{
                            view.setBusy(true);
                        },
                        dataReceived : ()=>{
                            view.setBusy(false);
                        },
                    }})
}
 public onClosePress():void{
    const oRoute = this.getRouter();
    oRoute.navTo("RouteMaster")
    const oModel = this.getModel("view") as JSONModel;
    oModel.setProperty("/layout/","OneColumn")
 }
}