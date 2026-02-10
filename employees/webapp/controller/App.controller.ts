import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import { layout } from "sap/ui/commons/library";


/**
 * @namespace com.logaligroup.employees.controller
 */
export default class App extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.loadEmployees();
        this.loadView();
        //this.loadCountries();

    }

    private loadEmployees() : void {
        const model = new JSONModel();
        model.loadData("../model/Employees.json");
        this.setModel(model,"employees");
    }

   private loadCountries(): void {
    const model = new JSONModel();
    model.loadData("../model/Countries.json");
    this.setModel(model,"countries");
    }

    private loadView():void{
       const data ={
        layout: "OneColumn"
       } 
       const model = new JSONModel(data);
       this.setModel(model,"view")
    }
}