import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subject, Observable } from 'rxjs';
import { LogsModel, Log } from '../../modules/logs/logs.model';
import { Store } from '@ngrx/store';
import { AuthService } from '../global/auth.service';
import { LOG_TYPES } from '../../app/app.enums';
import * as logsActions from '../../modules/logs/logs.actions';

@Injectable()
export class StorageService {
  private storageSub = new Subject<any>();

  constructor(
    private storage: Storage,
    private store$: Store<LogsModel>,
    private authService: AuthService
  ) {}

  create(key: string, dataArray: any | any[]): Promise<any> {
    return this.storage.set(key, dataArray);
  }

  read(key: string): Promise<any> {
    return this.storage.get(key).then((data: any) => {
      // TOOD: Remove logging after the white screen bug is resolved
      // CVSB: 17584
      const log: Log = {
        type: LOG_TYPES.INFO,
        message: `User ${this.authService.getOid()} read storage key ${key}`,
        timestamp: Date.now()
      };
      this.store$.dispatch(new logsActions.SaveLog(log));

      return data;
    });
  }

  update(key, value): Promise<any> {
    return this.storage.remove(key).then((data: any) => {
      return this.storage.set(key, value).then((data: any) => {
        // TOOD: Remove logging after the white screen bug is resolved
        // CVSB: 17584
        const log: Log = {
          type: LOG_TYPES.INFO,
          message: `User ${this.authService.getOid()} write storage key ${key}`,
          timestamp: Date.now()
        };
        this.store$.dispatch(new logsActions.SaveLog(log));

        return data;
      });
    });
  }

  /**
   * Further discuss on this approach if adopted. Hence if used will cause
   * some refactoring in the app
   * @param key data key
   * @param value data value
   */
  async updateAsync(key: string, value: any): Promise<any> {
    await this.storage.remove(key);
    return await this.storage.set(key, value);
  }

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, data);
    this.storageSub.next();
  }

  removeItem(key) {
    localStorage.removeItem(key);
    this.storageSub.next();
  }

  delete(key: string): Promise<any> {
    return this.storage.remove(key).then((data) => {
      return data;
    });
  }

  clearStorage(): Promise<any> {
    return this.storage.clear().then((data) => {
      return data;
    });
  }
}
