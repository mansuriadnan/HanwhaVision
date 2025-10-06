import { useEffect, useState } from "react";
import { IClient } from "../../interfaces/IGetAllClients";
import {
  AddClientService,
  UpdateClientService,
} from "../../services/clientService";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import handleResponse from "../../utils/handleResponse";
import {
  GetAllCountriesService,
  GetCitiesByStateORCountryIDService,
  GetStateByCountryService,
} from "../../services/regionServices";
import { ICities, ICountry, IStates } from "../../interfaces/IRegion";
import {
  ICountryLookup,
  IStatesLookup,
  ICitiesLookup,
} from "../../interfaces/ILookup";
import { GetAllDistributorService } from "../../services/distributorService";
import { Idistributor } from "../../interfaces/IDistributor";
import { CustomButton, CustomSelect, CustomTextField } from "../../components";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ILookup } from "../../interfaces/ILookup";
import { LABELS, REGEX } from "../../utils/constants";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";

interface ClientAddEditPageProps {
  client?: IClient | null;
  onClose: () => void;
  refreshData: () => void;
}

export const ClientAddEditPage: React.FC<ClientAddEditPageProps> = ({
  client,
  onClose,
  refreshData,
}) => {
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [allCountryData, setAllCountryData] = useState<ICountryLookup[]>([]);
  const [allStateData, setAllStateData] = useState<IStatesLookup[]>([]);
  const [allCitiesData, setAllCitiesData] = useState<ICitiesLookup[]>([]);
  const [selectedContry, setSelectedContry] = useState<ICountryLookup | null>(
    null
  );
  const [selectedState, setSelectedState] = useState<IStatesLookup | null>(
    null
  );
  const [selectedCity, setSelectedCity] = useState<ICities | null>(null);
  const [distributorData, setDistributorData] = useState<ILookup[]>([]);
  const [mobileNo, setMobileNo] = useState();

  const [error, setError] = useState<string | null>(null);

  interface ClientFormInputs {
    customerName: string;
    distributorName: string;
    contactPersonName: string;
    contactPersonMobile: string;
    officePhone: string;
    emailAddress: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
    address: string;
  }

  const { control, handleSubmit, setValue, watch } = useForm<ClientFormInputs>({
    defaultValues: {
      customerName: "",
      distributorName: "",
      contactPersonName: "",
      contactPersonMobile: "",
      officePhone: "",
      emailAddress: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
      address: "",
    },
  });

  const selectedCountryId = watch("country");

  const selectedStateId = watch("state");

  useEffect(() => {
    const filteredData =
      allCountryData.find((item) => item.id === selectedCountryId) || null;
    setSelectedContry(filteredData);
    setAllCitiesData([]);
  }, [selectedCountryId, allCountryData]);
  useEffect(() => {
    if (selectedStateId) {
      const filteredState =
        allStateData.find((item) => item.id === selectedStateId) || null;
      setSelectedState(filteredState);
    }
  }, [selectedStateId, allStateData]);

  const isEditMode = !!client;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditMode && client) {
      setValue("customerName", client.customerName || "");
      setValue("distributorName", client.distributorId || "");
      setValue("contactPersonMobile", client.contactPersonMobile || "");
      setValue("officePhone", client.officePhone || "");
      setValue("emailAddress", client.emailAddress || "");
      setValue("contactPersonName", client.contactPersonName || "");
      setValue("country", client.countryId || "");
      setValue("state", client.stateId || "");
      setValue("city", client.cityId || "");
      setValue("postalCode", client.postalCode || "");
      setValue("address", client.address || "");
    }
  }, [client]);

  useEffect(() => {
    if (selectedContry) {
      if (selectedContry.hasStates) {
        fetchStatesData(selectedContry.id);
      } else {
        setAllStateData([])
        setSelectedState(null)
        fetchCitiesData(selectedContry.id, false);
      }
    }
  }, [selectedContry]);

  useEffect(() => {
    if (selectedState) {
      fetchCitiesData(selectedState.id, true);
    }
  }, [selectedState]);

  const fetchInitialData = async () => {
    try {
      const [countryData, distributorData] = await Promise.all([
        GetAllCountriesService(),
        GetAllDistributorService(),
      ]);
      const data = distributorData.data as Idistributor[];
      const tempDistributorList = data?.map((item) => ({
        title: item.distributorName,
        id: item.id,
      }));
      setDistributorData(tempDistributorList as ILookup[]);
      const tempcountryList = countryData?.map((item) => ({
        title: item.name,
        id: item.id,
        hasStates: item.hasStates,
        code: item.code,
      }));
      setAllCountryData(tempcountryList as ICountryLookup[]);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const fetchStatesData = async (selectedContryID: string) => {
    try {
      const response = await GetStateByCountryService(selectedContryID);
      const tempstateList = response as IStates[];
      const finalstateList = tempstateList?.map((item) => ({
        title: item.name,
        id: item.id,
        countryId: item.countryId,
      }));

      setAllStateData(finalstateList as IStatesLookup[]);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const fetchCitiesData = async (
    stateOrCountryID: string,
    hasStates: boolean
  ) => {
    try {
      const response = await GetCitiesByStateORCountryIDService(
        stateOrCountryID,
        hasStates
      );
      const tempcityList = response as ICities[];
      const finalcityList = tempcityList?.map((item) => ({
        title: item.name,
        id: item.id,
        countryId: item.countryId,
        stateId: item.stateId,
      }));
      setAllCitiesData(finalcityList as ICitiesLookup[]);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const clientSubmit: SubmitHandler<ClientFormInputs> = async (data: any) => {
    const clientData: IClient = {
      contactPersonName: data.contactPersonName,
      customerName: data.customerName,
      contactPersonMobile: data.contactPersonMobile,
      emailAddress: data.emailAddress,
      address: data.address,
      distributorId: data.distributorName,
      officePhone: data.officePhone,
      postalCode: data.postalCode,
      countryId: data.country,
      stateId: selectedContry && selectedContry?.hasStates ? data.state : "",
      cityId: data.city,
      id: isEditMode ? client?.id : "",
    };

    try {
      if (isEditMode) {
        const response: any = await UpdateClientService(clientData);
        if (response?.isSuccess) {
          refreshData();
          onClose();
        }
      } else {
        const response: any = await AddClientService(clientData);
        if (response?.isSuccess) {
          refreshData();
          onClose();
        }
      }
      // Close dialog after saving
    } catch (err: any) {
      console.error("Error saving client:", err);
    }
  };

  return (

    <Box className="comn-pop-up-design" component="form">
      <Grid className="main-row-wrapper">
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="customerName"
            label="Customer Name"
            control={control}
            rules={{
              required: "Customer Name is required.",
            }}
            fullWidth
            autoFocus
            required
            placeholder="Enter customer name"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="distributorName"
            control={control}
            //label="Distributor*"
            label={<label>Distributor<span>*</span></label>}
            options={distributorData}
            rules={{ required: "Distributor is required" }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="emailAddress"
            label="Email Address"
            control={control}
            rules={{
              required: "Email Address is required.",
              pattern: {
                value: REGEX.Email_Regex,
                message: "Enter a valid email address.",
              },
            }}
            fullWidth
            autoFocus
            required
            placeholder="Enter email address"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="contactPersonName"
            label="Contact Person"
            control={control}
            rules={{
              required: "Contact Person is required.",
            }}
            fullWidth
            autoFocus
            required
            placeholder="Enter contact person"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="country"
            control={control}
            //label="Country*"
            label={<label>Country<span>*</span></label>}
            options={allCountryData}
            rules={{ required: "Country is required" }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {/* {selectedContry && selectedContry.hasStates && ( */}
          <CustomSelect
            name="state"
            control={control}
            //label="State*"
            label={<label>State<span>*</span></label>}
            options={allStateData}
            // rules={{ required: "State is required" }}
            rules={
              selectedContry?.hasStates
                ? { required: "State is required" } // Apply validation if hasStates is true
                : { required: false } // No validation if hasStates is false
            }
            disabled={selectedContry?.hasStates ? false : true}
          />
          {/* )} */}
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="city"
            control={control}
            //label="City*"
            label={<label>City<span>*</span></label>}
            options={allCitiesData}
            rules={{ required: "City is required" }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="postalCode"
            label="Postal/Zip Code"
            control={control}
            rules={{
              pattern: {
                value: REGEX.ZipCode_Regex,
                message: "Enter a valid postal/zip code.",
              },
            }}
            fullWidth
            autoFocus
            placeholder="Enter postal/zip code"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {/* <CustomTextField
                name="contactPersonMobile"
                label="Mobile"
                control={control}
                rules={{
                  required: "Mobile is required.",
                  pattern: {
                    value: REGEX.Mobile_Regex,
                    message: "Enter a valid Mobile Number.",
                  },
                }}
                fullWidth
                autoFocus
                required
                placeholder="Enter Mobile"
              /> */}
          <Box className="custom-field">
            <Controller
              name="contactPersonMobile"
              control={control}
              rules={{
                required: "Mobile is required.",
                validate: (value) => {
                  if (!value) return "Enter a valid mobile number.";

                  const phoneNumber = parsePhoneNumberFromString(value);
                  if (!phoneNumber || !phoneNumber.isValid()) {
                    return "Enter a valid mobile number for the selected country.";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <label className={fieldState.error ? "label-error-mobile" : ""}>
                    Mobile<span>*</span>
                  </label>

                  <FormControl fullWidth error={!!fieldState.error}>
                    <PhoneInput
                      international
                      defaultCountry={selectedContry?.code as any}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      style={{"margin-bottom" : "0px"}}
                      placeholder="Enter mobile"
                      className={`phone-input-container ${fieldState.error ? "error-border" : ""
                        }`}
                    />
                    {fieldState.error && (
                      <FormHelperText error>{fieldState.error.message}</FormHelperText>
                    )}
                  </FormControl>
                </>
              )}
            />
          </Box>

        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            name="officePhone"
            label="Office Phone"
            control={control}
            type="number"
            rules={{
              // pattern: {
              //   value: REGEX.Mobile_Regex,
              //   message: "Enter a valid office phone.",
              // },
            }}
            fullWidth
            autoFocus
            placeholder="Enter office phone"
          />
        </Grid>

        <Grid container item xs={12} md={12}>
          <CustomTextField
            name="address"
            label="Address"
            control={control}
            fullWidth
            autoFocus
            placeholder="Enter address"
          />
        </Grid>

      </Grid>
      <CustomButton
        onClick={handleSubmit(clientSubmit)}
        className="pop-bottom-cmn-btn"
      >
        {isEditMode ? "Update Customer" : "Add Customer"}
      </CustomButton>
    </Box>
  );
};
