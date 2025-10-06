import { Box, Grid, Typography } from "@mui/material";
import { VehicleByTypeProps } from "../../../../interfaces/IChart";
// import VehicleByType_BicycleIcon from "../../../../../public/images/dashboard/VehicleByType_Bicycle.gif";
// import VehicleByType_MotorCycle from "../../../../../public/images/dashboard/VehicleByType_MotorCycle.gif";
// import VehicleByType_Car from "../../../../../public/images/dashboard/VehicleByType_Car.gif";
// import VehicleByType_Bus from "../../../../../public/images/dashboard/VehicleByType_Bus.gif";
// import VehicleByType_Truck from "../../../../../public/images/dashboard/VehicleByType_Truck.gif";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleByType1_1: React.FC<VehicleByTypeProps> = ({
  vehicleByTypeCountData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const { theme } = useThemeContext();
  const vehicleTypes = [
    {
      label: "Truck",
      icon: "/images/dashboard/VehicleByType_Truck.gif",
      count: vehicleByTypeCountData?.truckInCount ?? 0,
    },
    {
      label: "Motorcycle",
      icon: "/images/dashboard/VehicleByType_MotorCycle.gif",
      count: vehicleByTypeCountData?.motorCycleInCount ?? 0,
    },
    {
      label: "Bus",
      icon: "/images/dashboard/VehicleByType_Bus.gif",
      count: vehicleByTypeCountData?.busInCount ?? 0,
    },
    {
      label: "Bicycle",
      icon: "/images/dashboard/VehicleByType_Bicycle.gif",
      count: vehicleByTypeCountData?.bicycleInCount ?? 0,
    },
    {
      label: "Car",
      icon: "/images/dashboard/VehicleByType_Car.gif",
      count: vehicleByTypeCountData?.carInCount ?? 0,
    },
  ];

  // const formatNumbers = (num: any) => {
  //   if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  //   if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  //   return num.toString();
  // };

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
            <div className="vehicle-by-type-data">
              <Grid className="vehicle-by-type-data-wrapper">
                {vehicleTypes.map((type) => (
                  <Grid item 
                  className="vehicle-by-type-data-wrapper-repeat"
                  sx={{ background : theme === 'light'? "" : "linear-gradient(270deg, #C3B110 0%, #726700 100%)"}}
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
                      <Typography variant="body2" fontWeight="500">
                        {type.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatNumber(type.count)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </div>
          </div>
        </Box>

        {/* Total Vehicles and Scan Icon */}
        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of vehicle : </Typography>
            <span>
              {" "}
              {formatNumber(vehicleByTypeCountData?.totalInVehicleCount || 0)}
            </span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnVehiclebyType">
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
export { VehicleByType1_1 };
