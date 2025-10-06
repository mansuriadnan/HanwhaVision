import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import {
  CustomMapWidgetProps,
  IFloorPlanData,
  IMapPlanData,
} from "../../interfaces/IChart";
import { formatNumber } from "../../utils/formatNumber";

const CustomMapWidget: React.FC<CustomMapWidgetProps> = ({
  IsSetUpView,
  deleteWidget,
  cam,
}) => {
  const { widgetData } = cam as IMapPlanData | IFloorPlanData;

  return (
    <>
      {cam?.feature === "PeopleCount" && (
        <Box
          sx={{
            backgroundColor: "#33CCCC",
          }}
          className="common-map-inner-pop people-vehicle-map-widget"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

          <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/People_Count_Marker.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>
                {formatNumber(widgetData?.totalInCount ?? 0)}
              </Typography>
              <span>In</span>
            </Box>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>
                {formatNumber(widgetData?.totalOutCount ?? 0)}
              </Typography>
              <span>Out</span>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "slipAndFallDetection" && (
        <Box
          sx={{
            backgroundColor: "#2081FF",
          }}
          className="common-map-inner-pop"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

         <Box className="common-map-inner-pop-box">
            <IconButton sx={{ backgroundColor: "white" }}>
              <img
                src={"/images/dashboard/Slip___Fall_Detection.gif"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>{formatNumber(widgetData ?? 0)}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "VehicleCount" && (
        <Box
          sx={{
            backgroundColor: "#FD6050",
          }}
          className="common-map-inner-pop people-vehicle-map-widget"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

          <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/Map_Vehicle_In_Out.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>
                {formatNumber(widgetData?.totalInCount ?? 0)}
              </Typography>
              <span>In</span>
            </Box>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>
                {formatNumber(widgetData?.totalOutCount ?? 0)}
              </Typography>
              <span>Out</span>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "pedestriandetection" && (
        <Box
          sx={{
            backgroundColor: "#4953AC",
          }}
          className="common-map-inner-pop"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

          <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/Map_Pedestrian_Detection.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>{formatNumber(widgetData ?? 0)}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "vehiclequeuemanagement" && (
        <Box
          sx={{
            backgroundColor: "#8DCE00",
          }}
          className="common-map-inner-pop"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

         <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/Map_Vehicle_Queue_Analysis.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>{formatNumber(widgetData ?? 0)}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "vehiclespeeddetection" && (
        <Box
          sx={{
            backgroundColor: "#109400",
          }}
          className="common-map-inner-pop"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

          <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/Map_Speed_Violation.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>{formatNumber(widgetData ?? 0)}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "trafficjamdetection" && (
        <Box
          sx={{
            backgroundColor: "#FD8F00",
          }}
          className="common-map-inner-pop"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

          <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/Map_Traffic_Jam.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>{formatNumber(widgetData ?? 0)}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "ShoppingCartcounting" && (
        <Box
          sx={{
            backgroundColor: "#67CCD1",
          }}
          className="common-map-inner-pop"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

          <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/Map_Shopping_Cart_Counting.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>{formatNumber(widgetData ?? 0)}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      {cam?.feature === "Forkliftcounting" && (
        <Box
          sx={{
            backgroundColor: "#AFD852",
          }}
          className="common-map-inner-pop"
        >
          {IsSetUpView ? (
            <Box className="common-map-inner-pop-cross">
              <IconButton onClick={deleteWidget}>
                <img
                  src={"/images/close.svg"}
                  alt="close"
                  width={20}
                  height={20}
                  style={{ backgroundColor: "white" }}
                />
              </IconButton>
            </Box>
          ) : null}

          <Box className="common-map-inner-pop-box">
            <IconButton>
              <img
                src={"/images/dashboard/Map_Forklift_Counting.svg"}
                alt="setup"
                width={40}
                height={40}
              />
            </IconButton>
            <Box className="common-map-inner-pop-box-contain">
              <Typography>{formatNumber(widgetData ?? 0)}</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export { CustomMapWidget };
