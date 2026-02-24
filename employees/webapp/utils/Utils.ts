import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Model from "sap/ui/model/Model";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import ResponsiveScale from "sap/m/ResponsiveScale";

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



    public async read(object?: JSONModel): Promise<void | ODataListBinding> {
        const oModel = this.oModel;
        let path = object?.getProperty("/path");
        const filters = object?.getProperty("/filters");
        const oResourceBundle = this.oResourceBundle;
        //solo tenemos que enviar la entidad en el metodo read //IncidentsSet y lo que estaba mandando era /IncidentsSet(IncidenceSet='',SapId='', EmployeeId='')
        // en cambio para los demas metodos create, update y delete se envia todo y estos metodos ya lo recortan por la validación
       
      //  console.log("Before");
     //   console.log(path,filters);

        if (path && typeof path === 'string'){
            path = path.split('(')[0];
        }
     //   console.log("After");
    //    console.log(path,filters);
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
    public async crud(action: string, object?: JSONModel): Promise<void | ODataListBinding> {
        const oResourceBundle = this.oResourceBundle;
       return new Promise((resolve,reject)=>{
         MessageBox.confirm(oResourceBundle.getText("question") || 'no text defined', {
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: async (response: string) => {
                if (MessageBox.Action.OK === response) {
                    switch (action) {
                        case 'create': resolve(await this.create(object)); break;
                        case 'update': resolve(await this.update(object)); break;
                        case 'delete': resolve(await this.delete(object)); break;
                    }
                }
            }
        });
       })
    }

    private async create(object?: JSONModel): Promise<void | ODataListBinding> {
        const oModel = this.oModel;
        const path = object?.getProperty("/path")
        const body = object?.getProperty("/oData")
        const oResourceBundle = this.oResourceBundle;
        return new Promise((resolve, reject) => {
            oModel.create(path, body, {
                success: async () => {
                    MessageBox.success(oResourceBundle.getText("success") || 'no text define');
                    resolve(await this.read(object));
                },
                error: () => {
                    MessageBox.error(oResourceBundle.getText("error") || 'no text define');
                    reject();
                }
            });

        })
    }
    private async update(object?: JSONModel): Promise<void | ODataListBinding> {
        const oModel = this.oModel;
        const path = object?.getProperty("/path")
        const body = object?.getProperty("/oData")
        const oResourceBundle = this.oResourceBundle;

        return new Promise((resolve, reject) => {
            oModel.update(path, body, {
                success: async () => {
                    MessageBox.success(oResourceBundle.getText("success") || 'no text define');
                    resolve(await this.read(object))
                },
                error: () => {
                    MessageBox.error(oResourceBundle.getText("error") || 'no text define');
                    reject();
                }
            });
        });
    }

    private async delete(object?: JSONModel): Promise<void | ODataListBinding> {
        const path = object?.getProperty("/path");
        const oResourceBundle = this.oResourceBundle;

        return new Promise((resolve, reject) => {
            this.oModel.remove(path, {
                success: async () => {
                    MessageBox.success(oResourceBundle.getText("success") || 'no text define');
                    resolve (await this.read(object))
                },
                error: () => {
                    MessageBox.error(oResourceBundle.getText("error") || 'no text define');
                    reject();
                }
            });
        });
    };
}
