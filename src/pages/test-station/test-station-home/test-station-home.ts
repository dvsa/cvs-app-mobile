import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { StorageService } from "../../../providers/natives/storage.service";
import { VisitService } from "../../../providers/visit/visit.service";
import { LOCAL_STORAGE, STORAGE, APP_STRINGS, PAGE_NAMES } from "../../../app/app.enums";

@IonicPage()
@Component({
  selector: 'page-test-station-home',
  templateUrl: 'test-station-home.html'
})
export class TestStationHomePage implements OnInit {
  count: number = 0;
  appStrings: object = APP_STRINGS;

  constructor(public navCtrl: NavController, public toastController: ToastController, private storageService: StorageService, private visitService: VisitService) {
  }

  ngOnInit() {
    this.visitService.easterEgg = localStorage.getItem(LOCAL_STORAGE.EASTER_EGG);
    this.visitService.caching = localStorage.getItem(LOCAL_STORAGE.CACHING);
  }

  ionViewDidLeave() {
    this.count = 0;
  }

  getStarted(): void {
    this.navCtrl.push(PAGE_NAMES.TEST_STATION_SEARCH_PAGE);
  }

  enableCache() {
    this.count++;
    if (this.visitService.easterEgg == 'true' && this.count == 3) {
      if (this.visitService.caching == 'true') {
        localStorage.setItem(LOCAL_STORAGE.CACHING, 'false');
        this.visitService.caching = 'false';
        this.storageService.delete(STORAGE.STATE);
        this.storageService.delete(STORAGE.VISIT);
        this.count = 0;
        this.presentToast(APP_STRINGS.CACHING_ENABLED_STORAGE_CLEARED);
      } else {
        localStorage.setItem(LOCAL_STORAGE.CACHING, 'true');
        this.visitService.caching = 'true';
        this.count = 0;
        this.presentToast(APP_STRINGS.CACHING_ENABLED);
      }
    }
  }

  presentToast(message: string): void {
    const toast = this.toastController.create({
      message: message,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
}
