import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { Platform } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { NetworkMock, PlatformMock } from 'ionic-mocks';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { provideMockActions } from '@ngrx/effects/testing';
import { Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';
import { StoreModule, Store } from '@ngrx/store';

import { LogsEffects } from './logs.effects';
import * as logsActions from './logs.actions';
import { of } from 'rxjs/observable/of';
import { Log, LogType } from './logs.model';
import { LogsProviderMock } from './logs.service.mock';
import { LogsProvider } from './logs.service';
import { logsReducer } from './logs.reducer';
import { DataStoreProvider } from './data-store.service';
import { DataStoreProviderMock } from './data-store.service.mock';
import { NetworkService } from './../../providers/global/network.service';

export class TestActions extends Actions {
  constructor() {
    super(empty());
  }

  set stream$(source$: Observable<any>) {
    this.source = source$;
  }
}

describe('Logs Effects', () => {
  let effects: LogsEffects;
  let actions$: any;
  let cacheDays: number;
  let dataStoreMock: DataStoreProvider;

  beforeEach(() => {
    // ARRANGE
    actions$ = new ReplaySubject(1);
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          logs: logsReducer
        })
      ],
      providers: [
        LogsEffects,
        NetworkService,
        provideMockActions(() => actions$),
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: Network, useFactory: () => NetworkMock.instance('wifi') },
        { provide: DataStoreProvider, useClass: DataStoreProviderMock },
        { provide: LogsProvider, useClass: LogsProviderMock },
        Store
      ]
    });
    effects = TestBed.get(LogsEffects);
    dataStoreMock = TestBed.get(DataStoreProvider);
  });

  it('should create the logs effects', () => {
    expect(effects).toBeTruthy();
  });

  it('should dispatch the persist logs action when the logs post successfully', (done) => {
    // ARRANGE
    const timeStamps: number[] = [12345678];
    // ACT
    actions$.next(new logsActions.SendLogsSuccess(timeStamps));
    // ASSERT
    effects.sendLogsSuccessEffect$.subscribe((result) => {
      expect(result instanceof logsActions.PersistLog).toBe(true);
      done();
    });
  });

  it('should dispatch the persist logs action when an individual log is added', (done) => {
    // ARRANGE
    const log: Log = {
      ['test']: 'xyz',
      type: LogType.DEBUG,
      message: 'test',
      timestamp: 1234567
    };
    // ACT
    actions$.next(new logsActions.SaveLog(log));
    // ASSERT
    effects.saveLogEffect$.subscribe((result) => {
      expect(result instanceof logsActions.PersistLog).toBe(true);
      done();
    });
  });

  describe('persistLogs', () => {
    it('should call saveLogs', fakeAsync((done) => {
      // ARRANGE
      spyOn(effects, 'saveLogs').and.callThrough();
      // ACT
      actions$.next(new logsActions.PersistLog());
      tick();
      // ASSERT
      effects.persistLogEffect$.subscribe((result) => {
        expect(effects.saveLogs).toHaveBeenCalled();
        expect(result instanceof of).toBe(true);
        done();
      });
    }));
  });
  describe('LoadLog', () => {
    it('should call getPersistedLogs and return LoadLogState', fakeAsync((done) => {
      // ARRANGE
      spyOn(effects, 'getPersistedLogs').and.callThrough();
      // ACT
      actions$.next(new logsActions.LoadLog());
      tick();
      // ASSERT
      effects.persistLogEffect$.subscribe((result) => {
        expect(effects.getPersistedLogs).toHaveBeenCalled();
        expect(result instanceof logsActions.LoadLogState).toBe(true);
        done();
      });
    }));
  });

  describe('getAndConvertPersistedLogs', () => {
    it('should return data without emptying cache if data is not too old', (done) => {
      const log: Log = {
        ['test']: 'xyz',
        type: LogType.DEBUG,
        message: 'test',
        timestamp: 1234567
      };
      const dataWthinWindowCache = {
        data: log
      };

      // override mock getItem as we need data to test
      // @ts-ignore
      dataStoreMock.getItem.and.callFake(() =>
        Promise.resolve(JSON.stringify(dataWthinWindowCache))
      );

      spyOn(effects, 'emptyCachedData').and.callThrough();

      effects.getAndConvertPersistedLogs().then((data) => {
        expect(effects.emptyCachedData).toHaveBeenCalledTimes(0);
        expect(dataStoreMock.setItem).toHaveBeenCalledTimes(0);
        done();
      });
    });
  });
});
