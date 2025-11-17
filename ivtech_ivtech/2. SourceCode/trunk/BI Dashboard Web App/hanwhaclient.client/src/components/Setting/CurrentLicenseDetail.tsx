import React, { useEffect, useState } from "react";
import { Grid, Box, Typography, Paper } from "@mui/material";
import { ILicenseData } from "../../interfaces/ILicense";
import { GetCurrentLicenseDetailService } from "../../services/settingService";
import { formatDateDDMMYY } from "../../utils/dateUtils";

const CurrentLicenseDetail = () => {
  const [license, setLicense] = useState<ILicenseData | null>(null);
  // console.log(`license details => `, license);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await GetCurrentLicenseDetailService();
        if (response !== null) {
          setLicense(response as ILicenseData);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const boxStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    minHeight: "80px",
    minWidth: "130px",
  };

  const items = license
    ? [
        { label: "Product Name", value: "Vision Insight", color: "#FF8A00" },
        { label: "License Version", value: "1.0.0", color: "#FF8A00" },
        {
          label: "Type",
          value: license.licenseType == null ? "-" : license.licenseType,
          color: "#2DB400",
        },
        {
          label: "Camera Utilized",
          value: `${license.utilizedCamera}/${license.cameras}`,
          color: "#FF8A00",
        },
        {
          label: "User Utilized",
          value: `${license.utilizedUser}/${license.users}`,
          color: "#FF8A00",
        },
        {
          label: "Start Date",
          value: formatDateDDMMYY(license.startDate),
          color: "#FF8A00",
        },
        {
          label: "End Date",
          value: formatDateDDMMYY(license.expiryDate),
          color: "#FF8A00",
        },
      ]
    : [];

  return (
    <Paper className="current-license-detail">
      <Typography variant="h5">Current License Detail</Typography>
      <Grid container spacing={2} wrap="wrap">
        {items.map((item, index) => (
          <Grid key={index} item xs={6} sm={4} md={3} lg={1.7}>
            <Box sx={boxStyle} className="current-license-detail-box">
              <Typography variant="body2" fontWeight={500}>
                {item.label}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color={item.color}
                mt={1}
              >
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export { CurrentLicenseDetail };
