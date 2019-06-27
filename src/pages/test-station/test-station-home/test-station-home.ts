import { Component, OnInit } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';
import { StorageService } from "../../../providers/natives/storage.service";
import { VisitService } from "../../../providers/visit/visit.service";
import { APP_STRINGS, PAGE_NAMES, TESTER_ROLES } from "../../../app/app.enums";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { AppService } from "../../../providers/global/app.service";
import { AuthService } from "../../../providers/global/auth.service";
import { AppConfig } from "../../../../config/app.config";
import { CallNumber } from "@ionic-native/call-number";
import { Log, LogsModel } from "../../../modules/logs/logs.model";
import { Store } from "@ngrx/store";
import { StartSendingLogs } from "../../../modules/logs/logs.actions";
import { NetworkStateProvider } from "../../../modules/logs/network-state.service";

@IonicPage()
@Component({
  selector: 'page-test-station-home',
  templateUrl: 'test-station-home.html'
})
export class TestStationHomePage implements OnInit {
  appStrings: object = APP_STRINGS;

  constructor(public navCtrl: NavController,
              public appService: AppService,
              private storageService: StorageService,
              private visitService: VisitService,
              private screenOrientation: ScreenOrientation,
              public authService: AuthService,
              private alertCtrl: AlertController,
              private callNumber: CallNumber,
              private store$: Store<LogsModel>,
              private networkStateProvider: NetworkStateProvider) {
  }

  ngOnInit() {
    this.networkStateProvider.initialiseNetworkState();
    this.store$.dispatch(new StartSendingLogs());
    if (this.appService.isCordova) this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
    let neededRoles: string[] = [TESTER_ROLES.FULL_ACCESS, TESTER_ROLES.PSV, TESTER_ROLES.HGV, TESTER_ROLES.ADR, TESTER_ROLES.TIR];
    if (!this.authService.hasRights(this.authService.userRoles, neededRoles)) {
      const alert = this.alertCtrl.create({
        title: APP_STRINGS.UNAUTHORISED,
        message: APP_STRINGS.UNAUTHORISED_MSG,
        buttons: [
          {
            text: APP_STRINGS.CALL,
            handler: () => {
              this.callNumber.callNumber(AppConfig.KEY_PHONE_NUMBER, true).then(
                data => console.log(data),
                err => console.log(err)
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

  getStarted(): void {
    if (this.appService.isCordova) {
      if (this.appService.isJwtTokenStored) {
        if (this.appService.isSignatureRegistered) {
          this.navCtrl.push(PAGE_NAMES.TEST_STATION_SEARCH_PAGE);
        } else {
          this.navCtrl.push(PAGE_NAMES.SIGNATURE_PAD_PAGE, {navController: this.navCtrl});
        }
      }
    } else {
      this.navCtrl.push(PAGE_NAMES.TEST_STATION_SEARCH_PAGE);
    }
  }

  enableCache() {
    this.appService.enableCache();
  }
}
