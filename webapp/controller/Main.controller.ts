import Controller from "sap/ui/core/mvc/Controller";
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
    
}