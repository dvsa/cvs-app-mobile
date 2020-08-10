import { TestCreatePage } from './test-create';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  IonicModule,
  NavController,
  NavParams,
  AlertController,
  ModalController,
  Events,
} from 'ionic-angular';
import { VehicleService } from '../../../../providers/vehicle/vehicle.service';
import { TestTypeModel } from '../../../../models/tests/test-type.model';
import { TestTypeDataModelMock } from '../../../../assets/data-mocks/data-model/test-type-data-model.mock';
import { TechRecordDataMock } from '../../../../assets/data-mocks/tech-record-data.mock';
import { NavParamsMock } from '../../../../../test-config/ionic-mocks/nav-params.mock';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ODOMETER_METRIC,
  VEHICLE_TYPE,
  TEST_COMPLETION_STATUS,
  TEST_TYPE_RESULTS,
  MOD_TYPES,
  DEFICIENCY_CATEGORY,
} from "../../../../app/app.enums";
import { TestService } from "../../../../providers/test/test.service";
import { TestServiceMock } from "../../../../../test-config/services-mocks/test-service.mock";
import { VehicleServiceMock } from "../../../../../test-config/services-mocks/vehicle-service.mock";
import { VisitService } from "../../../../providers/visit/visit.service";
import { VisitServiceMock } from "../../../../../test-config/services-mocks/visit-service.mock";
import { StateReformingService } from "../../../../providers/global/state-reforming.service";
import { StateReformingServiceMock } from "../../../../../test-config/services-mocks/state-reforming-service.mock";
import { VisitDataMock } from "../../../../assets/data-mocks/visit-data.mock";
import { VehicleTechRecordModel } from "../../../../models/vehicle/tech-record.model";
import { CommonFunctionsService } from "../../../../providers/utils/common-functions";
import { CallNumber } from "@ionic-native/call-number";
import { AppService } from "../../../../providers/global/app.service";
import { AppServiceMock } from "../../../../../test-config/services-mocks/app-service.mock";
import { AlertControllerMock, EventsMock, ModalControllerMock, NavControllerMock } from "ionic-mocks";
import { FirebaseLogsService } from "../../../../providers/firebase-logs/firebase-logs.service";
import { FirebaseLogsServiceMock } from "../../../../../test-config/services-mocks/firebaseLogsService.mock";
import { VehicleDataMock } from "../../../../assets/data-mocks/vehicle-data.mock";
import { TestDataModelMock } from "../../../../assets/data-mocks/data-model/test-data-model.mock";
import { TestTypeService } from "../../../../providers/test-type/test-type.service";
import { TestTypeServiceMock } from "../../../../../test-config/services-mocks/test-type-service.mock";
import { DefectDetailsDataMock } from "../../../../assets/data-mocks/defect-details-data.mock";
import { VehicleModel } from "../../../../models/vehicle/vehicle.model";
import { EuVehicleCategoryData } from "../../../../assets/app-data/eu-vehicle-category/eu-vehicle-category";
import { SpecialistCustomDefectModel } from "../../../../models/defects/defect-details.model";

describe('Component: TestCreatePage', () => {
  let component: TestCreatePage;
  let fixture: ComponentFixture<TestCreatePage>;
  let navCtrl: NavController;
  let navParams: NavParams;
  let vehicleService: VehicleService;
  let visitService: VisitService;
  let appService: AppService;
  let testService: TestService;
  let stateReformingService: StateReformingService;
  let callNumberSpy: any;
  let firebaseLogsService: FirebaseLogsService;
  let modalctrl: ModalController;
  let commonFuncService: CommonFunctionsService;

  const ADDED_VEHICLE_TEST: TestTypeModel = TestTypeDataModelMock.TestTypeData;
  const vehicle: VehicleTechRecordModel = TechRecordDataMock.VehicleTechRecordData;
  const TEST_DATA = TestDataModelMock.TestData;
  const VEHICLE = VehicleDataMock.VehicleData;
  const DEFECTS = DefectDetailsDataMock.DefectDetails;

  beforeEach(async(() => {
    callNumberSpy = jasmine.createSpyObj('CallNumber', ['callPhoneNumber']);

    TestBed.configureTestingModule({
      declarations: [TestCreatePage],
      imports: [IonicModule.forRoot(TestCreatePage)],
      providers: [
        { provide: FirebaseLogsService, useClass: FirebaseLogsServiceMock },
        CommonFunctionsService,
        { provide: Events, useFactory: () => EventsMock.instance() },
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: ModalController, useFactory: () => ModalControllerMock.instance() },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: AppService, useClass: AppServiceMock },
        { provide: CallNumber, useValue: callNumberSpy },
        { provide: StateReformingService, useClass: StateReformingServiceMock },
        { provide: VehicleService, useClass: VehicleServiceMock },
        { provide: VisitService, useClass: VisitServiceMock },
        { provide: TestService, useClass: TestServiceMock },
        { provide: NavParams, useClass: NavParamsMock },
        { provide: TestTypeService, useClass: TestTypeServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCreatePage);
    component = fixture.componentInstance;
    navCtrl = TestBed.get(NavController);
    navParams = TestBed.get(NavParams);
    vehicleService = TestBed.get(VehicleService);
    testService = TestBed.get(TestService);
    appService = TestBed.get(AppService);
    visitService = TestBed.get(VisitService);
    stateReformingService = TestBed.get(StateReformingService);
    firebaseLogsService = TestBed.get(FirebaseLogsService);
    modalctrl = TestBed.get(ModalController);
    commonFuncService = TestBed.get(CommonFunctionsService);
  }));

  beforeEach(() => {
    const navParams = fixture.debugElement.injector.get(NavParams);

    navParams.get = jasmine.createSpy('get').and.callFake((param) => {
      const params = {
        test: VisitDataMock.VisitTestData,
      };
      return params[param];
    });
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
    testService = null;
    vehicleService = null;
    visitService = null;
    stateReformingService = null;
    firebaseLogsService = null;
    modalctrl = null;
    navCtrl = null;
    commonFuncService = null;
  });

  it('should create the component', () => {
    expect(fixture).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should test ionViewWillEnter lifecycle hook', () => {
    spyOn(component, 'computeErrorIncomplete');
    component.testData = TEST_DATA;
    component.testData.vehicles.push(VEHICLE);
    component.ionViewWillEnter();
    expect(component.computeErrorIncomplete).toHaveBeenCalled();
    expect(component.displayAddVehicleButton).toBeFalsy();
    component.testData.vehicles[0].techRecord.vehicleType = VEHICLE_TYPE.HGV;
    component.ionViewWillEnter();
    expect(component.displayAddVehicleButton).toBeTruthy();
  });

  it('should test ionViewDidEnterLogic', () => {
    spyOn(firebaseLogsService, 'setScreenName');
    component.ionViewDidEnter();
    expect(firebaseLogsService.setScreenName).toHaveBeenCalled();
  });

  it('should say either a test is abandoned or not', () => {
    expect(component.isTestAbandoned(ADDED_VEHICLE_TEST)).toBeFalsy();
    ADDED_VEHICLE_TEST.reasons.push('Best reason');
    ADDED_VEHICLE_TEST.additionalCommentsForAbandon = 'Additional comment';
    expect(component.isTestAbandoned(ADDED_VEHICLE_TEST)).toBeTruthy();
  });

  it('should say either a test has odometer data or not', () => {
    const newTest = testService.createTest();
    const newVehicle = vehicleService.createVehicle(vehicle);
    newTest.vehicles.push(newVehicle);
    component.testData = newTest;

    expect(component.doesOdometerDataExist(0)).toBeFalsy();
    newTest.vehicles[0].odometerReading = '1234';
    newTest.vehicles[0].odometerMetric = ODOMETER_METRIC.MILES;
    expect(component.doesOdometerDataExist(0)).toBeTruthy();
  });

  it('should return correctly formatted string of odometer data', () => {
    const newTest = testService.createTest();
    const newVehicle = vehicleService.createVehicle(vehicle);
    newTest.vehicles.push(newVehicle);
    component.testData = newTest;

    newTest.vehicles[0].odometerReading = '1234';
    newTest.vehicles[0].odometerMetric = ODOMETER_METRIC.MILES;

    expect(component.getOdometerStringToBeDisplayed(0)).toEqual('1,234 mi');
  });

  it('should return the test type status to be displayed', () => {
    expect(component.getTestTypeStatus(VEHICLE, ADDED_VEHICLE_TEST)).toEqual('In progress');
    ADDED_VEHICLE_TEST.numberOfSeatbeltsFitted = 2;
    ADDED_VEHICLE_TEST.seatbeltInstallationCheckDate = true;
    ADDED_VEHICLE_TEST.lastSeatbeltInstallationCheckDate = '19-01-2019';
    expect(component.getTestTypeStatus(VEHICLE, ADDED_VEHICLE_TEST)).toEqual('Edit');
    ADDED_VEHICLE_TEST.testTypeId = '40';
    ADDED_VEHICLE_TEST.testResult = null;
    expect(component.getTestTypeStatus(VEHICLE, ADDED_VEHICLE_TEST)).toEqual('Edit');
  });

  it('should have "Edit" status if a ADR test has the certificateNumber exactly 6 digits long', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '50';
    testType.testExpiryDate = new Date().toISOString();
    testType.certificateNumber = '12345';
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('In progress');
    testType.certificateNumber = '123456';
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('Edit');
  });

  it('should set the testResult to FAIL when a PASS test with sections has major defects', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testResult = TEST_TYPE_RESULTS.PASS;
    testType.defects.push(DefectDetailsDataMock.DefectData);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.FAIL);
  });

  it('should set the testResult to PRS when a PASS test with sections has repaired major defects', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testResult = TEST_TYPE_RESULTS.PASS;
    const defect = DefectDetailsDataMock.DefectData;
    defect.prs = true;
    testType.defects.push(defect);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.PRS);
  });

  it('should not change the testResult when a PASS test with sections has minor defects', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testResult = TEST_TYPE_RESULTS.PASS;
    const defect = DefectDetailsDataMock.DefectData;
    defect.deficiencyCategory = DEFICIENCY_CATEGORY.MINOR;
    testType.defects.push(defect);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.PASS);
  });

  it('should set the testResult to FAIL when a test with sections has major defects but does not have a testResult', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testResult = undefined;
    testType.defects.push(DefectDetailsDataMock.DefectData);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.FAIL);
  });

  it('should set the testResult to FAIL when a PASS test without sections has major defects', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '94';
    testType.testResult = TEST_TYPE_RESULTS.PASS;
    testType.defects.push(DefectDetailsDataMock.DefectData);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.FAIL);
  });

  it('should set the testResult to PRS when a PASS test without sections has repaired major defects', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '94';
    testType.testResult = TEST_TYPE_RESULTS.PASS;
    const defect = DefectDetailsDataMock.DefectData;
    defect.prs = true;
    testType.defects.push(defect);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.PRS);
  });

  it('should not change the testResult when a PASS test without sections has minor defects', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '94';
    testType.testResult = TEST_TYPE_RESULTS.PASS;
    const defect = DefectDetailsDataMock.DefectData;
    defect.deficiencyCategory = DEFICIENCY_CATEGORY.MINOR;
    testType.defects.push(defect);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.PASS);
  });

  it('should set the testResult to FAIL when a test without sections has major defects but does not have a testResult', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '94';
    testType.testResult = undefined;
    testType.defects.push(DefectDetailsDataMock.DefectData);

    component.getTestTypeStatus(vehicle, testType);

    expect(testType.testResult).toBe(TEST_TYPE_RESULTS.FAIL);
  });

  it('should have "Edit" status if a TIR test has the certificateNumber exactly 5 digits long', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '49';
    testType.certificateNumber = '1234';
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('In progress');
    testType.certificateNumber = '12345';
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('Edit');
  });

  it('should have "Edit" status if a Specialist test has a certificateNumber captured', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '125';
    testType.certificateNumber = null;
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('In progress');
    testType.certificateNumber = '12345';
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('Edit');
  });

  it('should have "Edit" status if a PSV Notifiable Alteration test has a testResult captured', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '38';
    testType.testResult = null;
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('In progress');
    testType.testResult = 'pass';
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('Edit');
  });

  it('should have "in progress" status if a Specialist test has the custom defects incompletely captured', () => {
    const testType: TestTypeModel = { ...TestTypeDataModelMock.TestTypeData };
    const vehicle: VehicleModel = { ...VEHICLE };
    testType.testTypeId = '125';
    testType.certificateNumber = '12345';
    testType.customDefects.push({} as SpecialistCustomDefectModel);
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('In progress');
    testType.customDefects[0].referenceNumber = '12345';
    testType.customDefects[0].defectName = 'customDefect';
    testType.customDefects[0].hasAllMandatoryFields = true;
    expect(component.getTestTypeStatus(vehicle, testType)).toEqual('Edit');
  });

  it('should not allow to review a test because not all mandatory fields completed', () => {
    const newTest = testService.createTest();
    const newVehicle = vehicleService.createVehicle(vehicle);
    vehicleService.addTestType(newVehicle, ADDED_VEHICLE_TEST);
    newTest.vehicles.push(newVehicle);
    component.testData = newTest;

    component.reviewTest();
  });

  it('should not allow to review a test because no testType added', () => {
    const newTest = testService.createTest();
    const newVehicle = vehicleService.createVehicle(vehicle);
    newTest.vehicles.push(newVehicle);
    newVehicle.testTypes = [];
    newVehicle.countryOfRegistration = 'United Kingdom';
    newVehicle.euVehicleCategory = 'm1';
    newVehicle.odometerReading = '122';
    component.testData = newTest;

    component.reviewTest();
  });

  it('should not allow to review a combination test if at least one vehicle has an incomplete test', () => {
    const newTest = testService.createTest();
    const completeTest = TestTypeDataModelMock.TestTypeData;
    completeTest.testTypeId = '90';
    const incompleteTest = TestTypeDataModelMock.TestTypeData;
    incompleteTest.testTypeId = '90';
    incompleteTest.testResult = null;

    const hgv = vehicleService.createVehicle(vehicle);
    vehicleService.addTestType(hgv, incompleteTest);
    hgv.techRecord.vehicleType = VEHICLE_TYPE.HGV;
    hgv.countryOfRegistration = 'United Kingdom';
    hgv.euVehicleCategory = 'n1';
    hgv.odometerReading = '122';
    newTest.vehicles.push(hgv);

    const trailer = vehicleService.createVehicle(vehicle);
    vehicleService.addTestType(trailer, completeTest);
    trailer.techRecord.vehicleType = VEHICLE_TYPE.TRL;
    trailer.countryOfRegistration = 'United Kingdom';
    trailer.euVehicleCategory = 'o2';
    newTest.vehicles.push(trailer);

    component.testData = newTest;
    component.reviewTest();
    expect(component.errorIncomplete).toBe(true);
    expect(navCtrl.pop).not.toHaveBeenCalled();
    expect(navCtrl.push).not.toHaveBeenCalled();
  });

  it('should test firebase logging when adding a test type', () => {
    component.addVehicleTest(vehicleService.createVehicle(vehicle));
    expect(firebaseLogsService.add_test_type_time.add_test_type_start_time).toBeTruthy();
  });

  it('should test firebase logging when removing a test type', () => {
    spyOn(firebaseLogsService, 'logEvent');
    component.completedFields = {};
    component.removeVehicleTest(vehicleService.createVehicle(vehicle), ADDED_VEHICLE_TEST);
    expect(firebaseLogsService.logEvent).toHaveBeenCalled();
  });

  it('should test onOdometer logic', () => {
    const newTest = testService.createTest();
    const newVehicle = vehicleService.createVehicle(vehicle);
    newTest.vehicles.push(newVehicle);
    component.testData = newTest;
    component.onOdometer(0);
    expect(modalctrl.create).toHaveBeenCalled();
    expect(
      firebaseLogsService.add_odometer_reading_time.add_odometer_reading_start_time,
    ).toBeTruthy();
  });

  it('should test onVehicleCategory logic', () => {
    component.onCountryOfRegistration(VEHICLE);
    expect(modalctrl.create).toHaveBeenCalled();
  });

  it('should test onCountryOfRegistration logic', () => {
    component.onVehicleCategory(VEHICLE);
    expect(modalctrl.create).toHaveBeenCalled();
  });

  it('should test computeErrorIncomplete logic', () => {
    component.errorIncomplete = true;
    component.testData = TEST_DATA;
    component.testData.vehicles.push(VEHICLE);
    component.testData.vehicles[0].odometerReading = '12';
    component.testData.vehicles[0].euVehicleCategory = 'm1';
    component.testData.vehicles[0].testTypes.push(ADDED_VEHICLE_TEST);
    component.computeErrorIncomplete();
    expect(component.errorIncomplete).toBeFalsy();
  });

  it('should check if logEvent was called', () => {
    spyOn(firebaseLogsService, 'logEvent');
    const vehicle = VehicleDataMock.VehicleData;
    vehicle.countryOfRegistration = '';
    component.logMissingFields(vehicle);
    expect(firebaseLogsService.logEvent).toHaveBeenCalled();

    vehicle.countryOfRegistration = 'gb';
    vehicle.euVehicleCategory = 'something';
    vehicle.odometerReading = '1233';
    component.logMissingFields(vehicle);
    expect(firebaseLogsService.logEvent).toHaveBeenCalled();
  });

  it('should test getCountryStringToBeDisplayed', () => {
    spyOn(commonFuncService, 'getCountryStringToBeDisplayed');
    component.getCountryStringToBeDisplayed(VEHICLE);
    expect(commonFuncService.getCountryStringToBeDisplayed).toHaveBeenCalled();
  });

  it('should check if navCtrl.push was called', () => {
    const tests = [];
    tests.push(testService.createTest());
    component.addTrailer(tests);
    expect(navCtrl.push).toHaveBeenCalled();
  });

  it('should verify that the vehicle type is one of the specified types', () => {
    const vehicle = Object.create(VehicleDataMock.VehicleData);
    expect(component.isVehicleOfType(vehicle, VEHICLE_TYPE.PSV)).toBeTruthy();
    expect(
      component.isVehicleOfType(vehicle, VEHICLE_TYPE.PSV, VEHICLE_TYPE.TRL, VEHICLE_TYPE.HGV),
    ).toBeTruthy();
  });

  it('should verify that the vehicle type is not one of specified types', () => {
    const vehicle = Object.create(VehicleDataMock.VehicleData);
    expect(component.isVehicleOfType(vehicle, VEHICLE_TYPE.TRL)).toBeFalsy();
    expect(component.isVehicleOfType(vehicle, VEHICLE_TYPE.TRL, VEHICLE_TYPE.HGV)).toBeFalsy();
  });

  it('should check if a lec test-type is in progress or not', () => {
    let testType = { ...ADDED_VEHICLE_TEST };
    testType.testResult = TEST_TYPE_RESULTS.FAIL;
    testType.additionalNotesRecorded = 'notes';
    expect(component.isLecTestTypeInProgress(testType)).toBeFalsy();

    testType = { ...ADDED_VEHICLE_TEST };
    testType.testResult = TEST_TYPE_RESULTS.PASS;
    testType.testExpiryDate = '2019-10-31';
    testType.emissionStandard = 'emission';
    testType.smokeTestKLimitApplied = 'smoke';
    testType.fuelType = 'petrol';
    testType.modType = MOD_TYPES.P;
    testType.particulateTrapFitted = 'trap';
    testType.particulateTrapSerialNumber = 'number';
    expect(component.isLecTestTypeInProgress(testType)).toBeFalsy();

    testType.modType = MOD_TYPES.G;
    testType.particulateTrapFitted = null;
    testType.particulateTrapSerialNumber = null;
    testType.modificationTypeUsed = 'mod';
    expect(component.isLecTestTypeInProgress(testType)).toBeFalsy();

    testType.modType = null;
    expect(component.isLecTestTypeInProgress(testType)).toBeTruthy();
  });

  it('should check if a vehicle has only abandoned test types', () => {
    const testType = { ...ADDED_VEHICLE_TEST };
    const testType2 = { ...ADDED_VEHICLE_TEST };
    const vehicle = { ...VEHICLE };

    testType.testResult = TEST_TYPE_RESULTS.ABANDONED;
    vehicle.testTypes.push(testType);
    expect(component.doesVehicleHaveOnlyAbandonedTestTypes(vehicle)).toBeTruthy();

    testType2.testResult = TEST_TYPE_RESULTS.PASS;
    vehicle.testTypes.push(testType2);
    expect(component.doesVehicleHaveOnlyAbandonedTestTypes(vehicle)).toBeFalsy();
  });

  it('should autocomplete the vehicle category when there is only one category available', () => {
    const vehicle = { ...VEHICLE };
    vehicle.euVehicleCategory = null;
    vehicle.techRecord.vehicleType = VEHICLE_TYPE.CAR;
    component.autoAssignVehicleCategoryOnlyWhenOneCategoryAvailable(vehicle);
    expect(vehicle.euVehicleCategory).toEqual(EuVehicleCategoryData.EuCategoryCarData[0].key);
    vehicle.euVehicleCategory = null;
    vehicle.techRecord.vehicleType = VEHICLE_TYPE.LGV;
    component.autoAssignVehicleCategoryOnlyWhenOneCategoryAvailable(vehicle);
    expect(vehicle.euVehicleCategory).toEqual(EuVehicleCategoryData.EuCategoryLgvData[0].key);
  });
});
