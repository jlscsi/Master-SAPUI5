import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import UIComponent from "sap/ui/core/UIComponent";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Dialog from "sap/m/Dialog";
import View from "sap/ui/core/mvc/View";
import Fragment from "sap/ui/core/Fragment";

/**
 * @namespace com.logaligroup.invoice.controller
 */
export default class HelloPanel extends Controller {
    private dialog : Dialog;

    public onInit(): void {

    }
    public onShowMessage(): void {
        //Primera forma
        //Nota: Esto esta disponible despues de la renderizacion por lo que puede dar error si se intenta acceder al recurso y aun no esta renderizado
        //let resourceModel = (this.getView() as View).getModel("i18n") as ResourceModel;
        //la sentencia anterior es similar a la de abajo pero tiene una diferencia leer nota
        //Segunda forma
        //Nota:Esto esta disponible siempre es decir antes de la renderizacion, este metodo es aconsejable cuando queremos cargar el i18n 
        let resourceModel = (this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel;
        let sMessage = (resourceModel.getResourceBundle() as ResourceBundle).getText("helloWorld") as string;
        MessageToast.show(sMessage)
    }
    public async onOpenDialog(): Promise<void> {
        let view = this.getView() as View;
        //if(!this.dialog) esto es equivalente a  this.dialog??= y asi no hay que poner el if que se pone para comprobar que esa instancia no existe si no existe se carga la instancia 
        if(!this.dialog){
            this.dialog = await Fragment.load({
                id: view.getId(),
                name:"com.logaligroup.invoice.fragment.HelloDialog",
                controller: this 
            }) as Dialog;
        }
        //agrega a la vista el dialog
        view.addDependent(this.dialog)
        //finalmente abre el dialogo
        this.dialog.open();
    }
     public onCloseDialog(): void {
      if (this.dialog) {
        this.dialog.close();
      }
    }
}