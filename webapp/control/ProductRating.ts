
// Control Customizado
import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import { MetadataOptions } from "sap/ui/core/Element";
import RatingIndicator, { RatingIndicator$LiveChangeEvent } from "sap/m/RatingIndicator";
import Label from "sap/m/Label";
import Button from "sap/m/Button";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import { Button$ClickEvent } from "sap/ui/webc/main/Button";

/**
 * @namespace com.logaligroup.invoices.control
 */

export default class ProductRating extends Control {

    constructor(idOrSettings?: string | $ProductRatingSettings);
    constructor(id?: string, settings?: $ProductRatingSettings);
    constructor(id?: string, settings?: $ProductRatingSettings) { super(id, settings); }

    static readonly metadata: MetadataOptions = {
        properties: {
            value: { //por defect6o se crean estos metodos getValue() and setValue()
                type: 'float',
                defaultValue: 0
            }
        },
        aggregations: {
            _rating: {
                type: 'sap.m.RatingIndicator',
                multiple: false,
                visibility: 'hidden'
            },
            _label: {
                type: 'sap.m.Label',
                multiple: false,
                visibility: 'hidden'
            },
            _button: {
                type: 'sap.m.Button',
                multiple: false,
                visibility: 'hidden'
            }
        },
        events: {
            change: {
                parameters: {
                    value: 'float'
                }
            }
        }
    }

    init(): void {
        this.setAggregation("_rating", new RatingIndicator({
            value: this.getValue(),
            iconSize: "2rem",
            liveChange: this._onRate.bind(this)
        }));
        this.setAggregation("_label", new Label({
            text: "{i18n>productRatingLabelInitial}",
        }).addStyleClass("sapUISmallMarginBeginEnd"));
        this.setAggregation("_button", new Button({
            text: "{i18n>productRatingButton}",
            press: this._onSubmit.bind(this)
        }).addStyleClass("sapUiSmallMarginTopButtom"));
    }

    renderer = {

        apiVersion: 4,
        render: (rm: RenderManager, control: ProductRating) => {
            //Las sentencias a continuacion crean:  rm.openStart("div") crea <div,  rm.openEnd() crea > y finalmente rm.close("div") crea </div>
            rm.openStart("div", control);
            rm.class("productRating");
            rm.openEnd();
            rm.renderControl(<Control>control.getAggregation("_rating"))
            rm.renderControl(<Control>control.getAggregation("_label"))
            rm.renderControl(<Control>control.getAggregation("_button"))
            rm.close("div");
        }
    }
    _onRate (event: RatingIndicator$LiveChangeEvent): void {
        let rating = event.getSource() as RatingIndicator;
        let resourceBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
        let iValue= rating.getValue() as number;
        let iMaxValue = rating.getMaxValue() as number;
        this.setProperty("value",iValue);
        (this.getAggregation("_label") as Label).setText(resourceBundle.getText("productRatingLabelIndicator",[iValue,iMaxValue]));
        (this.getAggregation("_label") as Label).setDesign("Bold");
    }
    _onSubmit (event:Button$ClickEvent): void{
        let resourceBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
         (this.getAggregation("_rating") as RatingIndicator).setEnabled(false);
         (this.getAggregation("_button") as Button).setEnabled(false);
         (this.getAggregation("_label") as Label).setText(resourceBundle.getText("productRatingLabelFinal"));
         this.fireEvent('change',{value:this.getValue()})
    }
    
    mysetValue(value:number){
        this.setProperty("value",value);
        (this.getAggregation("_rating") as RatingIndicator).setValue(value)
        return this;

    }

    public reset(): void{
        this.mysetValue(0); 
        (this.getAggregation("_rating") as RatingIndicator).setEnabled(true);
        (this.getAggregation("_button") as Button).setEnabled(true);
        let resourceBundle = (this.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
        (this.getAggregation("_label") as Label).setText(resourceBundle.getText("productRatingLabelInitial"));
        (this.getAggregation("_label") as Label).setDesign("Standard");
         
    }
}