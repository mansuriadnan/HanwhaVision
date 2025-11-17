import React, { useEffect, useState, useRef } from "react";
import { IForkliftQueueEventProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const ForkliftQueueEvent1_1: React.FC<IForkliftQueueEventProps> = ({
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
  const [forkliftQueueCount, setForkliftQueueCount] = useState<number>(0);
  const [message, setmessage] = useState("Low");
  // const [ruleName, setruleName] = useState("");

  const ruleCountMapRef = useRef<Record<number, Record<number, number>>>({});
  const { theme } = useThemeContext();

  useEffect(() => {
    // getLiveData("ForkliftQueueAnalysis", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      const liveData = JSON.parse(data);
      const { EventName, RuleIndex, count, state, deviceId } = liveData;

      if (EventName === "OpenSDK.WiseAI.ForkliftQueueCountChanged") {
        if (!ruleCountMapRef.current[deviceId]) {
          ruleCountMapRef.current[deviceId] = {};
        }

        ruleCountMapRef.current[deviceId][RuleIndex] = count;

        const totalCount = Object.values(ruleCountMapRef.current)
          .flatMap((ruleMap) => Object.values(ruleMap))
          .reduce((sum, val) => sum + val, 0);

        setAnimate?.(true);
        setForkliftQueueCount(totalCount);
      }

      const alertMap: Record<string, string> = {
        "OpenSDK.WiseAI.ForkliftQueueHigh": "High",
        "OpenSDK.WiseAI.ForkliftQueueMedium": "Medium",
      };

      if (EventName in alertMap) {
        if (state === true) {
          setmessage(alertMap[EventName]); // Show High or Medium
          // setruleName(RuleName); // Show the Rule name
        } else {
          // If state is false, revert to default "Low"
          setmessage("Low");
          // setruleName(""); // Clear rule name
        }
      }
    };

    onReceiveMessage("ForkliftQueueAnalysis", handleSignalRMessage);
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
            <div className="forklift-queue-event">
              <Box className="forklift-queue-event-full-row">
                <img
                  src="/images/dashboard/Queue_forklift.svg"
                  alt="shopping cart"
                  style={{width:"100%", height:"100%"}}
                />
              </Box>
              <Box className="forklift-queue-event-two-column">
                <Box className="forklift-queue-event-box">
                  <Typography>{formatNumber(forkliftQueueCount)}</Typography>
                  <Typography>forklift</Typography>
                </Box>
                <Box className="forklift-queue-event-box">
                  <img src="/images/up-up-up.png" alt="shopping cart"  style={{width:"28px"}}/>
                  {/* <Typography>{formatNumber(200)}</Typography> */}
                  <Typography>{message}</Typography>
                </Box>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total queue events for forklift : </Typography>
            <span> {formatNumber(forkliftQueueCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnQueueeventsforforklift">
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

export { ForkliftQueueEvent1_1 };
