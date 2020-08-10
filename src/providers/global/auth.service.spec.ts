import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LOCAL_STORAGE, TESTER_ROLES } from '../../app/app.enums';
import { AuthenticationContext, MSAdal } from '@ionic-native/ms-adal';
import { Platform } from 'ionic-angular';
import { CommonFunctionsService } from '../utils/common-functions';
import { Store } from '@ngrx/store';
import { TestStore } from '../interceptors/auth.interceptor.spec';
import { MOCK_UTILS } from '../../../test-config/mocks/mocks.utils';

export class AuthenticationContextMock {
  tokenCache = {
    clear() {
      return true;
    },
  };
  acquireTokenAsync() {
    return Promise.resolve();
  }
  acquireTokenSilentAsync() {
    return Promise.resolve();
  }
}

describe(`AuthService`, () => {
  let authService: AuthService;
  let store;
  let authContext: AuthenticationContext;

  // dummy hand crafted jwt token for testing purpose only
  const JWT_TOKEN: string =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvaWQiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidXBuIjoidGVzdEBlbWFpbC5jb20iLCJyb2xlcyI6WyJDVlNQc3ZUZXN0ZXIiXSwidGlkIjoiMTIzNDU2Nzg5MCJ9.9prTaDS-toi8z6HUbuhm5es1IcRp-BHVAqxjuu7C7-k';
  const JWT_TOKEN_EMPTY: string = '';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AuthService,
        CommonFunctionsService,
        Platform,
        MSAdal,
        { provide: Store, useClass: TestStore },
        { provide: AuthenticationContext, useClass: AuthenticationContextMock },
      ],
    });

    authService = TestBed.get(AuthService);
    store = TestBed.get(Store);
    authContext = TestBed.get(AuthenticationContext);
  });

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    authService = null;

    localStorage.clear();
  });

  it('should not add the JWT Token into localstorage', () => {
    expect(localStorage.getItem(LOCAL_STORAGE.JWT_TOKEN)).toBeFalsy();
    authService.setJWTToken(JWT_TOKEN_EMPTY);
    expect(localStorage.getItem(LOCAL_STORAGE.JWT_TOKEN)).toBeFalsy();
  });

  it('should add the JWT Token into localstorage', () => {
    expect(localStorage.getItem(LOCAL_STORAGE.JWT_TOKEN)).toBeFalsy();
    authService.setJWTToken(JWT_TOKEN);
    expect(localStorage.getItem(LOCAL_STORAGE.JWT_TOKEN)).toBeTruthy();
  });

  it('should get the JWT Token', () => {
    expect(localStorage.getItem(LOCAL_STORAGE.JWT_TOKEN)).toBeFalsy();
    authService.setJWTToken(JWT_TOKEN);
    expect(localStorage.getItem(LOCAL_STORAGE.JWT_TOKEN)).toBeTruthy();
    expect(authService.getJWTToken()).toBe(JWT_TOKEN);
  });

  it('should decode the token', () => {
    let decodedToken;
    expect(decodedToken).toBeUndefined();
    decodedToken = authService.decodeJWT(JWT_TOKEN);
    expect(decodedToken).toBeTruthy();
  });

  it('should set the default tester details', () => {
    let details;
    const expectedDetails = MOCK_UTILS.mockTesterDetails();
    expect(details).toBeUndefined();
    details = authService.setTesterDetails(
      null,
      expectedDetails.testerId,
      expectedDetails.testerName,
      expectedDetails.testerEmail,
      [TESTER_ROLES.PSV],
    );
    expect(details.testerName).toEqual('John Doe');
    expect(details.testerId).toEqual('1234567890');
    expect(details.testerEmail).toEqual('test@email.com');
    expect(details.testerRoles).toEqual([TESTER_ROLES.PSV]);
  });

  it('should check if user has rights', () => {
    let userRoles = [TESTER_ROLES.FULL_ACCESS];
    let neededRoles = [TESTER_ROLES.PSV, TESTER_ROLES.FULL_ACCESS];
    let hasRights = authService.hasRights(userRoles, neededRoles);
    expect(hasRights).toBeTruthy();

    userRoles = [];
    neededRoles = [TESTER_ROLES.PSV, TESTER_ROLES.FULL_ACCESS];
    hasRights = authService.hasRights(userRoles, neededRoles);
    expect(hasRights).toBeFalsy();
  });

  it('should set default tester details with no authResponse', () => {
    const result = authService.setTesterDetails(null);
    expect(result.testerId).toBeTruthy();
    expect(result.testerEmail).toBeTruthy();
    expect(result.testerName).toBeTruthy();
    expect(result.testerRoles[0]).toBe(TESTER_ROLES.FULL_ACCESS);
  });

  it('should set default tester details with authResponse', () => {
    const authResponse = {
      accessToken: JWT_TOKEN,
    };

    const result = authService.setTesterDetails(authResponse);
    expect(result.testerId).toBeTruthy();
    expect(result.testerEmail).toBeTruthy();
    expect(result.testerName).toBeTruthy();
    expect(result.testerRoles[0]).toBe(TESTER_ROLES.PSV);
  });

  it('should set the tenantId with authResponse', () => {
    authService.setTesterDetails({ accessToken: JWT_TOKEN });
    expect(authService.tenantId).toBe('1234567890');
  });

  it('should set the tester details in localStorage', () => {
    authService.setTesterDetails({ accessToken: JWT_TOKEN });
    expect(localStorage.getItem('tester-details')).toEqual(
      JSON.stringify(MOCK_UTILS.mockTesterDetails()),
    );
  });

  it('should test if it is valid token', () => {
    expect(authService.isValidToken(JWT_TOKEN)).toBeTruthy();
    expect(authService.isValidToken(null)).toBeFalsy();
  });

  it('it sets the localStorage tester-details key with the given testerId', () => {
    localStorage.setItem('tester-details', JSON.stringify({ testerId: 'test' }));
    expect(authService.getOid()).toEqual('test');
  });

  it('logLoginUnsuccessful', () => {
    spyOn(store, 'dispatch');
    authService.logLoginUnsuccessful('testError');
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  it('logLoginSuccessful', () => {
    spyOn(store, 'dispatch');
    authService.logLoginSuccessful();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  it('it should dispatch the correct logs when silentLoginAttempt is true', () => {
    spyOn(store, 'dispatch');
    authService.logLoginAttempt(true);
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  it('it should dispatch the correct logs when silentLoginAttempt is false', () => {
    spyOn(store, 'dispatch');
    authService.logLoginAttempt(false);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('resetTokenCache', () => {
    authService.authContext = authContext;
    expect(authService.resetTokenCache()).toBeTruthy();
  });

  it('createAuthContext', () => {
    expect(authService.createAuthContext()).toBeTruthy();
  });

  it('login', () => {
    authService.authContext = authContext;
    expect(authService.login()).toBeTruthy();
  });
});
