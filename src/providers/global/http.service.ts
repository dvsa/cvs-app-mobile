import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { AppConfig } from '../../../config/app.config';
import { TestStationReferenceDataModel } from '../../models/reference-data-models/test-station.model';
import { TestTypesReferenceDataModel } from '../../models/reference-data-models/test-types.model';
import { PreparersReferenceDataModel } from '../../models/reference-data-models/preparers.model';
import { PATHS } from '../../app/app.enums';
import { TestResultModel } from '../../models/tests/test-result.model';
import { DefectItemReferenceDataModel } from '../../models/reference-data-models/defects.reference-model';
import { VehicleTechRecordModel } from '../../models/vehicle/tech-record.model';
import { ActivityModel } from '../../models/visit/activity.model';
import { Log } from '../../modules/logs/logs.model';
import { LatestVersionModel } from '../../models/latest-version.model';

import {default as hybridConfig} from '../../../config/application.hybrid';


@Injectable()
export class HTTPService {
  constructor(private http: HttpClient) {}

  getAtfs(): Observable<HttpResponse<TestStationReferenceDataModel[]>> {
    return this.http.get<TestStationReferenceDataModel[]>(hybridConfig.options.BACKEND_URL_TEST_STATIONS, {
      observe: 'response'
    });
  }

  getDefects(): Observable<HttpResponse<DefectItemReferenceDataModel[]>> {
    return this.http.get<DefectItemReferenceDataModel[]>(hybridConfig.options.BACKEND_URL_DEFECTS, {
      observe: 'response'
    });
  }

  getTestTypes(): Observable<HttpResponse<TestTypesReferenceDataModel[]>> {
    return this.http.get<TestTypesReferenceDataModel[]>(hybridConfig.options.BACKEND_URL_TESTTYPES, {
      observe: 'response'
    });
  }

  getPreparers(): Observable<HttpResponse<PreparersReferenceDataModel[]>> {
    return this.http.get<PreparersReferenceDataModel[]>(hybridConfig.options.BACKEND_URL_PREPARERS, {
      observe: 'response'
    });
  }

  getTechRecords(
    param: string,
    searchCriteria: string
  ): Observable<HttpResponse<VehicleTechRecordModel[]>> {
    return this.http.get<VehicleTechRecordModel[]>(
      `${hybridConfig.options.BACKEND_URL_TECHRECORDS}/${encodeURIComponent(param)}/${PATHS.TECH_RECORDS}`,
      {
        observe: 'response',
        params: {
          status: 'provisional_over_current',
          searchCriteria
        }
      }
    );
  }

  getTestResultsHistory(systemNumber: string): Observable<HttpResponse<TestResultModel[]>> {
    return this.http.get<TestResultModel[]>(
      `${hybridConfig.options.BACKEND_URL_TEST_RESULTS}/${systemNumber}`,
      { observe: 'response' }
    );
  }

  postTestResult(body): Observable<HttpResponse<any>> {
    return this.http.post<TestResultModel>(hybridConfig.options.BACKEND_URL_TEST_RESULTS, body, {
      observe: 'response'
    });
  }

  startVisit(activities: ActivityModel): Observable<HttpResponse<any>> {
    return this.http.post(hybridConfig.options.BACKEND_URL_VISIT, activities, { observe: 'response' });
  }

  endVisit(visitID: string): Observable<HttpResponse<any>> {
    return this.http.put(`${hybridConfig.options.BACKEND_URL_VISIT}/${visitID}/end`, null, {
      observe: 'response'
    });
  }

  postActivity(activities: ActivityModel): Observable<HttpResponse<any>> {
    return this.http.post(hybridConfig.options.BACKEND_URL_VISIT, activities, { observe: 'response' });
  }

  updateActivity(activities): Observable<HttpResponse<any>> {
    return this.http.put(`${hybridConfig.options.BACKEND_URL_VISIT}/update`, activities, {
      observe: 'response'
    });
  }

  getOpenVisitCheck(testerStaffId): Observable<HttpResponse<any>> {
    return this.http.get(`${hybridConfig.options.BACKEND_URL_VISIT}/open?testerStaffId=${testerStaffId}`, {
      observe: 'response'
    });
  }

  saveSignature(staffId: string, signatureString: string): Observable<HttpResponse<any>> {
    return this.http.put(`${hybridConfig.options.BACKEND_URL_SIGNATURE}${staffId}.base64`, signatureString, {
      observe: 'response'
    });
  }

  sendAuthenticatedLogs(logs: Log[]): Observable<HttpResponse<any>> {
    return this.http.post(hybridConfig.options.BACKEND_URL_LOGS, logs, { observe: 'response' });
  }

  sendUnauthenticatedLogs(logs: Log[]): Observable<HttpResponse<any>> {
    let headers = new HttpHeaders().set('x-api-key', hybridConfig.options.UNAUTH_LOGS_API_KEY);
    return this.http.post(hybridConfig.options.BACKEND_URL_UNAUTH_LOGS, logs, {
      headers,
      observe: 'response'
    });
  }

  getApplicationVersion(): Promise<HttpResponse<LatestVersionModel>> {
    return this.http
      .get<LatestVersionModel>(hybridConfig.options.URL_LATEST_VERSION, { observe: 'response' })
      .toPromise();
  }
}
