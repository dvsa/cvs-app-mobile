import { Component, OnInit } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';
import {
  APP_STRINGS,
  FIREBASE_SCREEN_NAMES,
  LOG_TYPES,
  PAGE_NAMES,
  TESTER_ROLES
} from '../../../app/app.enums';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AppService } from '../../../providers/global/app.service';
import { AuthService } from '../../../providers/global/auth.service';
import { AppConfig } from '../../../../config/app.config';
import { CallNumber } from '@ionic-native/call-number';
import { Log, LogsModel } from '../../../modules/logs/logs.model';
import { Store } from '@ngrx/store';
import { StartSendingLogs } from '../../../modules/logs/logs.actions';
import { NetworkStateProvider } from '../../../modules/logs/network-state.service';
import { FirebaseLogsService } from '../../../providers/firebase-logs/firebase-logs.service';
import { SyncService } from '../../../providers/global/sync.service';
import * as logsActions from '../../../modules/logs/logs.actions';

@IonicPage()
@Component({
  selector: 'page-test-station-home',
  templateUrl: 'test-station-home.html'
})
export class TestStationHomePage implements OnInit {
  appStrings: object = APP_STRINGS;

  constructor(
    public navCtrl: NavController,
    public appService: AppService,
    private screenOrientation: ScreenOrientation,
    public authService: AuthService,
    private syncService: SyncService,
    private alertCtrl: AlertController,
    private callNumber: CallNumber,
    private store$: Store<LogsModel>,
    private networkStateProvider: NetworkStateProvider,
    private firebaseLogsService: FirebaseLogsService
  ) {}

  ngOnInit() {
    this.networkStateProvider.initialiseNetworkState();
    this.store$.dispatch(new StartSendingLogs());
    if (this.appService.isCordova)
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
    let neededRoles: string[] = [
      TESTER_ROLES.FULL_ACCESS,
      TESTER_ROLES.PSV,
      TESTER_ROLES.HGV,
      TESTER_ROLES.ADR,
      TESTER_ROLES.TIR
    ];
    if (!this.authService.hasRights(this.authService.userRoles, neededRoles)) {
      const alert = this.alertCtrl.create({
        title: APP_STRINGS.UNAUTHORISED,
        message: APP_STRINGS.UNAUTHORISED_MSG,
        buttons: [
          {
            text: APP_STRINGS.CALL,
            handler: () => {
              this.callNumber.callNumber(AppConfig.KEY_PHONE_NUMBER, true).then(
                (data) => console.log(data),
                (err) => console.log(err)
              );
              return false;
            }
          }
        ],
        enableBackdropDismiss: false
      });
      alert.present();
    }
  }

  ionViewDidEnter() {
    this.firebaseLogsService.setScreenName(FIREBASE_SCREEN_NAMES.GET_STARTED);
  }

  async getStarted() {
    const IsDataSynced: boolean = await this.syncService.startSync();
    if (IsDataSynced) {
      this.setPage();
    } else {
      const log: Log = {
        type: LOG_TYPES.ERROR,
        message: `User ${this.authService.getOid()} having issue(s) with syncing data:`,
        timestamp: Date.now()
      };
      this.store$.dispatch(new logsActions.SaveLog(log));
    }
  }

  setPage(): void {
    if (this.appService.isCordova) {
      if (this.appService.isSignatureRegistered) {
        this.navCtrl.push(PAGE_NAMES.TEST_STATION_SEARCH_PAGE);
      } else {
        this.navCtrl.push(PAGE_NAMES.SIGNATURE_PAD_PAGE, { navController: this.navCtrl });
      }
    } else {
      this.navCtrl.push(PAGE_NAMES.TEST_STATION_SEARCH_PAGE);
    }
  }

  enableCache() {
    this.appService.enableCache();
  }
}
