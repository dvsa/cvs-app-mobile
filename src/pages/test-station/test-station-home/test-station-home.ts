import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Store } from '@ngrx/store';
import { IonicPage, NavController } from 'ionic-angular';

import {
  ANALYTICS_SCREEN_NAMES,
  APP_STRINGS,
  LOG_TYPES,
  PAGE_NAMES,
  TESTER_ROLES
} from '../../../app/app.enums';
import {
  AppService,
  AnalyticsService,
  SyncService,
  AppAlertService
} from '../../../providers/global';
import { AuthenticationService } from '../../../providers/auth/authentication/authentication.service';
import { LogsModel } from '../../../modules/logs/logs.model';
import { StartSendingLogs } from '../../../modules/logs/logs.actions';
import { LogsProvider } from '../../../modules/logs/logs.service';

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
    private authenticationService: AuthenticationService,
    private syncService: SyncService,
    private alertService: AppAlertService,
    private store$: Store<LogsModel>,
    private analyticsService: AnalyticsService,
    private logProvider: LogsProvider
  ) {}

  neededRoles: string[] = [
    TESTER_ROLES.FULL_ACCESS,
    TESTER_ROLES.PSV,
    TESTER_ROLES.HGV,
    TESTER_ROLES.ADR,
    TESTER_ROLES.TIR
  ];

  ngOnInit() {
    this.store$.dispatch(new StartSendingLogs());

    if (this.appService.isCordova) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);

      this.analyticsService.setCurrentPage(ANALYTICS_SCREEN_NAMES.GET_STARTED);
    }
  }

  async ionViewDidEnter() {
    if (!(await this.authenticationService.hasUserRights(this.neededRoles))) {
      this.alertService.alertUnAuthorise();
    }
  }

  async getStarted() {
    let err: Error, IsDataSynced: boolean;
    [err, IsDataSynced] = await this.syncService.startSync();

    if (IsDataSynced) {
      this.setPage();
    } else {
      this.logProvider.dispatchLog({
        type: LOG_TYPES.ERROR,
        message: `User ${
          this.authenticationService.tokenInfo.oid
        } having issue(s) with syncing data: Error ${JSON.stringify(err)}`,
        timestamp: Date.now()
      });
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
