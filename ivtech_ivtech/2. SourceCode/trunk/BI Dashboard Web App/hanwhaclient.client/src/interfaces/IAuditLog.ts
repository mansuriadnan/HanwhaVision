import { iOptionModelResponse } from "./IApiResponse";

export interface FinalAuditLogData {
  [key: string]: any;
}

export interface Collectiontype {
  id: number;
  title: string;
}

export interface AuditLogres {
  auditLogDetails: FinalAuditLogData[];
  totalCount: number;
}

// export interface referenceDatatype {
//   createdBy: iOptionModelResponse[];
//   updatedBy: iOptionModelResponse[];
// }

export interface referenceDatatype {
  [key: string]: iOptionModelResponse[];
}
