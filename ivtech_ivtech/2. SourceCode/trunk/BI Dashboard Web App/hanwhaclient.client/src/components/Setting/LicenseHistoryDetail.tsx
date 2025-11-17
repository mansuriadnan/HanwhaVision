import {
  Box,
  Chip,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import {
  ILicenseHistory,
  ILicenseHistoryReferenceData,
} from "../../interfaces/ILicense";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import { useThemeContext } from "../../context/ThemeContext";

interface LicenseHistoryDetailProps {
  licenseHistory: ILicenseHistory[];
  setLicenseHistory: React.Dispatch<React.SetStateAction<ILicenseHistory[]>>;
  licenseReferenceData: ILicenseHistoryReferenceData;
  setLicenseReferenceData: React.Dispatch<React.SetStateAction<ILicenseHistoryReferenceData>>;
}

const LicenseHistoryDetail : React.FC<LicenseHistoryDetailProps> = ({
  licenseHistory,
  setLicenseHistory,
  licenseReferenceData,
  setLicenseReferenceData,
}) => {
  const [licenseSearchTerm, setLicenseSearchTerm] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10, // Default page size
    page: 0, // Default page index
  });
  const { theme } = useThemeContext();


  const handleLicenseSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseSearchTerm(event.target.value);
  };



  const CustomNoRowsOverlay = () => (
    <Box className="no-data-douns">
      <Box sx={{ width: 200, justifyItems: "center", flex: 1 }}>
        <img
          src={theme === 'light' ? '/images/noData.gif' : '/images/dark-theme/noData.gif'}
          alt="Animated GIF"
          width="100"
          height="100"
        />
        <Typography sx={{ FontWeight: 600, fontSize: 24, color: "#090909" }}>
          No data found
        </Typography>
      </Box>
    </Box>
  );

  // const licenseRows = licenseHistory.map((license, index) => {
  //   const currentDate = new Date();
  //   const startDate = new Date(license.startDate);
  //   const expiryDate = new Date(license.expiryDate);

  //   let status = "";
  //   if (license.licenseType === "Trial") {
  //     if (currentDate < startDate) status = "Future";
  //     else if (currentDate >= startDate && currentDate <= expiryDate)
  //       status = "Active";
  //     else status = "Expired";
  //   } else {
  //     if (currentDate < startDate) {
  //       status = "Future";
  //     } else if (currentDate >= startDate && currentDate <= expiryDate) {
  //       status = "Active";
  //     } else {
  //       status = license.licenseType === "Trial" ? "Expired" : "Active"; // Non-trial licenses stay "Active" even after expiry
  //     }
  //   }

  //   return {
  //     id: license.id,
  //     macAddress: license.macAddress,
  //     licenseType: license.licenseType,
  //     // users: license.users,
  //     numberOfUsers: license.numberOfUsers,
  //     noOfChannel: license.noOfChannel,
  //     startDate: license.startDate,
  //     expiryDate: license.expiryDate,
  //     status,
  //     createdBy: license.createdBy,
  //     createdOn: license.createdOn,
  //   };
  // });

  const licenseRows = (() => {
    const currentDate = new Date();

    // Separate trial and permanent licenses
    const trialLicenses = licenseHistory.filter(
      (license) => license.licenseType === "Trial"
    );

    const permanentLicenses = licenseHistory.filter(
      (license) => license.licenseType !== "Trial"
    );

    // Find the latest permanent license (by createdOn or startDate)
    let latestPermanentLicense: ILicenseHistory | null = null;
    if (permanentLicenses.length > 0) {
      latestPermanentLicense = permanentLicenses.reduce((latest, current) => {
        const latestDate = new Date(latest.createdOn);
        const currentDate = new Date(current.createdOn);
        return currentDate > latestDate ? current : latest;
      });
    }

    const processLicense = (license: ILicenseHistory, isLatestPermanent = false) => {
      const startDate = new Date(license.startDate);
      const expiryDate = new Date(license.expiryDate);
      let status = "";

      if (license.licenseType === "Trial") {
        if (currentDate < startDate) status = "Future";
        else if (currentDate >= startDate && currentDate <= expiryDate)
          status = "Active";
        else status = "Expired";
      } else {
        if (isLatestPermanent) {
          status = "Active";
        } else {
          status = "Expired";
        }
      }

      return {
        id: license.id,
        macAddress: license.macAddress,
        licenseType: license.licenseType,
        numberOfUsers: license.numberOfUsers,
        noOfChannel: license.noOfChannel,
        startDate: license.startDate,
        expiryDate: license.expiryDate,
        status,
        createdBy: license.createdBy,
        createdOn: license.createdOn,
      };
    };

    const processedTrial = trialLicenses.map((license) => processLicense(license));
    const processedPermanent = permanentLicenses.map((license) =>
      processLicense(license, license.id === latestPermanentLicense?.id)
    );

    return [...processedTrial, ...processedPermanent];
  })();

  const filteredLicense = licenseSearchTerm?.length >=3 ? licenseRows.filter(
    (license) =>
      license.macAddress
        ?.toLowerCase()
        .includes(licenseSearchTerm.toLowerCase()) ||
      license.licenseType
        ?.toLowerCase()
        .includes(licenseSearchTerm.toLowerCase()) ||
      moment(license.startDate)
        .format("DD/MM/YYYY")
        .toLowerCase()
        .includes(licenseSearchTerm.toLowerCase())
  ) : licenseRows;

  const LicenseColumns = [
    { field: "macAddress", headerName: "MAC Address", flex: 1 },
    {
      field: "licenseType",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => {
        return (
          <span
            style={{
              color: params.row.licenseType === "Trial" ? "#FF8A01" : "#2DB400",
              paddingTop: "4px",
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    // { field: "users", headerName: "No. Of Users", flex: 1 },
    { field: "numberOfUsers", headerName: "No. Of Users", flex: 1 },
    { field: "noOfChannel", headerName: "No. Of Channels", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => moment(params.value).format("DD/MM/YYYY"),
    },
    {
      field: "expiryDate",
      headerName: "End Date",
      flex: 1,
      // renderCell: (params) => moment(params.value).format("DD/MM/YYYY"),
      renderCell: (params) =>
        params.row.licenseType === "Trial"
          ? moment(params.value).format("DD/MM/YYYY")
          : "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        let statusColor = "default";
        if (params.value === "Future") statusColor = "warning";
        if (params.value === "Active") statusColor = "success";
        if (params.value === "Expired") statusColor = "error";
        return (
          <Chip
            label={params.value}
            size="small"
            color={
              statusColor as
              | "default"
              | "primary"
              | "secondary"
              | "success"
              | "error"
              | "info"
              | "warning"
            }
            variant="outlined"
            sx={{
              backgroundColor:
                statusColor === "success"
                  ? "#dff0d8"
                  : statusColor === "error"
                    ? "#f8d7da"
                    : statusColor === "warning"
                      ? "#fff3cd"
                      : "transparent",
              color:
                statusColor === "success"
                  ? "#155724"
                  : statusColor === "error"
                    ? "#721c24"
                    : statusColor === "warning"
                      ? "#856404"
                      : "inherit",
            }}
          />
        );
      },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      flex: 1,
      renderCell: (params) => {
        const createdByID = params.row.createdBy as string;
        const filteredData = licenseReferenceData?.createdBy?.find(
          (item) => item.value === createdByID
        );
        return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
      },
    },
    {
      field: "createdOn",
      headerName: "Created On",
      width: 150,
      renderCell: (params: any) => {
        const convertedDateTime = formatDateToConfiguredTimezone(params.value);
        return <span>{formatDate(convertedDateTime)}</span>;
      },
    },
  ];

  return (
    <Paper className="license-history-main current-license-detail">
      <Typography variant="h5">
        License History
      </Typography>

      <Box className="license-detail-main" mb={2}>
        <TextField
          //label="Search"
          variant="outlined"
          className="license-detail-search"
          fullWidth
          sx={{ flexGrow: 1, mr: 2 }}
          value={licenseSearchTerm}
          onChange={handleLicenseSearch}
          placeholder="Search by MAC Address,type,start date..."
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <img src={"/images/search.svg"} alt="Search" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataGrid
        rows={filteredLicense}
        columns={LicenseColumns}
        getRowId={(row) => row.id}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50, 100]}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        sx={{
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#FDF1E8",
          },
        }}
      />
    </Paper>
  );
};

export { LicenseHistoryDetail };
