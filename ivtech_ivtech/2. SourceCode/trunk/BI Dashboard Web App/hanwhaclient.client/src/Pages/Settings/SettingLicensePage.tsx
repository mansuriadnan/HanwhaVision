import { Box, Button, Container, Drawer, IconButton, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
// import { CurrentLicenseDetail, CustomButton, LicenseHistoryDetail, UploadClientLicenseAndPem } from "../../components";
// import { CurrentLicenseDetail } from "../../components/Settings/CurrentLicenseDetail";
// import { LicenseHistoryDetail } from "../../components/Settings/LicenseHistoryDetail";
// import { UploadClientLicenseAndPem } from "../../components/Settings/UploadClientLicenseAndPem";
import { CustomButton } from "../../components/Reusable/CustomButton";
import { CurrentLicenseDetail } from "../../components/Setting/CurrentLicenseDetail";
import { LicenseHistoryDetail } from "../../components/Setting/LicenseHistoryDetail";

import { GridCloseIcon } from "@mui/x-data-grid";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { ILicenseHistory, ILicenseHistoryReferenceData } from "../../interfaces/ILicense";
import { GetAllLicenseHistoryService } from "../../services/settingService";
import { useThemeContext } from "../../context/ThemeContext";
import { UploadClientLicenseAndPem } from "../../components/Setting/UploadClientLicenseAndPem";
// import NoLicense from "../../../public/images/No_license.gif";

const SettingLicensePage = () => {
  const [isOpenAddLicenseDrawer, setIsOpenAddLicenseDrawer] = useState(false);
  const [licenseHistory, setLicenseHistory] = useState<ILicenseHistory[]>([]);
  const [licenseReferenceData, setLicenseReferenceData] =
    useState<ILicenseHistoryReferenceData>({
      createdBy: [],
    });
  const { theme } = useThemeContext();
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const response: any = await GetAllLicenseHistoryService();
      setLicenseHistory(response.data as ILicenseHistory[]);
    
      setLicenseReferenceData(
        response.referenceData as ILicenseHistoryReferenceData
      );
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  };

  const handleCloseDrawer = () => {
    setIsOpenAddLicenseDrawer(false);
  };


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
            License
          </Typography>
          <Typography>
            Configure your license settings here...
          </Typography>

        </Box>
        {licenseHistory.length > 0 && HasPermission(LABELS.Upload_New_License) && (
          <CustomButton
            // size="small"
            variant="outlined"
            customStyles={{
              background: "#FFFFFF",
              color: "#090909",
              borderRadius: 5,
            }}
            onClick={() => setIsOpenAddLicenseDrawer(true)}
          >
            <img src={"/images/adddevice.svg"} alt="Add License" /> Add License
          </CustomButton>
        )}
      </div>
      {HasPermission(LABELS.View_License_Details_and_History) && licenseHistory.length > 0 ? (
        <Stack spacing={4} mt={4}>
          <CurrentLicenseDetail />
          <LicenseHistoryDetail
            licenseHistory={licenseHistory}
            setLicenseHistory={setLicenseHistory}
            licenseReferenceData={licenseReferenceData}
            setLicenseReferenceData={setLicenseReferenceData}
          />
        </Stack>
      ) : (
        <Box
          className="add-widget"
          sx={{
            backgroundImage: "url('images/Add_License.png')", // Relative path from public folder
          }}
        >
          <Box className="add-widget-wrapper">
            <img src={theme === 'light' ? "/images/No_license.gif" : '/images/dark-theme/No_license.gif'} alt="Animated GIF" />
            <h3>Add License</h3>
            <p>There are no license configured for you yet.
              <br />To upload your license, please click the button below</p>
            <CustomButton variant="outlined"
              onClick={() => setIsOpenAddLicenseDrawer(true)}
            >
              <img src={"/images/adddevice.svg"} alt="Add Devices" />
              Add License
            </CustomButton>
          </Box>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={isOpenAddLicenseDrawer}
        onClose={handleCloseDrawer}
        className="cmn-pop"
        ModalProps={{
          onClose: (event, reason) => {
            if (reason !== 'backdropClick') {
              setIsOpenAddLicenseDrawer(false);
            }
          }
        }}
      >

        <Box className="cmn-pop-head">
          <Typography variant="h6">  Add License</Typography>
          <IconButton onClick={handleCloseDrawer}>
            <GridCloseIcon />
          </IconButton>
        </Box>
        <UploadClientLicenseAndPem onClose={handleCloseDrawer} />
      </Drawer>
    </Container>

  );
};

export default SettingLicensePage;
