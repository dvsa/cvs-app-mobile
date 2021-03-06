import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular/platform/platform';
import { IonicAuth } from '@ionic-enterprise/auth';
import { Observable, Subject } from 'rxjs';
import * as jwt_decode from 'jwt-decode';
import to from 'await-to-js';

import { AUTH, LOG_TYPES } from '../../../app/app.enums';
import { default as AppConfig } from '../../../../config/application.hybrid';
import { VaultService } from '../vault/vault.service';
import { CommonFunctionsService } from '../../utils/common-functions';
import { TokenInfo, TokenStatus } from '../authentication/auth-model';
import { cordovaAzureConfig, webAzureConfig } from '../authentication/auth-options';
import { Log } from '../../../modules/logs/logs.model';
import { LogsProvider } from '../../../modules/logs/logs.service';

@Injectable()
export class AuthenticationService {
  private _tokenInfo: TokenInfo;
  private _auth: IonicAuth;

  private _loginStatusChanged: Subject<boolean>;
  get loginStatusChanged(): Observable<boolean> {
    return this._loginStatusChanged.asObservable();
  }

  get tokenInfo(): TokenInfo {
    return this._tokenInfo || ({} as TokenInfo);
  }

  get auth(): IonicAuth {
    return this._auth;
  }

  constructor(
    private platform: Platform,
    private vaultService: VaultService,
    // private alertService: AppAlertService,
    private commonFunc: CommonFunctionsService,
    private logProvider: LogsProvider
  ) {
    this.initialiseAuth();
  }

  async initialiseAuth() {
    const isCordovaApp = this.platform.is('cordova');
    const config = isCordovaApp ? cordovaAzureConfig : webAzureConfig;
    config.tokenStorageProvider = this.vaultService;

    this._loginStatusChanged = new Subject();
    this.vaultService.lockChanged.subscribe((locked) => this._loginStatusChanged.next(!locked));

    this._auth = new IonicAuth(config);
  }

  async expireTokens(): Promise<void> {
    await this._auth.expire();
  }

  async login(): Promise<void> {
    await this.vaultService.logout();
    await this.vaultService.setDesiredAuthMode();

    try {
      await this._auth.login();

      const tkInfo: TokenInfo = await this.updateTokenInfo();
      const testerOid = tkInfo && tkInfo.oid ? tkInfo.oid : this.commonFunc.randomString(9);

      await this.vaultService.storeTesterObfuscatedId(
        this.commonFunc.getObfuscatedTesterOid(testerOid)
      );
    } catch (error) {
      console.log(error || error.message);
      throw error;
    }
  }

  async updateTokenInfo(): Promise<TokenInfo> {
    this._tokenInfo = await this.getTokenDetails();
    return this._tokenInfo;
  }

  async hasUserRights(checkRoles: string[]): Promise<boolean> {
    const { testerRoles: roles } = this.tokenInfo;
    return roles && roles.some((role) => checkRoles.indexOf(role) >= 0);
  }

  async getTokenDetails(): Promise<TokenInfo> {
    const authResponse = await this._auth.getAuthResponse();
    if (!authResponse) {
      return;
    }

    const { id_token: token } = authResponse;
    const decodedToken: any = jwt_decode(token);

    return {
      id: decodedToken.sub,
      testerName: decodedToken.name,
      testerEmail: decodedToken.email || decodedToken.preferred_username,
      testerRoles: decodedToken.roles,
      oid: decodedToken.oid || '',
      employeeId: decodedToken.employeeid || '',
      testerId: decodedToken.employeeid || decodedToken.oid,
      token: token
    };
  }

  async isUserAuthenticated(): Promise<TokenStatus> {
    if (!(await this._auth.isAccessTokenAvailable())) {
      return { active: false, action: AUTH.RE_LOGIN };
    }

    if (await this._auth.isAccessTokenExpired()) {
      try {
        await this._auth.refreshSession();
      } catch (error) {
        return { active: false, action: AUTH.RE_LOGIN };
      }
    }

    await this.updateTokenInfo();

    return { active: true, action: AUTH.CONTINUE };
  }

  async checkUserAuthStatus(): Promise<boolean> {
    const { action } = await this.isUserAuthenticated();

    if (action === AUTH.RE_LOGIN) {
      const [error] = await to(this.login());

      if (error) {
        // this.alertService.alertLoginFailed();
        this.logLoginUnsuccessful(error.message);
        return Promise.resolve(false);
      } else {
        this._loginStatusChanged.next(true);
      }
    }

    return Promise.resolve(true);
  }

  logLoginUnsuccessful(errorMessage: string) {
    const log: Log = {
      type: LOG_TYPES.ERROR,
      message: `Login unsuccessful for client_id=${AppConfig.app.CLIENT_ID} with the error message ${errorMessage}`,
      timestamp: Date.now(),
      unauthenticated: true
    };

    this.logProvider.dispatchLog(log);
  }
}
