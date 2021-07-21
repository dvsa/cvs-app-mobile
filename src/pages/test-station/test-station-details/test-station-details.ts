import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
  LoadingController
} from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { TestStationReferenceDataModel } from '../../../models/reference-data-models/test-station.model';
import {
  APP_STRINGS,
  PAGE_NAMES,
  AUTH,
  ANALYTICS_SCREEN_NAMES,
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_EVENTS,
  ANALYTICS_LABEL,
  ANALYTICS_VALUE
} from '../../../app/app.enums';
import { VisitService } from '../../../providers/visit/visit.service';
import { CallNumber } from '@ionic-native/call-number';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../../providers/auth/authentication/authentication.service';
import { AppService, AnalyticsService } from '../../../providers/global';
import { LogsProvider } from '../../../modules/logs/logs.service';

@IonicPage()
@Component({
  selector: 'page-test-station-details',
  templateUrl: 'test-station-details.html'
})
export class TestStationDetailsPage {
  testStation: TestStationReferenceDataModel;
  changeOpacity: boolean = false;
  nextAlert: boolean = false;
  isNextPageLoading: boolean = false;
  startVisitSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private callNumber: CallNumber,
    private visitService: VisitService,
    private openNativeSettings: OpenNativeSettings,
    private loadingCtrl: LoadingController,
    private authenticationService: AuthenticationService,
    private analyticsService: AnalyticsService,
    private appService: AppService,
    private logProvider: LogsProvider
  ) {
    this.testStation = navParams.get('testStation');
  }

  ionViewDidEnter() {
    this.analyticsService.setCurrentPage(ANALYTICS_SCREEN_NAMES.TEST_STATION_DETAILS);
  }

  ionViewDidLoad() {
    this.viewCtrl.setBackButtonText(APP_STRINGS.SEARCH_TEST_STATION);
  }

  confirmStartVisit() {
    const LOADING = this.loadingCtrl.create({
      content: 'Loading...'
    });
    this.isNextPageLoading = true;

    const { oid } = this.authenticationService.tokenInfo;
    LOADING.present();
    this.startVisitSubscription = this.visitService.startVisit(this.testStation).subscribe(
      (data) => {
        this.logProvider.dispatchLog({
          type: 'info',
          message: `${oid} - ${data.status} ${data.statusText} for API call to ${data.url}`,
          timestamp: Date.now()
        });

        this.isNextPageLoading = false;
        LOADING.dismiss();
        this.startVisitSubscription.unsubscribe();
        this.visitService.createVisit(this.testStation, data.body.id);
        this.navCtrl.push(PAGE_NAMES.VISIT_TIMELINE_PAGE, { testStation: this.testStation });
      },
      (error) => {
        this.logProvider.dispatchLog({
          type: 'error-visitService.startVisit-confirmStartVisit in test-station-details.ts',
          message: `${oid} - failed making a call to start a visit - ${JSON.stringify(error)}`,
          timestamp: Date.now()
        });

        this.isNextPageLoading = false;
        LOADING.dismiss();

        this.analyticsService.logEvent({
          category: ANALYTICS_EVENT_CATEGORIES.ERRORS,
          event: ANALYTICS_EVENTS.TEST_ERROR,
          label: ANALYTICS_VALUE.START_ACTIVITY_FAILED
        });

        if (error && error.error === AUTH.INTERNET_REQUIRED) {
          const TRY_AGAIN_ALERT = this.alertCtrl.create({
            title: APP_STRINGS.UNABLE_TO_START_VISIT,
            message: APP_STRINGS.NO_INTERNET_CONNECTION,
            buttons: [
              {
                text: APP_STRINGS.SETTINGS_BTN,
                handler: () => {
                  this.openNativeSettings.open('settings');
                }
              },
              {
                text: APP_STRINGS.TRY_AGAIN_BTN,
                handler: () => {
                  this.confirmStartVisit();
                }
              }
            ]
          });
          TRY_AGAIN_ALERT.present();
        }
      }
    );
  }

  reportIssueHandler() {
    this.nextAlert = true;
    let alert = this.alertCtrl.create({
      title: APP_STRINGS.REPORT_TITLE,
      message: APP_STRINGS.SPEAK_TO_TTL,
      buttons: [APP_STRINGS.OK]
    });
    alert.present();
    alert.onDidDismiss(() => {
      this.nextAlert = this.changeOpacity = false;
    });
  }

  startVisit(): void {
    this.changeOpacity = true;
    let confirm = this.alertCtrl.create({
      title: APP_STRINGS.TEST_STATION_SAFETY,
      message: `Confirm that you are at ${this.testStation.testStationName} (${this.testStation.testStationPNumber}) and that it is suitable to begin testing before continuing.`,
      cssClass: this.appService.isAccessibilityTextZoomEnabled()
        ? 'accessibility-limit-message-height'
        : '',
      buttons: [
        {
          text: APP_STRINGS.CONFIRM,
          cssClass: 'bold-action-button',
          handler: () => {
            this.confirmStartVisit();
          }
        },
        {
          text: APP_STRINGS.REPORT_ISSUE,
          cssClass: 'danger-action-button',
          handler: () => {
            this.reportIssueHandler();
          }
        },
        {
          text: APP_STRINGS.CANCEL,
          cssClass: 'not-bold-action-button'
        }
      ]
    });
    confirm.present();
    confirm.onDidDismiss(() => {
      if (!this.nextAlert) {
        this.changeOpacity = false;
      }
    });
  }

  callPhoneNumber(): void {
    let confirm = this.alertCtrl.create({
      title: `${this.testStation.testStationContactNumber}`,
      buttons: [
        {
          text: APP_STRINGS.CANCEL
        },
        {
          text: APP_STRINGS.CALL,
          handler: () => {
            this.callNumber.callNumber(this.testStation.testStationContactNumber, true);
          }
        }
      ]
    });
    confirm.present();
  }
}
