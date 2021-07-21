import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  IonicPage,
  NavController,
  NavParams,
  TextInput,
  ViewController
} from 'ionic-angular';
import { VehicleModel } from '../../../../models/vehicle/vehicle.model';
import {
  ANALYTICS_EVENT_CATEGORIES,
  ANALYTICS_EVENTS,
  ANALYTICS_LABEL,
  DURATION_TYPE,
  ODOMETER_METRIC,
  REG_EX_PATTERNS
} from '../../../../app/app.enums';

import { VisitService } from '../../../../providers/visit/visit.service';
import { VehicleService } from '../../../../providers/vehicle/vehicle.service';
import { AnalyticsService, DurationService } from '../../../../providers/global';

@IonicPage()
@Component({
  selector: 'page-odometer-reading',
  templateUrl: 'odometer-reading.html'
})
export class OdometerReadingPage implements OnInit {
  odometerReading: string;
  odometerMetric: string;
  vehicle: VehicleModel;
  errorIncomplete: boolean;
  patterns;

  @ViewChild('valueInput') valueInput: TextInput;

  constructor(
    public visitService: VisitService,
    private actionSheetCtrl: ActionSheetController,
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private vehicleService: VehicleService,
    private cdRef: ChangeDetectorRef,
    private analyticsService: AnalyticsService,
    private durationService: DurationService
  ) {
    this.vehicle = this.navParams.get('vehicle');
    this.errorIncomplete = this.navParams.get('errorIncomplete');
  }

  ngOnInit() {
    this.odometerReading =
      this.vehicle.odometerReading && this.vehicle.odometerReading.length
        ? this.vehicle.odometerReading
        : null;
    this.odometerMetric =
      this.vehicle.odometerMetric && this.vehicle.odometerMetric.length
        ? this.vehicle.odometerMetric
        : ODOMETER_METRIC.KILOMETRES;
    this.patterns = REG_EX_PATTERNS;
    if (this.vehicle.odometerReading) this.errorIncomplete = false;
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.valueInput.setFocus();
    }, 150);
  }

  valueInputChange(value) {
    this.cdRef.detectChanges();
    this.odometerReading = value.length > 7 ? value.substring(0, 7) : value;
  }

  displayOdometerMetricCapitalized() {
    return this.odometerMetric.charAt(0).toUpperCase() + this.odometerMetric.slice(1);
  }

  async onSave() {
    const type: string = DURATION_TYPE[DURATION_TYPE.ODOMETER_READING];
    this.durationService.setDuration({ end: Date.now() }, type);
    const duration = this.durationService.getDuration(type);
    const takenDuration = this.durationService.getTakenDuration(duration);

    await this.trackOdometerReadingDuration(
      'ADD_ODOMETER_READING_START_TIME',
      duration.start.toString()
    );
    await this.trackOdometerReadingDuration(
      'ADD_ODOMETER_READING_END_TIME',
      duration.end.toString()
    );
    await this.trackOdometerReadingDuration(
      'ADD_ODOMETER_READING_TIME_TAKEN',
      takenDuration.toString()
    );

    this.vehicle = this.vehicleService.setOdometer(
      this.vehicle,
      this.odometerReading,
      this.odometerMetric
    );

    this.viewCtrl.dismiss();
  }

  async trackOdometerReadingDuration(label: string, value: string) {
    await this.analyticsService.logEvent({
      category: ANALYTICS_EVENT_CATEGORIES.DURATION,
      event: ANALYTICS_EVENTS.ADD_ODOMETER_READING_TIME_TAKEN,
      label: ANALYTICS_LABEL[label]
    });

    await this.analyticsService.addCustomDimension(
      Object.keys(ANALYTICS_LABEL).indexOf(label) + 1,
      value
    );
  }

  onEdit() {
    const actionSheet = this.actionSheetCtrl.create({
      title: '',
      buttons: [
        {
          text: 'Kilometres',
          handler: () => {
            this.odometerMetric = ODOMETER_METRIC.KILOMETRES;
          }
        },
        {
          text: 'Miles',
          handler: () => {
            this.odometerMetric = ODOMETER_METRIC.MILES;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
}
