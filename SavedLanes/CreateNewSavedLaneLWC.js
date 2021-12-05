import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { createRecord,getRecord } from 'lightning/uiRecordApi';
import savedLanesObjInfo from '@salesforce/schema/Saved_Lanes__c';
import accountId from '@salesforce/schema/Saved_Lanes__c.Account__c';
import name from '@salesforce/schema/Saved_Lanes__c.Name';
import deliveryCity from '@salesforce/schema/Saved_Lanes__c.DeliveryCity__c';
import deliveryCountry from '@salesforce/schema/Saved_Lanes__c.DeliveryCountry__c';
import deliveryState from '@salesforce/schema/Saved_Lanes__c.Delivery_State__c';
import deliveryZipCode from '@salesforce/schema/Saved_Lanes__c.Delivery_Zip_Code__c';
import Distance from '@salesforce/schema/Saved_Lanes__c.Distance__c';
import pickUpCity from '@salesforce/schema/Saved_Lanes__c.PickupCity__c';
import pickUpCountry from '@salesforce/schema/Saved_Lanes__c.PickupCountry__c';
import pickUpState from '@salesforce/schema/Saved_Lanes__c.Pickup_State__c';
import pickUpZipCode from '@salesforce/schema/Saved_Lanes__c.PickupZipCode__c';
import routing from '@salesforce/schema/Saved_Lanes__c.Routing__c';
import trailerType from '@salesforce/schema/Saved_Lanes__c.Trailer_Type__c';
import weight from '@salesforce/schema/Saved_Lanes__c.Weight__c';
//import minRate from '@salesforce/schema/Saved_Lanes__c.Min_Rate__c';
import deliveryradius from '@salesforce/schema/Saved_Lanes__c.Delivery_Radius__c';
import pickupradius from '@salesforce/schema/Saved_Lanes__c.Pickup_Radius__c';
import pickupTimeWindow from '@salesforce/schema/Saved_Lanes__c.Pickup_Time_Window__c';
import destinationTimeWindow from '@salesforce/schema/Saved_Lanes__c.Destination_Time_Window__c';
import availablePickupDate from '@salesforce/schema/Saved_Lanes__c.Available_Pickup_Date_Ranges__c';
import availablePickupTime from '@salesforce/schema/Saved_Lanes__c.Available_Pickup_Time_Ranges__c';
import availableDeliveryDate from '@salesforce/schema/Saved_Lanes__c.Available_Delivery_Date_Ranges__c';
import availableDeliveryTime from '@salesforce/schema/Saved_Lanes__c.Available_Delivery_Time_Ranges__c';
import repeatDays from '@salesforce/schema/Saved_Lanes__c.Repeat_Days__c';
import repeatFrequency from '@salesforce/schema/Saved_Lanes__c.Repeat_Frequency__c';
import { showToast , checkNullOrEmptyValues} from 'c/util';

const pickUpLat = 'Pickup_Location__Latitude__s';
const pickUpLong = 'Pickup_Location__Longitude__s';
const deliveryLat = 'Dropoff_Location__Latitude__s';
const deliveryLong = 'Dropoff_Location__Longitude__s';

export default class CreateNewSavedLaneLWC extends NavigationMixin(LightningElement) {
  @api recordId;
  @api fields;
  pickUpAddressSelected;
  pickUpCitySelected;
  deliveryAddressSelected;
  deliveryCitySelected;
  weightSelected;
  //rateSelected;
  trailerTypeSelected;
  distanceSelected;
  routingSelected;
  savedLanesName;
  errorFields;
  selectedAccount;
  savedLaneRecordId;
  accountName;
  accountRecordIdSelected;
  isRelatedListClick = false;
  pickupWindowPickVal;
  destinationWindowPickVal;
  pickupWindowSelected;
  destinationWindowSelected;
  pickupDateSelected;
  pickupTimeSelected;
  deliveryDateSelected;
  deliveryTimeSelected;
  daySelected;
  frequencySelected;
  trailerPickVal;
  distPickVal;
  routingPickVal;
  daysPickVal;
  frequencyPickVal;
  currentPageReference;
  activeSections = ['laneInfo'];
  hideRepeatDays = false;
  pickupRadiusSelected;
  deliveryRadiusSelected;

  @wire(CurrentPageReference)
  currentPageReference;

  @wire(getObjectInfo, { objectApiName: savedLanesObjInfo })
  objectInfo;

  // Get PickList Values for fields
  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: pickupTimeWindow })
  wiredPickupPicklistValues({ data, error }) {
    if (data) {
      this.pickupWindowPickVal = data.values;
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: destinationTimeWindow })
  wiredDestinationPicklistValues({ data, error }) {
    if (data) {
      this.destinationWindowPickVal = data.values;
    }
  }
  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: trailerType})
  wiredtrailerTypePicklistValues({ data, error }) {
    if (data) {
      this.trailerPickVal = data.values;
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Distance })
  wiredDistancePicklistValues({ data, error }) {
    if (data) {
      this.distPickVal = data.values;
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: routing })
  wiredRoutingPicklistValues({ data, error }) {
    if (data) {
      this.routingPickVal = data.values;
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: repeatDays })
  wiredDaysPicklistValues({ data, error }) {
    if (data) {
      this.daysPickVal = data.values;
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: repeatFrequency })
  wiredFrequencyPicklistValues({ data, error }) {
    if (data) {
      this.frequencyPickVal = data.values;
    }
  }

  connectedCallback() {
    var url = this.currentPageReference && this.currentPageReference.state.ws;
    if (!checkNullOrEmptyValues(url)) {
      this.accountRecordIdSelected = url.substring(21, 39);//extract accountid from pagereference
      this.isRelatedListClick = true;
    }
    this.fields = [
      'Account.Id',
      'Account.Name',
    ]
  }

  @wire(getRecord, { recordId: '$accountRecordIdSelected', fields: '$fields' })
  wiredRecord({ error, data }) {
    if (error) {
      console.log('Error:', this.error);
    }
    else if (data) {
      this.selectedAccount = data;
      this.accountRecordIdSelected =  data.fields.Id.value;
      this.accountName = data.fields.Name.value;
      console.log('accountName', this.accountName);
      console.log('selectedAccount', this.selectedAccount);
    }
  }

  handleToggleSection(event) {
    this.activeSections = event.detail.openSections;
  }

  handleChange(event) {
    var labelName = event.target.dataset.recordId;
    switch (labelName) {
      case "account":
        if (!checkNullOrEmptyValues(event.detail.record)) {
          this.selectedAccount = event.detail.record;
          this.accountRecordIdSelected = this.selectedAccount.Id;
          this.accountName = this.selectedAccount.Name;
        }
        break;
      case "pickup":
        if (!checkNullOrEmptyValues(event.detail.record)) {
          this.pickUpAddressSelected = event.detail.record;
          this.pickUpCitySelected = this.pickUpAddressSelected.City__c;
        }
        break;
      case "delivery":
        if (!checkNullOrEmptyValues(event.detail.record)) {
          this.deliveryAddressSelected = event.detail.record;
          this.deliveryCitySelected = this.deliveryAddressSelected.City__c;
        }
        break;
      case "sourceWindow":
        if (!checkNullOrEmptyValues(event.target.value)) {
          let window = event.target.value;
          this.pickupWindowSelected = window.toString().replaceAll(",", ";");
        }
        break;
      case "destinationWindow":
        if (!checkNullOrEmptyValues(event.target.value)) {
          let window = event.target.value;
          this.destinationWindowSelected = window.toString().replaceAll(",", ";");
        }
        break;
      case "pickupdate":
        if (!checkNullOrEmptyValues(event.target.value))
          this.pickupDateSelected = event.target.value;
        break;
      case "pickuptime":
        if (!checkNullOrEmptyValues(event.target.value))
          this.pickupTimeSelected = event.target.value;
        break;
      case "deliverydate":
        if (!checkNullOrEmptyValues(event.target.value))
          this.deliveryDateSelected = event.target.value;
        break;
      case "deliverytime":
        if (!checkNullOrEmptyValues(event.target.value))
          this.deliveryTimeSelected = event.target.value;
        break;
      case "pickupradius":
        if (!checkNullOrEmptyValues(event.target.value))
          this.pickupRadiusSelected = event.target.value;
        break;
      case "deliveryradius":
        if (!checkNullOrEmptyValues(event.target.value))
          this.deliveryRadiusSelected = event.target.value;
        break;
      case "trailer":
        if (!checkNullOrEmptyValues(event.detail.value)) {
          let trailer = event.target.value;
          this.trailerTypeSelected = trailer.toString().replaceAll(",", ";");
        }
        break;
      case "weight":
        if (!checkNullOrEmptyValues(event.target.value))
          this.weightSelected = event.target.value;
        break;
      case "distance":
        if (!checkNullOrEmptyValues(event.target.value)) {
          let distance = event.target.value;
          this.distanceSelected = distance.toString().replaceAll(",", ";");
        }
        break;
      case "routing":
        if (!checkNullOrEmptyValues(event.target.value)) {
          let route = event.target.value;
          this.routingSelected = route.toString().replaceAll(",", ";");
        }
        break;
      case "days":
        if (!checkNullOrEmptyValues(event.target.value)) {
          let day = event.target.value;
          this.daySelected = day.toString().replaceAll(",", ";");
        }
        break;
      case "frequency":
        this.frequencySelected = event.detail.value;
        if (this.frequencySelected === 'Daily') {
          this.daySelected = '';
          this.hideRepeatDays = true;
        } else
          this.hideRepeatDays = false;
        break;
    }
  }

  submitDetails() {
    this.errorFields = this.validateRecord();
    if (!checkNullOrEmptyValues(this.errorFields)) {
      this.dispatchEvent(showToast('Error','Review Error Messages'+this.errorFields, 'error', 'dismissable'));
    }
    else {
      const fields = {};
      if (!checkNullOrEmptyValues(this.pickUpAddressSelected) && !checkNullOrEmptyValues(this.deliveryAddressSelected)) {
        if(!checkNullOrEmptyValues(this.pickUpAddressSelected.City__c) && !checkNullOrEmptyValues(this.deliveryAddressSelected.City__c)){
          this.savedLanesName = this.pickUpAddressSelected.City__c + ' - ' + this.deliveryAddressSelected.City__c;
        }
      }
      else if (!checkNullOrEmptyValues(this.pickUpAddressSelected) && checkNullOrEmptyValues(this.deliveryAddressSelected)) {
        if(!checkNullOrEmptyValues(this.pickUpAddressSelected.City__c))
          this.savedLanesName = this.pickUpAddressSelected.City__c + ' - ' + 'Anywhere';
      }
      if (checkNullOrEmptyValues(this.pickupTimeSelected)) {
        this.pickupTimeSelected = '00:00:00.000Z';
      }
      if (checkNullOrEmptyValues(this.deliveryTimeSelected)) {
        this.deliveryTimeSelected = '00:00:00.000Z';
      }
      fields[accountId.fieldApiName] = this.accountRecordIdSelected;
      fields[name.fieldApiName] = this.savedLanesName;
      if (!checkNullOrEmptyValues(this.deliveryAddressSelected)) {
        fields[deliveryCity.fieldApiName] = this.deliveryAddressSelected.City__c;
        fields[deliveryCountry.fieldApiName] = this.deliveryAddressSelected.Country__c;
        fields[deliveryState.fieldApiName] = this.deliveryAddressSelected.State__c;
        fields[deliveryZipCode.fieldApiName] = this.deliveryAddressSelected.Zipcode__c;
        fields[deliveryLat] = this.deliveryAddressSelected.Latitude__c;
        fields[deliveryLong] = this.deliveryAddressSelected.Longitude__c;
      }
      if (!checkNullOrEmptyValues(this.pickUpAddressSelected)) {
        fields[pickUpCity.fieldApiName] = this.pickUpAddressSelected.City__c;
        fields[pickUpCountry.fieldApiName] = this.pickUpAddressSelected.Country__c;
        fields[pickUpState.fieldApiName] = this.pickUpAddressSelected.State__c;
        fields[pickUpZipCode.fieldApiName] = this.pickUpAddressSelected.Zipcode__c;
        fields[pickUpLat] = this.pickUpAddressSelected.Latitude__c;
        fields[pickUpLong] = this.pickUpAddressSelected.Longitude__c;
      }
      fields[Distance.fieldApiName] = this.distanceSelected;
      fields[routing.fieldApiName] = this.routingSelected;
      fields[trailerType.fieldApiName] = this.trailerTypeSelected;
      fields[weight.fieldApiName] = this.weightSelected;
      fields[pickupTimeWindow.fieldApiName] = this.pickupWindowSelected;
      fields[destinationTimeWindow.fieldApiName] = this.destinationWindowSelected;
      fields[availablePickupDate.fieldApiName] = this.pickupDateSelected;
      fields[availablePickupTime.fieldApiName] = this.pickupTimeSelected;
      fields[availableDeliveryDate.fieldApiName] = this.deliveryDateSelected;
      fields[availableDeliveryTime.fieldApiName] = this.deliveryTimeSelected;
      fields[deliveryradius.fieldApiName] = this.deliveryRadiusSelected;
      fields[pickupradius.fieldApiName] = this.pickupRadiusSelected;
      //fields[minRate.fieldApiName] = this.rateSelected;
      fields[repeatDays.fieldApiName] = this.daySelected;
      fields[repeatFrequency.fieldApiName] = this.frequencySelected;
      const recordInput = { apiName: savedLanesObjInfo.objectApiName, fields };
      //Create New Record
      createRecord(recordInput)
        .then(savedLaneRecord => {
          console.log('savedLaneRecord.id', savedLaneRecord.id);
          this.savedLaneRecordId = savedLaneRecord.id;
          this.dispatchEvent(showToast('Success', 'Saved Lanes record has been created', 'success', 'dismissable'));
          this.handleCancel();
          window.open(window.location.origin + '/' + this.savedLaneRecordId,"_blank");
        }).catch(error => {
          this.dispatchEvent(showToast('Error creating record',error.body.message, 'error', 'dismissable'));
          });
     }
  }
  //Validate all required fields are filled
  validateRecord() {
    var errorMsg = '';
    const todaydate = new Date();
    const isodate = todaydate.toISOString();
    var date = isodate.substr(0, 10);//truncating only date
    if (checkNullOrEmptyValues(this.accountRecordIdSelected)) {
      errorMsg += ' Account is required,';
    }
    if (checkNullOrEmptyValues(this.pickUpAddressSelected) || checkNullOrEmptyValues(this.pickUpAddressSelected.City__c)) {
      errorMsg += ' PickUp Address is required,';
    }
    if (!checkNullOrEmptyValues(this.pickupDateSelected) && this.pickupDateSelected < date) {
      errorMsg += ' Pickup date cannot be before to todays date,';
    }
    if (!checkNullOrEmptyValues(this.deliveryDateSelected) && this.deliveryDateSelected < date) {
      errorMsg += ' Delivery date cannot be before to todays date,';
    }
    if (!checkNullOrEmptyValues(this.pickupDateSelected) && !checkNullOrEmptyValues(this.deliveryDateSelected) && this.deliveryDateSelected < this.pickupDateSelected) {
      errorMsg += ' Delivery date cannot be before to Pickup date,';
    }
    console.log('errorMsg', errorMsg);
    return errorMsg;
  }

  handleCancel() {
    var close = true;
    const closeclickedevt = new CustomEvent('closeclicked', {
        detail: { close },
    });
    this.dispatchEvent(closeclickedevt);
  }
}
