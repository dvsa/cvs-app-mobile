import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavParams, ViewController } from 'ionic-angular';
import { ViewControllerMock } from 'ionic-mocks';
import { NavParamsMock } from '../../../../../test-config/ionic-mocks/nav-params.mock';
import { VisitService } from '../../../../providers/visit/visit.service';
import { VisitServiceMock } from '../../../../../test-config/services-mocks/visit-service.mock';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OdometerReadingPage } from './odometer-reading';
import { VehicleService } from '../../../../providers/vehicle/vehicle.service';
import { VehicleServiceMock } from '../../../../../test-config/services-mocks/vehicle-service.mock';
import { VehicleDataMock } from '../../../../assets/data-mocks/vehicle-data.mock';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { AnalyticsService, DurationService } from '../../../../providers/global';
import {
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_EVENTS,
  ANALYTICS_LABEL,
  DURATION_TYPE
} from '../../../../app/app.enums';
import { Duration } from '../../../../models/duration.model';

describe('Component: OdometerReadingPage', () => {
  let component: OdometerReadingPage;
  let fixture: ComponentFixture<OdometerReadingPage>;
  let vehicleService: VehicleService;
  let navParams: NavParams;
  let analyticsService: AnalyticsService;
  let analyticsServiceSpy: any;
  let durationService: DurationService;

  let VEHICLE: VehicleModel = VehicleDataMock.VehicleData;

  beforeEach(() => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', [
      'logEvent',
      'addCustomDimension'
    ]);

    TestBed.configureTestingModule({
      declarations: [OdometerReadingPage],
      imports: [IonicModule.forRoot(OdometerReadingPage)],
      providers: [
        DurationService,
        { provide: NavParams, useClass: NavParamsMock },
        { provide: ViewController, useFactory: () => ViewControllerMock.instance() },
        { provide: VisitService, useClass: VisitServiceMock },
        { provide: VehicleService, useClass: VehicleServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(OdometerReadingPage);
    component = fixture.componentInstance;
    navParams = TestBed.get(NavParams);
    vehicleService = TestBed.get(VehicleService);
    analyticsService = TestBed.get(AnalyticsService);
    durationService = TestBed.get(DurationService);
  });

  beforeEach(() => {
    const navParams = fixture.debugElement.injector.get(NavParams);

    navParams.get = jasmine.createSpy('get').and.callFake((param) => {
      const params = {
        vehicle: VEHICLE
      };
      return params[param];
    });

    component.vehicle = navParams.get('vehicle');
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
    navParams = null;
    vehicleService = null;
  });

  it('should create component', () => {
    expect(fixture).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should test ngOnInit logic', () => {
    component.vehicle.odometerReading = '32';
    component.errorIncomplete = true;
    component.ngOnInit();
    expect(component.errorIncomplete).toBeFalsy();
    component.vehicle.odometerReading = '';
    component.errorIncomplete = true;
    component.ngOnInit();
    expect(component.errorIncomplete).toBeTruthy();
  });

  describe('onSave', () => {
    let timeStart: number;
    let timeEnd: number;
    let strType: string;
    let duration: Duration;

    beforeEach(() => {
      timeStart = 1620242516913;
      timeEnd = 1620243020205;
      spyOn(Date, 'now').and.returnValue(timeEnd);

      strType = DURATION_TYPE[DURATION_TYPE.ODOMETER_READING];
      duration = { start: timeStart, end: timeEnd };

      spyOn(durationService, 'setDuration');
      spyOn(durationService, 'getDuration').and.returnValue(duration);
      spyOn(durationService, 'getTakenDuration').and.returnValue(timeEnd);
    });

    it('should track odometer reading duration on save', async () => {
      await component.onSave();

      expect(durationService.setDuration).toHaveBeenCalledWith({ end: timeEnd }, strType);
      expect(durationService.getDuration).toHaveBeenCalledWith(strType);
      expect(durationService.getTakenDuration).toHaveBeenCalledWith(duration);
    });

    it('should track odometer event on save', async () => {
      const label = 'ADD_ODOMETER_READING_START_TIME';
      await component.trackOdometerReadingDuration(label, timeStart.toString());

      expect(analyticsService.logEvent).toHaveBeenCalledWith({
        category: ANALYTICS_EVENT_CATEGORIES.DURATION,
        event: ANALYTICS_EVENTS.ADD_ODOMETER_READING_TIME_TAKEN,
        label: ANALYTICS_LABEL[label]
      });

      const key = Object.keys(ANALYTICS_LABEL).indexOf(label) + 1;
      expect(analyticsService.addCustomDimension).toHaveBeenCalledWith(key, timeStart.toString());
    });
  });

  it('should test ngOnInit logic', () => {
    VEHICLE.odometerReading = '';
    component.vehicle = VEHICLE;
    expect(component.vehicle.odometerReading.length).toEqual(0);
    VEHICLE.odometerReading = '7676';
    component.ngOnInit();
    expect(component.vehicle.odometerReading.length).toEqual(4);
  });

  it('should display the odometer metric capitalised', () => {
    component.odometerMetric = 'kilometres';
    expect(component.displayOdometerMetricCapitalized()).toEqual('Kilometres');
  });
});
