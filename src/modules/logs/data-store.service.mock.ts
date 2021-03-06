export class DataStoreProviderMock {
  setItem = jasmine.createSpy('setItem').and.returnValue(Promise.resolve('set'));
  getItem = jasmine.createSpy('getItem').and.returnValue(Promise.resolve('get'));
  setSecureContainer = jasmine.createSpy('setSecureContainer').and.returnValue(Promise.resolve());
  removeItem = jasmine.createSpy('removeItem');
}

export class TestStore {
  dispatch() {}
}
