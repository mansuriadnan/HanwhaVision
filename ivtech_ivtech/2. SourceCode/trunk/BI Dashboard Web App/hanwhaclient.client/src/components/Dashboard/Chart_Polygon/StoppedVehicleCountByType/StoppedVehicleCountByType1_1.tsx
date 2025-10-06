import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { IStoppedVehicleCountByTypeProps } from "../../../../interfaces/IChart";
// import VehicleByType_BicycleIcon from "../../../../../public/images/dashboard/VehicleByType_Bicycle.gif";
// import VehicleByType_MotorCycle from "../../../../../public/images/dashboard/VehicleByType_MotorCycle.gif";
// import VehicleByType_Car from "../../../../../public/images/dashboard/VehicleByType_Car.gif";
// import VehicleByType_Bus from "../../../../../public/images/dashboard/VehicleByType_Bus.gif";
// import VehicleByType_Truck from "../../../../../public/images/dashboard/VehicleByType_Truck.gif";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const StoppedVehicleCountByType1_1: React.FC<
  IStoppedVehicleCountByTypeProps
> = ({
  floor,
  zones,
  stoppedVehicleCountByTypeData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate
}) => {
    const { theme } = useThemeContext();
    const [vehicleTypes, setVehicleTypes] = useState([
      {
        label: "Truck",
        key: "truck",
        icon: theme === 'light' ? "/images/dashboard/VehicleByType_Truck.gif" : "/images/dark-theme/dashboard/VehicleByType_Truck.gif",
        count: stoppedVehicleCountByTypeData?.truck ?? 0,
        backgroundColor:theme === 'light' ?
          "linear-gradient(270deg, #FFE601 0%, #FFFCDC 45.67%, #FFFFFF 100%);"
          :
          "linear-gradient(270deg, #AF9E00 0%, #000000 100%)",
      },
      {
        label: "Motorcycle",
        key: "motorcycle",
        icon: theme === 'light' ? "/images/dashboard/VehicleByType_MotorCycle.gif" : "/images/dark-theme/dashboard/VehicleByType_MotorCycle.gif",
        count: stoppedVehicleCountByTypeData?.motorcycle ?? 0,
        backgroundColor:theme === 'light' ?
          "linear-gradient(270deg, #A48DFF 0%, #EBE6FF 45.67%, #FFFFFF 100%);"
          :
          "linear-gradient(270deg, #9378FF 0%, #000000 100%)",
      },
      {
        label: "Bus",
        key: "bus",
        icon:  theme === 'light' ? "/images/dashboard/VehicleByType_Bus.gif" : "/images/dark-theme/dashboard/VehicleByType_Bus.gif" ,
        count: stoppedVehicleCountByTypeData?.bus ?? 0,
        backgroundColor:theme === 'light' ?
          "linear-gradient(270deg, #006FFF 0%, #E1EEFF 45.67%, #FFFFFF 100%);"
          :
          "linear-gradient(270deg, #4E8FE3 0%, #000000 100%)",
      },
      {
        label: "Bicycle",
        key: "cycle",
        icon:  theme === 'light' ? "/images/dashboard/VehicleByType_Bicycle.gif" : "/images/dark-theme/dashboard/VehicleByType_Bicycle.gif",
        count: stoppedVehicleCountByTypeData?.cycle ?? 0,
        backgroundColor: theme === 'light' ?
          "linear-gradient(270deg, #BBFF00 0%, #F8FFE3 45.67%, #FFFFFF 100%);"
          :
          "linear-gradient(270deg, #B7DF4A 0%, #000000 100%)",
      },
      {
        label: "Car",
        key: "car",
        icon: theme === 'light' ? "/images/dashboard/VehicleByType_Car.gif" : "/images/dark-theme/dashboard/VehicleByType_Car.gif" ,
        count: stoppedVehicleCountByTypeData?.car ?? 0,
        backgroundColor: theme === 'light' ?
          "linear-gradient(270deg, #CCCCCC 0%, #FCFCFC 45.67%, #FFFFFF 100%);"
          :
          "linear-gradient(270deg, #938E8E 0%, #464545 48.08%, #000000 96.15%)",
      },
    ]); 

    useEffect(() => {
      // getLiveData("StoppedVehicleDetection", floor as string[], zones as string[]);

      const handleSignalRMessage = (data: any) => {
        const liveData = JSON.parse(data);

        if (liveData?.state === true && liveData?.VehicleType) {
          const vehicleKey = liveData.VehicleType.toLowerCase();
          setAnimate?.(true);
          setVehicleTypes((prevTypes) =>
            prevTypes.map((type) =>
              type.key === vehicleKey ? { ...type, count: type.count + 1 } : type
            )
          );
        }
      };

      onReceiveMessage("StoppedVehicleDetection", handleSignalRMessage);
    }, [floor, zones]);

    const totalCount = vehicleTypes.reduce(
      (sum, vehicle) => sum + vehicle.count,
      0
    );

    const formatNumbers = (num: any) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    };

    return (
      <Box sx={{ width: customizedWidth }}>
        <Box className="widget-main-wrapper">
          <Box className="widget-main-header">
            <Typography variant="h6" component="h2">
              {displayName}
            </Typography>
          </Box>

          <Box className="widget-main-body">
            <div className="widget-data-wrapper">
              <div className="stopped-vehicle-count vehicle-by-type-data">
                <Grid className="vehicle-by-type-data-wrapper">
                  {vehicleTypes.map((type, index) => (
                    <Grid
                      item
                      className="vehicle-by-type-data-wrapper-repeat"
                      key={index}
                      sx={{ background: type.backgroundColor, borderColor: "#ECECEC" }}
                    >
                      <Box className="vehicle-by-type-data-image">
                        <img
                          src={type.icon}
                          alt={type.label}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                      <Box className="vehicle-by-type-data-main">
                        <Typography variant="body2">{type.label}</Typography>
                        <Typography variant="h6">
                          {formatNumbers(type.count)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </div>
          </Box>

          <Box className="widget-main-footer">
            <Box className="widget-main-footer-value">
              <Typography>Total no of stopped vehicle : </Typography>
              <span> {formatNumber(totalCount)}</span>
            </Box>
            {!openZoomDialog ? (
              <Box
                className="widget-main-footer-zoom-i"
                onMouseEnter={() => setIsDraggable?.(true)}
                onMouseLeave={() => setIsDraggable?.(false)}
              >
                <img
                  src={theme === 'light' ? "/images/dashboard/drag.svg" : "/images/dark-theme/dashboard/drag.svg"}
                  alt="vehicle"
                  width={35}
                  height={35}
                />
              </Box>
            ) : null}
            {!openZoomDialog ? (
              <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnStoppedVehicleCountTime">
                <img
                  src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                  alt="vehicle"
                  width={35}
                  height={35}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    );
  };
export { StoppedVehicleCountByType1_1 };
