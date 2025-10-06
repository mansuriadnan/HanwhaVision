// import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { CustomButton } from "../../components/Reusable/CustomButton";
// import NoData from "../../../public/images/EmptyReport.gif";

interface EmptyReportPageProps {
    onAddReport: () => void;
}

const EmptyReportPage: React.FC<EmptyReportPageProps> = ({ onAddReport }) => {
    const backgroundStyle = {
        backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
    };

    return (
        <>
            <Box className="top-orange-head" style={backgroundStyle}>
            <Box className="top-orange-head-left">
              <Typography variant="h4">My Reports</Typography>
              <Typography>
                Configure your reports here.. 
              </Typography>
            </Box>
            </Box>
            <Box
                className="add-widget"
                sx={{
                    backgroundImage: "url('images/reports_background.svg')", // Relative path from public folder
                }}
            >
                <Box className="add-widget-wrapper">
                    <img src={"/images/EmptyReport.gif"} alt="Animated GIF" />
                    <h3 style={{fontSize:"20px !important"}}>Add Report</h3>
                    <p>There are no reports configured for you yet. <br/> To create a new report, please click the button below.</p>
                    <CustomButton variant="outlined" onClick={onAddReport}>
                        <img src={"/images/adddevice.svg"} alt="Add Devices" />
                        Add Report
                    </CustomButton>
                </Box>
            </Box>
        </>
    )
}
export { EmptyReportPage }