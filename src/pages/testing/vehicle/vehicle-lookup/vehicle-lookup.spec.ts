import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleLookupPage } from './vehicle-lookup';
import {
  AlertController,
  IonicModule,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Loading
} from 'ionic-angular';
import {
  AlertControllerMock,
  LoadingControllerMock,
  ModalControllerMock,
  NavControllerMock
} from 'ionic-mocks';
import { NavParamsMock } from '../../../../../test-config/ionic-mocks/nav-params.mock';
import { VisitService } from '../../../../providers/visit/visit.service';
import { VisitServiceMock } from '../../../../../test-config/services-mocks/visit-service.mock';
import { StorageService } from '../../../../providers/natives/storage.service';
import { StorageServiceMock } from '../../../../../test-config/services-mocks/storage-service.mock';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { VehicleService } from '../../../../providers/vehicle/vehicle.service';
import { VehicleServiceMock } from '../../../../../test-config/services-mocks/vehicle-service.mock';
import { Firebase } from '@ionic-native/firebase';
import { CallNumber } from '@ionic-native/call-number';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestDataModelMock } from '../../../../assets/data-mocks/data-model/test-data-model.mock';
import { VehicleDataMock } from '../../../../assets/data-mocks/vehicle-data.mock';
import { APP_STRINGS, STORAGE, VEHICLE_TYPE } from '../../../../app/app.enums';
import { AuthService } from '../../../../providers/global/auth.service';
import { AuthServiceMock } from '../../../../../test-config/services-mocks/auth-service.mock';
import { Store } from '@ngrx/store';
import { TestStore } from '../../../../providers/interceptors/auth.interceptor.spec';
import { FirebaseLogsService } from '../../../../providers/firebase-logs/firebase-logs.service';
import { FirebaseLogsServiceMock } from '../../../../../test-config/services-mocks/firebaseLogsService.mock';
import { AppService } from '../../../../providers/global/app.service';
import { AppServiceMock } from '../../../../../test-config/services-mocks/app-service.mock';
import { VehicleLookupSearchCriteriaData } from '../../../../assets/app-data/vehicle-lookup-search-criteria/vehicle-lookup-search-criteria.data';
import { _throw } from 'rxjs/observable/throw';
import { of } from 'rxjs/observable/of';
import { deepCopy } from 'ionic-angular/util/util';

describe('Component: VehicleLookupPage', () => {
  let component: VehicleLookupPage;
  let fixture: ComponentFixture<VehicleLookupPage>;
  let openNativeSettingsSpy: any;
  let storageService: StorageServiceMock;
  let firebaseLogsService: FirebaseLogsService;
  let modalCtrl: ModalController;
  let vehicleService: VehicleService;

  const TEST_DATA = TestDataModelMock.TestData;
  const VEHICLE = VehicleDataMock.VehicleData;
  let loading: Loading;

  beforeEach(async(() => {
    openNativeSettingsSpy = jasmine.createSpyObj('OpenNativeSettings', ['open']);
    loading = jasmine.createSpyObj('Loading', ['dismiss', 'present']);

    TestBed.configureTestingModule({
      declarations: [VehicleLookupPage],
      imports: [IonicModule.forRoot(VehicleLookupPage)],
      providers: [
        Firebase,
        CallNumber,
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: NavParams, useClass: NavParamsMock },
        { provide: VisitService, useClass: VisitServiceMock },
        { provide: FirebaseLogsService, useClass: FirebaseLogsServiceMock },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: LoadingController, useFactory: () => LoadingControllerMock.instance(loading) },
        { provide: ModalController, useFactory: () => ModalControllerMock.instance() },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: OpenNativeSettings, useValue: openNativeSettingsSpy },
        { provide: VehicleService, useClass: VehicleServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: Store, useClass: TestStore },
        { provide: AppService, useClass: AppServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleLookupPage);
    component = fixture.componentInstance;
    storageService = TestBed.get(StorageService);
    firebaseLogsService = TestBed.get(FirebaseLogsService);
    modalCtrl = TestBed.get(ModalController);
    vehicleService = TestBed.get(VehicleService);

    component.selectedSearchCriteria = 'Registration number, VIN or trailer ID';
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
    storageService = null;
    vehicleService = null;
  });

  it('should create the component', () => {
    expect(fixture).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should test ionViewDidEnterLogic', () => {
    spyOn(firebaseLogsService, 'setScreenName');
    component.ionViewDidEnter();
    expect(firebaseLogsService.setScreenName).toHaveBeenCalled();
  });

  it('should test ionViewWillEnter lifecycle hook', () => {
    component.testData = TEST_DATA;
    component.testData.vehicles.push(VEHICLE);
    component.ionViewWillEnter();
    expect(component.isCombinationTest).toBeTruthy();
    expect(component.searchPlaceholder).toEqual(APP_STRINGS.REG_NUMBER_TRAILER_ID_OR_VIN);
    component.testData.vehicles[0].techRecord.vehicleType = VEHICLE_TYPE.HGV;
    component.ionViewWillEnter();
    expect(component.searchPlaceholder).toEqual(APP_STRINGS.TRAILER_ID_OR_VIN);
  });

  it('should get the formatted search field placeholder', () => {
    component.selectedSearchCriteria =
      VehicleLookupSearchCriteriaData.VehicleLookupSearchCriteria[2];
    expect(component.getSearchFieldPlaceholder()).toEqual('Enter full VIN');
  });

  it('should call modal.create when pressing on changeSearchCriteria', () => {
    component.onChangeSearchCriteria();
    expect(modalCtrl.create).toHaveBeenCalled();
  });

  it('should get the right queryParam for techRecords call based on selected search criteria', () => {
    component.selectedSearchCriteria =
      VehicleLookupSearchCriteriaData.VehicleLookupSearchCriteria[4];
    expect(component.getTechRecordQueryParam().queryParam).toEqual('trailerId');
  });

  it('should empty ionic storage if the test history cannot be retrieved', () => {
    spyOn(storageService, 'update');
    vehicleService.getVehicleTechRecords = jasmine.createSpy().and.callFake(() => of([VEHICLE]));
    vehicleService.getTestResultsHistory = jasmine
      .createSpy()
      .and.callFake(() => _throw('Error'));
    component.searchVehicle('TESTVIN');
    expect(storageService.update).toHaveBeenCalledTimes(1);
    expect(storageService.update).toHaveBeenCalledWith(
      STORAGE.TEST_HISTORY + VEHICLE.systemNumber,
      []
    );
  });

  it('should dismiss the loading when the skeleton alert is displayed', async(() => {
    const skeletonVehicle = deepCopy(VEHICLE);
    skeletonVehicle.techRecord.recordCompleteness = 'skeleton';
    vehicleService.getVehicleTechRecords = jasmine
      .createSpy()
      .and.callFake(() => of([skeletonVehicle]));
    vehicleService.getTestResultsHistory = jasmine
      .createSpy()
      .and.callFake(() => _throw('Error'));
    vehicleService.createSkeletonAlert = jasmine.createSpy();
    component.searchVehicle('TESTVIN');

    expect(vehicleService.createSkeletonAlert).toHaveBeenCalledTimes(1);
    expect(loading.dismiss).toHaveBeenCalledTimes(1);
  }));
});
