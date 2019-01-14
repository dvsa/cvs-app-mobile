import { Component, OnInit } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import { DefectCategoryModel } from "../../../../models/reference-data-models/defects.model";
import { DefectsService } from "../../../../providers/defects/defects.service";
import { APP } from "../../../../app/app.enums";
import { TestTypeModel } from "../../../../models/tests/test-type.model";

@IonicPage()
@Component({
  selector: 'page-add-defect-category',
  templateUrl: 'add-defect-category.html',
})
export class AddDefectCategoryPage implements OnInit {
  vehicleType: string;
  vehicleTest: TestTypeModel;
  defectCategories: DefectCategoryModel[];
  filteredCategories: DefectCategoryModel[];
  searchVal: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, private defectsService: DefectsService, public events: Events) {
    this.vehicleType = navParams.get('vehicleType');
    this.vehicleTest = navParams.get('vehicleTest');
    this.defectCategories = navParams.get('defects');
  }

  ngOnInit() {
    this.filteredCategories = this.defectsService.searchDefect(this.defectCategories, this.searchVal, ['imNumber', 'imDescription']);
  }

  selectCategory(category: DefectCategoryModel): void {
    this.navCtrl.push('AddDefectItemPage', {
      vehicleType: this.vehicleType,
      vehicleTest: this.vehicleTest,
      category: category
    })
    this.events.publish(APP.NAV_OUT);
  }

  searchList(e): void {
    this.searchVal = e.target.value;
    this.filteredCategories = this.defectsService.searchDefect(this.defectCategories, this.searchVal, ['imNumber', 'imDescription']);
  }
}
