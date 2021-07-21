import { Component, Renderer2, ViewChild } from '@angular/core';
import { Platform, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthenticationService } from '../providers/auth/authentication/authentication.service';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';
import { StorageService } from '../providers/natives/storage.service';
import { VisitService } from '../providers/visit/visit.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import * as Sentry from 'sentry-cordova';
import { Subscription } from 'rxjs';
import to from 'await-to-js';

import {
  ACCESSIBILITY_DEFAULT_VALUES,
  PAGE_NAMES,
  SIGNATURE_STATUS,
  STORAGE,
  LOG_TYPES,
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_EVENTS,
  CONNECTION_STATUS
} from './app.enums';
import { AppService, AnalyticsService, SyncService } from '../providers/global';
import { ActivityService } from '../providers/activity/activity.service';
import { Log } from '../modules/logs/logs.model';
import { LogsProvider } from './../modules/logs/logs.service';
import { default as AppConfig } from '../../config/application.hybrid';
import { ActivityModel } from '../models/visit/activity.model';
import { VisitModel } from '../models/visit/visit.model';
import { NetworkService } from '../providers/global/network.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navElem: Nav;
  rootPage: any = PAGE_NAMES.TEST_STATION_HOME_PAGE;

  appResumeSub: Subscription;
  authLogSub: Subscription;
  connectedSub: Subscription;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    private splashScreen: SplashScreen,
    public events: Events,
    public visitService: VisitService,
    public activityService: ActivityService,
    public storageService: StorageService,
    private appService: AppService,
    private syncService: SyncService,
    private networkService: NetworkService,
    private authenticationService: AuthenticationService,
    private mobileAccessibility: MobileAccessibility,
    private renderer: Renderer2,
    private screenOrientation: ScreenOrientation,
    private analyticsService: AnalyticsService,
    private logProvider: LogsProvider
  ) {
    platform.ready().then(() => {
      Sentry.init({
        enabled: !!AppConfig.sentry.SENTRY_DSN,
        dsn: AppConfig.sentry.SENTRY_DSN,
        environment: AppConfig.sentry.SENTRY_ENV
      });

      statusBar.overlaysWebView(true);
      statusBar.styleLightContent();

      this.initApp();

      // Resuming app from background Mobile Accessibility
      this.appResumeSub = this.platform.resume.subscribe(() => {
        this.accessibilityFeatures();
        this.syncService.checkForUpdate();
      });

      // TOOD: Remove logging after the white screen bug is resolved
      // CVSB: 17584
      this.setupLogNetworkStatus();
    });
  }

  async initApp() {
    // await this.authenticationService.auth.logout();

    this.networkService.initialiseNetworkStatus();

    await this.authenticationService.expireTokens();

    await this.appService.manageAppInit();

    const netWorkStatus: CONNECTION_STATUS = this.networkService.getNetworkState();
    if (netWorkStatus === CONNECTION_STATUS.OFFLINE) {
      this.manageAppState();
      return;
    }

    const authStatus = await this.authenticationService.checkUserAuthStatus();
    authStatus && !this.appService.isSignatureRegistered
      ? this.navigateToSignaturePage()
      : this.manageAppState();

    if (authStatus && this.appService.isCordova) {
      await this.activateNativeFeatures();
    }
  }

  async activateNativeFeatures(): Promise<void> {
    await this.analyticsService.startAnalyticsTracking(AppConfig.ga.GOOGLE_ANALYTICS_ID);

    this.accessibilityFeatures();
    await this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
  }

  async navigateToSignaturePage(): Promise<void> {
    this.splashScreen.hide();
    await this.navElem.setRoot(PAGE_NAMES.SIGNATURE_PAD_PAGE);
    this.manageAppStateListeners();
  }

  manageAppStateListeners() {
    this.events.subscribe(SIGNATURE_STATUS.SAVED_EVENT, async () => {
      this.events.unsubscribe(SIGNATURE_STATUS.SAVED_EVENT);
      await this.manageAppState();
    });
  }

  async manageAppState() {
    let error, storageState, storedVisit, storedActivities;

    [error, storageState] = await to(this.storageService.read(STORAGE.STATE));
    if (storageState) {
      let parsedArr = JSON.parse(storageState);
      this.navElem.setPages(parsedArr).then(() => this.splashScreen.hide());
    } else {
      this.setRootPage();
    }

    [error, storedVisit] = await to(this.storageService.read(STORAGE.VISIT));
    this.visitService.visit = storedVisit || ({} as VisitModel);

    [error, storedActivities] = await to(this.storageService.read(STORAGE.ACTIVITIES));
    this.activityService.activities = storedActivities || ([] as ActivityModel[]);

    if (error) {
      const { oid } = this.authenticationService.tokenInfo;
      this.logProvider.dispatchLog({
        type: `${LOG_TYPES.ERROR}`,
        timestamp: Date.now(),
        message: `User ${oid} failed from manageAppState in app.component.ts - ${JSON.stringify(
          error
        )}`
      });
    }
  }

  private accessibilityFeatures(): void {
    this.mobileAccessibility.updateTextZoom();

    this.mobileAccessibility
      .getTextZoom()
      .then((result) => {
        if (result !== ACCESSIBILITY_DEFAULT_VALUES.TEXT_SIZE) {
          this.analyticsService.logEvent({
            category: ANALYTICS_EVENT_CATEGORIES.MOBILE_ACCESSIBILITY,
            event: ANALYTICS_EVENTS.IOS_FONT_SIZE_USAGE
          });
        }
        this.appService.setAccessibilityTextZoom(result);
      })
      .catch(() => this.appService.setAccessibilityTextZoom(106));

    this.mobileAccessibility.isVoiceOverRunning().then((result) => {
      if (result) {
        this.analyticsService.logEvent({
          category: ANALYTICS_EVENT_CATEGORIES.MOBILE_ACCESSIBILITY,
          event: ANALYTICS_EVENTS.IOS_VOICEOVER_USAGE
        });
      }
    });

    this.mobileAccessibility.isInvertColorsEnabled().then((result) => {
      result
        ? this.renderer.setStyle(document.body, 'filter', 'invert(100%)')
        : this.renderer.removeStyle(document.body, 'filter');
    });

    this.mobileAccessibility.isBoldTextEnabled().then((result) => {
      result
        ? this.renderer.addClass(document.body, 'accessibility-bold-text')
        : this.renderer.removeClass(document.body, 'accessibility-bold-text');
    });
  }

  private async setRootPage(): Promise<any> {
    await this.navElem.setRoot(PAGE_NAMES.TEST_STATION_HOME_PAGE);
    this.splashScreen.hide();
    return this.navElem.popToRoot();
  }

  private setupLogNetworkStatus(): void {
    let log: Log = {
      type: LOG_TYPES.INFO,
      timestamp: Date.now()
    } as Log;

    this.connectedSub = this.networkService
      .onNetworkChange()
      .subscribe((status: CONNECTION_STATUS) => {
        log = {
          ...log,
          message: `User ${this.authenticationService.tokenInfo.oid}
        connection ${CONNECTION_STATUS[status]} (connection type ${this.networkService.networkType})
        `
        };

        this.logProvider.dispatchLog(log);
      });
  }

  ionViewWillLeave() {
    this.appResumeSub.unsubscribe();
    this.authLogSub.unsubscribe();
    this.connectedSub.unsubscribe();
  }
}
