
// Control Customizado
import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import { MetadataOptions } from "sap/ui/core/Element";
import RatingIndicator from "sap/m/RatingIndicator";
import Label from "sap/m/Label";
import Button from "sap/m/Button";

/**
 * @namespace com.logaligroup.invoices.control
 */

export default class ProductRating extends Control {
    static readonly metadata: MetadataOptions = {
        properties:{
            value:{
                type: 'float',
                defaultValue:0
            }
        },
        aggregations:{
            _rating:{
                type:'sap.m.RateIndicator',
                multiple:false,
                visibility:'hidden'
            },
            _label:{
                type:'sap.m.Label',
                multiple:false,
                visibility:'hidden'
            },
            _button:{
                type:'sap.m.Button',
                multiple:false,
                visibility:'hidden'
            }
        },
        events:{
            
        }
    }

    init(): void {

    }

    renderer = {

        apiVersion: 4,
        render: (rm: RenderManager, control: ProductRating) => { }
    }

}