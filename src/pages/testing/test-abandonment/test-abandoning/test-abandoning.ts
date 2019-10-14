import { Component, OnInit } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { TestTypeModel } from "../../../../models/tests/test-type.model";
import { VisitService } from "../../../../providers/visit/visit.service";
import { TestTypeService } from "../../../../providers/test-type/test-type.service";
import { FirebaseLogsService } from "../../../../providers/firebase-logs/firebase-logs.service";
import { FIREBASE } from "../../../../app/app.enums";

@IonicPage()
@Component({
  selector: 'page-test-abandoning',
  templateUrl: 'test-abandoning.html',
})
export class TestAbandoningPage implements OnInit {
  vehicleTest: TestTypeModel;
  selectedReasons: string[];
  additionalComment: string;
  editMode: string;
  altAbandon: boolean;
  fromTestReview: boolean;
  changeOpacity: boolean = false;

  constructor(private navParams: NavParams,
              private alertCtrl: AlertController,
              private navCtrl: NavController,
              public visitService: VisitService,
              private testTypeService: TestTypeService,
              private firebaseLogsService: FirebaseLogsService) {
    this.vehicleTest = this.navParams.get('vehicleTest');
    this.selectedReasons = this.navParams.get('selectedReasons');
    this.editMode = this.navParams.get('editMode');
    this.altAbandon = this.navParams.get('altAbandon');
    this.fromTestReview = this.navParams.get('fromTestReview');
  }

  ngOnInit() {
    if (!this.editMode) {
      this.additionalComment = this.vehicleTest.additionalCommentsForAbandon;
    }
  }

  onDoneHandler() {
    this.updateVehicleTestModel();
    if (!this.fromTestReview) {
      this.altAbandon ? this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 4)) : this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 3));
    } else {
      this.navCtrl.popToRoot();
    }
  }

  onDone() {
    this.changeOpacity = true;
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
            this.onDoneHandler();
          }
        }
      ]
    });
    alert.onDidDismiss(() => this.changeOpacity = false);
    alert.present();
  }

  updateVehicleTestModel() {
    this.firebaseLogsService.logEvent(FIREBASE.ABANDON_TEST_TYPE, FIREBASE.TEST_TYPE_NAME, this.vehicleTest.testTypeName);
    this.vehicleTest.reasons.push(...this.selectedReasons);
    if (this.additionalComment && this.additionalComment.length) {
      this.vehicleTest.additionalCommentsForAbandon = this.additionalComment;
    }
    this.vehicleTest.testResult = this.testTypeService.setTestResult(this.vehicleTest, false);
    this.visitService.updateVisit();
  }

}
