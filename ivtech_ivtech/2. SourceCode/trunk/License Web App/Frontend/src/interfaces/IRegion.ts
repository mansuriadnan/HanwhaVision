export interface ICountry {
    id: string;
    name: string;
    hasStates: boolean; 
    code: string;
  }

  export interface IStates {
    id: string;
    name: string;
    countryId: string; 
  }
  
  export interface ICities {
    id: string;
    name: string;
    countryId: string; 
    stateId : string
  }