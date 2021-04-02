import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import {
  AlertController,
  Events,
  IonicPage,
  ItemSliding,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';
import { TestModel } from '../../../../models/tests/test.model';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { VehicleService } from '../../../../providers/vehicle/vehicle.service';
import { StateReformingService } from '../../../../providers/global/state-reforming.service';
import { VisitService } from '../../../../providers/visit/visit.service';
import { TestTypeModel } from '../../../../models/tests/test-type.model';
import {
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_EVENTS,
  ANALYTICS_LABEL,
  ANALYTICS_SCREEN_NAMES,
  ANALYTICS_VALUE,
  APP,
  APP_STRINGS,
  DURATION_TYPE,
  PAGE_NAMES,
  TEST_COMPLETION_STATUS,
  TEST_TYPE_INPUTS,
  TEST_TYPE_RESULTS,
  VEHICLE_TYPE
} from '../../../../app/app.enums';
import { TestTypesFieldsMetadata } from '../../../../assets/app-data/test-types-data/test-types-fields.metadata';
import { CommonFunctionsService } from '../../../../providers/utils/common-functions';
import { CallNumber } from '@ionic-native/call-number';
import { AppService, AnalyticsService, DurationService } from '../../../../providers/global';
import { TestTypeService } from '../../../../providers/test-type/test-type.service';
import { EuVehicleCategoryData } from '../../../../assets/app-data/eu-vehicle-category/eu-vehicle-category';

@IonicPage()
@Component({
  selector: 'page-test-create',
  templateUrl: 'test-create.html'
})
export class TestCreatePage implements OnInit {
  @ViewChildren('slidingItem') slidingItems: QueryList<ItemSliding>;
  VEHICLE_TYPE: typeof VEHICLE_TYPE = VEHICLE_TYPE;
  testData: TestModel;
  testTypesFieldsMetadata;
  testCompletionStatus: typeof TEST_COMPLETION_STATUS;
  completedFields = {};
  changeOpacity: boolean = false;
  displayAddVehicleButton: boolean;
  doesHgvLgvExist: boolean;
  errorIncomplete: boolean = false;
  allVehiclesCompletelyTested: boolean = false;
  TEST_CREATE_ERROR_BANNER: typeof APP_STRINGS.TEST_CREATE_ERROR_BANNER =
    APP_STRINGS.TEST_CREATE_ERROR_BANNER;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public callNumber: CallNumber,
    public alertCtrl: AlertController,
    public appService: AppService,
    public visitService: VisitService,
    public stateReformingService: StateReformingService,
    private vehicleService: VehicleService,
    private events: Events,
    private commonFunctions: CommonFunctionsService,
    private modalCtrl: ModalController,
    private analyticsService: AnalyticsService,
    private durationService: DurationService,
    private testTypeService: TestTypeService
  ) {
    this.testTypesFieldsMetadata = TestTypesFieldsMetadata.FieldsMetadata;
  }

  ngOnInit() {
    this.stateReformingService.saveNavStack(this.navCtrl);
    this.testCompletionStatus = TEST_COMPLETION_STATUS;
    let lastTestIndex = this.visitService.visit.tests.length - 1;
    this.testData = Object.keys(this.visitService.visit).length
      ? this.visitService.visit.tests[lastTestIndex]
      : this.navParams.get('test');
  }

  ionViewWillEnter() {
    this.displayAddVehicleButton = true;
    this.doesHgvLgvExist = false;
    for (let vehicle of this.testData.vehicles) {
      if (
        vehicle.techRecord.vehicleType === VEHICLE_TYPE.PSV ||
        vehicle.techRecord.vehicleType === VEHICLE_TYPE.CAR ||
        vehicle.techRecord.vehicleType === VEHICLE_TYPE.MOTORCYCLE ||
        this.testData.vehicles.length >= 4
      )
        this.displayAddVehicleButton = false;
      if (
        vehicle.techRecord.vehicleType === VEHICLE_TYPE.HGV ||
        vehicle.techRecord.vehicleType === VEHICLE_TYPE.LGV
      )
        this.doesHgvLgvExist = true;

      this.autoAssignVehicleCategoryOnlyWhenOneCategoryAvailable(vehicle);
    }
    this.events.subscribe(APP.TEST_TYPES_UPDATE_COMPLETED_FIELDS, (completedFields) => {
      this.completedFields = completedFields;
    });
    this.computeErrorIncomplete();
  }

  ionViewDidEnter() {
    this.analyticsService.setCurrentPage(ANALYTICS_SCREEN_NAMES.TEST_OVERVIEW);
  }

  ionViewWillLeave() {
    this.events.unsubscribe(APP.TEST_TYPES_UPDATE_COMPLETED_FIELDS);
    if (this.slidingItems.length) {
      this.slidingItems.forEach((slidingItem) => {
        slidingItem.close();
      });
    }
  }

  getCountryStringToBeDisplayed(vehicle: VehicleModel) {
    return this.commonFunctions.getCountryStringToBeDisplayed(vehicle);
  }

  doesOdometerDataExist(index: number) {
    if (this.testData.vehicles[index].odometerReading) {
      return (
        this.testData.vehicles[index].odometerReading.length &&
        this.testData.vehicles[index].odometerMetric.length
      );
    }
  }

  getOdometerStringToBeDisplayed(index: number) {
    if (this.doesOdometerDataExist(index)) {
      let unit = this.commonFunctions.getDistanceType(
        this.testData.vehicles[index].odometerMetric
      );
      return (
        this.vehicleService.formatOdometerReadingValue(
          this.testData.vehicles[index].odometerReading
        ) +
        ' ' +
        unit
      );
    } else {
      return 'Enter';
    }
  }

  getVehicleTypeIconToShow(vehicle: VehicleModel) {
    return vehicle.techRecord.vehicleType.toLowerCase();
  }

  isLecTestTypeInProgress(testType: TestTypeModel): boolean {
    if (
      testType &&
      ((testType.testResult === TEST_TYPE_RESULTS.FAIL && testType.additionalNotesRecorded) ||
        (testType.testResult === TEST_TYPE_RESULTS.PASS &&
          testType.testExpiryDate &&
          testType.emissionStandard &&
          testType.smokeTestKLimitApplied &&
          testType.fuelType &&
          testType.modType &&
          ((testType.particulateTrapFitted && testType.particulateTrapSerialNumber) ||
            testType.modificationTypeUsed)))
    ) {
      testType.completionStatus = TEST_COMPLETION_STATUS.EDIT;
      return false;
    } else {
      testType.completionStatus = TEST_COMPLETION_STATUS.IN_PROGRESS;
      return true;
    }
  }

  getTestTypeStatus(vehicle: VehicleModel, testType: TestTypeModel) {
    let isInProgress = true;
    this.testTypeService.updateLinkedTestResults(vehicle, testType);
    for (let testTypeFieldMetadata of this.testTypesFieldsMetadata) {
      if (
        testType.testTypeId === testTypeFieldMetadata.testTypeId &&
        testTypeFieldMetadata.sections.length
      ) {
        isInProgress = false;
        testType.completionStatus = TEST_COMPLETION_STATUS.EDIT;
        for (let section of testTypeFieldMetadata.sections) {
          for (let input of section.inputs) {
            if (
              (!testType[input.testTypePropertyName] &&
                testType[input.testTypePropertyName] !== false) ||
              ((this.testTypeService.isAdrTestType(testType.testTypeId) ||
                this.testTypeService.isTirTestType(testType.testTypeId) ||
                this.testTypeService.isSpecialistTestTypesExceptForCoifAndVoluntaryIvaTestAndRetest(
                  testType.testTypeId
                ) ||
                this.testTypeService.isSpecialistPartOfCoifTestTypes(testType.testTypeId) ||
                this.testTypeService.isPsvNotifiableAlterationTestType(testType.testTypeId)) &&
                input.testTypePropertyName === TEST_TYPE_INPUTS.CERTIFICATE_NUMBER)
            ) {
              if (
                (input.testTypePropertyName !== TEST_TYPE_INPUTS.SIC_SEATBELTS_NUMBER &&
                  input.testTypePropertyName !== TEST_TYPE_INPUTS.SIC_LAST_DATE) ||
                (testTypeFieldMetadata.category === 'B' &&
                  (input.testTypePropertyName === TEST_TYPE_INPUTS.SIC_SEATBELTS_NUMBER ||
                    input.testTypePropertyName === TEST_TYPE_INPUTS.SIC_LAST_DATE))
              ) {
                isInProgress = true;
                testType.completionStatus = TEST_COMPLETION_STATUS.IN_PROGRESS;
              }
              if (
                this.testTypeService.isAdrTestType(testType.testTypeId) &&
                (testType.testResult === TEST_TYPE_RESULTS.FAIL ||
                  (input.testTypePropertyName === TEST_TYPE_INPUTS.CERTIFICATE_NUMBER &&
                    testType.certificateNumber &&
                    testType.certificateNumber.length === 6))
              ) {
                isInProgress = false;
                testType.completionStatus = TEST_COMPLETION_STATUS.EDIT;
              }
              if (
                this.testTypeService.isTirTestType(testType.testTypeId) &&
                (testType.testResult === TEST_TYPE_RESULTS.FAIL ||
                  (input.testTypePropertyName === TEST_TYPE_INPUTS.CERTIFICATE_NUMBER &&
                    testType.certificateNumber &&
                    testType.certificateNumber.length === 5))
              ) {
                isInProgress = false;
                testType.completionStatus = TEST_COMPLETION_STATUS.EDIT;
              }
              if (
                (this.testTypeService.isSpecialistTestTypesExceptForCoifAndVoluntaryIvaTestAndRetest(
                  testType.testTypeId
                ) ||
                  this.testTypeService.isSpecialistPartOfCoifTestTypes(testType.testTypeId)) &&
                (testType.testResult === TEST_TYPE_RESULTS.FAIL ||
                  (input.testTypePropertyName === TEST_TYPE_INPUTS.CERTIFICATE_NUMBER &&
                    testType.certificateNumber))
              ) {
                isInProgress = false;
                testType.completionStatus = TEST_COMPLETION_STATUS.EDIT;
              }
              if (
                this.testTypeService.isPsvNotifiableAlterationTestType(testType.testTypeId) &&
                testType.testResult
              ) {
                isInProgress = false;
                testType.completionStatus = TEST_COMPLETION_STATUS.EDIT;
              }
            } else {
              if (
                !this.completedFields.hasOwnProperty(input.testTypePropertyName) &&
                (input.testTypePropertyName === TEST_TYPE_INPUTS.SIC_CARRIED_OUT ||
                  input.testTypePropertyName === TEST_TYPE_INPUTS.SIC_SEATBELTS_NUMBER ||
                  input.testTypePropertyName === TEST_TYPE_INPUTS.SIC_LAST_DATE)
              ) {
                this.completedFields[input.testTypePropertyName] =
                  testType[input.testTypePropertyName];
              }
            }
          }
        }

        if (this.testTypeService.isLecTestType(testType.testTypeId)) {
          isInProgress = this.isLecTestTypeInProgress(testType);
        }

        if (
          this.testTypeService.isSpecialistTestType(testType.testTypeId) &&
          !this.testTypeService.areSpecialistCustomDefectsCompleted(testType)
        ) {
          isInProgress = true;
          testType.completionStatus = TEST_COMPLETION_STATUS.IN_PROGRESS;
        }
        testType.testResult = this.testTypeService.setTestResult(
          testType,
          testTypeFieldMetadata.hasDefects
        );
      } else if (
        testType.testTypeId === testTypeFieldMetadata.testTypeId &&
        !testTypeFieldMetadata.sections.length
      ) {
        testType.testResult = this.testTypeService.setTestResult(
          testType,
          testTypeFieldMetadata.hasDefects
        );
        isInProgress = false;
        testType.completionStatus = TEST_COMPLETION_STATUS.EDIT;
      }
    }

    return isInProgress ? 'In progress' : 'Edit';
  }

  addVehicleTest(vehicle: VehicleModel): void {
    this.durationService.setDuration(
      { start: Date.now() },
      DURATION_TYPE[DURATION_TYPE.TEST_TYPE]
    );

    this.navCtrl.push(PAGE_NAMES.TEST_TYPES_LIST_PAGE, { vehicleData: vehicle });
  }

  onVehicleDetails(vehicle: VehicleModel) {
    this.navCtrl.push(PAGE_NAMES.VEHICLE_DETAILS_PAGE, { vehicle: vehicle });
  }

  openTest(vehicle: VehicleModel, vehicleTest: TestTypeModel): void {
    if (!this.isTestAbandoned(vehicleTest)) {
      this.navCtrl.push(PAGE_NAMES.COMPLETE_TEST_PAGE, {
        vehicle: vehicle,
        vehicleTest: vehicleTest,
        completedFields: this.completedFields,
        errorIncomplete: this.errorIncomplete
      });
    } else {
      this.navCtrl.push(PAGE_NAMES.TEST_ABANDONING_PAGE, {
        vehicleTest: vehicleTest,
        selectedReasons: vehicleTest.reasons,
        editMode: false
      });
    }
  }

  onOdometer(index: number) {
    this.durationService.setDuration(
      { start: Date.now() },
      DURATION_TYPE[DURATION_TYPE.ODOMETER_READING]
    );

    const MODAL = this.modalCtrl.create(PAGE_NAMES.ODOMETER_READING_PAGE, {
      vehicle: this.testData.vehicles[index],
      errorIncomplete: this.errorIncomplete
    });
    MODAL.present();
    MODAL.onDidDismiss(() => {
      this.computeErrorIncomplete();
    });
  }

  onCountryOfRegistration(vehicle: VehicleModel) {
    const MODAL = this.modalCtrl.create(PAGE_NAMES.REGION_READING_PAGE, {
      vehicle: vehicle
    });
    MODAL.present();
    MODAL.onDidDismiss(() => {
      this.computeErrorIncomplete();
    });
  }

  onVehicleCategory(vehicle: VehicleModel) {
    const MODAL = this.modalCtrl.create(PAGE_NAMES.CATEGORY_READING_PAGE, {
      vehicle: vehicle,
      errorIncomplete: this.errorIncomplete
    });
    MODAL.present();
    MODAL.onDidDismiss(() => {
      this.computeErrorIncomplete();
    });
  }

  onRemoveVehicleTest(
    vehicle: VehicleModel,
    vehicleTest: TestTypeModel,
    slidingItem: ItemSliding
  ) {
    slidingItem.close();
    const alert = this.alertCtrl.create({
      title: APP_STRINGS.REMOVE_TEST_TITLE,
      message: APP_STRINGS.REMOVE_TEST_MSG,
      buttons: [
        {
          text: APP_STRINGS.CANCEL,
          role: 'cancel'
        },
        {
          text: APP_STRINGS.REMOVE,
          handler: () => {
            this.removeVehicleTest(vehicle, vehicleTest);
          }
        }
      ]
    });

    alert.present();
    alert.onDidDismiss(() => {
      this.computeErrorIncomplete();
    });
  }

  async removeVehicleTest(vehicle: VehicleModel, vehicleTest: TestTypeModel) {
    await this.analyticsService.logEvent({
      category: ANALYTICS_EVENT_CATEGORIES.TEST_TYPES,
      event: ANALYTICS_EVENTS.REMOVE_TEST_TYPE,
      label: ANALYTICS_LABEL.TEST_TYPE_NAME
    });

    await this.analyticsService.addCustomDimension(
      Object.keys(ANALYTICS_LABEL).indexOf('TEST_TYPE_NAME') + 1,
      vehicleTest.testTypeName
    );

    this.vehicleService.removeSicFields(vehicle, this.completedFields);
    this.vehicleService.removeTestType(vehicle, vehicleTest);
  }

  isTestAbandoned(vehicleTest: TestTypeModel) {
    return vehicleTest.reasons.length > 0;
  }

  onAbandonVehicleTest(vehicleType, vehicleTest) {
    this.navCtrl.push(PAGE_NAMES.REASONS_SELECTION_PAGE, {
      vehicleType: vehicleType,
      vehicleTest: vehicleTest
    });
  }

  onCancel() {
    this.navCtrl.push(PAGE_NAMES.TEST_CANCEL_PAGE, {
      test: this.testData
    });
  }

  addTrailer(tests) {
    this.navCtrl.push(PAGE_NAMES.VEHICLE_LOOKUP_PAGE, { test: tests[tests.length - 1] });
  }

  areAllTestTypesCompleted(vehicle: VehicleModel): boolean {
    return vehicle.testTypes.every((test: TestTypeModel) => {
      this.getTestTypeStatus(vehicle, test);
      return (
        test.completionStatus != TEST_COMPLETION_STATUS.IN_PROGRESS ||
        test.testResult === TEST_TYPE_RESULTS.ABANDONED
      );
    });
  }

  doesVehicleHaveOnlyAbandonedTestTypes(vehicle: VehicleModel): boolean {
    return vehicle.testTypes.every((test: TestTypeModel) => {
      return test.testResult === TEST_TYPE_RESULTS.ABANDONED;
    });
  }

  areAllVehiclesCompletelyTested(test: TestModel): boolean {
    return test.vehicles.every((vehicle: VehicleModel) => {
      let isOdometerCaptured = vehicle.trailerId ? true : vehicle.odometerReading; // TRLs does not have odometer Reading
      return (
        (vehicle.countryOfRegistration &&
          vehicle.euVehicleCategory &&
          isOdometerCaptured &&
          this.areAllTestTypesCompleted(vehicle)) ||
        this.doesVehicleHaveOnlyAbandonedTestTypes(vehicle)
      );
    });
  }

  computeErrorIncomplete() {
    this.allVehiclesCompletelyTested = this.areAllVehiclesCompletelyTested(this.testData);
    if (this.allVehiclesCompletelyTested) {
      this.errorIncomplete = false;
    }
  }

  /**
   * Go to test review page with checks on the tests.
   * As this page is used to change the details during a test review also; if i'm already coming from a test review page (for a vehicle being tested), go back to that page.
   */
  async reviewTest() {
    let allVehiclesHaveTests: boolean = true;
    this.changeOpacity = true;
    let finishedTest = true;
    let requiredFieldsCompleted = true;
    for (let vehicle of this.testData.vehicles) {
      if (
        (!vehicle.countryOfRegistration ||
          !vehicle.euVehicleCategory ||
          (vehicle.techRecord.vehicleType !== VEHICLE_TYPE.TRL && !vehicle.odometerReading)) &&
        !this.doesVehicleHaveOnlyAbandonedTestTypes(vehicle)
      ) {
        this.logMissingFields(vehicle);
        requiredFieldsCompleted = false;
      }
      finishedTest = finishedTest && this.areAllTestTypesCompleted(vehicle);
      allVehiclesHaveTests = allVehiclesHaveTests && vehicle.testTypes.length > 0;
    }

    if (!allVehiclesHaveTests) {
      let alert = this.alertCtrl.create({
        title: APP_STRINGS.NO_TESTS_ADDED,
        message: APP_STRINGS.PLEASE_ADD_TEST,
        buttons: [APP_STRINGS.OK]
      });
      alert.present();

      await this.analyticsService.logEvent({
        category: ANALYTICS_EVENT_CATEGORIES.ERRORS,
        event: ANALYTICS_EVENTS.TEST_ERROR,
        label: ANALYTICS_LABEL.ERROR
      });

      await this.analyticsService.addCustomDimension(
        Object.keys(ANALYTICS_LABEL).indexOf('ERROR') + 1,
        ANALYTICS_VALUE.NO_TEST_ADDED
      );

      await this.trackTestReviewFailure(ANALYTICS_VALUE.NO_TEST_ADDED);

      alert.onDidDismiss(() => (this.changeOpacity = false));
    } else if (!finishedTest || !requiredFieldsCompleted) {
      this.changeOpacity = false;
      this.errorIncomplete = true;

      await this.analyticsService.logEvent({
        category: ANALYTICS_EVENT_CATEGORIES.ERRORS,
        event: ANALYTICS_EVENTS.TEST_ERROR,
        label: ANALYTICS_VALUE.NOT_ALL_TESTS_COMPLETED
      });

      if (!finishedTest) {
        await this.analyticsService.logEvent({
          category: ANALYTICS_EVENT_CATEGORIES.REVIEWS,
          event: ANALYTICS_EVENTS.TEST_REVIEW_UNSUCCESSFUL,
          label: ANALYTICS_VALUE.NOT_ALL_TESTS_COMPLETED
        });
      }
    } else {
      this.changeOpacity = false;
      this.errorIncomplete = false;
      if (this.navCtrl.getPrevious().name === PAGE_NAMES.TEST_REVIEW_PAGE) {
        this.navCtrl.pop();
      } else {
        this.navCtrl.push(PAGE_NAMES.TEST_REVIEW_PAGE, { visit: this.visitService.visit });
      }
    }
  }

  async trackTestReviewFailure(value: string): Promise<void> {
    await this.analyticsService.logEvent({
      category: ANALYTICS_EVENT_CATEGORIES.REVIEWS,
      event: ANALYTICS_EVENTS.TEST_REVIEW_UNSUCCESSFUL,
      label: ANALYTICS_LABEL.MISSING_MADATORY_FIELD
    });

    await this.analyticsService.addCustomDimension(
      Object.keys(ANALYTICS_LABEL).indexOf('MISSING_MADATORY_FIELD') + 1,
      value
    );
  }

  async logMissingFields(vehicle: VehicleModel) {
    if (!vehicle.countryOfRegistration) {
      await this.trackTestReviewFailure(ANALYTICS_VALUE.COUNTRY_OF_REGISTRATION);
    }

    if (!vehicle.euVehicleCategory) {
      await this.trackTestReviewFailure(ANALYTICS_VALUE.EU_VEHICLE_CATEGORY);
    }

    if (!vehicle.odometerReading) {
      await this.trackTestReviewFailure(ANALYTICS_VALUE.ODOMETER_READING);
    }
  }

  isVehicleOfType(vehicle: VehicleModel, ...vehicleType: VEHICLE_TYPE[]) {
    return this.commonFunctions.checkForMatchInArray(vehicle.techRecord.vehicleType, vehicleType);
  }

  displayVehicleCategoryKey(key: string): string {
    return this.vehicleService.displayVehicleCategoryKey(key);
  }

  autoAssignVehicleCategoryOnlyWhenOneCategoryAvailable(vehicle: VehicleModel): void {
    if (vehicle.techRecord.vehicleType === VEHICLE_TYPE.CAR) {
      vehicle.euVehicleCategory = EuVehicleCategoryData.EuCategoryCarData[0].key;
    }
    if (vehicle.techRecord.vehicleType === VEHICLE_TYPE.LGV) {
      vehicle.euVehicleCategory = EuVehicleCategoryData.EuCategoryLgvData[0].key;
    }
  }
}
