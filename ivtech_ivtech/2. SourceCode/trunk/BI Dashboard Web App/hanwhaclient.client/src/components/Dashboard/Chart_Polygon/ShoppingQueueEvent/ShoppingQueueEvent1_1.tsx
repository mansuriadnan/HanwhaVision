import React, { useEffect, useState, useRef } from "react";
import { IShopptingQueueEventProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const ShoppingQueueEvent1_1: React.FC<IShopptingQueueEventProps> = ({
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
  const [shoppingCartQueueCount, setShoppingCartQueueCount] =
    useState<number>(0);
  const [message, setmessage] = useState("Low");
  // const [ruleName, setruleName] = useState("");

  const ruleCountMapRef = useRef<Record<number, Record<number, number>>>({});
  const { theme } = useThemeContext();

  useEffect(() => {
    // getLiveData("ShoppingCartQueueAnalysis", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      const liveData = JSON.parse(data);
      const { EventName, RuleIndex, count, state, deviceId } = liveData;

      if (EventName === "OpenSDK.WiseAI.ShoppingCartQueueCountChanged") {
        if (!ruleCountMapRef.current[deviceId]) {
          ruleCountMapRef.current[deviceId] = {};
        }

        ruleCountMapRef.current[deviceId][RuleIndex] = count;

        const totalCount = Object.values(ruleCountMapRef.current)
          .flatMap((ruleMap) => Object.values(ruleMap))
          .reduce((sum, val) => sum + val, 0);

        setAnimate?.(true);
        setShoppingCartQueueCount(totalCount);
      }

      const alertMap: Record<string, string> = {
        "OpenSDK.WiseAI.ShoppingCartQueueHigh": "High",
        "OpenSDK.WiseAI.ShoppingCartQueueMedium": "Medium",
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

    onReceiveMessage("ShoppingCartQueueAnalysis", handleSignalRMessage);
  }, [floor, zones]);

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <Box className="widget-main-body shopping-queue-event">
          <div className="widget-data-wrapper">
            <div className="shopping-queue-event">
              <Box className="shopping-queue-event-wrapper">
                <Box className="shopping-queue-event-top">
                  <div className="shopping-queue-event-top-inner">
                    <img src="/images/up-arrow.png" alt="shopping cart" />
                    <Typography>{message}</Typography>
                  </div>
                </Box>

                <Box className="shopping-queue-event-bottom">
                  <Box className="shopping-queue-event-left">
                    <img
                      src="/images/dashboard/Shopping_Cart_Counting.gif"
                      alt="shopping cart"
                      width={50}
                      height={50}
                      // style={{ objectFit: "contain" }}
                    />
                  </Box>
                  <Box className="shopping-queue-event-right">
                    <Typography>Shopping Cart Counting</Typography>
                    <Typography variant="h6">
                      {formatNumber(shoppingCartQueueCount)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of queue events : </Typography>
            <span> {formatNumber(shoppingCartQueueCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnQueueeventsforshoppingcart">
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

export { ShoppingQueueEvent1_1 };
