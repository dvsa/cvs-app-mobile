import { ActivityModel } from "../../src/models/visit/activity.model";
import { TestResultModel } from "../../src/models/tests/test-result.model";
import { VisitModel } from "../../src/models/visit/visit.model";
import { of } from "rxjs/observable/of";

export class ActivityServiceMock {
  activities: ActivityModel[] = [];
  waitTimeStarted: boolean = false;

  constructor() {

  }

  createActivity(visit: VisitModel, activityType?: string, pushToActivities?: boolean, updateActivities?: boolean): ActivityModel {
    let activity: ActivityModel = {
      activityType: activityType ? activityType : 'unaccountable time',
      testStationName: visit.testStationName,
      testStationPNumber: visit.testStationPNumber,
      testStationEmail: visit.testStationEmail,
      testStationType: visit.testStationType,
      testerName: 'John Doe',
      testerStaffId: 'dfgdgjnkgn',
      startTime: null,
      endTime: null,
      waitReason: [],
      notes: '',
      parentId: visit.id
    };
    if (pushToActivities) this.activities.push(activity);
    if (updateActivities) this.updateActivities();
    return activity;
  }

  updateActivities() {
    return Promise.resolve(true);
  }

  submitActivity() {
    return of(true);
  }

  getActivities(): ActivityModel[] {
    return this.activities;
  }

  addActivity(activity: ActivityModel) {
    this.activities.push(activity);
  }

  updateActivityReasons(activities) {
    return of(true);
  }

  createActivityBodyForCall(visit, testResult?: TestResultModel, timeline?) {
    let activity = {} as ActivityModel;
    let timeNotTesting = 0;

    if (testResult) {
      let indexTestResult = visit.tests.map((elem) => elem.startTime).indexOf(testResult.testStartTimestamp);
      if (indexTestResult === 0) {
        timeNotTesting = (Date.parse(testResult.testStartTimestamp) - Date.parse(visit.startTime)) / 1000 / 60;
        timeNotTesting < 5 ? activity = this.createActivity(visit, null, false, false) : activity = this.createActivity(visit, 'wait', false, false);
        activity.startTime = visit.startTime;
        activity.endTime = testResult.testEndTimestamp;
      } else {
        timeNotTesting = (Date.parse(testResult.testStartTimestamp) - Date.parse(visit.tests[0].endTime)) / 1000 / 60;
        timeNotTesting < 5 ? activity = this.createActivity(visit, null, false, false) : activity = this.createActivity(visit, 'wait', false, false);
        activity.startTime = visit.tests[0].endTime;
        activity.endTime = testResult.testStartTimestamp;
      }
    } else {
      if (timeline.length === 0) {
        timeNotTesting = (Date.parse(new Date().toISOString()) - Date.parse(visit.startTime)) / 1000 / 60;
        timeNotTesting < 5 ? activity = this.createActivity(visit, null, false, false) : activity = this.createActivity(visit, 'wait', false, false);
        activity.startTime = visit.startTime;
      } else {
        if (timeline[timeline.length - 1].status) {
          timeNotTesting = (Date.parse(new Date().toISOString()) - Date.parse(timeline[timeline.length - 1].endTime)) / 1000 / 60;
          timeNotTesting < 5 ? activity = this.createActivity(visit, null, false, false) : activity = this.createActivity(visit, 'wait', false, false);
          activity.startTime = timeline[timeline.length - 1].endTime;
        } else {
          timeNotTesting = (Date.parse(new Date().toISOString()) - Date.parse(timeline[timeline.length - 1].startTime)) / 1000 / 60;
          timeNotTesting < 5 ? activity = this.createActivity(visit, null, false, false) : activity = this.createActivity(visit, 'wait', false, false);
          activity.startTime = timeline[timeline.length - 1].startTime;
        }
      }
      activity.endTime = new Date().toISOString();
    }
    activity.notes = null;
    return activity;
  }

  createActivitiesForUpdateCall(activitiesArr: ActivityModel[]) {
    let activitiesForUpdate = [];
    for (let activity of activitiesArr) {
      let updActivity = {
        id: activity.id,
        waitReason: activity.waitReason,
        notes: activity.notes ? activity.notes : null
      };
      activitiesForUpdate.push(updActivity);
    }
    return activitiesForUpdate;
  }
}
