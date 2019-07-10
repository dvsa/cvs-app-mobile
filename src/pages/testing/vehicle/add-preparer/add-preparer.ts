import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { PreparerService } from "../../../../providers/preparer/preparer.service";
import { TestModel } from "../../../../models/tests/test.model";
import { APP_STRINGS, FIREBASE, PAGE_NAMES, TESTER_ROLES } from "../../../../app/app.enums";
import { VehicleService } from "../../../../providers/vehicle/vehicle.service";
import { VehicleModel } from "../../../../models/vehicle/vehicle.model";
import { PreparersReferenceDataModel } from "../../../../models/reference-data-models/preparers.model";
import { TestService } from '../../../../providers/test/test.service';
import { VisitService } from "../../../../providers/visit/visit.service";
import { AuthService } from "../../../../providers/global/auth.service";
import { FirebaseLogsService } from "../../../../providers/firebase-logs/firebase-logs.service";


@IonicPage()
@Component({
  selector: 'page-add-preparer',
  templateUrl: 'add-preparer.html',
})
export class AddPreparerPage implements OnInit {
  preparers: PreparersReferenceDataModel[] = [];
  searchValue: string;
  focusOut: boolean = false;
  vehicleData: VehicleModel;
  testData: TestModel;
  activeIndex: number;
  preparerInfoText: string = APP_STRINGS.ADD_PREPARER_INFO_TEXT;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public preparerService: PreparerService,
              private alertCtrl: AlertController,
              private vehicleService: VehicleService,
              private visitService: VisitService,
              private cdRef: ChangeDetectorRef,
              private viewCtrl: ViewController,
              private testReportService: TestService,
              private authService: AuthService,
              private firebaseLogsService: FirebaseLogsService) {
    this.vehicleData = this.navParams.get('vehicle');
    this.testData = this.navParams.get('test');
  }

  ngOnInit() {
    this.getPreparers();
  }

  ionViewCanEnter() {
    return this.hasRightsToTestVechicle([TESTER_ROLES.FULL_ACCESS], this.authService.userRoles, this.vehicleData.techRecord.vehicleType)
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(APP_STRINGS.VEHICLE_DETAILS);
  }

  getPreparers(): void {
    this.preparerService.getPreparersFromStorage().subscribe(
      (data: PreparersReferenceDataModel[]) => {
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
        this.presentPreparerConfirm(preparer);
      } else {
        this.presentPreparerConfirm({preparerId: 'No preparer ID found', preparerName: ''}, false, true);
      }
    } else {
      this.presentPreparerConfirm({preparerId: 'No preparer ID given', preparerName: ''}, false);
    }
  }

  presentPreparerConfirm(preparer: PreparersReferenceDataModel, preparerFound = true, showSearchAgain = false) {
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
      buttons: [
        {
          text: !showSearchAgain ? APP_STRINGS.CANCEL : APP_STRINGS.SEARCH_AGAIN,
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: !showSearchAgain ? APP_STRINGS.CONFIRM : APP_STRINGS.CONTINUE,
          handler: () => {
            this.logIntoFirebase();

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
    ALERT.onDidDismiss(() => this.activeIndex = null);
  }

  keepCancelOn(ev, hideCancel?: boolean) {
    this.focusOut = !hideCancel;
  }

  valueInputChange(value) {
    this.cdRef.detectChanges();
    this.searchValue = value.length > 9 ? value.substring(0, 9) : value;
  }

  hasRightsToTestVechicle(neededRights: string[], userRights: string[], vehicleType: string) {
    switch (vehicleType) {
      case "psv": {
        neededRights.push(TESTER_ROLES.PSV);
        break;
      }
      case "hgv": {
        neededRights.push(TESTER_ROLES.HGV);
        break;
      }
      case "trl": {
        neededRights.push(TESTER_ROLES.HGV);
        break;
      }
      default: {
        break;
      }
    }
    return this.authService.hasRights(userRights, neededRights);
  }

  logIntoFirebase() {
    this.firebaseLogsService.confirm_preparer_time.confirm_preparer_end_time = Date.now();

    this.firebaseLogsService.confirm_preparer_time.confirm_preparer_time_taken = this.firebaseLogsService.differenceInHMS(this.firebaseLogsService.confirm_preparer_time.confirm_preparer_start_time, this.firebaseLogsService.confirm_preparer_time.confirm_preparer_end_time);
    this.firebaseLogsService.logEvent(FIREBASE.CONFIRM_PREPARER_TIME_TAKEN, FIREBASE.CONFIRM_PREPARER_START_TIME, this.firebaseLogsService.confirm_preparer_time.confirm_preparer_start_time.toString(), FIREBASE.CONFIRM_PREPARER_END_TIME, this.firebaseLogsService.confirm_preparer_time.confirm_preparer_end_time.toString(), FIREBASE.CONFIRM_PREPARER_TIME_TAKEN, this.firebaseLogsService.confirm_preparer_time.confirm_preparer_time_taken);
  }
}
