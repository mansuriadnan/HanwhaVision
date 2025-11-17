import { Box, Container, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
// import {
//   MachineIdDisplay,
//   OperationalTimePicker,
//   OperationalTiming,
//   SmtpSetting,
//   UploadCustomerLogo,
//   GoogleMapApiKey
// } from "../../components";

import { OperationalTimePicker } from "../../components/Setting/OperationalTimePicker";
import { SmtpSetting } from "../../components/Setting/SmtpSetting";
import { UploadCustomerLogo } from "../../components/Setting/UploadCustomerLogo";
import { GoogleMapApiKey } from "../../components/Setting/GoogleMapApiKey";

import { GetClientSettingsData } from "../../services/settingService";
import { FTPSetup } from "../../components/Setting/FTPSetup";
import { UploadSSLCertificate } from "../../components/Setting/UploadSSLCertificate";
import { ReportScheduler } from "../../components/Setting/ReportScheduler";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";

const SettingGeneralPage = () => {
  const [settingsData, setSettingsData] = useState<any>(null);
  useEffect(() => {
    const fetchClientSettings = async () => {
      try {
        const response: any = await GetClientSettingsData();
        if (response?.isSuccess !== false) {
          setSettingsData(response);
        }
      } catch (err) {
        console.error("Error fetching client settings", err);
      }
    };

    fetchClientSettings();
  }, []);


  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  return (
    <Container sx={{}} maxWidth={false}>
      <div className="top-orange-head" style={backgroundStyle} >
        <Box className="top-orange-head-left">
          <Typography variant="h4">
            General
          </Typography>
          <Typography>
            Configure your general settings here...
          </Typography>
        </Box>
      </div>

      <Stack className="generals-screen-data">
        {/* <MachineIdDisplay /> */}   {/* Temporary added */}
        <div className="generals-screen-data-only">
          {
            HasPermission(LABELS.View_and_Configure_SMTP_Setup_Details) &&
            <SmtpSetting smtpSettings={settingsData?.smtpSettings} />

          }
          {
            HasPermission(LABELS.View_and_Configure_Report_Scheduler) &&
            <ReportScheduler reportSchSettings={settingsData?.reportSchedule} ></ReportScheduler>
          }
          {
            HasPermission(LABELS.View_and_Configure_FTP_Setup_Details) &&
            <FTPSetup FTPSettings={settingsData?.ftpConfiguration} />
          }
          {
            HasPermission(LABELS.CanUploadClientLogo) &&
            <UploadCustomerLogo logoUploaded={settingsData?.logo} />
          }
          {
            HasPermission(LABELS.CanUploadSSLCertificate) &&
            <UploadSSLCertificate sslCertificateFileName={settingsData?.sslCertificateFileName} />
          }
          {
            HasPermission(LABELS.CanClientOperationalTiming) &&
            //  <OperationalTiming initialTimeZone={settingsData?.timeZone}/>
            <OperationalTimePicker operationalTiming={settingsData?.operationalTiming} />
          }
          {
            HasPermission(LABELS.CanGoogleMapApiKey) &&
            <GoogleMapApiKey googleApiKey={settingsData?.googleApiKey} />
          }
        </div>
      </Stack>
    </Container>
  );
};

export default SettingGeneralPage;
