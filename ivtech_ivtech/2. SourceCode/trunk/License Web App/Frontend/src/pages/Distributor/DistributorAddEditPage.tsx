import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ILookup } from "../../interfaces/ILookup";
import { Idistributor } from "../../interfaces/IDistributor";
import { GetAllCountriesService } from "../../services/regionServices";
import { AddUpdateDistributorService } from "../../services/distributorService";
import { Box, Container, Grid } from "@mui/material";
import {
  CustomButton,
  CustomTextField,
  CustomSelect,
} from "../../components/index";
import { REGEX } from "../../utils/constants";

interface DistributorAddEditPageProps {
  distributor?: Idistributor | null;
  onClose: () => void;
  refreshData: () => void;
}

export const DistributorAddEditPage: React.FC<DistributorAddEditPageProps> = ({
  distributor,
  onClose,
  refreshData,
}) => {
  const [allCountryData, setAllCountryData] = useState<ILookup[]>([]);
  const isEditMode = !!distributor;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      distributorName: "",
      address: "",
      selectedCountry: "",
      emailAddress: "",
      contactPerson: "",
    },
  });

  useEffect(() => {
    fetchCountryData();
    if (isEditMode && distributor) {
      setValue("distributorName", distributor.distributorName || "");
      setValue("address", distributor.address || "");
      setValue("selectedCountry", distributor.countryId || "");
      setValue("emailAddress", distributor.email || "");
      setValue("contactPerson", distributor?.contactPerson || "");
    }
  }, [distributor]);

  const fetchCountryData = async () => {
    try {
      const response = await GetAllCountriesService();
      const countryData = response?.map((item) => ({
        title: item.name,
        id: item.id,
      }));
      setAllCountryData(countryData as ILookup[]);
    } catch (err: any) {
      console.error("Error fetching countries:", err);
    }
  };

  const onSubmit = async (data: any) => {
    const distributorData: Idistributor = {
      ...data,
      countryId: data.selectedCountry,
      email: data.emailAddress,
      id: isEditMode ? distributor?.id : "",
    };
    try {
      const response: any = await AddUpdateDistributorService(distributorData);
      if(response?.isSuccess){
        refreshData();
        onClose();
      }
    } catch (err) {
      console.error("Error saving distributor:", err);
    }
  };

  return (
    <Box
      className="comn-pop-up-design"
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Grid className="main-row-wrapper">
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="distributorName"
            control={control}
            label="Distributor Name"
            fullWidth
            rules={{
              required: "Distributor Name is required",
              pattern: {
                value: REGEX.Name_Regex,
                message: "Enter a valid distributor name",
              },
            }}
            placeholder="Enter distributor name"
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomTextField
            name="contactPerson"
            control={control}
            label="Contact Person"
            fullWidth
            rules={{
              required: "Contact Person is required",
              pattern: {
                value: REGEX.Name_Regex,
                message: "Enter a valid contact person name",
              },
            }}
            placeholder="Enter contact person"
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            name="selectedCountry"
            control={control}
            //label="Country*"
            label={<label>Country<span>*</span></label>}
            options={allCountryData}
            rules={{ required: "Country is required" }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomTextField
            name="emailAddress"
            control={control}
            label="Email Address"
            fullWidth
            placeholder="Enter email address"
            rules={{
              required: "Email Address is required",
              pattern: {
                value: REGEX.Email_Regex,
                message: "Enter a valid email address",
              },
            }}
            required
          />
        </Grid>
        <Grid container item xs={12} md={12}>
          <CustomTextField
            name="address"
            control={control}
            label="Address"
            fullWidth
            rules={{ required: "Address is required" }}
            placeholder="Enter address"
            required
          />
        </Grid>
        <Grid
          item
          xs={12}
          container
        >
          <CustomButton className="pop-bottom-cmn-btn">
            {isEditMode ? "Update Distributor" : "Add Distributor"}
          </CustomButton>
        </Grid>
      </Grid>
    </Box>
  );
};
