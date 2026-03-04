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
import UploadSet, { UploadSet$AfterItemRemovedEvent, UploadSet$BeforeUploadStartsEvent, UploadSet$UploadCompletedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem, { UploadSetItem$OpenPressedEvent } from "sap/m/upload/UploadSetItem";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Item from "sap/ui/core/Item";

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
                 this.searchFiles();   
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
        ;
    }

    public onBeforeUpload(event: UploadSet$BeforeUploadStartsEvent): void{
        const item = event.getParameter("item") as UploadSetItem;
        const oUtils = new Utils(this);
        const context = this.getView()?.getBindingContext("northwind");
        const model = this.getOwnerComponent()?.getModel("zinvoices") as ODataModel;
        const token = model.getSecurityToken();
        const filename = item.getFileName();
        const mediaType = item.getMediaType();
        const orderId = context?.getProperty("OrderID")
        const sapId = oUtils.getEmail();
        const employeeId = context?.getProperty("EmployeeID");

        const headerToken = new Item ({
            key: "x-csrf-token",
            text: token
        });
        const headerSlug = new Item ({
            key: "slug",
            text: `${orderId};${sapId};${employeeId};${filename};${mediaType}`
        });
        console.log({filename,mediaType,token,orderId,sapId,employeeId}); 
        item.addHeaderField(headerToken);
        item.addHeaderField(headerSlug);
    }

    public onUploadCompleted( event : UploadSet$UploadCompletedEvent) : void {
        const uploadSet = event.getSource();
         uploadSet.getBinding("items")?.refresh();
    }

    private searchFiles() : void{
        const oUtils = new Utils(this);
        const context = this.getView()?.getBindingContext("northwind");
        const orderId = context?.getProperty("OrderID")
        const sapId = oUtils.getEmail();
        const employeeId = context?.getProperty("EmployeeID");
        //lo que sigue lo carga de forma dinamica y no estatica como en la vista
        const uploadSet = this.byId("upload") as UploadSet;
              uploadSet.bindAggregation("items",{
                path: 'zinvoices>/FilesSet',
                filters:[
                    new Filter("OrderId","EQ", orderId),
                    new Filter("SapId","EQ", sapId),
                    new Filter("EmployeeId","EQ", employeeId)
                ],
                //template siempre se usa para carga dinamica
                template: new UploadSetItem({
                    fileName: '{zinvoices>FileName}',
                    mediaType:'{zinvoices>MimeType}',
                    visibleEdit:false,
                    visibleRemove:true,
                    url:'hola',
                    openPressed: this.download.bind(this)
                })
              })
    }

    private download (event : UploadSetItem$OpenPressedEvent): void{
        const item = event.getSource() as UploadSetItem;
        const context = item.getBindingContext("zinvoices") as Context;
        const path = context.getPath();
        console.log(path)
        ///sap/opu/odata/sap/YSAPUI5_SRV_01/FilesSet(AttId='0709',OrderId='010258',SapId='c25c385%40gmail.com',EmployeeId='0001')/$value
        const url=`/sap/opu/odata/sap/YSAPUI5_SRV_01${path}/$value`
        item.setUrl(url);
    }
    public async onAfterRemoved( event: UploadSet$AfterItemRemovedEvent) : Promise<void>{
        const item = event.getParameter("item") as UploadSetItem;
        const context = item.getBindingContext("zinvoices") as Context;
        const path = context.getPath();
        
        const oUtils = new Utils(this);
        await oUtils.crud('delete', new JSONModel({path: path}));
        item.getBinding("items")?.refresh();
    }
}