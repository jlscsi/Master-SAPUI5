import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Controller from "sap/ui/core/mvc/Controller";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

export default {

    statusText: function (this: Controller, status: string): string | undefined {
        const resourceModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        const resourceBundle = resourceModel.getResourceBundle() as ResourceBundle;

        switch (status) {
            case 'A': return resourceBundle.getText("invoiceStatusA")//New
            case 'B': return resourceBundle.getText("invoiceStatusB")//In progress
            case 'C': return resourceBundle.getText("invoiceStatusC")//Done
            default: return;
        }

    },
     multiComboText: function(this: Controller, statusKey: string): string | undefined{
        const resourceModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        const resourceBundle = resourceModel?.getResourceBundle() as ResourceBundle;

        if (!resourceBundle) return statusKey;

        switch (statusKey) {
            case "invoiceStatusA": return resourceBundle.getText("invoiceStatusA"); // New
            case "invoiceStatusB": return resourceBundle.getText("invoiceStatusB"); // In progress
            case "invoiceStatusC": return resourceBundle.getText("invoiceStatusC"); // Done
            default: return statusKey;
        }
    }
}