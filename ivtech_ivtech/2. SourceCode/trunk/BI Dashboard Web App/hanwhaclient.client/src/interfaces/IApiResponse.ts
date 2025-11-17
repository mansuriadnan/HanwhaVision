
export interface iOptionModelResponse {
  value?: any; // Optional: The value of the option
  label?: any; // Optional: The label to display
  readOnly?: boolean; // Optional: Indicates if the option is read-only
  isDisabled?: boolean; // Optional: Indicates if the option is disabled
  isDefault?: boolean; // Optional: Indicates if the option is the default selection
  parentValue?: number | null; // Optional: Parent option value (if any)
  type?: string; // Optional: Type of the option
  order?: number | null; // Optional: Order for sorting
  hoverText?: string; // Optional: The hover text for the option
  additionalProperty?: string; // Optional: Additional metadata
}


// interfaces/ApiResponse.ts
export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  isSuccess: boolean;
  responseMessage: string;
  statusCode: string;
  message: string;
  referenceData?: iOptionModelResponse;
}


export interface IToBeDelete{
  id: string
}
