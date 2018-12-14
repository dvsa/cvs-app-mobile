import { Component, OnInit } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { VehicleTestModel } from "../../../../models/vehicle-test.model";

@IonicPage()
@Component({
  selector: 'page-test-abandoning',
  templateUrl: 'test-abandoning.html',
})
export class TestAbandoningPage implements OnInit {
  vehicleTest: VehicleTestModel;
  selectedReasons: string[];
  additionalComment: string;
  editMode: string;

  constructor(private navParams: NavParams, private alertCtrl: AlertController, private navCtrl: NavController) {
    this.vehicleTest = this.navParams.get('vehicleTest');
    this.selectedReasons = this.navParams.get('selectedReasons');
    this.editMode = this.navParams.get('editMode');
  }

  ngOnInit() {
    if (!this.editMode) {
      this.additionalComment = this.vehicleTest.getAbandonment().additionalComment;
    }
  }

  onDone() {
    const alert = this.alertCtrl.create({
      title: 'Abandon test',
      message: 'You will not be able to make changes to this test after it has been abandoned.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Abandon',
          cssClass: 'danger-action-button',
          handler: () => {
            this.updateVehicleTestModel();
            this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 3));
          }
        }
      ]
    });

    alert.present();
  }

  updateVehicleTestModel() {
    this.vehicleTest.addAbandonmentReasons(this.selectedReasons);
    if (this.additionalComment && this.additionalComment.length) {
      this.vehicleTest.addAdditionalAbandonmentReason(this.additionalComment);
    }
  }

}