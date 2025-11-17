export interface ILookup {
  id: string;
  title: string;
}


export interface ICountryLookup {
  id: string;
  title: string;
  hasStates: boolean; 
  code:string;
}


export interface IStatesLookup {
  id: string;
  title: string;
  countryId: string; 
}

export interface ICitiesLookup {
  id: string;
  title: string;
  countryId: string; 
  stateId : string
}