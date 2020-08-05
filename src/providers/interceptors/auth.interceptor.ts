import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../global/auth.service';
import { catchError, filter, finalize, switchMap, take, tap } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { AUTH, STATUS_CODE } from '../../app/app.enums';
import { Log, LogsModel } from '../../modules/logs/logs.model';
import * as logsActions from '../../modules/logs/logs.actions';
import { Store } from '@ngrx/store';
import { AppConfig } from '../../../config/app.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  isRefreshingToken: boolean = false;
  isProduction: boolean;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(public authService: AuthService, private store$: Store<LogsModel>) {
    this.isProduction = AppConfig.IS_PRODUCTION === 'true';
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!window.navigator.onLine) {
      // TOOD: Remove after the white screen bug is resolved
      // CVSB: 17584
      const log: Log = {
        type: 'error',
        message: `${this.authService.getOid()} - Cannot perform call to ${
          req.url
        }. Currently offline`,
        timestamp: Date.now()
      };
      this.store$.dispatch(new logsActions.SaveLog(log));

      return Observable.throw(new HttpErrorResponse({ error: AUTH.INTERNET_REQUIRED }));
    }
    const oid = this.authService.getOid();
    const log: Log = {
      type: 'info',
      message: `${oid} - API call to ${req.url}`,
      timestamp: Date.now()
    };
    this.store$.dispatch(new logsActions.SaveLog(log));
    return next.handle(this.addAuthHeader(req, this.authService.getJWTToken())).pipe(
      tap((response) => {
        // TOOD: Remove logging after the white screen bug is resolved
        // CVSB: 17584
        if (response instanceof HttpResponse) {
          const log: Log = {
            type: 'info',
            message: `${oid} - ${response.status} Response for API call to ${response.url}`,
            timestamp: Date.now()
          };
          this.store$.dispatch(new logsActions.SaveLog(log));
        }
      }),
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          // TOOD: Remove logging after the white screen bug is resolved
          // CVSB: 17584
          const log: Log = {
            type: 'error',
            message: `${oid} - ${error.status} ${error.message} for API call to ${error.url}`,
            timestamp: Date.now()
          };
          this.store$.dispatch(new logsActions.SaveLog(log));

          switch ((<HttpErrorResponse>error).status) {
            case (STATUS_CODE.UNAUTHORIZED, STATUS_CODE.FORBIDDEN):
              return this.handle401Error(req, next);
            default:
              return _throw(error);
          }
        }
      })
    );
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.tokenSubject.next(null);

      return this.authService.login().pipe(
        switchMap((newToken: string) => {
          if (newToken) {
            this.tokenSubject.next(newToken);
            return next.handle(this.addAuthHeader(req, newToken));
          }
          return this.logoutUser();
        }),
        catchError((error) => {
          return this.logoutUser(error);
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        })
      );
    } else {
      return this.tokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addAuthHeader(req, token));
        })
      );
    }
  }

  addAuthHeader(request: HttpRequest<any>, token) {
    const AUTH_HEADER = token;
    if (AUTH_HEADER && request.url !== AppConfig.URL_LATEST_VERSION) {
      return request.clone({
        setHeaders: {
          Authorization: `${AUTH_HEADER}`
        }
      });
    }
    return request;
  }

  logoutUser(error?): Observable<any> {
    return _throw(error || AUTH.INVALID_TOKEN);
  }
}
