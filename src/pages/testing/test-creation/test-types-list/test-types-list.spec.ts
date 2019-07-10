import {TestTypesListPage} from "./test-types-list";
import {async, ComponentFixture, inject, TestBed} from "@angular/core/testing";
import {IonicModule, NavController, NavParams, ViewController} from "ionic-angular";
import {NavParamsMock} from "../../../../../test-config/ionic-mocks/nav-params.mock";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {StorageService} from "../../../../providers/natives/storage.service";
import {TestTypeService} from "../../../../providers/test-type/test-type.service";
import {TestTypesReferenceDataMock} from "../../../../assets/data-mocks/reference-data-mocks/test-types.mock";
import {TestTypesReferenceDataModel} from "../../../../models/reference-data-models/test-types.model";
import {PipesModule} from "../../../../pipes/pipes.module";
import {TechRecordDataMock} from "../../../../assets/data-mocks/tech-record-data.mock";
import {VehicleService} from "../../../../providers/vehicle/vehicle.service";
import {TestTypeServiceMock} from "../../../../../test-config/services-mocks/test-type-service.mock";
import {ViewControllerMock} from "../../../../../test-config/ionic-mocks/view-controller.mock";
import {CommonFunctionsService} from "../../../../providers/utils/common-functions";
import {VehicleTechRecordModel} from "../../../../models/vehicle/tech-record.model";
import {VehicleModel} from "../../../../models/vehicle/vehicle.model";
import {VehicleDataMock} from "../../../../assets/data-mocks/vehicle-data.mock";
import {TEST_TYPE_RESULTS} from "../../../../app/app.enums";
import {FirebaseLogsService} from "../../../../providers/firebase-logs/firebase-logs.service";
import {FirebaseLogsServiceMock} from "../../../../../test-config/services-mocks/firebaseLogsService.mock";
import {NavControllerMock} from "ionic-mocks";

describe('Component: TestTypesListPage', () => {
  let comp: TestTypesListPage;
  let fixture: ComponentFixture<TestTypesListPage>;

  let navCtrl: NavController;
  let navParams: NavParams;
  let testTypeService: TestTypeService;
  let vehicleService: VehicleService;
  let storageServiceSpy: any;
  let vehicleServiceSpy;
  let commonFunctionsService: CommonFunctionsService;
  let vehicleData: VehicleModel = VehicleDataMock.VehicleData;
  let firebaseLogsService: FirebaseLogsService;

  const testTypes: TestTypesReferenceDataModel[] = TestTypesReferenceDataMock.TestTypesData;
  const vehicle: VehicleTechRecordModel = TechRecordDataMock.VehicleTechRecordData;

  beforeEach(async(() => {
    storageServiceSpy = jasmine.createSpyObj('StorageService', {
      'read': new Promise(resolve => resolve(testTypes))
    });
    vehicleServiceSpy = jasmine.createSpyObj('VehicleService', ['createVehicle', 'addTestType', 'removeTestType']);

    TestBed.configureTestingModule({
      declarations: [TestTypesListPage],
      imports: [
        PipesModule,
        IonicModule.forRoot(TestTypesListPage)
      ],
      providers: [
        {provide: NavController, useFactory: () => NavControllerMock.instance()},
        CommonFunctionsService,
        {provide: FirebaseLogsService, useClass: FirebaseLogsServiceMock},
        {provide: TestTypeService, useClass: TestTypeServiceMock},
        {provide: VehicleService, useValue: vehicleServiceSpy},
        {provide: NavParams, useClass: NavParamsMock},
        {provide: ViewController, useClass: ViewControllerMock}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTypesListPage);
    comp = fixture.componentInstance;
    navCtrl = TestBed.get(NavController);
    navParams = TestBed.get(NavParams);
    testTypeService = TestBed.get(TestTypeService);
    vehicleService = TestBed.get(VehicleService);
    commonFunctionsService = TestBed.get(CommonFunctionsService);
    firebaseLogsService = TestBed.get(FirebaseLogsService);
  });

  beforeEach(() => {
    const navParams = fixture.debugElement.injector.get(NavParams);

    navParams.get = jasmine.createSpy('get').and.callFake((param) => {
      const params = {
        'testTypeReferenceData': null,
        'vehicleData': vehicle
      };
      return params[param];
    })
  });

  afterEach(() => {
    fixture.destroy();
    comp = null;
    testTypeService = null;
    commonFunctionsService = null;
    firebaseLogsService = null;
  });

  it('should create the component', () => {
    expect(fixture).toBeTruthy();
    expect(comp).toBeTruthy();
    expect(testTypeService).toBeTruthy();
    expect(vehicleService).toBeTruthy();
  });

  it('should TestTypeService and TestTypesListPage Component share the same instance',
    inject([TestTypeService], (injectService: TestTypeService) => {
      expect(injectService).toBe(testTypeService);
    })
  );

  it('should return true of false if the testType can be displayed', () => {
    let addedIds = ['38', '39'];
    expect(comp.canDisplay(addedIds, testTypes[0])).toBeTruthy();
    addedIds = ['38', '30'];
    expect(comp.canDisplay(addedIds, testTypes[0])).toBeFalsy();
  });

  it('should return true or false if the leafs of the category are already added or not.', () => {
    let addedIds = ['1', '38', '39'];
    expect(comp.canDisplayCategory(testTypes[1], addedIds)).toBeTruthy();
    expect(comp.canDisplayCategory(testTypes[0], addedIds)).toBeFalsy();
    expect(comp.canDisplayCategory(testTypes[2], addedIds)).toBeTruthy();

  });

  it('should return an array with the ids and the added tests', () => {
    vehicleData.testTypes.push({
      name: 'annual test',
      testTypeName: 'Annual test',
      testTypeId: '3',
      certificateNumber: null,
      testTypeStartTimestamp: '2018-12-19T00:00:00.000Z',
      testTypeEndTimestamp: null,
      numberOfSeatbeltsFitted: null,
      lastSeatbeltInstallationCheckDate: null,
      seatbeltInstallationCheckDate: null,
      prohibitionIssued: null,
      additionalNotesRecorded: null,
      testResult: TEST_TYPE_RESULTS.PASS,
      reasonForAbandoning: null,
      additionalCommentsForAbandon: null,
      defects: [],
      reasons: [],
      linkedIds: ['38', '39']
    });
    let result = comp.addedTestTypesIds(vehicleData);
    expect(result.length).toBe(1);
  });

  it('should test flow of selectedItem', () => {
    comp.firstPage = false;
    comp.selectedItem(testTypes[1], vehicleData);
    expect(navCtrl.push).toHaveBeenCalled();
    comp.firstPage = true;
    comp.selectedItem(testTypes[1], vehicleData);
    expect(navCtrl.getViews).not.toHaveBeenCalled();
    expect(navCtrl.popTo).not.toHaveBeenCalled();
  });

  it('should check if navCtrl.pop was called', () => {
    comp.cancelTypes();
    expect(navCtrl.pop).toHaveBeenCalled();
  });

  it('should test firebase logging when adding a testType', () => {
    spyOn(firebaseLogsService, 'logEvent');
    comp.selectedItem(testTypes[0], vehicleData);
    expect(firebaseLogsService.logEvent).toHaveBeenCalled();
  });
});
