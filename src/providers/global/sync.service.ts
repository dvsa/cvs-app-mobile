import { Injectable } from "@angular/core";
import { HTTPService } from "./http.service";
import { catchError, map, retryWhen } from "rxjs/operators";
import { genericRetryStrategy } from "../utils/rxjs.utils";
import { AtfModel } from "../../models/atf.model";
import { LOCAL_STORAGE, STORAGE } from "../../app/app.enums";
import { StorageService } from "../natives/storage.service";
import { AlertController, Events, LoadingController } from "ionic-angular";
import { KEYS } from "../../../config/config.enums";
import { _throw } from "rxjs/observable/throw";
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
import { CallNumber } from "@ionic-native/call-number";
import { Observable } from "rxjs";
import { of } from "rxjs/observable/of";
import { DefectsModel } from "../../models/defects/defects.model";

@Injectable()
export class SyncService {
  initSyncDone: boolean;
  loading = this.loadingCtrl.create({
    content: 'Loading...'
  });
  loadOrder: Observable<any>[] = [];

  constructor(private httpService: HTTPService, private storageService: StorageService, public events: Events, private alertCtrl: AlertController, private openNativeSettings: OpenNativeSettings, private callNumber: CallNumber, public loadingCtrl: LoadingController) {
    this.initSyncDone = !!localStorage.getItem(LOCAL_STORAGE.INIT_SYNC);
    if (!this.initSyncDone) {
      this.loading.present().then(
        () => {
          this.events.subscribe('initSyncDone', () => {
            localStorage.setItem(LOCAL_STORAGE.INIT_SYNC, 'true');
            this.loading.dismissAll();
          })
        }
      )
    }
  }

  startSync(): void {
    this.loadOrder.push(this.getAtfs());
    this.loadOrder.push(this.getDefects());
    this.getAllData();
  }


  getAllData(): any {
    return Observable.forkJoin(this.loadOrder).subscribe(
      (data) => {
        this.handleData(data);
      }
    )
  }

  getAtfs(): Observable<AtfModel[]> {
    return this.httpService.getAtfs()
      .pipe(
        map((data) => {
          this.storageService.update(STORAGE.ATFS, data);
          return data;
        }),
        retryWhen(genericRetryStrategy()),
        catchError(() => of(undefined))
      )
  }

  getDefects(): Observable<DefectsModel[]> {
    return this.httpService.getDefects()
      .pipe(
        map((data) => {
          this.storageService.update(STORAGE.DEFECTS, data);
          return data
        }),
        retryWhen(genericRetryStrategy()),
        catchError(() => of(undefined))
      )
  }

  private handleData(array: any[]): void {
    array.forEach(
      (elem, index) => {
        if (elem) {
          this.loadOrder[index] = null;
        }
      }
    )
    this.loadOrder = this.loadOrder.filter(
      (elem) => {
        if (elem) return elem;
      }
    )
    if (this.loadOrder.length == 0) {
      this.events.publish('initSyncDone', true);
    } else {
      this.handleError();
    }
  }

  private handleError(): Observable<any> {
    let alert = this.alertCtrl.create({
        title: 'Unable to load data',
        enableBackdropDismiss: false,
        message: 'Make sure you are connected to the internet and try again',
        buttons: [
          {
            text: 'Settings',
            handler: () => {
              this.openNativeSettings.open('settings');
              this.handleError();
            }
          },
          {
            text: 'Call Technical Support',
            handler: () => {
              this.callNumber.callNumber(KEYS.PHONE_NUMBER, true)
              return false
            }
          },
          {
            text: 'Try again',
            handler: () => {
              this.getAllData();
            }
          }
        ]
      }
    );
    alert.present();
    return _throw(
      'Something bad happened; please try again later.'
    );
  }
}

