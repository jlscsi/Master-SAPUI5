import BaseController from "./BaseController";
import ComboBox from "sap/m/ComboBox";
import Table from "sap/m/Table";
import Filter from "sap/ui/model/Filter";
import { FilterBar$ClearEvent, FilterBar$SearchEvent } from "sap/ui/comp/filterbar/FilterBar";
import Control from "sap/ui/core/Control";
import Input from "sap/m/Input";
import ListBinding from "sap/ui/model/ListBinding";

/**
 * @namespace com.logaligroup.employees.controller
 */
export default class Main extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }
    
    public onFilterSearchPress(event: FilterBar$SearchEvent){
        const array = event.getParameter("selectionSet") as Control[];
        const input = array[0] as Input;
        const combobox = array[1] as ComboBox;
        const sEmployee = input.getValue();
        const sCountry = combobox.getSelectedKey();
        let filters = []
         if (sEmployee) {
            filters.push(
                new Filter({
                    filters:[
                         new Filter("EmployeeID","EQ",sEmployee),
                         new Filter({
                            filters:[
                                new Filter("FirstName","Contains",sEmployee),
                                new Filter("LastName","StartsWith",sEmployee)
                            ],
                            and:false
                         })    

                    ],
                    and:false
               }))
        }
         if (sCountry) {
            filters.push(new Filter("Country","EQ",sCountry))
        }
        const oTable = this.byId("employeeTable") as Table;
        const oBinding = oTable.getBinding("items") as ListBinding;

        if (oBinding)
        {
             oBinding.filter(filters);
        }
    }
     public onClearPress(event: FilterBar$ClearEvent){
        const array = event.getParameter("selectionSet") as Control[];
        const input = array[0] as Input;
        const combobox = array[1] as ComboBox;
        input.setValue("");
        combobox.setSelectedKey("");
        this.onFilterSearchPress(event);
     }
}