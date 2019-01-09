import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { IonicPage, NavController, AlertController, ItemSliding } from 'ionic-angular';
import { TestReportModel } from '../../../../models/tests/test-report.model';
import { VehicleTestModel } from '../../../../models/vehicle-test.model';
import { PhoneService } from '../../../../providers/natives/phone.service'
import { TestReportService } from "../../../../providers/test-report/test-report.service";
import { VehicleModel } from "../../../../models/vehicle/vehicle.model";
import { VehicleService } from "../../../../providers/vehicle/vehicle.service";

@IonicPage()
@Component({
  selector: 'page-test-create',
  templateUrl: 'test-create.html',
})
export class TestCreatePage implements OnInit {
  testReport: TestReportModel;
  @ViewChildren('slidingItem') slidingItems: QueryList<ItemSliding>;

  constructor(public navCtrl: NavController,
              public phoneService: PhoneService,
              public alertCtrl: AlertController,
              private vehicleService: VehicleService,
              private testReportService: TestReportService) {
  }

  ngOnInit() {
    this.testReport = this.testReportService.getTestReport();
  }

  ionViewWillLeave() {
    if (this.slidingItems.length) {
      this.slidingItems.forEach(slidingItem => {
        slidingItem.close();
      });
    }
  }

  presentSearchVehicle(): void {
    this.navCtrl.push('VehicleLookupPage');
  }

  addVehicleTest(vehicle: VehicleModel): void {
    this.navCtrl.push('TestTypesListPage', {vehicleData: vehicle});
  }

  openTest(vehicle: VehicleModel, vehicleTest: VehicleTestModel): void {
    if (!this.isTestAbandoned(vehicleTest)) {
      this.navCtrl.push('CompleteTestPage', {vehicle: vehicle, vehicleTest: vehicleTest});
    } else {
      this.navCtrl.push('TestAbandoningPage', {
        vehicleTest: vehicleTest,
        selectedReasons: vehicleTest.getAbandonment().reasons,
        editMode: false
      });
    }
  }

  reviewTest(): void {
    this.navCtrl.push('TestSummaryPage');
  }

  launchDialer(): void {
    this.phoneService.callPhoneNumber('00447976824451');
  }

  addATFIssue(): void {
    this.navCtrl.push('ATFIssuePage');
  }

  onCancel() {
    this.navCtrl.push('TestCancelPage');
  }

  onRemoveVehicleTest(vehicle: VehicleModel, vehicleTest: VehicleTestModel, slidingItem: ItemSliding) {
    slidingItem.close();
    const alert = this.alertCtrl.create({
      title: 'Remove test',
      message: 'This action will remove this test from the vehicle.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: () => {
            this.removeVehicleTest(vehicle, vehicleTest);
          }
        }
      ]
    });

    alert.present();
  }

  onAbandonVehicleTest(vehicleTest) {
    this.navCtrl.push('ReasonsSelectionPage', {vehicleTest: vehicleTest});
  }

  removeVehicleTest(vehicle: VehicleModel, vehicleTest: VehicleTestModel) {
    this.vehicleService.removeTestType(vehicle, vehicleTest);
  }

  isTestAbandoned(vehicleTest: VehicleTestModel) {
    return vehicleTest.getAbandonment().reasons.length > 0;
  }

}
