import BaseController from "./BaseController";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Panel from "sap/m/Panel";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Button, { Button$PressEvent } from "sap/m/Button";
import Context from "sap/ui/model/odata/v2/Context";
import Utils from "../utils/Utils";
import Filter from "sap/ui/model/Filter";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import DatePicker, { DatePicker$ChangeEvent } from "sap/m/DatePicker";
import Select, { Select$ChangeEvent } from "sap/m/Select";
import { Input$LiveChangeEvent } from "sap/m/Input";
import Event from "sap/ui/base/Event";
import ObjectListItem from "sap/m/ObjectListItem";
/**
 * @namespace com.logaligroup.employees.controller
 */

export default class Details extends BaseController {

    panelForm: Panel;
    public onInit(): void {
        const oRouter = this.getRouter();
        oRouter.getRoute("RouteDetails")?.attachPatternMatched(this.onBindElement.bind(this))
    }

    private loadIncidences(): void {
        const model = new JSONModel([]);
        this.setModel(model, "form")
    }

    private onBindElement(event: Route$PatternMatchedEvent): void {

        //reset panel
        const panel = this.byId("tableIncidence") as Panel;
        panel.removeAllContent();
        this.loadIncidences();
        let arg = event.getParameter("arguments") as any;
        let id = arg.ID;
        const view = this.getView() as View;
        view.bindElement({
            path: `/Employees(${id})`,
            model: 'northwind',
            events: {
                change: () => {
                    this.read();
                },
                dataRequested: () => {
                    view.setBusy(true);
                },
                dataReceived: () => {
                    view.setBusy(false);
                },
            }
        })
    }
    public onClosePress(): void {
        const oRoute = this.getRouter();
        oRoute.navTo("RouteMaster")
        const oModel = this.getModel("view") as JSONModel;
        oModel.setProperty("/layout/", "OneColumn")
    }

    public async onCreatePress(): Promise<void> {
        const oPanelMain = this.byId("tableIncidence") as Panel;

        const form = this.getModel("form") as JSONModel;
        const aData = form.getData();
        const index = aData.length;
        aData.push({ Index: index + 1 })
        form.refresh();

        this.panelForm = await <Promise<Panel>>this.loadFragment({
            name: "com.logaligroup.employees.fragment.NewIncidence"
        });
        this.panelForm.bindElement({
            path: 'form>/' + index,
            model: 'form'
        })

        oPanelMain.addContent(this.panelForm);

    }

    private async read(): Promise<void> {
        const northwind = this.getView()?.getBindingContext("northwind") as Context;
        const oUtils = new Utils(this);

        const object = {
            path: '/IncidentsSet',
            filters: [
                new Filter("SapId", "EQ", "c25c385@gmail.com"),
                new Filter("EmployeeId", "EQ", northwind.getProperty("EmployeeID")),
            ]
        }
        const results = await oUtils.read(new JSONModel(object));
        this.showIncidents(results);
    }

    private showIncidents(results: ODataListBinding | void): void {
        const panel = this.byId("tableIncidence") as Panel;
        panel.removeAllContent();
        const object = results as any;
        const form = this.getModel("form") as JSONModel;
        form.setData(object.results);

        object.results.forEach(async (incidence: object, index: number) => {
            const newIncidence = await <Promise<Panel>>this.loadFragment({ name: "com.logaligroup.employees.fragment.NewIncidence" });
            newIncidence.bindElement("form>/" + index);
            panel.addContent(newIncidence);
        });
    }
    public onSavePress(event: Button$PressEvent): void {
        const oButton = event.getSource() as Button;
        const oBindingContext = oButton.getBindingContext("form");
        const northwind = this.getView()?.getBindingContext("northwind") as Context;

        const oUtils = new Utils(this);

        const sapId = oUtils.getEmail();
        let employeeId = (northwind.getProperty("EmployeeID") as number).toString();

        //    console.log(oBindingContext?.getObject());
        //    console.log(northwind.getObject());

        if (typeof oBindingContext?.getProperty("IncidenceId") === 'undefined') {
            const object = {
                //lugar donde se va a hacer la inserción
                path: "/IncidentsSet",
                oData: {
                    SapId: sapId,
                    EmployeeId: employeeId,
                    CreationDate: oBindingContext?.getProperty("CreationDate"),
                    Type: oBindingContext?.getProperty("Type"),
                    Reason: oBindingContext?.getProperty("Reason"),
                },
                filters : [
                     new Filter("SapId","EQ",sapId),
                     new Filter("EmployeeId","EQ",employeeId)
                ]
            }
            oUtils.crud("create", new JSONModel(object));
        } else {

            let incidenceId= oBindingContext.getProperty("IncidenceId");
           
            const object = {
                //lugar donde se va a hacer la inserción
                path: `/IncidentsSet(IncidenceId='${incidenceId}',SapId='${sapId}',EmployeeId='${employeeId}')`,
                oData: {
                    CreationDate: oBindingContext?.getProperty("CreationDate"),
                    CreationDateX: oBindingContext?.getProperty("CreationDateX"),
                    Type: oBindingContext?.getProperty("Type"),
                    TypeX: oBindingContext?.getProperty("TypeX"),
                    Reason: oBindingContext?.getProperty("Reason"),                  
                    ReasonX: oBindingContext?.getProperty("ReasonX"),
                },
                filters : [
                     new Filter("SapId","EQ",oUtils.getEmail()),
                     new Filter("EmployeeId","EQ",employeeId)
                ]
            }
            oUtils.crud("update", new JSONModel(object));

        }
    }
    public async onDeletePress(event :Button$PressEvent) : Promise<void | ODataListBinding>{
        const button = event.getSource() as Button;
        const oBindingContext = button.getBindingContext("form") as Context;
        const oUtils = new Utils(this);

        const incidenceId = oBindingContext?.getProperty("IncidenceId");
        const sapId = oUtils.getEmail();
        const employeeId = oBindingContext?.getProperty("EmployeeId")

        let object = {
            path:`/IncidentsSet(IncidenceId='${incidenceId}',SapId='${sapId}',EmployeeId='${employeeId}')`,
            filters : [
                     new Filter("SapId","EQ",oUtils.getEmail()),
                     new Filter("EmployeeId","EQ",employeeId)
                ]
        };

        const results = await oUtils.crud('delete', new JSONModel(object))
        this.showIncidents(results);
    }
    public updateIncidenceCreationDate(event: DatePicker$ChangeEvent): void {
        const context = event.getSource().getBindingContext("form") as Context;
        let object = context.getObject() as any;
        object.CreationDateX = true;
    }
    public updateIncidenceReason(event: Input$LiveChangeEvent): void {
        const context = event.getSource().getBindingContext("form") as Context;
        let object = context.getObject() as any;
        object.ReasonX = true;
    }
    public updateIncidenceType(event: Select$ChangeEvent): void {
        const context = event.getSource().getBindingContext("form") as Context;
        let object = context.getObject() as any;
        object.TypeX = true;
    }
    public onNavToOrderDetails(event : Event){
        const item = event.getSource() as ObjectListItem;
        const oBindingContext = item.getBindingContext("northwind") as Context;
        const employeeId = oBindingContext.getProperty("EmployeeID");
        const orderId = oBindingContext.getProperty("OrderID");
        const view = this.getModel("view") as JSONModel;
        view.setProperty("/layout","EndColumnFullScreen");

        const router = this.getRouter();
        router.navTo("RouteOrderDetails",{
            key:employeeId,
            key2:orderId
        })
    }
}