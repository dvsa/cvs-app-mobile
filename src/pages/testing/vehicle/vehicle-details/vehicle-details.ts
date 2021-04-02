import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';

import { TestModel } from '../../../../models/tests/test.model';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { CommonFunctionsService } from '../../../../providers/utils/common-functions';
import {
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_SCREEN_NAMES,
  DURATION_TYPE,
  APP_STRINGS,
  DATE_FORMAT,
  PAGE_NAMES,
  STORAGE,
  TECH_RECORD_STATUS,
  VEHICLE_TYPE,
  ANALYTICS_EVENTS,
  ANALYTICS_LABEL
} from '../../../../app/app.enums';
import { StorageService } from '../../../../providers/natives/storage.service';
import { default as AppConfig } from '../../../../../config/application.hybrid';
import { AppService } from '../../../../providers/global/app.service';
import { AnalyticsService, DurationService } from '../../../../providers/global';

@IonicPage()
@Component({
  selector: 'page-vehicle-details',
  templateUrl: 'vehicle-details.html'
})
export class VehicleDetailsPage {
  VEHICLE_TYPE: typeof VEHICLE_TYPE = VEHICLE_TYPE;
  SPECIAL_VEHICLE_TYPES: VEHICLE_TYPE[] = [
    VEHICLE_TYPE.MOTORCYCLE,
    VEHICLE_TYPE.CAR,
    VEHICLE_TYPE.LGV
  ];
  TECH_RECORD_STATUS: typeof TECH_RECORD_STATUS = TECH_RECORD_STATUS;
  APP_STRINGS: typeof APP_STRINGS = APP_STRINGS;
  vehicleData: VehicleModel;
  testData: TestModel;
  dateFormat: string = DATE_FORMAT.DD_MM_YYYY;
  changeOpacity: boolean = false;
  previousPageName: string;

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public storageService: StorageService,
    public commonFunc: CommonFunctionsService,
    private callNumber: CallNumber,
    private analyticsService: AnalyticsService,
    private durationService: DurationService,
    public appService: AppService
  ) {
    this.vehicleData = navParams.get('vehicle');
    this.testData = navParams.get('test');
    this.previousPageName = this.navCtrl.last().name;
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(this.getBackButtonText());

    this.analyticsService.setCurrentPage(ANALYTICS_SCREEN_NAMES.VEHICLE_DETAILS);
  }

  async ionViewDidEnter() {
    const type: string = DURATION_TYPE[DURATION_TYPE.SEARCH_VEHICLE];
    this.durationService.setDuration({ end: Date.now() }, type);
    const duration = this.durationService.getDuration(type);
    const takenDuration = this.durationService.getTakenDuration(duration);

    await this.trackDuration(
      ANALYTICS_EVENTS.SEARCH_VEHICLE_TIME_TAKEN,
      'SEARCH_VEHICLE_START_TIME',
      duration.start.toString()
    );
    await this.trackDuration(
      ANALYTICS_EVENTS.SEARCH_VEHICLE_TIME_TAKEN,
      'SEARCH_VEHICLE_END_TIME',
      duration.end.toString()
    );
    await this.trackDuration(
      ANALYTICS_EVENTS.SEARCH_VEHICLE_TIME_TAKEN,
      'SEARCH_VEHICLE_TIME_TAKEN',
      takenDuration.toString()
    );

    this.durationService.setDuration(
      { start: Date.now() },
      DURATION_TYPE[DURATION_TYPE.CONFIRM_VEHICLE]
    );
  }

  private async trackDuration(event: string, label: string, value: string) {
    await this.analyticsService.logEvent({
      category: ANALYTICS_EVENT_CATEGORIES.DURATION,
      event: event,
      label: ANALYTICS_LABEL[label]
    });

    await this.analyticsService.addCustomDimension(
      Object.keys(ANALYTICS_LABEL).indexOf(label) + 1,
      value
    );
  }

  goToPreparerPage(): void {
    this.changeOpacity = true;
    let confirm = this.alertCtrl.create({
      title: APP_STRINGS.CONFIRM_VEHICLE,
      message: APP_STRINGS.CONFIRM_VEHICLE_MSG,
      buttons: [
        {
          text: APP_STRINGS.CANCEL
        },
        {
          text: APP_STRINGS.CONFIRM,
          handler: () => {
            // this.loggingInAlertHandler();

            this.trackConfirmVehicleDuration();

            this.navCtrl
              .push(PAGE_NAMES.ADD_PREPARER_PAGE, {
                vehicle: this.vehicleData,
                test: this.testData
              })
              .then((resp) => {
                if (!resp) {
                  const alert = this.alertCtrl.create({
                    title: APP_STRINGS.UNAUTHORISED,
                    message: APP_STRINGS.UNAUTHORISED_TEST_MSG,
                    buttons: [
                      {
                        text: APP_STRINGS.CANCEL,
                        role: 'cancel'
                      },
                      {
                        text: APP_STRINGS.CALL,
                        handler: () => {
                          this.callNumber.callNumber(AppConfig.app.KEY_PHONE_NUMBER, true).then(
                            (data) => console.log(data),
                            (err) => console.log(err)
                          );
                          return false;
                        }
                      }
                    ]
                  });
                  alert.present();
                }
              });
          }
        }
      ]
    });
    confirm.present();
    confirm.onDidDismiss(() => (this.changeOpacity = false));
  }

  async trackConfirmVehicleDuration() {
    const type: string = DURATION_TYPE[DURATION_TYPE.CONFIRM_VEHICLE];
    this.durationService.setDuration({ end: Date.now() }, type);
    const duration = this.durationService.getDuration(type);
    const takenDuration = this.durationService.getTakenDuration(duration);

    await this.trackDuration(
      ANALYTICS_EVENTS.CONFIRM_VEHICLE_TIME_TAKEN,
      'CONFIRM_VEHICLE_START_TIME',
      duration.start.toString()
    );

    await this.trackDuration(
      ANALYTICS_EVENTS.CONFIRM_VEHICLE_TIME_TAKEN,
      'CONFIRM_VEHICLE_END_TIME',
      duration.end.toString()
    );

    await this.trackDuration(
      ANALYTICS_EVENTS.CONFIRM_VEHICLE_TIME_TAKEN,
      'CONFIRM_VEHICLE_TIME_TAKEN',
      takenDuration.toString()
    );

    this.durationService.setDuration(
      { start: Date.now() },
      DURATION_TYPE[DURATION_TYPE.CONFIRM_PREPARER]
    );
  }

  showMoreDetails(pageName: string): void {
    this.navCtrl.push(pageName, {
      vehicleData: this.vehicleData
    });
  }

  goToVehicleTestResultsHistory() {
    this.storageService
      .read(STORAGE.TEST_HISTORY + this.vehicleData.systemNumber)
      .then((data) => {
        this.navCtrl.push(PAGE_NAMES.VEHICLE_HISTORY_PAGE, {
          vehicleData: this.vehicleData,
          testResultsHistory: data ? data : []
        });
      });
  }

  private getBackButtonText(): string {
    switch (this.previousPageName) {
      case PAGE_NAMES.TEST_CREATE_PAGE:
        return APP_STRINGS.TEST;
      case PAGE_NAMES.MULTIPLE_TECH_RECORDS_SELECTION:
        return APP_STRINGS.SELECT_VEHICLE;
      case PAGE_NAMES.VEHICLE_LOOKUP_PAGE:
        return APP_STRINGS.IDENTIFY_VEHICLE;
      default:
        return 'Back';
    }
  }
}
