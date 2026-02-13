import BaseController from "./BaseController";
import View  from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Panel from "sap/m/Panel";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Button, { Button$PressEvent } from "sap/m/Button";
/**
 * @namespace com.logaligroup.employees.controller
 */

export default class Details extends BaseController{

panelForm : Panel;
public onInit(): void {
    const oRouter = this.getRouter();
    oRouter.getRoute("RouteDetails")?.attachPatternMatched(this.onBindElement.bind(this))    
}

private loadIncidences () : void {
  const model = new JSONModel([]);
  this.setModel(model,"form")
}

private onBindElement(event:Route$PatternMatchedEvent):void {

    //reset panel
    const panel = this.byId("tableIncidence") as Panel;
    panel.removeAllContent();
    this.loadIncidences();
    let arg = event.getParameter("arguments") as any;
    let id = arg.ID;
    const view = this.getView() as View;
    view.bindElement({path:`/Employees(${id})`,
                      model: 'northwind',
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
 
 public async onCreatePress(): Promise<void> {
        const oPanelMain = this.byId("tableIncidence") as Panel;

        const form = this.getModel("form") as JSONModel;
        const aData = form.getData();
        const index = aData.length;
        aData.push({Index:index + 1})
        form.refresh();

        this.panelForm=  await <Promise<Panel>>this.loadFragment({
            name:"com.logaligroup.employees.fragment.NewIncidence"
        }) ;
        this.panelForm.bindElement({
            path: 'form>/'+index,
            model: 'form'
        })
        
        oPanelMain.addContent(this.panelForm);

    }
    public onSavePress(event: Button$PressEvent): void {
        const oButton= event.getSource() as Button;
        const oBindingContext = oButton.getBindingContext("form");
        console.log(oBindingContext?.getObject());
        
    }

}