import { TestService } from "./test.service";
import { TestBed } from "@angular/core/testing";
import { PreparersModel } from "../../models/reference-data-models/preparers.model";
import { PreparersDataMock } from "../../assets/data-mocks/reference-data-mocks/preparers-data.mock";
import { TechRecordDataMock } from "../../assets/data-mocks/tech-record-data.mock";
import { VehicleModel } from "../../models/vehicle/vehicle.model";
import { VehicleService } from "../vehicle/vehicle.service";

describe('Provider: TestReportService', () => {
  let testService: TestService;
  let vehicleService: VehicleService;
  let vehicleServiceSpy: any;

  const VEHICLE: VehicleModel = TechRecordDataMock.VehicleData;


  beforeEach(() => {
    vehicleServiceSpy = jasmine.createSpyObj('VehicleService', ['createVehicle', 'addTestType', 'removeTestType'])

    TestBed.configureTestingModule({
      providers: [
        TestService,
        {provide: VehicleService, useValue: vehicleServiceSpy},
      ]
    });

    testService = TestBed.get(TestService);
    vehicleService = TestBed.get(VehicleService);
  });

  afterEach(() => {
    testService = null;
    vehicleService = null;
  });

  it('should assign the startTime to the report', () => {
    let newTest = testService.createTest();
    expect(newTest.startTime).toBeTruthy();
  });

  it('should assign the endTime to the report', () => {
    let endedTest = testService.createTest();
    testService.endTestReport(endedTest);
    expect(endedTest.endTime).toBeTruthy();
  });

  it('should add a vehicle to the vehicles array of testReport', () => {
    let newTest = testService.createTest();
    expect(newTest.vehicles.length).toEqual(0);
    testService.addVehicle(newTest, VEHICLE);
    expect(newTest.vehicles.length).toEqual(1);
  });
});
