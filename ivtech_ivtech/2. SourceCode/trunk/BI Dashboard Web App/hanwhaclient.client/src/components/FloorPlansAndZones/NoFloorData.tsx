import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { AddFloorService } from "../../services/floorPlanService";
import { COMMON_CONSTANTS, REGEX } from "../../utils/constants";
import { useForm } from "react-hook-form";
import { IAddFloor } from "../../interfaces/IFloorAndZone";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { FloorAndZoneList } from "./FloorAndZoneList";
import { CustomTextFieldWithButton } from "../Reusable/CustomTextFieldWithButton";

const NoFloorData: React.FC = () => {
  const [showNoData, setShowNoData] = useState(true);

  const { control, handleSubmit, reset } = useForm<IAddFloor>({
    defaultValues: {
      floorName: "",
    },
  });

  const AddFloorPlan = async (data: any) => {
    try {
      const param = {
        floorPlanName: data.floorName,
        id: "",
      };

      var result: any = await AddFloorService(param);
      if (result && result.isSuccess) {
        // setShowList(true);
        setShowNoData(false);
        reset();
      }
      // console.log("result", result);
    } catch (error) {
      console.error("Submission Error:", error);
    }
  };

  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  return (
    <>
      {showNoData ? (
        <>
          <div className="top-orange-head" style={backgroundStyle}>
            <Box className="top-orange-head-left">
              <Typography variant="h4">Floor Plans & Zones</Typography>
              <Typography>
                Configure your floor plans, define their associated zones, and
                manage camera configurations on the specific zone here.
              </Typography>
            </Box>
          </div>

          <Box
            className="add-widget"
            sx={{
              backgroundImage: "url('images/no-data.png')",
            }}
          >
            <Box className="add-widget-wrapper">
              <img src={"/images/noData.gif"} alt="Animated GIF" />
              <h3>No data available</h3>
              <p>
                No data available to load floor plans, their associated zones,
                or <br></br>
                configured cameras for the specified zones.
              </p>

              {HasPermission(LABELS.CanAddOrUpdateFloor) && (
                <Box
                  component="form"
                  onSubmit={handleSubmit(AddFloorPlan)}
                  sx={{ marginTop: 2 }}
                >
                  <CustomTextFieldWithButton
                    name="floorName"
                    control={control}
                    rules={{
                      required: "Floor name is required",
                      pattern: {
                        value: REGEX.Floor_Zone_Name_Regex,
                        message:
                          "Floor Plan name must only contain letters and numbers. Special characters are not allowed.",
                      },
                      maxLength: {
                        value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                        message: "Floor name cannot exceed 50 characters",
                      },
                      minLength: {
                        value: COMMON_CONSTANTS.MIN_TEXT_FIELD_LENGTH,
                        message: "Floor name must have atleast 3 characters.",
                      },
                    }}
                    placeholder="Enter floor plan"
                    customStyles={{ width: 350 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </>
      ) : (
        <FloorAndZoneList showNoData={showNoData}></FloorAndZoneList>
      )}
    </>
  );
};

export { NoFloorData };
