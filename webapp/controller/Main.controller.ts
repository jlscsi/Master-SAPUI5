import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import View from "sap/ui/core/mvc/View";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.logaligroup.invoice.controller
 * 
 */
export default class Main extends Controller{

    onInit(): void | undefined {
        //otra forma de crear y cargar el modelo
       /*  var oModel = new JSONModel({
        datos: [
            { id: "1", nombre: "Juan", edad: 30 },
            { id: "2", nombre: "Ana", edad: 25 },
            { id: "3", nombre: "Pedro", edad: 40 }
        ]
    });
     (this.getView() as View).setModel(oModel);*/
       this.loadModel(); 
    }

    private loadModel():void{
       let data={
        recipient:{
            name:"World"
        }
       }
       let model= new JSONModel(data);
       this.getView()?.setModel(model,"view");
    } 
    onShowMessage():void{
        //Primera forma
        //Nota: Esto esta disponible despues de la renderizacion por lo que puede dar error si se intenta acceder al recurso y aun no esta renderizado
        //let resourceModel = (this.getView() as View).getModel("i18n") as ResourceModel;
       //la sentencia anterior es similar a la de abajo pero tiene una diferencia leer nota
      //Nota:Esto esta disponible siempre es decir antes de la renderizacion, este metodo es aconsejable cuando queremos cargar el i18n
       let resourceModel = (this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel;
       let sMessage = (resourceModel.getResourceBundle() as ResourceBundle).getText("helloWorld") as string;
       MessageToast.show(sMessage)

        //Segunda forma
    }
}