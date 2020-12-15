// import { VehicleHistoryDetailsPage } from './vehicle-history-details';
// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { ViewControllerMock } from '../../../../../test-config/ionic-mocks/view-controller.mock';
// import { NavParamsMock } from '../../../../../test-config/ionic-mocks/nav-params.mock';
// import { CommonFunctionsService } from '../../../../providers/utils/common-functions';
// import { PipesModule } from '../../../../pipes/pipes.module';
// import { TestResultModel } from '../../../../models/tests/test-result.model';
// import { TestResultsHistoryDataMock } from '../../../../assets/data-mocks/test-results-history-data.mock';
// import { FirebaseLogsService } from '../../../../providers/firebase-logs/firebase-logs.service';
// import { FirebaseLogsServiceMock } from '../../../../../test-config/services-mocks/firebaseLogsService.mock';
// import { AppService } from '../../../../providers/global/app.service';
// import { AppServiceMock } from '../../../../../test-config/services-mocks/app-service.mock';
// import { TestTypeService } from '../../../../providers/test-type/test-type.service';
// import { TestTypeServiceMock } from '../../../../../test-config/services-mocks/test-type-service.mock';
// import { DEFICIENCY_CATEGORY } from '../../../../app/app.enums';
// import { DefectDetailsModel } from '../../../../models/defects/defect-details.model';
// import { MOCK_UTILS } from '../../../../../test-config/mocks/mocks.utils';

// describe('Component: VehicleHistoryDetailsPage', () => {
//   let comp: VehicleHistoryDetailsPage;
//   let fixture: ComponentFixture<VehicleHistoryDetailsPage>;
//   let navCtrl: NavController;
//   let commonFunctionsService: CommonFunctionsService;
//   let firebaseLogsService: FirebaseLogsService;
//   let viewCtrl: ViewController;

//   const defects: DefectDetailsModel[] = [MOCK_UTILS.mockDefectsDetails()];

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [VehicleHistoryDetailsPage],
//       imports: [IonicModule.forRoot(VehicleHistoryDetailsPage), PipesModule],
//       providers: [
//         NavController,
//         CommonFunctionsService,
//         { provide: NavParams, useClass: NavParamsMock },
//         { provide: ViewController, useClass: ViewControllerMock },
//         { provide: TestTypeService, useClass: TestTypeServiceMock },
//         { provide: FirebaseLogsService, useClass: FirebaseLogsServiceMock },
//         { provide: AppService, useClass: AppServiceMock }
//       ],
//       schemas: [CUSTOM_ELEMENTS_SCHEMA]
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(VehicleHistoryDetailsPage);
//     comp = fixture.componentInstance;
//     navCtrl = TestBed.get(NavController);
//     viewCtrl = TestBed.get(ViewController);
//     commonFunctionsService = TestBed.get(CommonFunctionsService);
//     firebaseLogsService = TestBed.get(FirebaseLogsService);
//     comp.testIndex = 0;
//     comp.testTypeIndex = 0;
//     comp.testResultHistory = TestResultsHistoryDataMock.TestResultHistoryData;
//     comp.testsWithoutCertificate = ['test'];
//     comp.testsWithoutDefects = ['test'];
//     comp.testsWithoutSeatbelts = ['test'];
//     fixture.detectChanges();
//   });

//   afterEach(() => {
//     fixture.destroy();
//     comp = null;
//   });

//   it('should create the component', () => {
//     expect(fixture).toBeTruthy();
//     expect(comp).toBeTruthy();
//   });

//   it('should test ionViewDidEnterLogic', () => {
//     spyOn(firebaseLogsService, 'setScreenName');
//     comp.ionViewDidEnter();
//     expect(firebaseLogsService.setScreenName).toHaveBeenCalled();
//   });

//   it('should return the correct color', () => {
//     expect(commonFunctionsService.getTestResultColor('pass')).toEqual('secondary');
//     expect(commonFunctionsService.getTestResultColor('fail')).toEqual('danger');
//     expect(commonFunctionsService.getTestResultColor('abandoned')).toEqual('danger');
//     expect(commonFunctionsService.getTestResultColor('prs')).toEqual('tertiary');
//   });

//   it('should return false if defects is null', () => {
//     expect(comp.checkForDefects(null)).toBeFalsy;
//   });

//   it('should return false if defects array is empty', () => {
//     expect(comp.checkForDefects([])).toBeFalsy;
//   });

//   it('should return true if defects array is not empty', () => {
//     expect(comp.checkForDefects(defects)).toBeTruthy;
//   });

//   it('should set the correct test metadata to variables', () => {
//     comp.selectedTestResult = {} as TestResultModel;
//     comp.selectedTestResult.countryOfRegistration = 'a';
//     comp.setTestMetadata();
//     expect(comp.countryOfRegistration).toEqual('Austria');
//   });

//   it('should return color for category advisory', () => {
//     const deficiencyColor = comp.getDeficiencyColor(DEFICIENCY_CATEGORY.ADVISORY);
//     expect(deficiencyColor).toEqual('light');
//   });

//   it('should return color for category DANGEROUS', () => {
//     const deficiencyColor = comp.getDeficiencyColor(DEFICIENCY_CATEGORY.DANGEROUS);
//     expect(deficiencyColor).toEqual('dark');
//   });

//   it('should return color for category MAJOR', () => {
//     const deficiencyColor = comp.getDeficiencyColor(DEFICIENCY_CATEGORY.MAJOR);
//     expect(deficiencyColor).toEqual('danger');
//   });

//   it('should return color for category MINOR', () => {
//     const deficiencyColor = comp.getDeficiencyColor(DEFICIENCY_CATEGORY.MINOR);
//     expect(deficiencyColor).toEqual('attention');
//   });

//   it('should compareTestWithMetadata', () => {
//     comp.compareTestWithMetadata();
//     expect(comp.doesNotHaveCert).toEqual(false);
//     expect(comp.doesNotHaveDefects).toEqual(false);
//     expect(comp.doesNotHaveCert).toEqual(false);
//   });

//   it('should ionViewWillEnter', () => {
//     spyOn(viewCtrl, 'setBackButtonText');
//     comp.ionViewWillEnter();

//     expect(viewCtrl.setBackButtonText).toHaveBeenCalledWith('Test history');
//   });
// });
