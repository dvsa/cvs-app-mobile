import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  IonicPage,
  Navbar,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';

import {
  AdditionalInfoMetadataModel,
  DefectDetailsModel,
  DefectLocationModel
} from '../../../../models/defects/defect-details.model';
import { DefectsService } from '../../../../providers/defects/defects.service';
import { TestTypeModel } from '../../../../models/tests/test-type.model';
import { TestTypeService } from '../../../../providers/test-type/test-type.service';
import {
  APP_STRINGS,
  DEFICIENCY_CATEGORY,
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_EVENTS,
  ANALYTICS_LABEL
} from './../../../../app/app.enums';
import { ProhibitionClearanceTestTypesData } from '../../../../assets/app-data/test-types-data/prohibition-clearance-test-types.data';
import { TestTypesFieldsMetadata } from '../../../../assets/app-data/test-types-data/test-types-fields.metadata';
import { AnalyticsService } from '../../../../providers/global';

@IonicPage()
@Component({
  selector: 'page-defect-details',
  templateUrl: 'defect-details.html'
})
export class DefectDetailsPage implements OnInit {
  vehicleTest: TestTypeModel;
  defect: DefectDetailsModel;
  defectMetadata: AdditionalInfoMetadataModel;
  isEdit: boolean;
  isLocation: boolean;
  tempDefectLocation: DefectLocationModel;
  tempDefectNotes: string;
  fromTestReview: boolean;
  showPrs: boolean = true;
  notesChanged: boolean = false;
  showProhibition: boolean = false;
  prohibitionAsterisk: boolean = false;
  prohibitionClearanceTestTypesIds: string[] =
    ProhibitionClearanceTestTypesData.ProhibitionClearanceTestTypesIds;
  isProhibitionClearance: boolean;
  @ViewChild(Navbar) navBar: Navbar;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public defectsService: DefectsService,
    private testTypeService: TestTypeService,
    private analyticsService: AnalyticsService,
    private alertCtrl: AlertController
  ) {
    this.vehicleTest = navParams.get('vehicleTest');
    this.defect = navParams.get('deficiency');
    this.isEdit = navParams.get('isEdit');
    this.fromTestReview = this.navParams.get('fromTestReview');
  }

  ngOnInit() {
    this.tempDefectLocation = Object.assign({}, this.defect.additionalInformation.location);
    this.tempDefectNotes = this.defect.additionalInformation.notes;
    this.defectMetadata = this.defect.metadata.category.additionalInfo;
    this.isLocation =
      this.defectMetadata && this.defectMetadata.location
        ? this.checkForLocation(this.defectMetadata.location)
        : false;
    this.checkForPrs(this.defect);
    this.checkForProhibition(this.defect);
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText(APP_STRINGS.DEFECT_DESC);
    this.isProhibitionClearance =
      this.prohibitionClearanceTestTypesIds.indexOf(this.vehicleTest.testTypeId) !== -1;
  }

  ionViewDidLoad() {
    this.navBar.backButtonClick = () => {
      this.defect.additionalInformation.location = Object.assign({}, this.tempDefectLocation);
      this.defect.additionalInformation.notes = this.tempDefectNotes;
      this.navCtrl.pop();
    };
  }

  /**
   * Logic on how to go back to complete-test (Test type details) page and add the current defect.
   * This is when you press Done on defect-details page (Defect details)(when adding a new defect OR when changing an existing defect)
   * Note: you cannot close complete-test page without saving it so it's ok to add the defect to the test here.
   *
   * This adds a defect only is it's first time add defect.
   * If the "Done" button is pressed on a changed defect, testTypeService.addDefect will not be called
   */
  addDefect(): void {
    if (!this.fromTestReview) {
      let views = this.navCtrl.getViews();
      for (let i = views.length - 1; i >= 0; i--) {
        if (views[i].component.name == 'CompleteTestPage') {
          if (!this.isEdit) {
            this.testTypeService.addDefect(this.vehicleTest, this.defect);
          }
          this.navCtrl.popTo(views[i]);
        }
      }
    } else {
      if (!this.isEdit) {
        this.testTypeService.addDefect(this.vehicleTest, this.defect);
      }
      this.navCtrl.popToRoot();
    }

    if (this.notesChanged) {
      this.onNotesChanged();
    }
  }

  private getTestTypeDetailsFromFieldsMetadata(testTypeModel: TestTypeModel) {
    return TestTypesFieldsMetadata.FieldsMetadata.find(
      (fieldsMetadata) => testTypeModel.testTypeId === fieldsMetadata.testTypeId
    );
  }

  checkForLocation(location: {}): boolean {
    for (let type in location) {
      if (location[type]) {
        return true;
      }
    }
    return false;
  }

  checkIfDefectWasAdded(): boolean {
    let found = false;
    this.vehicleTest.defects.forEach((defect) => {
      if (defect.deficiencyRef == this.defect.deficiencyRef) {
        found = true;
      }
    });
    return found;
  }

  checkForPrs(defect: any): void {
    if (defect.deficiencyCategory === DEFICIENCY_CATEGORY.MINOR) {
      this.showPrs = false;
      defect.prs = null;
    }
  }

  checkForProhibition(defect: any): void {
    if (defect.deficiencyCategory === DEFICIENCY_CATEGORY.DANGEROUS) {
      this.showProhibition = true;
      if (this.defect.stdForProhibition) this.prohibitionAsterisk = true;
    }
  }

  checkProhibitionStatus(): void {
    if (this.showProhibition && !this.isProhibitionClearance) {
      if (!this.prohibitionAsterisk && !this.defect.prohibitionIssued) {
        this.showProhibitionAlert(APP_STRINGS.PROHIBITION_MSG_CONFIRM);
      } else {
        this.addDefect();
      }
    } else {
      this.addDefect();
    }
  }

  showProhibitionAlert(showThisMessage: string): void {
    const alert = this.alertCtrl.create({
      title: APP_STRINGS.PROHIBITION_TITLE,
      message: showThisMessage,
      buttons: [
        {
          text: APP_STRINGS.OK
        }
      ]
    });
    alert.present();
  }

  removeDefectConfirm(defect: DefectDetailsModel): void {
    const confirm = this.alertCtrl.create({
      title: APP_STRINGS.REMOVE_DEFECT_TITLE,
      message: APP_STRINGS.REMOVE_DEFECT_MSG,
      buttons: [
        {
          text: APP_STRINGS.CANCEL,
          handler: () => {}
        },
        {
          text: APP_STRINGS.REMOVE,
          handler: () => {
            this.removeDefect(defect);
          }
        }
      ]
    });
    confirm.present();
  }

  removeDefect(defect: DefectDetailsModel): void {
    this.testTypeService.removeDefect(this.vehicleTest, defect);
    this.navCtrl.pop();
  }

  private async onNotesChanged() {
    await this.analyticsService.logEvent({
      category: ANALYTICS_EVENT_CATEGORIES.DEFECTS,
      event: ANALYTICS_EVENTS.DEFECT_NOTES_USAGE,
      label: ANALYTICS_LABEL.DEFICIENCY_REFERENCE
    });

    await this.analyticsService.addCustomDimension(
      Object.keys(ANALYTICS_LABEL).indexOf('DEFICIENCY_REFERENCE') + 1,
      this.defect.deficiencyRef
    );
  }
}
