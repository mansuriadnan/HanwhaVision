import React, { useEffect, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { IPeopleQueueEventsProps } from "../../../../interfaces/IChart";
// import PeopleQueueEventsIcon from "../../../../../public/images/dashboard/Queue_events_for_people.gif";
// import People_Queue_Events_High_Icon from "../../../../../public/images/People_Queue_Events_High_Icon.svg";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const PeopleQueueEvent1_1: React.FC<IPeopleQueueEventsProps> = ({
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
  const [peopleQueueCount, setPeopleQueueCount] = useState<number>(0);
  const [message, setmessage] = useState("Low");
  // const [ruleName, setruleName] = useState("");
  const { theme } = useThemeContext();

  const ruleCountMapRef = useRef<Record<number, Record<number, number>>>({});

  useEffect(() => {
    // getLiveData("PeopleQueueAnalysis", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      const liveData = JSON.parse(data);
      const { EventName, RuleIndex, count, state, deviceId } = liveData;

      if (EventName === "OpenSDK.WiseAI.QueueCountChanged") {
        if (!ruleCountMapRef.current[deviceId]) {
          ruleCountMapRef.current[deviceId] = {};
        }

        ruleCountMapRef.current[deviceId][RuleIndex] = count;

        const totalCount = Object.values(ruleCountMapRef.current)
          .flatMap((ruleMap) => Object.values(ruleMap))
          .reduce((sum, val) => sum + val, 0);

        setAnimate?.(true);
        setPeopleQueueCount(totalCount);
      }

      const alertMap: Record<string, string> = {
        "OpenSDK.WiseAI.QueueHigh": "High",
        "OpenSDK.WiseAI.QueueMedium": "Medium",
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

    onReceiveMessage("PeopleQueueAnalysis", handleSignalRMessage);
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
            <div className="people-queue-event">
              {/* Main content */}
              <Box className="people-queue-event-left">
                <img
                  src={"/images/dashboard/Queue_events_for_people.gif"}
                  style={{
                    width: "86px",
                    height: "86px",
                    objectFit: "contain",
                  }}
                />
                <Typography>Queue events</Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatNumber(peopleQueueCount)}
                </Typography>
              </Box>

              {/* Right-side tag (High) - OUTSIDE the square */}
              <Box className="people-queue-event-right">
                <img
                  src={"/images/People_Queue_Events_High_Icon.svg"}
                  style={{
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  }}
                />
                <Typography color="black" fontWeight={500}>
                  {message}
                </Typography>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of queue events : </Typography>
            <span> {formatNumber(peopleQueueCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnQueueeventsforpeople">
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
export { PeopleQueueEvent1_1 };
