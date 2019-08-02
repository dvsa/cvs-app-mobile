import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  Events,
  IonicPage,
  LoadingController,
  Loading,
  NavController,
  NavParams,
  ToastController,
  ModalController
} from 'ionic-angular';
import { TestService } from "../../../providers/test/test.service";
import { TestModel } from "../../../models/tests/test.model";
import { VisitService } from "../../../providers/visit/visit.service";
import { VisitModel } from "../../../models/visit/visit.model";
import { StateReformingService } from "../../../providers/global/state-reforming.service";
import {
  APP,
  APP_STRINGS,
  STORAGE,
  TEST_REPORT_STATUSES,
  TEST_TYPE_RESULTS,
  AUTH,
  PAGE_NAMES,
  FIREBASE,
  VISIT,
  WAIT_TIME_REASONS
} from "../../../app/app.enums";
import { StorageService } from "../../../providers/natives/storage.service";
import { AppService } from "../../../providers/global/app.service";
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { AuthService } from "../../../providers/global/auth.service";
import { Store } from "@ngrx/store";
import { Log, LogsModel } from "../../../modules/logs/logs.model";
import * as logsActions from "../../../modules/logs/logs.actions";
import { FirebaseLogsService } from "../../../providers/firebase-logs/firebase-logs.service";
import { Firebase } from '@ionic-native/firebase';
import { ActivityModel } from "../../../models/visit/activity.model";
import { ActivityService } from "../../../providers/activity/activity.service";

@IonicPage()
@Component({
  selector: 'page-visit-timeline',
  templateUrl: 'visit-timeline.html'
})
export class VisitTimelinePage implements OnInit {
  visit: VisitModel;
  timeline: any[];
  TEST_REPORT_STATUS = TEST_REPORT_STATUSES;
  TEST_TYPE_RESULT = TEST_TYPE_RESULTS;
  VISIT_TYPE = VISIT;
  changeOpacity: boolean = false;
  oid: string;
  timeout;
  isCreateTestEnabled = true;

  constructor(public navCtrl: NavController,
              public stateReformingService: StateReformingService,
              public loadingCtrl: LoadingController,
              public events: Events,
              public appService: AppService,
              private navParams: NavParams,
              private testReportService: TestService,
              public visitService: VisitService,
              private activityService: ActivityService,
              private alertCtrl: AlertController,
              private storageService: StorageService,
              private toastCtrl: ToastController,
              private openNativeSettings: OpenNativeSettings,
              private firebase: Firebase,
              private authService: AuthService,
              private store$: Store<LogsModel>,
              private firebaseLogsService: FirebaseLogsService,
              private modalCtrl: ModalController) {
    this.timeline = [];
  }

  ngOnInit() {
    this.visit = Object.keys(this.visitService.visit).length ? this.visitService.visit : this.visitService.createVisit(this.navParams.get('testStation'));
    this.stateReformingService.saveNavStack(this.navCtrl);
    this.events.subscribe(APP.TEST_SUBMITTED, () => {
      const TOAST = this.toastCtrl.create({
        message: APP_STRINGS.SUBMIT_TEST_TOAST_MESSAGE,
        duration: 4000,
        position: 'top',
        cssClass: 'submit-toast'
      });
      TOAST.present();
    });
  }

  ionViewWillEnter() {
    this.createTimeline();
  }

  ionViewDidEnter() {
    if (!this.activityService.waitTimeStarted && this.canAddOtherWaitingTime(this.timeline)) {
      this.timeout = setTimeout(() => {
        let waitActivity: ActivityModel = this.activityService.createActivity(this.visit, VISIT.ACTIVITY_TYPE_WAIT, true, true);
        this.activityService.waitTimeStarted = true;
        if (this.timeline.length === 0) {
          waitActivity.startTime = this.visit.startTime;
        } else {
          waitActivity.startTime = this.timeline[this.timeline.length - 1]["endTime"]
        }
        this.timeline.push(waitActivity);
      }, this.activityService.counterTime * 1000 * 60);
    }
  }

  endVisit(): void {
    this.showConfirm(this.visit);
  }

  createNewTestReport(): void {
    this.firebaseLogsService.search_vehicle_time.search_vehicle_start_time = Date.now();
    let test = this.testReportService.createTest();
    this.navCtrl.push(PAGE_NAMES.VEHICLE_LOOKUP_PAGE, {test: test});
    clearTimeout(this.timeout);
  }

  createTimeline(): void {
    this.timeline = [];
    let tempTimeline = [];
    let activities = this.activityService.getActivities();
    activities.forEach(activity => {
      tempTimeline.push(activity)
    });

    let testReports = this.visitService.getTests();
    testReports.forEach(testReport => {
      tempTimeline.push(testReport)
    });

    this.timeline = [...tempTimeline].sort((a, b) => {
      return Date.parse(a.startTime) - Date.parse(b.startTime);
    });
  }

  onUpdateActivityReasonsSuccess(LOADING: Loading) {
    this.storageService.delete(STORAGE.VISIT);
    this.storageService.delete(STORAGE.STATE);
    this.storageService.delete(STORAGE.ACTIVITIES);
    this.activityService.waitTimeStarted = false;
    this.visitService.visit = {} as VisitModel;
    this.activityService.activities = [];
    LOADING.dismiss();
    this.navCtrl.push(PAGE_NAMES.END_VISIT_CONFIRM_PAGE, {testStationName: this.visit.testStationName});
  }

  confirmEndVisit() {
    this.isCreateTestEnabled=false;
    const LOADING = this.loadingCtrl.create({
      content: APP_STRINGS.END_VISIT_LOADING
    });
    LOADING.present();
    this.oid = this.authService.getOid();
    this.visitService.endVisit(this.visit.id).subscribe(
      (response) => {
        const log: Log = {
          type: 'info',
          message: `${this.oid} - ${response.status} ${response.statusText} for API call to ${response.url}`,
          timestamp: Date.now(),
        };
        this.store$.dispatch(new logsActions.SaveLog(log));
        clearTimeout(this.timeout);
        let activity: ActivityModel = this.activityService.createActivityBodyForCall(this.visitService.visit, null, this.timeline);
        this.activityService.submitActivity(activity).subscribe(
          (resp) => {
            if (this.timeline.length && this.timeline[this.timeline.length - 1].activityType) {
              this.activityService.activities[this.activityService.activities.length - 1].endTime = new Date().toISOString();
              this.activityService.activities[this.activityService.activities.length - 1].id = resp.id;
            }
            this.activityService.updateActivities();
            let updActivitiesARR = this.activityService.createActivitiesForUpdateCall(this.activityService.activities);
            if (updActivitiesARR.length) {
              this.activityService.updateActivityReasons(updActivitiesARR).subscribe(
                () => {
                  this.onUpdateActivityReasonsSuccess(LOADING);
                },
                () => {
                  LOADING.dismiss();
                }
              )
            } else {
              this.onUpdateActivityReasonsSuccess(LOADING);
            }
          },
          () => {
            this.firebase.logEvent('test_error', {content_type: 'error', item_id: "Wait activity submission failed"});
          }
        );
      }, (error) => {
        const log: Log = {
          type: 'error',
          message: `${this.oid} - ${error.status} ${error.error.error} for API call to ${error.url}`,
          timestamp: Date.now(),
        };
        this.store$.dispatch(new logsActions.SaveLog(log));
        LOADING.dismiss();
        this.firebaseLogsService.logEvent(FIREBASE.TEST_ERROR, FIREBASE.ERROR, FIREBASE.ENDING_ACTIVITY_FAILED);
        if (error && error.error === AUTH.INTERNET_REQUIRED) {
          const TRY_AGAIN_ALERT = this.alertCtrl.create({
            title: APP_STRINGS.UNABLE_TO_END_VISIT,
            message: APP_STRINGS.NO_INTERNET_CONNECTION,
            buttons: [{
              text: APP_STRINGS.SETTINGS_BTN,
              handler: () => {
                this.openNativeSettings.open('settings');
              }
            },
              {
                text: APP_STRINGS.TRY_AGAIN_BTN,
                handler: () => {
                  this.confirmEndVisit();
                }
              }]
          });
          TRY_AGAIN_ALERT.present();
        } else if(error && error.error.error === VISIT.ALREADY_ENDED){
          this.onUpdateActivityReasonsSuccess(LOADING);
        }
      });
  }

  showConfirm(visit: VisitModel): void {
    this.changeOpacity = true;

    if (this.checkWaitTimeReasons(this.activityService.activities)) {
      const CONFIRM_WAITING = this.alertCtrl.create({
        title: APP_STRINGS.END_VISIT_WAITING_TITLE,
        message: APP_STRINGS.END_VISIT_WAITING_MSG,
        buttons: [APP_STRINGS.OK]
      });
      CONFIRM_WAITING.present();
      CONFIRM_WAITING.onDidDismiss(() => this.changeOpacity = false);
    } else {
      const CONFIRM = this.alertCtrl.create({
        title: APP_STRINGS.END_VISIT_TITLE,
        message: `${APP_STRINGS.END_VISIT_MSG}${visit.testStationName}.`,
        buttons: [
          {
            text: APP_STRINGS.CANCEL,
            role: 'cancel'
          },
          {
            text: APP_STRINGS.END_VISIT_TITLE,
            handler: () => {
              this.confirmEndVisit();
            }
          }
        ]
      });
      CONFIRM.present();
      CONFIRM.onDidDismiss(() => this.changeOpacity = false);
    }
  }

  editWaitTime(activity: ActivityModel) {
    const MODAL = this.modalCtrl.create(PAGE_NAMES.WAIT_TIME_REASONS_PAGE, {
      'waitActivity': activity
    });
    MODAL.onDidDismiss((data) => {
      activity.waitReason = data.waitActivity.waitReason;
      activity.notes = data.waitActivity.notes;
      this.activityService.updateActivities();
    });
    if (activity.activityType === VISIT.ACTIVITY_TYPE_WAIT) {
      MODAL.present();
    }
  }

  checkWaitTimeReasons(activities: ActivityModel[]): boolean {
    let checkReason: boolean = false;
    activities.forEach((elem) => {
      if (elem.waitReason.length == 0) checkReason = true;
    });
    return checkReason;
  }

  canAddOtherWaitingTime(timeline): boolean {
    if (timeline.length == 0) {
      return true;
    } else {
      return !timeline[timeline.length - 1].activityType;
    }
  }
}
