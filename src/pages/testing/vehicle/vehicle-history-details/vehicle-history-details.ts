import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CommonFunctionsService } from "../../../../providers/utils/common-functions";
import {
  TEST_TYPE_RESULTS,
  DEFICIENCY_CATEGORY,
  DEFAULT_VALUES,
  APP_STRINGS,
  ODOMETER_METRIC,
  FIREBASE_SCREEN_NAMES
} from '../../../../app/app.enums';
import {
  TestsWithoutCertificate,
  TestsWithoutSeatbelts,
  TestsWithoutDefects
} from '../../../../assets/app-data/test-required-fields/test-required-fields.data';
import { TestTypeModel } from "../../../../models/tests/test-type.model";
import { TestResultModel } from "../../../../models/tests/test-result.model";
import { CountryOfRegistrationData } from "../../../../assets/app-data/country-of-registration/country-of-registration.data";
import { FirebaseLogsService } from "../../../../providers/firebase-logs/firebase-logs.service";
import { AppService } from '../../../../providers/global/app.service';
import { TestTypeService } from "../../../../providers/test-type/test-type.service";

@IonicPage()
@Component({
  selector: 'page-vehicle-history-details',
  templateUrl: 'vehicle-history-details.html',
})
export class VehicleHistoryDetailsPage {
  testResultHistory: any;
  testIndex: number;
  testTypeIndex: number;
  selectedTestResult: TestResultModel;
  selectedTestType: TestTypeModel;
  testTypeResults: typeof TEST_TYPE_RESULTS;
  defaultValues: typeof DEFAULT_VALUES;
  testsWithoutCertificate: any;
  testsWithoutSeatbelts: any;
  testsWithoutDefects: any;
  doesNotHaveCert: boolean = false;
  doesNotHaveDefects: boolean = false;
  doesNotHaveBelts: boolean = false;
  doesNotHaveExpiry: boolean;
  doDefectsExist: boolean;
  isTestResultAbandon: boolean;
  isTestResultFail: boolean;
  testResultColor: string;
  countryOfRegistration: string;
  distanceType: string;
  vehicleType: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public commonFunc: CommonFunctionsService,
              private firebaseLogsService: FirebaseLogsService,
              public appService: AppService,
              public testTypeService: TestTypeService) {
    this.testResultHistory = navParams.get('testResultHistory');
    this.testIndex = navParams.get('testIndex');
    this.testTypeIndex = navParams.get('testTypeIndex');
    this.vehicleType = navParams.get('vehicleType');
  }

  ngOnInit() {
    this.selectedTestResult = this.testResultHistory[this.testIndex];
    this.selectedTestType = this.testResultHistory[this.testIndex].testTypes[this.testTypeIndex];
    this.testTypeResults = TEST_TYPE_RESULTS;
    this.defaultValues = DEFAULT_VALUES;
    this.doDefectsExist = this.checkForDefects(this.selectedTestType.defects);

    this.setTestMetadata();
    this.compareTestWithMetadata();

    this.isTestResultAbandon = this.commonFunc.checkForMatch(this.selectedTestType.testResult, TEST_TYPE_RESULTS.ABANDONED);
    this.isTestResultFail = this.commonFunc.checkForMatch(this.selectedTestType.testResult, TEST_TYPE_RESULTS.FAIL);
    this.testResultColor = this.commonFunc.getTestResultColor(this.selectedTestType.testResult);
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(APP_STRINGS.TEST_HISTORY);
  }

  ionViewDidEnter() {
    this.firebaseLogsService.setScreenName(FIREBASE_SCREEN_NAMES.VEHICLE_TEST_HISTORY_DETAILS);
  }

  setTestMetadata() {
    this.testsWithoutCertificate = TestsWithoutCertificate.TestsWithoutCertificate;
    this.testsWithoutSeatbelts = TestsWithoutSeatbelts.TestsWithoutSeatbelts;
    this.testsWithoutDefects = TestsWithoutDefects.TestsWithoutDefects;
    this.countryOfRegistration = CountryOfRegistrationData.CountryData.find(country => {
      return this.selectedTestResult.countryOfRegistration === country.key;
    }).value.split(' -')[0];
    this.distanceType = this.commonFunc.getDistanceType(this.testResultHistory[this.testIndex].odometerReadingUnits);
  }

  compareTestWithMetadata() {
    if (this.selectedTestType.testTypeName) {
      this.doesNotHaveCert = this.commonFunc.checkForMatchInArray(this.selectedTestType.testTypeName, this.testsWithoutCertificate);
      this.doesNotHaveDefects = this.commonFunc.checkForMatchInArray(this.selectedTestType.testTypeId, this.testsWithoutDefects);
      this.doesNotHaveBelts = this.commonFunc.checkForMatchInArray(this.selectedTestType.testTypeName, this.testsWithoutSeatbelts);
    }
  }

  getDeficiencyColor(deficiencyCategory: string): string {
    switch (deficiencyCategory.toLowerCase()) {
      case DEFICIENCY_CATEGORY.ADVISORY:
        return 'light';
      case DEFICIENCY_CATEGORY.DANGEROUS:
        return 'dark';
      case DEFICIENCY_CATEGORY.MAJOR:
        return 'danger';
      case DEFICIENCY_CATEGORY.MINOR:
        return 'attention';
    }
  }

  checkForDefects(defects: any): boolean {
    return !(defects === null || !defects.length);
  }

}
