import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AlertController,
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';
import { PreparerService } from '../../../../providers/preparer/preparer.service';
import { TestModel } from '../../../../models/tests/test.model';
import {
  APP_STRINGS,
  PAGE_NAMES,
  TESTER_ROLES,
  VEHICLE_TYPE,
  ANALYTICS_SCREEN_NAMES,
  DURATION_TYPE,
  ANALYTICS_EVENTS,
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_LABEL
} from '../../../../app/app.enums';
import { VehicleService } from '../../../../providers/vehicle/vehicle.service';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import { PreparersReferenceDataModel } from '../../../../models/reference-data-models/preparers.model';
import { TestService } from '../../../../providers/test/test.service';
import { VisitService } from '../../../../providers/visit/visit.service';
import { AuthenticationService } from '../../../../providers/auth/authentication/authentication.service';
import { CommonFunctionsService } from '../../../../providers/utils/common-functions';
import { AppService, AnalyticsService, DurationService } from '../../../../providers/global';

@IonicPage()
@Component({
  selector: 'page-add-preparer',
  templateUrl: 'add-preparer.html'
})
export class AddPreparerPage implements OnInit {
  preparers: PreparersReferenceDataModel[] = [];
  searchValue: string;
  focusOut: boolean = false;
  vehicleData: VehicleModel;
  testData: TestModel;
  activeIndex: number;
  preparerInfoText: string = APP_STRINGS.ADD_PREPARER_INFO_TEXT;
  VEHICLE_TYPE: typeof VEHICLE_TYPE = VEHICLE_TYPE;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public preparerService: PreparerService,
    private alertCtrl: AlertController,
    private vehicleService: VehicleService,
    private visitService: VisitService,
    private cdRef: ChangeDetectorRef,
    private viewCtrl: ViewController,
    private testReportService: TestService,
    private authenticationService: AuthenticationService,
    private analyticsService: AnalyticsService,
    private durationService: DurationService,
    private commonFunc: CommonFunctionsService,
    public appService: AppService
  ) {
    this.vehicleData = this.navParams.get('vehicle');
    this.testData = this.navParams.get('test');
  }

  ngOnInit() {
    this.getPreparers();
    this.autoPopulatePreparerInput(this.testData.vehicles);
  }

  ionViewCanEnter() {
    const { testerRoles: roles } = this.authenticationService.tokenInfo;

    switch (this.vehicleData.techRecord.vehicleType) {
      case VEHICLE_TYPE.PSV: {
        return roles.some(
          (role) => role === TESTER_ROLES.PSV || role === TESTER_ROLES.FULL_ACCESS
        );
      }
      case VEHICLE_TYPE.HGV:
      case VEHICLE_TYPE.TRL: {
        return roles.some(
          (role) => role === TESTER_ROLES.HGV || role === TESTER_ROLES.FULL_ACCESS
        );
      }
    }
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(APP_STRINGS.VEHICLE_DETAILS);
  }

  ionViewDidEnter() {
    this.analyticsService.setCurrentPage(ANALYTICS_SCREEN_NAMES.ENTER_PREPARER);
  }

  checkForMatch(inputValue: string, expectedValue: string): boolean {
    return this.commonFunc.checkForMatch(inputValue, expectedValue);
  }

  getPreparers(): void {
    this.preparerService
      .getPreparersFromStorage()
      .subscribe((data: PreparersReferenceDataModel[]) => {
        this.preparers = data;
      });
  }

  selectPreparer(preparer: PreparersReferenceDataModel): void {
    this.focusOut = false;
    this.vehicleService.addPreparer(this.vehicleData, preparer);
  }

  formatDataForConfirm(): void {
    if (this.searchValue && this.searchValue.length > 0) {
      let searchVal = this.searchValue.toLowerCase().replace(/ /g, '');
      let preparer = this.preparers.find((elem) => elem.preparerId.toLowerCase() === searchVal);

      if (preparer) {
        this.presentPreparerConfirm(preparer, this.appService.isAccessibilityTextZoomEnabled());
      } else {
        this.presentPreparerConfirm(
          {
            preparerId: APP_STRINGS.NO_PREPARER_ID_FOUND,
            preparerName: ''
          },
          this.appService.isAccessibilityTextZoomEnabled(),
          false,
          true
        );
      }
    } else {
      this.presentPreparerConfirm(
        {
          preparerId: APP_STRINGS.NO_PREPARER_ID_GIVEN,
          preparerName: ''
        },
        this.appService.isAccessibilityTextZoomEnabled(),
        false
      );
    }
  }

  presentPreparerConfirm(
    preparer: PreparersReferenceDataModel,
    isAccessibilityTextZoomEnabled,
    preparerFound = true,
    showSearchAgain = false
  ) {
    let showThisTitle, showThisMessage;

    if (!preparerFound && !showSearchAgain) {
      showThisTitle = APP_STRINGS.WITHOUT_PREPARER;
      showThisMessage = APP_STRINGS.WITHOUT_PREPARER_MSG;
    } else if (!preparerFound && showSearchAgain) {
      showThisTitle = APP_STRINGS.PREPARER_NOT_FOUND;
      showThisMessage = APP_STRINGS.PREPARER_NOT_FOUND_MSG;
    } else {
      showThisTitle = `${preparer.preparerName} (${preparer.preparerId})`;
      showThisMessage = APP_STRINGS.CONFIRM_PREPARER;
    }

    const ALERT = this.alertCtrl.create({
      title: showThisTitle,
      message: showThisMessage,
      cssClass: 'accessibility-minimize-content-max-width-' + isAccessibilityTextZoomEnabled,
      buttons: [
        {
          text: !showSearchAgain ? APP_STRINGS.CANCEL : APP_STRINGS.SEARCH_AGAIN,
          role: 'cancel',
          handler: () => {}
        },
        {
          text: !showSearchAgain ? APP_STRINGS.CONFIRM : APP_STRINGS.CONTINUE,
          handler: () => {
            this.trackPrepareConfirmation();

            if (
              !this.visitService.visit.tests.length ||
              this.visitService.getLatestTest().endTime
            )
              this.visitService.addTest(this.testData);
            this.testReportService.addVehicle(this.testData, this.vehicleData);
            this.selectPreparer(preparer);
            this.navCtrl.push(PAGE_NAMES.TEST_CREATE_PAGE, {
              test: this.testData
            });
          }
        }
      ]
    });
    ALERT.present();
    ALERT.onDidDismiss(() => (this.activeIndex = null));
  }

  keepCancelOn(ev, hideCancel?: boolean) {
    this.focusOut = !hideCancel;
  }

  valueInputChange(value) {
    this.cdRef.detectChanges();
    this.searchValue = value.length > 9 ? value.substring(0, 9) : value;
  }

  private async trackPrepareConfirmation() {
    const type: string = DURATION_TYPE[DURATION_TYPE.CONFIRM_PREPARER];
    this.durationService.setDuration({ end: Date.now() }, type);
    const duration = this.durationService.getDuration(type);
    const takenDuration = this.durationService.getTakenDuration(duration);

    await this.trackPrepareDuration('CONFIRM_PREPARER_START_TIME', duration.start.toString());
    await this.trackPrepareDuration('CONFIRM_PREPARER_END_TIME', duration.end.toString());
    await this.trackPrepareDuration('CONFIRM_PREPARER_TIME_TAKEN', takenDuration.toString());
  }

  private async trackPrepareDuration(label: string, value: string) {
    await this.analyticsService.logEvent({
      category: ANALYTICS_EVENT_CATEGORIES.DURATION,
      event: ANALYTICS_EVENTS.CONFIRM_PREPARER_TIME_TAKEN,
      label: ANALYTICS_LABEL[label]
    });

    await this.analyticsService.addCustomDimension(
      Object.keys(ANALYTICS_LABEL).indexOf(label) + 1,
      value
    );
  }

  autoPopulatePreparerInput(vehicles) {
    if (vehicles.length > 0) {
      if (
        vehicles[0].preparerId != APP_STRINGS.NO_PREPARER_ID_FOUND &&
        vehicles[0].preparerId != APP_STRINGS.NO_PREPARER_ID_GIVEN
      ) {
        this.searchValue = vehicles[0].preparerId;
      }
    }
  }
}
