import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Model from "sap/ui/model/Model";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";

/**
 * @namespace com.logaligroup.employees.utils
 */

export default class Utils {
    private controller: Controller;
    private oModel: ODataModel;
    private oResourceBundle: ResourceBundle;

    constructor(controller: Controller) {
        this.controller = controller;
        this.oModel = (this.controller.getOwnerComponent() as UIComponent).getModel("zinvoices") as ODataModel;
        this.oResourceBundle = ((this.controller.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    }

    public getEmail(): string {
        return "c25c385@gmail.com"
    }



    public async read(object?: JSONModel): Promise<void | ODataListBinding>{
        const oModel = this.oModel;
        const path = object?.getProperty("/path");
        const filters = object?.getProperty("/filters");
        const oResourceBundle = this.oResourceBundle;

        // una consulta a una base de datos siempre se hace como una promesa
        return new Promise((resolve, reject) => {
            oModel.read(path, {
                filters: filters,
                success: (oData: ODataListBinding) => {
                    resolve(oData);
                },
                error: () => {
                    reject();
                    MessageBox.error(oResourceBundle.getText("error") || 'no text defined')
                },
            })
        })
    }

    // action = create, read, update, delete
    public async crud(action: string, object?: JSONModel): Promise<void> {
        const oResourceBundle = this.oResourceBundle;
        MessageBox.confirm(oResourceBundle.getText("question") || 'no text defined', {
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: async (response: string) => {
                if (MessageBox.Action.OK === response) {
                    switch (action) {
                        case 'create': await this.create(object);
                        case 'update': await this.update(object)
                        //case 'delete': this.delete()
                    }
                }
            }
        });
    }

    private async create(object?: JSONModel): Promise<void> {
        const oModel = this.oModel;
        const path = object?.getProperty("/path")
        const body = object?.getProperty("/oData")
        const oResourceBundle = this.oResourceBundle;
        oModel.create(path, body, {
            success: () => {
                MessageBox.success(oResourceBundle.getText("success") || 'no text define');
            },
            error: () => {
                MessageBox.error(oResourceBundle.getText("error") || 'no text define');
            }
        });

    }
     private async update(object?: JSONModel): Promise<void> {
        const oModel = this.oModel;
        const path = object?.getProperty("/path")
        const body = object?.getProperty("/oData")
        const oResourceBundle = this.oResourceBundle;
        oModel.update(path, body, {
            success: () => {
                MessageBox.success(oResourceBundle.getText("success") || 'no text define');
            },
            error: () => {
                MessageBox.error(oResourceBundle.getText("error") || 'no text define');
            }
        });

    }
}
