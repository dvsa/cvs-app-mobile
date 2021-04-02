import { Component } from '@angular/core';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonFunctionsService } from '../../../../providers/utils/common-functions';
import {
  APP_STRINGS,
  TEST_TYPE_RESULTS,
  TEST_REPORT_STATUSES,
  VEHICLE_TYPE,
  ANALYTICS_SCREEN_NAMES
} from '../../../../app/app.enums';
import { TestResultModel } from '../../../../models/tests/test-result.model';
import { AnalyticsService } from '../../../../providers/global';

@IonicPage()
@Component({
  selector: 'page-vehicle-history',
  templateUrl: 'vehicle-history.html'
})
export class VehicleHistoryPage {
  VEHICLE_TYPE: typeof VEHICLE_TYPE = VEHICLE_TYPE;
  vehicleData: VehicleModel;
  testResultHistory: TestResultModel[];
  testTypeResults = TEST_TYPE_RESULTS;
  noHistory: string;
  testResultHistoryClone: any[] = [];
  testTypeArray: any[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public commonFunc: CommonFunctionsService,
    private analyticsService: AnalyticsService
  ) {
    this.vehicleData = navParams.get('vehicleData');
    this.testResultHistory = navParams.get('testResultsHistory');
  }

  ngOnInit() {
    this.testResultHistoryClone = this.commonFunc.cloneObject(this.testResultHistory);
    this.createTestTypeArray();
    this.commonFunc.orderTestTypeArrayByDate(this.testTypeArray);
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(APP_STRINGS.VEHICLE_DETAILS);
    this.noHistory = APP_STRINGS.NO_HISTORY;
  }

  ionViewDidEnter() {
    this.analyticsService.setCurrentPage(ANALYTICS_SCREEN_NAMES.VEHICLE_TEST_HISTORY);
  }

  showTestDetails(testIndex: number, testTypeIndex: number): void {
    this.navCtrl.push('VehicleHistoryDetailsPage', {
      testResultHistory: this.testResultHistory,
      testIndex: testIndex,
      testTypeIndex: testTypeIndex,
      vehicleType: this.vehicleData.techRecord.vehicleType
    });
  }

  createTestTypeArray(): void {
    if (this.testResultHistory.length) {
      this.testResultHistoryClone.forEach((testResult, testIndex) => {
        if (
          testResult.testTypes.length &&
          testResult.testStatus === TEST_REPORT_STATUSES.SUBMITTED
        ) {
          testResult.testTypes.forEach((testType, typeTypeIndex) => {
            testType.testIndex = testIndex;
            testType.testTypeIndex = typeTypeIndex;
            this.testTypeArray.push(testType);
          });
        }
      });
      delete this.testResultHistoryClone;
    }
  }

  haveProhibition(testType): boolean {
    let resp = false;
    if (testType.prohibitionIssued) {
      resp = true;
    } else {
      if (testType.defects && testType.defects.length) {
        testType.defects.forEach((defect) => {
          if (defect.prohibitionIssued) resp = true;
        });
      } else {
        resp = false;
      }
    }
    return resp;
  }

  isVehicleOfType(vehicle: VehicleModel, ...vehicleType: VEHICLE_TYPE[]) {
    return this.commonFunc.checkForMatchInArray(vehicle.techRecord.vehicleType, vehicleType);
  }
}
