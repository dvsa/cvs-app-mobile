import {TestBed} from "@angular/core/testing";
import {StorageService} from "../natives/storage.service";
import {TestStationService} from "./test-station.service";
import {TestStationReferenceDataModel} from "../../models/reference-data-models/test-station.model";
import {TestStationDataMock} from "../../assets/data-mocks/reference-data-mocks/test-station-data.mock";

describe('Provider: TestStationService', () => {
  let testStationService: TestStationService;
  let storageService: StorageService;
  let spy: any;

  const testStationData = TestStationDataMock.TestStationData;
  let initialData: TestStationReferenceDataModel[];
  const PROPERTIES: string[] = ['testStationName', 'testStationPNumber', 'testStationAddress'];
  let filter: string;

  beforeEach(() => {
    spy = jasmine.createSpyObj('StorageService', {
      'read': new Promise(resolve => resolve(testStationData))
    });

    TestBed.configureTestingModule({
      providers: [
        TestStationService,
        {provide: StorageService, useValue: spy}
      ]
    });

    testStationService = TestBed.get(TestStationService);
    storageService = TestBed.get(StorageService);
  });

  afterEach(() => {
    testStationService = null;
    storageService = null;
  });

  it('should return data from local storage', () => {
    testStationService.getTestStationsFromStorage().subscribe(
      data => {
        expect(data).toBe(<TestStationReferenceDataModel[]>testStationData)
      }
    )
  });

  it('should return searched value as bold', () => {
    expect(testStationService.boldSearchVal('test', 'es')).toBe('t<strong>es</strong>t');
  });

  it('should return str, find null', () => {
    expect(testStationService.boldSearchVal('test', null)).toMatch('test');
  });

  it('should return string as find not fount in str', () => {
    expect(testStationService.boldSearchVal('test', 'xxx')).toMatch('test');
  });

  it('should order the list', () => {
    initialData = testStationService.groupByLetter(testStationData, 'testStationName');
    expect(Array.isArray(initialData[0])).toBe(true);
  });

  it('should return Test Station by name', () => {
    filter = 'An Test Station Name';
    let filteredData = testStationService.sortAndSearchTestStation(initialData, filter, PROPERTIES);

    expect(filteredData.length).toEqual(1);
    expect(filteredData[0][0].testStationName).toEqual(filter);
  });

  it('should return Test Station by address', () => {
    filter = 'An Test Station Address';
    let filteredData = testStationService.sortAndSearchTestStation(initialData, filter, PROPERTIES);

    expect(filteredData.length).toEqual(1);
    expect(filteredData[0][0].testStationAddress).toEqual(filter);
  });

  it('should return Test Station by pNumber', () => {
    filter = '123';
    let filteredData = testStationService.sortAndSearchTestStation(initialData, filter, PROPERTIES);

    expect(filteredData.length).toEqual(1);
    expect(filteredData[0][0].testStationPNumber).toEqual(filter);
  });

  it('should return nothing by unrelated string', () => {
    filter = 'xxx';
    let filteredData = testStationService.sortAndSearchTestStation(initialData, filter, PROPERTIES);

    expect(filteredData.length).toEqual(0);
  });

});
