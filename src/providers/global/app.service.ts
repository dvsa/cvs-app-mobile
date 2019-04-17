import { Injectable } from "@angular/core";
import { AppConfig } from "../../../config/app.config";
import { APP, LOCAL_STORAGE, STORAGE } from "../../app/app.enums";
import { Platform, ToastController } from "ionic-angular";
import { StorageService } from "../natives/storage.service";
import { AuthService } from "./auth.service";

@Injectable()
export class AppService {
  public readonly isProduction: boolean;
  public readonly isCordova: boolean;
  public readonly isInitRunDone: boolean;
  public isInitSyncDone: boolean;
  public isSignatureRegistered: boolean;
  public isJwtTokenStored: boolean;
  public easterEgg: boolean;
  public caching: boolean;
  count: number = 0;

  constructor(private platform: Platform,
              private toastController: ToastController,
              private storageService: StorageService,
              private authService: AuthService) {
    this.isCordova = this.platform.is('cordova');
    this.isProduction = (AppConfig.IS_PRODUCTION == 'true');
    this.isInitRunDone = !!localStorage.getItem(LOCAL_STORAGE.FIRST_INIT);
  }

  setFlags() {
    this.isSignatureRegistered = (localStorage.getItem(LOCAL_STORAGE.SIGNATURE) == 'true');
    this.caching = (localStorage.getItem(LOCAL_STORAGE.CACHING) == 'true');
    this.easterEgg = (localStorage.getItem(LOCAL_STORAGE.EASTER_EGG) == 'true');
    this.isInitSyncDone = (localStorage.getItem(APP.INIT_SYNC) == 'true');
    this.isJwtTokenStored = !!localStorage.getItem(LOCAL_STORAGE.JWT_TOKEN);
  }

  manageAppInit(): Promise<any> {
    if (this.isCordova) {

      if (this.isInitRunDone) {
        this.setEasterEgg();
        this.setFlags();
        return Promise.resolve();
      } else {
        let arr = [
          this.authService.resetTokenCache(),
          this.storageService.clearStorage(),
          this.clearLocalStorage()
        ];

        return Promise.all(arr).then(
          () => {
            localStorage.setItem(LOCAL_STORAGE.FIRST_INIT, 'done');
            this.setEasterEgg();
            this.setFlags();
            return Promise.resolve(true);
          }
        )
      }
    } else {
      this.setEasterEgg();
      this.setFlags();
      return Promise.resolve(true);
    }
  }

  clearLocalStorage(): Promise<any> {
    localStorage.clear();
    return Promise.resolve(true);
  }

  enableCache() {
    this.count++;
    if (this.easterEgg && this.count == 3) {
      if (this.caching) {
        localStorage.setItem(LOCAL_STORAGE.CACHING, 'false');
        this.caching = false;
        this.storageService.delete(STORAGE.STATE);
        this.storageService.delete(STORAGE.VISIT);
        this.count = 0;
        this.presentToast('Storage was cleared and caching was disabled. Ride on');
      } else {
        localStorage.setItem(LOCAL_STORAGE.CACHING, 'true');
        this.caching = true;
        this.count = 0;
        this.presentToast('Caching was enabled');
      }
    }
  }

  setEasterEgg(): void {
    if (this.isProduction) {
      localStorage.setItem(LOCAL_STORAGE.EASTER_EGG, 'false');
      localStorage.setItem(LOCAL_STORAGE.CACHING, 'true');
    } else {
      localStorage.setItem(LOCAL_STORAGE.EASTER_EGG, 'true');
      let cache = localStorage.getItem(LOCAL_STORAGE.CACHING);
      cache ? localStorage.setItem(LOCAL_STORAGE.CACHING, cache) : localStorage.setItem(LOCAL_STORAGE.CACHING, 'true');
    }
  }

  private presentToast(message: string): void {
    const TOAST = this.toastController.create({
      message: message,
      position: 'top',
      duration: 2000
    });
    TOAST.present();
  }
}
