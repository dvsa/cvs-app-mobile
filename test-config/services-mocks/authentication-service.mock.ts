import { TokenInfo } from '../../src/providers/auth/authentication/auth-model';

export class AuthenticationServiceMock {
  public tokenInfo: TokenInfo;

  constructor() {
    this.tokenInfo = {
      testerId: 'testerId',
      testerEmail: 'jack@dvsa.gov.uk',
      testerName: 'jack'
    } as TokenInfo;
  }

  hasUserRights(): boolean {
    return true;
  }

  login() {}
}
