import {DefectModel} from "./defect.model";

export class VehicleTestModel {
  private name: string;
  private hasPassed: boolean;
  private certificateExpirationDate: Date;
  private certificateLifespanInMonths: number;
  private date: Date;
  private odometerReading: number;
  private odometerMetric: string;
  private defects: DefectModel[];

  constructor(name: string, hasPassed?: boolean, certificateExpirationDate?: Date, certificateLifespanInMonths?: number, date?: Date) {
    this.name = name;
    this.hasPassed = hasPassed;
    this.certificateExpirationDate = certificateExpirationDate;
    this.certificateLifespanInMonths = certificateLifespanInMonths;
    this.date = date;
    this.defects = [];
  }

  _clone(): VehicleTestModel {
    let clone = new VehicleTestModel(this.name, this.hasPassed, this.certificateExpirationDate, this.certificateLifespanInMonths, this.date);
    clone.setOdometer(this.odometerReading, this.odometerMetric);
    this.defects.forEach(defect => {
      clone.addDefect(defect);
    });
    return clone;
  }

  getCertificateExpirationDate(): Date {
    return this.certificateExpirationDate;
  }

  getName(): string {
    return this.name;
  }

  getDate(): Date {
    return this.date;
  }

  getCertificateLifespanInMonths(): number {
    return this.certificateLifespanInMonths;
  }

  getHasPassed(): boolean {
    return this.hasPassed;
  }

  getOdometerReading(): number {
    return this.odometerReading;
  }

  getDefects(): DefectModel[] {
    return this.defects;
  }

  private passVehicleTest() {
    // if (this.hasPassed == null && this.date == null) {
    this.hasPassed = true;
    this.date = new Date();

    if (this.certificateLifespanInMonths && this.certificateExpirationDate == null) {
      this.certificateExpirationDate = this.calculateCertificateExpirationDate(this.date, this.certificateLifespanInMonths);
    }
    // }
  }

  private failVehicleTest() {
    // if (this.hasPassed == null && this.date == null) {
    this.hasPassed = false;
    this.date = new Date();
    // }
  }

  endVehicleTest() {
    // check for defects, if yes -> passVechicleTest, if no -> failVehicleTest
    if (this.checkPass()) {
      this.passVehicleTest();
    } else {
      this.failVehicleTest();
    }
  }

  checkPass(): Boolean {
    let foundCriticalDefect = true;
    this.defects.forEach(defect => {
      if (defect.deficiencyCategory.toLowerCase() == "major" || defect.deficiencyCategory.toLowerCase() == "dangerous") {
        foundCriticalDefect = false;
      }
    })
    return foundCriticalDefect;
  }

  private calculateCertificateExpirationDate(date: Date, certificateLifespanInMonths: number): Date {
    let certificateExpirationDate = new Date(date.toUTCString());
    certificateExpirationDate.setMonth(certificateExpirationDate.getMonth() + certificateLifespanInMonths);
    return certificateExpirationDate;
  }

  setOdometer(odometerReading: number, odometerMetric: string) {
    this.odometerReading = odometerReading;
    this.odometerMetric = odometerMetric;
  }

  addDefect(defect: DefectModel) {
    this.defects.push(defect);
  }
}
