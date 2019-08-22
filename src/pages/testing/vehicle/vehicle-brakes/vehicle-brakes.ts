import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { VehicleModel } from "../../../../models/vehicle/vehicle.model";
import { CommonFunctionsService } from "../../../../providers/utils/common-functions";
import { APP_STRINGS, VEHICLE_TYPE } from "../../../../app/app.enums";

@IonicPage()
@Component({
  selector: 'page-vehicle-brakes',
  templateUrl: 'vehicle-brakes.html',
})
export class VehicleBrakesPage {
  VEHICLE_TYPE: typeof VEHICLE_TYPE=VEHICLE_TYPE;
  APP_STRINGS: typeof APP_STRINGS=APP_STRINGS;
  vehicleData: VehicleModel;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public commonFunc: CommonFunctionsService) {
    this.vehicleData = navParams.get('vehicleData');
    this.viewCtrl = viewCtrl;
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(APP_STRINGS.VEHICLE_DETAILS);
  }

}
