import View from "sap/ui/core/mvc/View";
import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Signature from "../control/Signature";
import Context from "sap/ui/model/Context";
import Utils from "../utils/Utils";
import MessageBox from "sap/m/MessageBox";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import Filter from "sap/ui/model/Filter";

/**
 * @namespace com.logaligroup.employees.controller
 */

export default class OrderDetails extends BaseController {


    public onInit() {
        const router = this.getRouter();
        router.getRoute("RouteOrderDetails")?.attachPatternMatched(this.onBindingContext.bind(this));

    }

    private onBindingContext(event: Route$PatternMatchedEvent): void {
        const arg = event.getParameter("arguments") as any;
        const employeeId = arg.key;
        const orderId = arg.key2;
        console.log({ employeeId, orderId })

        const view = this.getView() as View;
        view.bindElement({
            path: `/Orders(${orderId})`,
            model: 'northwind',
            events: {
                change: () => {
                 this.read();   
                },
                dataRequest: () => {
                    view.setBusy(true);
                },
                dataReceived: () => {
                    view.setBusy(false);
                }
            }
        })
    }

    public onClearPress(): void {
        const signature = this.byId("signature") as Signature;
        signature.clear();
    }
    public async onSavePress(): Promise<void> {
        const signature = this.byId("signature") as Signature;
        const oBindingContext = this.getView()?.getBindingContext("northwind") as Context;
        const oResourceBundle = this.getResourceBundle();
        const oUtils = new Utils(this);

        if (!signature.isFill()) {
            MessageBox.error(oResourceBundle.getText("fillSignature") || '');
        } else {
            const sSignature = signature.getSignature();
            //data:image/png;base64,
            const sMediaContent = sSignature.replace("data:image/png;base64,", "");
            const body = {
                path: '/SignatureSet',
                oData: {


                    OrderId: oBindingContext.getProperty("OrderID").toString(),
                    SapId: oUtils.getEmail(),
                    EmployeeId: oBindingContext.getProperty("EmployeeID").toString(),
                    MimeType: 'image/png',
                    MediaContent: sMediaContent
                }

            };
              await oUtils.crud('create', new JSONModel(body));
        }
    }

    private async read() : Promise<void | ODataListBinding> {
       
       const oBindingContext = this.getView()?.getBindingContext("northwind") as Context;
       const oUtils = new Utils(this)
       
       let body = {
         path: '/SignatureSet',
         filters:[
            new Filter("OrderId","EQ", oBindingContext.getProperty("OrderID").toString()),
            new Filter("SapId","EQ", oUtils.getEmail()),
            new Filter("EmployeeId","EQ", oBindingContext.getProperty("EmployeeID").toString())          
         ]
       };
       const results = await oUtils.read(new JSONModel(body));
       this.showSignature(results);
    }

     public showSignature(data : void | ODataListBinding): void {
        let results = data as any;
        const signature = this.byId("signature") as Signature;
        const mediaContent = results.results[0].MediaContent;
        console.log(results);
        signature.setSignature("data:image/png;base64,"+mediaContent);
    }

    public onRefreshPress(){
        this.read();
    }
   
}