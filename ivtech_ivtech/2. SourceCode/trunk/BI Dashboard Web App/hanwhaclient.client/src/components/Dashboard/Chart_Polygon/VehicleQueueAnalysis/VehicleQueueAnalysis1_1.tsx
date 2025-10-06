import React, { useEffect, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { IVQAProps } from "../../../../interfaces/IChart";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleQueueAnalysis1_1: React.FC<IVQAProps> = ({
  floor,
  zones,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate,
}) => {
  const [vehicleQueueCount, setVehicleQueueCount] = useState<number>(0);
  const [message, setmessage] = useState("Low");
  const [ruleName, setruleName] = useState("");
  const { theme } = useThemeContext();

  const ruleCountMapRef = useRef<Record<number, Record<number, number>>>({});

  useEffect(() => {
    // getLiveData("VehicleQueueAnalysis", floor as string[], zones as string[]);

    const handleSignalRMessage = (data :any) => {
      const liveData = JSON.parse(data);
      console.log("VehicleQueueAnalysis->",liveData);
      const { EventName, RuleIndex, RuleName, count, state, deviceId } =
        liveData;

      if (EventName === "OpenSDK.WiseAI.VehicleQueueCountChanged") {
        if (!ruleCountMapRef.current[deviceId]) {
          ruleCountMapRef.current[deviceId] = {};
        }

        ruleCountMapRef.current[deviceId][RuleIndex] = count;

        const totalCount = Object.values(ruleCountMapRef.current)
          .flatMap((ruleMap) => Object.values(ruleMap))
          .reduce((sum, val) => sum + val, 0);

        setAnimate?.(true);
        setVehicleQueueCount(totalCount);
      }

      const alertMap: Record<string, string> = {
        "OpenSDK.WiseAI.VehicleQueueHigh": "High",
        "OpenSDK.WiseAI.VehicleQueueMedium": "Medium",
      };

      if (EventName in alertMap) {
        if (state === true) {
          setmessage(alertMap[EventName]); // Show High or Medium
          setruleName(RuleName); // Show the Rule name
        } else {
          // If state is false, revert to default "Low"
          setmessage("Low");
          setruleName(""); // Clear rule name
        }
      }
    };

    onReceiveMessage("VehicleQueueAnalysis", handleSignalRMessage);
  }, [floor, zones]);

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
            <div className="vehicle-queue-image">
              <Box className="vehicle-image-left">
                <img src={theme === 'light' ? "/images/car.png" : "/images/dark-theme/car.png"} alt="vehicle" />
              </Box>
              <Box>
                <Box className="vehicle-content-top">
                  <Typography>{formatNumber(vehicleQueueCount)}</Typography>
                  <Typography>Vehicle Queue Analysis</Typography>
                </Box>
                <Box className="vehicle-content-bottom">
                  <Typography>{message}</Typography>
                  <Typography>{ruleName} </Typography>
                </Box>
              </Box>
            </div>
          </div>
        </Box>
        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of vehicle queue : </Typography>
            <span> {formatNumber(vehicleQueueCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnVehicleQueueAnalysis">
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

export { VehicleQueueAnalysis1_1 };
