import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { PreparerService } from "../../../../providers/preparer/preparer.service";
import { TestModel } from "../../../../models/tests/test.model";
import { APP_STRINGS, TESTER_ROLES } from "../../../../app/app.enums";
import { VehicleService } from "../../../../providers/vehicle/vehicle.service";
import { VehicleModel } from "../../../../models/vehicle/vehicle.model";
import { PreparersReferenceDataModel } from "../../../../models/reference-data-models/preparers.model";
import { TestService } from '../../../../providers/test/test.service';
import { VisitService } from "../../../../providers/visit/visit.service";
import { AuthService } from "../../../../providers/global/auth.service";


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
              private authService: AuthService) {
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
    const ALERT = this.alertCtrl.create({
      title: preparerFound ? `${preparer.preparerName} (${preparer.preparerId})` : APP_STRINGS.WITHOUT_PREPARER,
      message: preparerFound ? APP_STRINGS.CONFIRM_PREPARER : APP_STRINGS.WITHOUT_PREPARER_MSG,
      buttons: [
        {
          text: !showSearchAgain ? APP_STRINGS.CANCEL : APP_STRINGS.PREPARER_NOT_FOUND,
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: APP_STRINGS.CONFIRM,
          handler: () => {
            this.visitService.addTest(this.testData);
            this.testReportService.addVehicle(this.testData, this.vehicleData);
            this.selectPreparer(preparer);
            this.navCtrl.push('TestCreatePage', {
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
      case "adr": {
        neededRights.push(TESTER_ROLES.ADR);
        break;
      }
      case "tir": {
        neededRights.push(TESTER_ROLES.TIR);
        break;
      }
      default: {
        break;
      }
    }
    return this.authService.hasRights(userRights, neededRights);
  }
}
