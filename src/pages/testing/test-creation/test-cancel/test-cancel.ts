import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { TestModel } from "../../../../models/tests/test.model";
import { TestService } from "../../../../providers/test/test.service";
import { APP_STRINGS, FIREBASE, LOG_TYPES, PAGE_NAMES, TEST_REPORT_STATUSES } from "../../../../app/app.enums";
import { TestResultService } from "../../../../providers/test-result/test-result.service";
import { VisitService } from "../../../../providers/visit/visit.service";
import { Observable } from "rxjs";
import { OpenNativeSettings } from "@ionic-native/open-native-settings";
import { AuthService } from "../../../../providers/global/auth.service";
import { Store } from "@ngrx/store";
import { Log, LogsModel } from "../../../../modules/logs/logs.model";
import * as logsActions from "../../../../modules/logs/logs.actions";
import { catchError } from "rxjs/operators";
import { FirebaseLogsService } from "../../../../providers/firebase-logs/firebase-logs.service";
import { ActivityService } from "../../../../providers/activity/activity.service";
import { Firebase } from "@ionic-native/firebase";
import { TestResultModel } from "../../../../models/tests/test-result.model";

@IonicPage()
@Component({
  selector: 'page-test-cancel',
  templateUrl: 'test-cancel.html',
})
export class TestCancelPage {
  testData: TestModel;
  cancellationReason: string = '';
  changeOpacity;
  nextAlert;
  tryAgain: boolean = false;
  oid: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private testReportService: TestService,
              private alertCtrl: AlertController,
              private testResultService: TestResultService,
              private openNativeSettings: OpenNativeSettings,
              private visitService: VisitService,
              private loadingCtrl: LoadingController,
              private firebase: Firebase,
              private authService: AuthService,
              private store$: Store<LogsModel>,
              private firebaseLogsService: FirebaseLogsService,
              private activityService: ActivityService) {
    this.testData = this.navParams.get('test');
  }

  submitHandler() {
    this.testData.status = TEST_REPORT_STATUSES.CANCELLED;
    this.testData.reasonForCancellation = this.cancellationReason;
    this.testReportService.endTestReport(this.testData);
    this.nextAlert = true;
    this.submit(this.testData);
  }

  onSubmit() {
    this.changeOpacity = true;
    let alert;
    if (this.isValidReason()) {
      alert = this.alertCtrl.create({
        title: 'Cancel test',
        message: 'You will not be able to make changes to this test after it has been cancelled.',
        buttons: [
          {
            text: 'Back'
          },
          {
            text: 'Submit',
            cssClass: 'danger-action-button',
            handler: () => {
              this.submitHandler();
            }
          }
        ]
      });
    } else {
      this.cancellationReason = '';
      alert = this.alertCtrl.create({
        title: 'Reason not entered',
        message: 'You must add a reason for cancelling this test to submit the cancellation.',
        buttons: ['Ok']
      });
    }
    alert.present();
    alert.onDidDismiss(() => this.changeOpacity = this.nextAlert);
  }

  submit(test) {
    let stack: Observable<any>[] = [];
    this.oid = this.authService.getOid();
    const TRY_AGAIN_ALERT = this.alertCtrl.create({
      title: APP_STRINGS.UNABLE_TO_SUBMIT_TESTS_TITLE,
      message: APP_STRINGS.NO_INTERNET_CONNECTION,
      buttons: [{
        text: APP_STRINGS.SETTINGS_BTN,
        handler: () => {
          this.openNativeSettings.open('settings');
        }
      }, {
        text: APP_STRINGS.TRY_AGAIN_BTN,
        handler: () => {
          this.tryAgain = true;
          this.submit(this.testData);
        }
      }]
    });

    const LOADING = this.loadingCtrl.create({
      content: 'Loading...'
    });
    LOADING.present();

    let testResultsArr: TestResultModel[] = [];

    for (let vehicle of test.vehicles) {
      let testResult = this.testResultService.createTestResult(this.visitService.visit, test, vehicle);
      testResultsArr.push(testResult);
      stack.push(this.testResultService.submitTestResult(testResult).pipe(catchError((error: any) => {
        const log: Log = {
          type: 'error',
          message: `${this.oid} - ${error.status} ${error.error.errors ? error.error.errors[0] : error.error} for API call to ${error.url} with the body message ${JSON.stringify(testResult)}`,
          timestamp: Date.now(),
        };
        this.store$.dispatch(new logsActions.SaveLog(log));
        return Observable.throw(error);
      })));
    }
    Observable.forkJoin(stack).subscribe(
      (response: any) => {
        const log: Log = {
          type: 'info',
          message: `${this.oid} - ${response[0].status} ${response[0].body} for API call to ${response[0].url}`,
          timestamp: Date.now(),
        };
        this.store$.dispatch(new logsActions.SaveLog(log));
        this.firebaseLogsService.logEvent(FIREBASE.CANCEL_TEST);
        for (let testResult of testResultsArr) {
          const activity = this.activityService.createActivityBodyForCall(this.visitService.visit, testResult, false);
          this.activityService.submitActivity(activity).subscribe(
            (resp) => {
              const log: Log = {
                type: LOG_TYPES.INFO,
                message: `${this.oid} - ${resp.status} ${resp.statusText} for API call to ${resp.url}`,
                timestamp: Date.now(),
              };
              this.store$.dispatch(new logsActions.SaveLog(log));
              let activityIndex = this.activityService.activities.map((activity) => activity.endTime).indexOf(testResult.testStartTimestamp);
              if (activityIndex > -1) this.activityService.activities[activityIndex].id = resp.body.id;
              this.activityService.updateActivities();
            },
            (error) => {
              const log: Log = {
                type: LOG_TYPES.ERROR,
                message: `${this.oid} - ${error.status} ${error.error.error} for API call to ${error.url}`,
                timestamp: Date.now(),
              };
              this.store$.dispatch(new logsActions.SaveLog(log));
              this.firebase.logEvent('test_error', {content_type: 'error', item_id: "Wait activity submission failed"});
            }
          );
        }
        LOADING.dismiss();
        let views = this.navCtrl.getViews();
        for (let i = views.length - 1; i >= 0; i--) {
          if (views[i].component.name == PAGE_NAMES.VISIT_TIMELINE_PAGE) {
            this.navCtrl.popTo(views[i]);
          }
        }
      },
      (error) => {
        LOADING.dismiss();
        TRY_AGAIN_ALERT.present();
        this.firebaseLogsService.logEvent(FIREBASE.TEST_ERROR, FIREBASE.ERROR, FIREBASE.TEST_SUBMISSION_FAILED);
        TRY_AGAIN_ALERT.onDidDismiss(() => {
          if (!this.tryAgain) {
            this.nextAlert = this.changeOpacity = false;
          } else {
            this.tryAgain = false;
          }
        });
      }
    )
  }

  isValidReason() {
    return this.cancellationReason.trim().length > 0;
  }
}
