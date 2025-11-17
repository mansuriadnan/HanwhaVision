import apiUrls from "../constants/apiUrls";
import User from "../interfaces/ICreateUser";
import { ApiResponse } from "../interfaces/IApiResponse";
import { apiPostService } from "../utils/apiPostService";
import { apiGetService } from "../utils/apiGetService";
import { apiDeleteService } from "../utils/apiDeleteService";
import { ITopLicenseDue } from "../interfaces/ILicense";
import { ICountry } from "../interfaces/IRegion";



export const GetAllCountriesService = () =>
  apiGetService<ICountry[]>({
    url: apiUrls.GetAllCountries,
  });

export const GetStateByCountryService = (id: string) =>
  apiGetService({
    url: `${apiUrls.GetStatesByCountry}/${id}`
  });


export const GetCitiesByStateORCountryIDService = (id: string, hasStates: boolean) =>
  apiGetService({
    url: hasStates ?
      `${apiUrls.GetCities}?stateId=${id}` :
      `${apiUrls.GetCities}?countryId=${id}`
  });


export const GetCitiesByCountryIDService = (id: string) =>
  apiGetService({
    url: `${apiUrls.GetStatesByCountry}/${id}`
  });