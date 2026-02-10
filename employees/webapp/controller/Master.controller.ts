import BaseController from "./BaseController";
import Table from "sap/m/Table";
import Filter from "sap/ui/model/Filter";
import { FilterBar$ClearEvent, FilterBar$SearchEvent } from "sap/ui/comp/filterbar/FilterBar";
import Control from "sap/ui/core/Control";
import Input from "sap/m/Input";
import ListBinding from "sap/ui/model/ListBinding";
import Sorter from "sap/ui/model/Sorter";
import View from "sap/ui/core/mvc/View";
import Spreadsheet from "sap/ui/export/Spreadsheet";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import FilterBar from "sap/sac/df/FilterBar";
import MultiInput from "sap/m/MultiInput";
import StandardListItem from "sap/m/StandardListItem";
import FilterOperator from "sap/ui/model/FilterOperator";
import Token from "sap/m/Token";
import SelectDialog from "sap/m/SelectDialog";
import ObjectListItem from "sap/m/ObjectListItem";
import Event from "sap/ui/base/Event";
import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
/**
 * @namespace com.logaligroup.employees.controller
 */
export default class Main extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
    }
    public onValueHelpRequest(): void {
        const oView = this.getView() as View;
        const oMultiInput = oView.byId("countrySelect") as MultiInput;

        const oSelectDialog = new SelectDialog({
            title: "Seleccionar Países",
            multiSelect: true, // <--- Habilita los checkboxes
            rememberSelections: true, // <--- Mantiene marcados los que ya elegiste
            items: {
                path: "countries>/countries",
                sorter: new Sorter("Country", false),
                template: new StandardListItem({
                    title: "{countries>Country}",
                    description: "{countries>Code}",
                    icon: "{countries>Icon}",
                    type: "Active"
                })
            },

            search: (oEvt: any) => {
                const sValue = oEvt.getParameter("value");
                const oBinding = oEvt.getSource().getBinding("items");
                const oFilter = new Filter({
                    filters: [
                        new Filter("Country", FilterOperator.Contains, sValue),
                        new Filter("Code", FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                oBinding.filter(sValue ? [oFilter] : []);
            },

            confirm: (oEvt: any) => {
                const aSelectedItems = oEvt.getParameter("selectedItems");
                if (aSelectedItems) {
                    // Borramos tokens anteriores y añadimos los nuevos
                    oMultiInput.removeAllTokens();
                    aSelectedItems.forEach((oItem: any) => {
                        oMultiInput.addToken(new Token({
                            key: oItem.getDescription(), // El código (ES, MX, etc.)
                            text: oItem.getTitle()       // El nombre (España, México...)
                        }));
                    });
                    // Ejecutamos el filtro de la tabla
                    this.onFilterSearchPress(oEvt);
                }
            }
        });

        oView.addDependent(oSelectDialog);
        oSelectDialog.open("");
    }
 public onFilterSearchPress(event: any) {
    const oView = this.getView() as View;
    const oInputEmployee = oView.byId("employeeInput") as Input;
    const oMultiInputCountry = oView.byId("countrySelect") as MultiInput;
    const sEmployee = oInputEmployee.getValue();
    const aTokens = oMultiInputCountry.getTokens();
    
    let aAllFilters = [];

    // 1. Filtro de Empleado (Mantiene tu lógica)
    if (sEmployee) {
        aAllFilters.push(new Filter({
            filters: [
                new Filter("EmployeeID", FilterOperator.EQ, sEmployee),
                new Filter("FirstName", FilterOperator.Contains, sEmployee),
                new Filter("LastName", FilterOperator.Contains, sEmployee)
            ],
            and: false
        }));
    }
     /*si fuera con MultiComboBox o Select ser'ia como a continuacion  siendo  const sCountry = oView.byId("countrySelect") as MultiComboBox;  
     if (sCountry) {
            filters.push(new Filter("Country","EQ",sCountry))
        }*/

     if (aTokens.length > 0) {
        const aCountryFilters = aTokens.map((oToken) => {
            const Country = oToken.getKey(); // Extraemos el texto aquí
            return new Filter("Country", FilterOperator.Contains, Country);
        });

        aAllFilters.push(new Filter({
            filters: aCountryFilters,
            and: false 
        }));
    }

    const oTable = this.byId("employeeTable") as Table;
    const oBinding = oTable.getBinding("items") as ListBinding;

    if (oBinding) {
        // (Filtros Empleado) AND (Filtros País)
        oBinding.filter(aAllFilters);
    }
}
    public onClearPress(event: FilterBar$ClearEvent) {
        const array = event.getParameter("selectionSet") as Control[];
        const input = this.byId("employeeInput") as Input;
        const oMultiInputCountry = array[1] as MultiInput;
        input.setValue("");
        oMultiInputCountry.removeAllTokens();
        this.onFilterSearchPress(event);
    }
    public formatFlagIcon(sCode: string): string {
        return 'flags/${sCode}.png'; // Ajusta según tu ruta de iconos
    }
    public onTableUpdateFinished(oEvent: any): void {
        const iTotal = oEvent.getParameter("total");
        const oFilterBar = (this.getView() as View).byId("filterBar") as FilterBar;

        if (oFilterBar) {
            const otableTitle = (this.getView() as View).byId("tableTitle") as any;
            if (otableTitle) {
                const oResourceBundle = ((this.getView() as View).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
                const sRecordText = oResourceBundle.getText("records");
                otableTitle.setText(`${sRecordText} : ${iTotal}`);
            }
        }
    }
    public onExportToExcelPress(): void {
        const oTable = this.byId("employeeTable") as any; // El ID de tu sap.m.Table
        const oRowBinding = oTable.getBinding("items");
        const aCols = this._createColumnConfig();

        const oSettings = {
            workbook: {
                columns: aCols,
                context: {
                    application: "Mi Aplicación de Empleados",
                    version: "1.0",
                    title: "Listado de Empleados Exportados"
                }
            },
            dataSource: oRowBinding,
            fileName: "Exportacion_Empleados.xlsx",
            worker: false // Desactivar worker ayuda a evitar problemas de rutas en local
        };

        const oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(() => {
            oSheet.destroy();
        });
    }

    private _createColumnConfig(): any[] {
        return [
            {
                label: "Employee ID",
                property: "EmployeeID",
                type: "string"
            },
            {
                label: "First Name",
                property: "FirstName",
                type: "string"
            },
            {
                label: "Last Name",
                property: "LastName",
                type: "string"
            },
            {
                label: "País",
                property: "Country",
                type: "string"
            },
            {
                label: "City",
                property: "City",
                type: "string"
            },
            {
                label: "Postal Code",
                property: "PostalCode",
                type: "string"
            }
        ];
    }
    public onNavToDetails(oEvent:Event):void | undefined{
        //Obtenemos el item del listado de items que generó el evento
        let oItem= oEvent.getSource() as ObjectListItem;
        //Obtenemos el Contexto del item del listado de items que generó el evento, es decir todos los datos EmployeeID, FirstName, etc...    
        let bindingContext = oItem.getBindingContext("employees") as Context;
        //get Property obtiene desde el contexto el dato que se corresponde con la columna EmployeeID    
        let id= bindingContext.getProperty("EmployeeID");
        const oModel = this.getModel("view") as JSONModel;
        oModel.setProperty("/layout","TwoColumnsMidExpanded");
        const oRouter = this.getRouter();
        oRouter.navTo("RouteDetails",{ID:parseInt(id)-1})
    }

}