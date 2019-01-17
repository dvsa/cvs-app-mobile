import { Component } from '@angular/core';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonFunctionsService } from "../../../../providers/utils/common-functions";
import { TEST_RESULT } from '../../../../app/app.enums';

@IonicPage()
@Component({
  selector: 'page-vehicle-history',
  templateUrl: 'vehicle-history.html',
})

export class VehicleHistoryPage {
  vehicleData: VehicleModel;
  testResultHistory: any;
  testResult: {};

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public commonFunc: CommonFunctionsService) {
    this.vehicleData = navParams.get('vehicleData');
    this.testResultHistory = navParams.get('testResultsHistory');
    this.testResult = TEST_RESULT;
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText('Vehicle details');
  }

  showTestDetails(testIndex: number, testTypeIndex: number): void {
    this.navCtrl.push('VehicleHistoryDetailsPage', {
      testResultHistory: this.testResultHistory,
      testIndex: testIndex,
      testTypeIndex: testTypeIndex
    });
  }

  getTestResultColor(testResult: string): string {
    switch (testResult.toLowerCase()) {
      case TEST_RESULT.PASS:
        return 'secondary';
      case TEST_RESULT.FAIL:
        return 'danger';
      case TEST_RESULT.PRS:
        return 'primary';
    }
  }
}
