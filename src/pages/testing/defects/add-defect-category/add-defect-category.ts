import { Component, OnInit } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import { VehicleTestModel } from "../../../../models/vehicle-test.model";
import { DefectCategoryModel, DefectsModel } from "../../../../models/defects/defects.model";
import { DefectsService } from "../../../../providers/defects/defects.service";

@IonicPage()
@Component({
  selector: 'page-add-defect-category',
  templateUrl: 'add-defect-category.html',
})
export class AddDefectCategoryPage implements OnInit {
  vehicleType: string;
  vehicleTest: VehicleTestModel;
  defectCategories: DefectsModel = {
    categories: []
  };
  filteredCategories: DefectCategoryModel[];
  searchVal: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, private defectsService: DefectsService, public events: Events) {
    this.vehicleType = navParams.get('vehicleType');
    this.vehicleTest = navParams.get('vehicleTest');
    this.defectCategories.categories = navParams.get('defects');
  }

  ngOnInit() {
    this.filteredCategories = this.defectsService.searchDefectCategory(this.defectCategories.categories, this.searchVal);
  }

  searchList(e): void {
    this.searchVal = e.target.value;
    this.filteredCategories = this.defectsService.searchDefectCategory(this.defectCategories.categories, this.searchVal);
  }


  selectCategory(category: DefectCategoryModel): void {
    this.navCtrl.push('AddDefectItemPage', {
      vehicleType: this.vehicleType,
      vehicleTest: this.vehicleTest,
      category: category
    })
    this.events.publish('navToDetails');
  }

}
