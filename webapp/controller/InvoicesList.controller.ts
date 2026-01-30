import Controller from "sap/ui/core/mvc/Controller";
import MultiComboBox from "sap/m/MultiComboBox"
import JSONModel from "sap/ui/model/json/JSONModel";
import { SearchField$SearchEvent } from "sap/ui/commons/SearchField";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import List from "sap/m/List";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
/**
 * @namespace com.logaligroup.invoices.controller
 */

export default class InvoicesList extends Controller {

    public onInit(): void {

        
        this.currencyModel();
        var oData = {
                ListaOpciones: [
                    { id: "A", description: "invoiceStatusA"},
                    { id: "B", description: "invoiceStatusB"},
                    { id: "C", description: "invoiceStatusC"}
                ],
                selectedItems: []
            };
         var oModel = new JSONModel(oData);
         this.getView()?.setModel(oModel);
         this.getView()?.setModel(
         new ResourceModel({ bundleName: "com.logaligroup.invoice.i18n.i18n" }),
         "i18n"
        );
    }

    private currencyModel(): void {
        let data = {
            usd: "USD"
        };
        const model = new JSONModel(data);
        this.getView()?.setModel(model, "currency");
    }

    public onSearchPress(event: SearchField$SearchEvent): void {
        const sQuery = event.getParameter("query")
        // const sQuery2 = event.getParameters().query otra forma de hacer lo mismo de arriba
        let aFilters = [];
        // para consulta con un campo como parametro
        /* if (sQuery)
            { 
                  aFilters.push(new Filter("ProductName",FilterOperator.Contains,sQuery))
            } */

        //Para cuando hay dos campos en el filtro, es decir productname or ShippedName para eso se usa and:false que indica que es un or si se pone and:true es un and
        if (sQuery) {
            aFilters.push(
                new Filter({
                    filters: [
                        new Filter("ProductName", FilterOperator.Contains, sQuery),
                        new Filter("ShipperName", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                })

            );
        }
        const list = this.byId("List") as List;
        const binding = list.getBinding("items") as ListBinding;
        binding.filter(aFilters);
    }
    public onFilterByStatus(): void {
        const multiCombo = this.byId("multiCombo") as MultiComboBox;
        const selectedKeys = multiCombo.getSelectedKeys(); // ["1","2",...]

        const list = this.byId("List") as List;
        const binding = list.getBinding("items") as ListBinding;

        if (!binding) return;

        let aFilters: Filter[] = [];

        if (selectedKeys.length > 0) {
            const statusFilters = selectedKeys.map(key => new Filter("Status", FilterOperator.EQ, key));
            aFilters.push(new Filter({ filters: statusFilters, and: false }));
        }

        binding.filter(aFilters);
}
}