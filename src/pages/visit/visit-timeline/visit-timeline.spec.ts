import { VisitTimelinePage } from "./visit-timeline";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  IonicModule,
  NavController,
  LoadingController,
  Events,
  AlertController,
  NavParams,
  ToastController,
  ModalController
} from "ionic-angular";
import { PipesModule } from "../../../pipes/pipes.module";
import { StateReformingService } from "../../../providers/global/state-reforming.service";
import { StateReformingServiceMock } from "../../../../test-config/services-mocks/state-reforming-service.mock";
import {
  LoadingControllerMock,
  EventsMock,
  NavControllerMock,
  AlertControllerMock,
  NavParamsMock,
  ToastControllerMock,
  ModalControllerMock
} from "ionic-mocks";
import { AppService } from "../../../providers/global/app.service";
import { AppServiceMock } from "../../../../test-config/services-mocks/app-service.mock";
import { TestService } from "../../../providers/test/test.service";
import { TestServiceMock } from "../../../../test-config/services-mocks/test-service.mock";
import { VisitService } from "../../../providers/visit/visit.service";
import { VisitServiceMock } from "../../../../test-config/services-mocks/visit-service.mock";
import { StorageService } from "../../../providers/natives/storage.service";
import { StorageServiceMock } from "../../../../test-config/services-mocks/storage-service.mock";
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { VisitDataMock } from "../../../assets/data-mocks/visit-data.mock";
import { AuthService } from "../../../providers/global/auth.service";
import { AuthServiceMock } from "../../../../test-config/services-mocks/auth-service.mock";
import { Store } from "@ngrx/store";
import { TestStore } from "../../../providers/interceptors/auth.interceptor.spec";
import { FirebaseLogsService } from "../../../providers/firebase-logs/firebase-logs.service";
import { FirebaseLogsServiceMock } from "../../../../test-config/services-mocks/firebaseLogsService.mock";
import { ActivityService } from "../../../providers/activity/activity.service";
import { ActivityServiceMock } from "../../../../test-config/services-mocks/activity-service.mock";
import { ActivityDataMock } from "../../../assets/data-mocks/activity.data.mock";
import { TestStationDataMock } from "../../../assets/data-mocks/reference-data-mocks/test-station-data.mock";
import { TestModel } from "../../../models/tests/test.model";
import { TEST_REPORT_STATUSES, VISIT } from "../../../app/app.enums"
import { Firebase } from "@ionic-native/firebase";
import { Observable } from "../../../../node_modules/rxjs";

describe('Component: VisitTimelinePage', () => {
  let component: VisitTimelinePage;
  let fixture: ComponentFixture<VisitTimelinePage>;
  let openNativeSettings: OpenNativeSettings;
  let openNativeSettingsSpy: any;
  let loadingCtrl: LoadingController;
  let firebaseLogsService: FirebaseLogsService;
  let visitService: VisitService;
  let visitServiceMock: VisitServiceMock;
  let navCtrl: NavController;
  let modalCtrl: ModalController;
  let activityService: ActivityService;
  let alertCtrl: AlertController;
  let storageService: StorageService;
  let storageServiceSpy: any;

  let waitActivity = ActivityDataMock.WaitActivityData;
  let testStation = TestStationDataMock.TestStationData[0];

  beforeEach(() => {
    openNativeSettingsSpy = jasmine.createSpyObj('OpenNativeSettings', ['open']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['delete']);

    TestBed.configureTestingModule({
      declarations: [VisitTimelinePage],
      imports: [
        IonicModule.forRoot(VisitTimelinePage),
        PipesModule
      ],
      providers: [
        Firebase,
        {provide: ModalController, useFactory: () => ModalControllerMock.instance()},
        {provide: ActivityService, useClass: ActivityServiceMock},
        {provide: FirebaseLogsService, useClass: FirebaseLogsServiceMock},
        {provide: NavController, useFactory: () => NavControllerMock.instance()},
        {provide: NavParams, useClass: NavParamsMock},
        {provide: StateReformingService, useClass: StateReformingServiceMock},
        {provide: LoadingController, useFactory: () => LoadingControllerMock.instance()},
        {provide: AlertController, useFactory: () => AlertControllerMock.instance()},
        {provide: ToastController, useFactory: () => ToastControllerMock.instance()},
        {provide: AppService, useClass: AppServiceMock},
        {provide: Events, useFactory: () => EventsMock},
        {provide: TestService, useClass: TestServiceMock},
        {provide: VisitService, useClass: VisitServiceMock},
        {provide: StorageService, useClass: StorageServiceMock},
        {provide: AuthService, useClass: AuthServiceMock},
        {provide: Store, useClass: TestStore},
        {provide: OpenNativeSettings, useValue: openNativeSettingsSpy}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitTimelinePage);
    component = fixture.componentInstance;
    loadingCtrl = TestBed.get(LoadingController);
    firebaseLogsService = TestBed.get(FirebaseLogsService);
    visitService = TestBed.get(VisitService);
    visitServiceMock = TestBed.get(VisitService);
    modalCtrl = TestBed.get(ModalController);
    activityService = TestBed.get(ActivityService);
    alertCtrl = TestBed.get(AlertController);
    storageService = TestBed.get(StorageService);
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
    loadingCtrl = null;
    firebaseLogsService = null;
    visitService = null;
    modalCtrl = null;
    activityService = null;
    alertCtrl = null;
    storageService = null;
  });

  it('should create component', () => {
    expect(fixture).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should test confirmEndVisit', () => {
    spyOn(firebaseLogsService, 'logEvent');
    visitServiceMock.isError = true;
    component.visit = VisitDataMock.VisitData;
    component.confirmEndVisit();
    expect(firebaseLogsService.logEvent).toHaveBeenCalled();

    visitServiceMock.isError = false;
    component.confirmEndVisit();
    expect(loadingCtrl.create).toHaveBeenCalled();
  });

  it('should test if logEvent method was called', () => {
    component.createNewTestReport();
    expect(firebaseLogsService.search_vehicle_time.search_vehicle_start_time).toBeTruthy();
  });

  it('should check ionViewDidEnter logic', () => {
    component.ionViewDidEnter();
    component.createNewTestReport();
    expect(component.timeline.length > 0).toBeFalsy();

  });

  it('should check ionViewDidEnter logic when timeline already has an wait activity', () => {
    component.timeline = [];
    component.timeline.push(waitActivity);
    component.ionViewDidEnter();
    component.createNewTestReport();
    expect(component.timeline.length > 0).toBeTruthy();
  });

  it('should create timeline', () => {
    visitService.createVisit(testStation);
    component.createTimeline();

    activityService.addActivity(waitActivity);
    visitService.createVisit(testStation);
    let customTest: TestModel = {} as TestModel;
    customTest.startTime = "2019-05-23T14:52:04.208Z";
    customTest.endTime = "2019-05-23T14:52:24.773Z";
    customTest.status = TEST_REPORT_STATUSES.CANCELLED;
    visitService.addTest(customTest);
    component.createTimeline();
    expect(component.timeline).toBeTruthy();
  });

  it('should create the confirm alert', () => {
    let newVisit = visitService.createVisit(testStation);
    component.showConfirm(newVisit);
    expect(alertCtrl.create).toHaveBeenCalled();


    spyOn(component, 'checkWaitTimeReasons').and.callFake(() => {
      return true
    });
    component.showConfirm(newVisit);
    expect(alertCtrl.create).toHaveBeenCalled();
  });

  it('should end visit', () => {
    let newVisit = visitService.createVisit(testStation);
    spyOn(component, 'showConfirm');
    component.endVisit();
    expect(component.showConfirm).toHaveBeenCalled();
  });

  it('should test confirmEndVisit with a wait activity', () => {
    spyOn(storageService, 'delete');
    activityService.addActivity(waitActivity);
    component.timeline = [];
    component.visitService.visit = visitService.createVisit(testStation);
    component.visit = visitService.createVisit(testStation);
    component.confirmEndVisit();
    expect(loadingCtrl.create).toHaveBeenCalled();
    expect(storageService.delete).toHaveBeenCalled();
  });

  it('should test confirmEndVisit without a wait activity', () => {
    spyOn(storageService, 'delete');
    spyOn(activityService, 'updateActivityReasons');
    activityService.activities = [];
    component.timeline = [];
    component.visitService.visit = visitService.createVisit(testStation);
    component.visit = visitService.createVisit(testStation);
    component.confirmEndVisit();
    expect(loadingCtrl.create).toHaveBeenCalled();
    expect(storageService.delete).toHaveBeenCalled();
    expect(activityService.updateActivityReasons).not.toHaveBeenCalled();
  });

  it('should check if it can be added another waiting time', () => {
    let customTimeline = [];
    expect(component.canAddOtherWaitingTime(customTimeline)).toBeTruthy();

    customTimeline.push(waitActivity);
    expect(component.canAddOtherWaitingTime(customTimeline)).toBeFalsy();
  });

  it('should check if waitTimeReasons are checked', () => {
    let customTimeline = ActivityDataMock.Activities;
    expect(component.checkWaitTimeReasons(customTimeline)).toBeTruthy()
  });

  it('should check if modal is created', () => {
    component.editWaitTime(waitActivity);
    expect(modalCtrl.create).toHaveBeenCalled();

    waitActivity.activityType = 'other';
    component.editWaitTime(waitActivity);
    expect(modalCtrl.create).toHaveBeenCalled();
  });

  it('should test onUpdateActivityReasonsSuccess', () => {
    spyOn(storageService, 'delete');
    component.visit = visitService.createVisit(testStation);
    const loading = loadingCtrl.create({});
    component.onUpdateActivityReasonsSuccess(loading);
    expect(storageService.delete).toHaveBeenCalled();
  });

  it('it should display the confirmation page if the endVisit call fails with the Activity already ended error message', () => {
    spyOn(component, 'onUpdateActivityReasonsSuccess');
    spyOn(visitService, 'endVisit').and.returnValue(Observable.throw({ error: { error: VISIT.ALREADY_ENDED } }));
    component.visit = visitService.createVisit(testStation);
    component.confirmEndVisit();
    expect(component.onUpdateActivityReasonsSuccess).toHaveBeenCalled();
  });

  it('it should not display the confirmation page if the endVisit call fails', () => {
    spyOn(component, 'onUpdateActivityReasonsSuccess');
    spyOn(visitService, 'endVisit').and.returnValue(Observable.throw({ error: 'Generic error' }));
    component.visit = visitService.createVisit(testStation);
    component.confirmEndVisit();
    expect(component.onUpdateActivityReasonsSuccess).not.toHaveBeenCalled();
  });

  it('should disable the Create Test button once confirmEndVisit is called', () => {
    component.visit = visitService.createVisit(testStation);
    expect(component.isCreateTestEnabled).toBeTruthy();
    component.confirmEndVisit();
    expect(component.isCreateTestEnabled).toBeFalsy();
  });

});
