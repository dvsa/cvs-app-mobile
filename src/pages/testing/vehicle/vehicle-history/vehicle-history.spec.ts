import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewControllerMock } from '../../../../../test-config/ionic-mocks/view-controller.mock';
import { NavParamsMock } from '../../../../../test-config/ionic-mocks/nav-params.mock';
import { CommonFunctionsService } from '../../../../providers/utils/common-functions';
import { VehicleDataMock } from '../../../../assets/data-mocks/vehicle-data.mock';
import { PipesModule } from '../../../../pipes/pipes.module';
import { TestResultsHistoryDataMock } from '../../../../assets/data-mocks/test-results-history-data.mock';
import { TestTypeArrayDataMock } from '../../../../assets/data-mocks/test-type-array-data.mock';
import {
  ANALYTICS_SCREEN_NAMES,
  TECH_RECORD_STATUS,
  VEHICLE_TYPE
} from '../../../../app/app.enums';
import { VehicleHistoryPage } from './vehicle-history';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { AnalyticsService } from '../../../../providers/global';

describe('Component: VehicleHistoryPage', () => {
  let comp: VehicleHistoryPage;
  let fixture: ComponentFixture<VehicleHistoryPage>;
  let navCtrl: NavController;
  let navParams: NavParams;
  let commonFunctionsService: any;
  let analyticsService: AnalyticsService;
  let analyticsServiceSpy: any;

  let testResultsHistory: any = TestResultsHistoryDataMock.TestResultHistoryData;
  let vehicleData: VehicleModel = VehicleDataMock.VehicleData;
  let testTypeArray = TestTypeArrayDataMock.TestTypeArrayData;

  beforeEach(async(() => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['setCurrentPage']);

    TestBed.configureTestingModule({
      declarations: [VehicleHistoryPage],
      imports: [IonicModule.forRoot(VehicleHistoryPage), PipesModule],
      providers: [
        NavController,
        CommonFunctionsService,
        { provide: NavParams, useClass: NavParamsMock },
        { provide: ViewController, useClass: ViewControllerMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    fixture = TestBed.createComponent(VehicleHistoryPage);
    comp = fixture.componentInstance;
    navCtrl = TestBed.get(NavController);
    navParams = TestBed.get(NavParams);
    analyticsService = TestBed.get(AnalyticsService);
    commonFunctionsService = TestBed.get(CommonFunctionsService);

    navParams.get = jasmine.createSpy('get').and.callFake((param) => {
      let params = {
        vehicleData: vehicleData,
        testResultsHistory: testResultsHistory
      };
      return params[param];
    });
  }));

  beforeEach(() => {
    comp.vehicleData = navParams.get('vehicleData');
    comp.testResultHistory = navParams.get('testResultsHistory');
    comp.testResultHistoryClone = comp.testResultHistory;
    comp.testTypeArray = testTypeArray;
  });

  afterEach(() => {
    fixture.destroy();
    comp = null;
  });

  it('should create the component', (done) => {
    expect(fixture).toBeTruthy();
    expect(comp).toBeTruthy();
    done();
  });

  it('should test ionViewDidEnterLogic', () => {
    comp.ionViewDidEnter();

    expect(analyticsService.setCurrentPage).toHaveBeenCalledWith(
      ANALYTICS_SCREEN_NAMES.VEHICLE_TEST_HISTORY
    );
  });

  it('should create an array called testTypeArray if testHistory exists', () => {
    comp.testTypeArray = [];
    comp.createTestTypeArray();
    expect(comp.testTypeArray.length).toBeTruthy();
  });

  it('should not create an array called testTypeArray if testHistory does not exists', () => {
    comp.testTypeArray = [];
    comp.testResultHistory = [];
    comp.createTestTypeArray();
    expect(comp.testTypeArray.length).toBeFalsy();
  });

  it('should not create an array called testTypeArray if testStatus in not submitted', () => {
    comp.testTypeArray = [];
    comp.testResultHistory[0].testStatus = 'cancelled';
    comp.testResultHistory[1].testStatus = 'cancelled';
    comp.createTestTypeArray();
    expect(comp.testTypeArray.length).toBeFalsy();
  });

  it('should check if any defect have an prohibition issued and returns true, otherwise return false', () => {
    let testType = {
      prohibitionIssued: false,
      testCode: 'pms',
      lastUpdatedAt: '2019-05-23T12:49:21.455Z',
      testNumber: 'W01B89366',
      additionalCommentsForAbandon: 'none',
      numberOfSeatbeltsFitted: 2,
      testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
      reasonForAbandoning: 'none',
      lastSeatbeltInstallationCheckDate: '2019-01-14',
      createdAt: '2019-05-23T12:49:21.455Z',
      testTypeId: '19',
      testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
      certificateNumber: '12334',
      testTypeName: 'Annual test',
      seatbeltInstallationCheckDate: true,
      additionalNotesRecorded: 'VEHICLE FRONT ROW SECOND SEAT HAS MISSING SEATBELT',
      defects: [
        {
          deficiencyCategory: 'major',
          deficiencyText: 'missing.',
          prs: false,
          additionalInformation: {
            location: {
              axleNumber: null,
              horizontal: null,
              vertical: 'upper',
              longitudinal: null,
              rowNumber: 1,
              lateral: 'centre',
              seatNumber: 2
            },
            notes: 'seatbelt missing'
          },
          itemNumber: 1,
          deficiencyRef: '3.1.a',
          stdForProhibition: false,
          prohibitionIssued: false,
          deficiencySubId: null,
          imDescription: 'Seat Belts & Supplementary Restraint Systems',
          deficiencyId: 'a',
          itemDescription: 'Obligatory Seat Belt:',
          imNumber: 3
        },
        {
          deficiencyCategory: 'major',
          deficiencyText: 'missing.',
          prs: false,
          additionalInformation: {
            location: {
              axleNumber: null,
              horizontal: null,
              vertical: 'upper',
              longitudinal: null,
              rowNumber: 1,
              lateral: 'centre',
              seatNumber: 2
            },
            notes: 'seatbelt missing'
          },
          itemNumber: 1,
          deficiencyRef: '3.1.a',
          stdForProhibition: true,
          prohibitionIssued: true,
          deficiencySubId: null,
          imDescription: 'Seat Belts & Supplementary Restraint Systems',
          deficiencyId: 'a',
          itemDescription: 'Obligatory Seat Belt:',
          imNumber: 3
        },
        {
          deficiencyCategory: 'major',
          deficiencyText: 'missing.',
          prs: false,
          additionalInformation: {
            location: {
              axleNumber: null,
              horizontal: null,
              vertical: 'upper',
              longitudinal: null,
              rowNumber: 1,
              lateral: 'centre',
              seatNumber: 2
            },
            notes: 'seatbelt missing'
          },
          itemNumber: 1,
          deficiencyRef: '3.1.a',
          stdForProhibition: false,
          prohibitionIssued: false,
          deficiencySubId: null,
          imDescription: 'Seat Belts & Supplementary Restraint Systems',
          deficiencyId: 'a',
          itemDescription: 'Obligatory Seat Belt:',
          imNumber: 3
        }
      ],
      name: 'Annual test',
      testResult: 'fail',
      testIndex: 52,
      testTypeIndex: 0
    };
    expect(comp.haveProhibition(testType)).toBeTruthy();
    testType.defects = [];
    expect(comp.haveProhibition(testType)).toBeFalsy();
    testType.prohibitionIssued = true;
    expect(comp.haveProhibition(testType)).toBeTruthy();
  });

  it('should verify that the vehicle type is one of the specified types', () => {
    let vehicle = Object.create(VehicleDataMock.VehicleData);
    expect(comp.isVehicleOfType(vehicle, VEHICLE_TYPE.PSV)).toBeTruthy();
    expect(
      comp.isVehicleOfType(vehicle, VEHICLE_TYPE.PSV, VEHICLE_TYPE.TRL, VEHICLE_TYPE.HGV)
    ).toBeTruthy();
  });

  it('should verify that the vehicle type is not one of specified types', () => {
    let vehicle = Object.create(VehicleDataMock.VehicleData);
    expect(comp.isVehicleOfType(vehicle, VEHICLE_TYPE.TRL)).toBeFalsy();
    expect(comp.isVehicleOfType(vehicle, VEHICLE_TYPE.TRL, VEHICLE_TYPE.HGV)).toBeFalsy();
  });

  it('should not display the provisional label if the techRecord is current', () => {
    comp.vehicleData.techRecord.statusCode = TECH_RECORD_STATUS.CURRENT;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = fixture.debugElement.query(By.css('ion-toolbar ion-title div.toolbar-title'));
      expect(title).toBeNull();
    });
  });

  it('should not display the provisional label even if the techRecord is provisional', () => {
    comp.vehicleData.techRecord.statusCode = TECH_RECORD_STATUS.PROVISIONAL;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = fixture.debugElement.query(By.css('ion-toolbar ion-title div.toolbar-title'));
      expect(title).toBeNull();
    });
  });
});
