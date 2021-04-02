import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleDetailsPage } from './vehicle-details';
import {
  AlertController,
  IonicModule,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';
import { NavControllerMock } from '../../../../../test-config/ionic-mocks/nav-controller.mock';
import { NavParamsMock } from '../../../../../test-config/ionic-mocks/nav-params.mock';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertControllerMock, ViewControllerMock } from 'ionic-mocks';
import { StorageService } from '../../../../providers/natives/storage.service';
import { StorageServiceMock } from '../../../../../test-config/services-mocks/storage-service.mock';
import { CommonFunctionsService } from '../../../../providers/utils/common-functions';
import { CallNumber } from '@ionic-native/call-number';
import { VehicleTechRecordModel } from '../../../../models/vehicle/tech-record.model';
import { TechRecordDataMock } from '../../../../assets/data-mocks/tech-record-data.mock';
import { TestTypeArrayDataMock } from '../../../../assets/data-mocks/test-type-array-data.mock';
import { PipesModule } from '../../../../pipes/pipes.module';
import {
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_SCREEN_NAMES,
  APP_STRINGS,
  DURATION_TYPE,
  PAGE_NAMES,
  TECH_RECORD_STATUS
} from '../../../../app/app.enums';
import { By } from '@angular/platform-browser';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { VehicleDataMock } from '../../../../assets/data-mocks/vehicle-data.mock';
import { AppService } from '../../../../providers/global/app.service';
import { AppServiceMock } from '../../../../../test-config/services-mocks/app-service.mock';
import { AnalyticsService, DurationService } from '../../../../providers/global';
import { Duration } from '../../../../models/duration.model';

describe('Component: VehicleDetailsPage', () => {
  let component: VehicleDetailsPage;
  let fixture: ComponentFixture<VehicleDetailsPage>;
  let navParams: NavParams;
  let commonFunctionsService: CommonFunctionsService;
  let callNumberSpy: any;
  let alertCtrl: AlertController;
  let viewController: ViewController;
  let analyticsService: AnalyticsService;
  let analyticsServiceSpy: any;
  let durationService: DurationService;

  const VEHICLE: VehicleModel = VehicleDataMock.VehicleData;
  let test = TestTypeArrayDataMock.TestTypeArrayData[0];

  beforeEach(() => {
    callNumberSpy = jasmine.createSpyObj('CallNumber', ['callNumber']);

    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', [
      'logEvent',
      'setCurrentPage',
      'addCustomDimension'
    ]);

    TestBed.configureTestingModule({
      declarations: [VehicleDetailsPage],
      imports: [IonicModule.forRoot(VehicleDetailsPage), PipesModule],
      providers: [
        CommonFunctionsService,
        DurationService,
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: NavParams, useClass: NavParamsMock },
        { provide: ViewController, useFactory: () => ViewControllerMock.instance() },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: CallNumber, useValue: callNumberSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: AppService, useClass: AppServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    navParams = TestBed.get(NavParams);
    navParams.get = jasmine.createSpy('get').and.callFake((param) => {
      const params = {
        vehicle: VEHICLE,
        test: test
      };
      return params[param];
    });
    commonFunctionsService = TestBed.get(CommonFunctionsService);
    alertCtrl = TestBed.get(AlertController);
    viewController = TestBed.get(ViewController);
    analyticsService = TestBed.get(AnalyticsService);
    durationService = TestBed.get(DurationService);

    fixture = TestBed.createComponent(VehicleDetailsPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
    navParams = null;
    commonFunctionsService = null;
    alertCtrl = null;
  });

  it('should create the component', () => {
    expect(fixture).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should set page tracking on ionViewWillEnter', () => {
    component.ionViewWillEnter();

    expect(analyticsService.setCurrentPage).toHaveBeenCalledWith(
      ANALYTICS_SCREEN_NAMES.VEHICLE_DETAILS
    );
  });

  describe('ionViewDidEnter', () => {
    let getDurationSpy: jasmine.Spy, getTakenDurationSpy: jasmine.Spy;
    let timeStart: number;
    let timeEnd: number;

    beforeEach(() => {
      timeStart = 1620242516913;
      timeEnd = 1620243020205;
      spyOn(Date, 'now').and.returnValue(timeEnd);

      spyOn(durationService, 'setDuration');
      getDurationSpy = spyOn(durationService, 'getDuration');
      getTakenDurationSpy = spyOn(durationService, 'getTakenDuration');
    });

    it('should set tracking duration when ionViewDidEnter called', async () => {
      const strSearchVehicle: string = DURATION_TYPE[DURATION_TYPE.SEARCH_VEHICLE];
      const duration: Duration = { start: timeStart, end: timeEnd };
      getDurationSpy.and.returnValue(duration);
      getTakenDurationSpy.and.returnValue(timeEnd);

      await component.ionViewDidEnter();

      expect(durationService.setDuration).toHaveBeenCalledWith(
        { end: timeEnd },
        strSearchVehicle
      );
      expect(durationService.getDuration).toHaveBeenCalledWith(strSearchVehicle);
      expect(durationService.getTakenDuration).toHaveBeenCalledWith(duration);
      expect(analyticsService.logEvent).toHaveBeenCalled();
    });
  });

  it('should check if alertCtrl was called', () => {
    component.goToPreparerPage();
    expect(alertCtrl.create).toHaveBeenCalled();
  });

  it('should track vehicle duration when goToPreparerPage is confirmed ', async () => {
    const timeStart = 1620242516913;
    const timeEnd = 1620243020205;
    spyOn(Date, 'now').and.returnValue(timeEnd);

    const strType: string = DURATION_TYPE[DURATION_TYPE.CONFIRM_VEHICLE];
    const duration: Duration = { start: timeStart, end: timeEnd };

    spyOn(durationService, 'setDuration');
    spyOn(durationService, 'getDuration').and.returnValue(duration);
    spyOn(durationService, 'getTakenDuration').and.returnValue(timeEnd);

    component.trackConfirmVehicleDuration();

    expect(durationService.setDuration).toHaveBeenCalledWith({ end: timeEnd }, strType);
    expect(durationService.getDuration).toHaveBeenCalledWith(strType);
    expect(durationService.getTakenDuration).toHaveBeenCalledWith(duration);
    expect(analyticsService.logEvent).toHaveBeenCalled();
  });

  it('should not display the provisional label if the techRecord is current', () => {
    component.vehicleData.techRecord.statusCode = TECH_RECORD_STATUS.CURRENT;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = fixture.debugElement.query(By.css('ion-toolbar ion-title div.toolbar-title'));
      expect(title).toBeNull();
    });
  });

  it('should display the provisional label if the techRecord is provisional', () => {
    component.vehicleData.techRecord.statusCode = TECH_RECORD_STATUS.PROVISIONAL;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = fixture.debugElement.query(By.css('ion-toolbar ion-title div.toolbar-title'));
      expect(title.nativeElement.innerText).toBe(APP_STRINGS.PROVISIONAL_LABEL_TEXT);
    });
  });

  describe('when accessing the vehicle details page', () => {
    it('should set the back button text to "Test" when accessing from Test Create page', () => {
      component.previousPageName = PAGE_NAMES.TEST_CREATE_PAGE;
      component.ionViewWillEnter();
      expect(viewController.setBackButtonText).toHaveBeenCalledWith(APP_STRINGS.TEST);
    });
    it('should set the back button text to "Select Vehicle" when accessing from Multiple Tech records selection page', () => {
      component.previousPageName = PAGE_NAMES.MULTIPLE_TECH_RECORDS_SELECTION;
      component.ionViewWillEnter();
      expect(viewController.setBackButtonText).toHaveBeenCalledWith(APP_STRINGS.SELECT_VEHICLE);
    });
    it('should set the back button text to "Identify Vehicle" when accessing from the Vehicle Lookup page', () => {
      component.previousPageName = PAGE_NAMES.VEHICLE_LOOKUP_PAGE;
      component.ionViewWillEnter();
      expect(viewController.setBackButtonText).toHaveBeenCalledWith(APP_STRINGS.IDENTIFY_VEHICLE);
    });
    it('should set the back button text to Back if accessing from any other page', () => {
      component.previousPageName = 'Random page name';
      component.ionViewWillEnter();
      expect(viewController.setBackButtonText).toHaveBeenCalledWith('Back');
    });
  });
});
