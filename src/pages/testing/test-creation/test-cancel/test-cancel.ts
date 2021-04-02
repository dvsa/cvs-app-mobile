import {
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_EVENTS,
  ANALYTICS_LABEL,
  ANALYTICS_VALUE
} from './../../../../app/app.enums';
import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams
} from 'ionic-angular';
import { TestModel } from '../../../../models/tests/test.model';
import { TestService } from '../../../../providers/test/test.service';
import {
  ANALYTICS_SCREEN_NAMES,
  APP_STRINGS,
  LOG_TYPES,
  PAGE_NAMES,
  TEST_REPORT_STATUSES
} from '../../../../app/app.enums';
import { TestResultService } from '../../../../providers/test-result/test-result.service';
import { VisitService } from '../../../../providers/visit/visit.service';
import { Observable } from 'rxjs';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { AuthenticationService } from '../../../../providers/auth/authentication/authentication.service';
import { catchError } from 'rxjs/operators';
import { ActivityService } from '../../../../providers/activity/activity.service';
import { TestResultModel } from '../../../../models/tests/test-result.model';
import { LogsProvider } from '../../../../modules/logs/logs.service';
import { AnalyticsService } from '../../../../providers/global';

@IonicPage()
@Component({
  selector: 'page-test-cancel',
  templateUrl: 'test-cancel.html'
})
export class TestCancelPage {
  testData: TestModel;
  cancellationReason: string = '';
  changeOpacity;
  nextAlert;
  tryAgain: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private testReportService: TestService,
    private alertCtrl: AlertController,
    private testResultService: TestResultService,
    private openNativeSettings: OpenNativeSettings,
    private visitService: VisitService,
    private loadingCtrl: LoadingController,
    private authenticationService: AuthenticationService,
    private analyticsService: AnalyticsService,
    private activityService: ActivityService,
    private logProvider: LogsProvider
  ) {
    this.testData = this.navParams.get('test');
  }

  ionViewDidEnter() {
    this.analyticsService.setCurrentPage(ANALYTICS_SCREEN_NAMES.TEST_CANCEL);
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
    alert.onDidDismiss(() => (this.changeOpacity = this.nextAlert));
  }

  submit(test) {
    let stack: Observable<any>[] = [];
    const { oid } = this.authenticationService.tokenInfo;

    const TRY_AGAIN_ALERT = this.alertCtrl.create({
      title: APP_STRINGS.UNABLE_TO_SUBMIT_TESTS_TITLE,
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
            this.tryAgain = true;
            this.submit(this.testData);
          }
        }
      ]
    });

    const LOADING = this.loadingCtrl.create({
      content: 'Loading...'
    });
    LOADING.present();

    let testResultsArr: TestResultModel[] = [];

    for (let vehicle of test.vehicles) {
      let testResult = this.testResultService.createTestResult(
        this.visitService.visit,
        test,
        vehicle
      );

      testResultsArr.push(testResult);

      stack.push(
        this.testResultService.submitTestResult(testResult).pipe(
          catchError((error: any) => {
            this.logProvider.dispatchLog({
              type: LOG_TYPES.ERROR,
              message: `${oid} - ${JSON.stringify(
                error
              )} for API call to with the body message ${JSON.stringify(testResult)}`,
              timestamp: Date.now()
            });

            return Observable.throw(error);
          })
        )
      );
    }

    Observable.forkJoin(stack).subscribe(
      (response: any) => {
        this.logProvider.dispatchLog({
          type: 'info',
          message: `${oid} - ${response[0].status} ${response[0].body} for API call to ${response[0].url}`,
          timestamp: Date.now()
        });

        this.analyticsService.logEvent({
          category: ANALYTICS_EVENT_CATEGORIES.TEST_TYPES,
          event: ANALYTICS_EVENTS.CANCEL_TEST
        });

        for (let testResult of testResultsArr) {
          const activity = this.activityService.createActivityBodyForCall(
            this.visitService.visit,
            testResult,
            false
          );
          this.activityService.submitActivity(activity).subscribe(
            (resp) => {
              this.logProvider.dispatchLog({
                type: LOG_TYPES.INFO,
                message: `${oid} - ${resp.status} ${resp.statusText} for API call to ${resp.url}`,
                timestamp: Date.now()
              });

              let activityIndex = this.activityService.activities
                .map((activity) => activity.endTime)
                .indexOf(testResult.testStartTimestamp);
              if (activityIndex > -1) {
                this.activityService.activities[activityIndex].id = resp.body.id;
              }

              this.activityService.updateActivities();
              this.visitService.updateVisit();
            },
            (error) => {
              this.logProvider.dispatchLog({
                type: `${LOG_TYPES.ERROR}-activityService.submitActivity in submit-test-cancel.ts`,
                message: `${oid} - ${JSON.stringify(error)}`,
                timestamp: Date.now()
              });

              this.analyticsService.logEvent({
                category: ANALYTICS_EVENT_CATEGORIES.ERRORS,
                event: ANALYTICS_EVENTS.TEST_ERROR,
                label: ANALYTICS_VALUE.WAIT_ACTIVITY_SUBMISSION_FAILED
              });
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

        this.analyticsService.logEvent({
          category: ANALYTICS_EVENT_CATEGORIES.ERRORS,
          event: ANALYTICS_EVENTS.TEST_ERROR,
          label: ANALYTICS_VALUE.TEST_SUBMISSION_FAILED
        });

        TRY_AGAIN_ALERT.onDidDismiss(() => {
          if (!this.tryAgain) {
            this.nextAlert = this.changeOpacity = false;
          } else {
            this.tryAgain = false;
          }
        });
      }
    );
  }

  isValidReason() {
    return this.cancellationReason.trim().length > 0;
  }
}
