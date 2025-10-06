export interface IExceptionlog {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: number;
  eventName?: string;
  fromDate?: string;  // ISO date string
  toDate?: string;    // ISO date string
  status?: string;

}

export interface IExceptionLogResponse {
  httpMethod: string | null;
  queryString: string | null;
  requestBody: string | null;
  statusCode: number;
  responseBody: string | null;
  requestTime: string;       
  responseTime: string;      
  isSuccess: boolean;
  exceptionMessage: string;
  stackTrace: string;
  exceptionType: string;
  loggedAt: string;          
  userId: string | null;
  requestPath: string;
  id:string;
}
