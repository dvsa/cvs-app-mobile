import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Storage } from '@ionic/storage';
import { StorageMock } from 'ionic-mocks';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { TestStore } from '../interceptors/auth.interceptor.spec';
import { AuthService } from '../global/auth.service';
import { AuthServiceMock } from '../../../test-config/services-mocks/auth-service.mock';

describe('Provider: StorageService', () => {
  let storageService: StorageService;
  let storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useFactory: () => StorageMock.instance() },
        { provide: Store, useClass: TestStore },
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    });
    storageService = TestBed.get(StorageService);
    storage = TestBed.get(Storage);
  });

  beforeEach(() => {
    let store = {};

    spyOn(window.localStorage, 'setItem').and.callFake((key, value) => {
      return (store[key] = value);
    });

    spyOn(window.localStorage, 'removeItem').and.callFake((key) => {
      delete store[key];
    });
  });

  afterEach(() => {
    storageService = null;
    storage = null;
  });

  it('should call storage.set', () => {
    let value = ['some data'];
    storageService.create('key', value);

    expect(storage.set).toHaveBeenCalledWith('key', value);
  });

  it('should call storage.get', () => {
    storageService.read('key');
    expect(storage.get).toHaveBeenCalledWith('key');
  });

  it('should update the storage', (done) => {
    let value = [1, 3];

    storageService.update('key', value);
    storage.remove('key').then(() => {
      expect(storage.remove).toHaveBeenCalledWith('key');
      expect(storage.set).toHaveBeenCalledWith('key', [1, 3]);
      done();
    });
  });

  it('should update the async storage', async () => {
    let value = [1, 3];

    await storageService.updateAsync('key', value);
    expect(storage.remove).toHaveBeenCalledWith('key');
    expect(storage.set).toHaveBeenCalledWith('key', [1, 3]);
  });

  it('should call storage.remove', () => {
    storageService.delete('key');
    expect(storage.remove).toHaveBeenCalledWith('key');
  });

  it('should call storage.clear', () => {
    storageService.clearStorage();
    expect(storage.clear).toHaveBeenCalled();
  });

  it('should return storage observable', () => {
    expect(storageService.watchStorage()).toEqual(jasmine.any(Observable));
  });

  it('should setItem into localStorage', () => {
    let value: any;
    storageService.setItem('key', value);
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('should removeItem from localStorage', () => {
    storageService.removeItem('key');
    expect(window.localStorage.removeItem).toHaveBeenCalled();
  });
});
