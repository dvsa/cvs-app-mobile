import { TEST_TYPE_RESULTS } from "../../app/app.enums";
import { TestTypeAbandonmentModel } from "./test-type-abandonment.model";
import { DefectDetailsModel } from "../defects/defect-details.model";

export interface TestTypeModel {
  code?: string;
  name: string;
  id?: string;
  certificateNumber?: string;
  lecCertificateNumber?: string;
  expiryDate?: string;
  startTime: string;
  endTime?: string;
  seatbeltsNumber?: number;
  lastSeatbeltInstallationCheckDate?: string;
  wasSeatbeltInstallationCheckCarriedOut?: boolean;
  result?: TEST_TYPE_RESULTS | string;
  wasProhibitionIssued?: boolean;
  abandonment?: TestTypeAbandonmentModel;
  additionalNotes?: string;
  defects: DefectDetailsModel[];
}
