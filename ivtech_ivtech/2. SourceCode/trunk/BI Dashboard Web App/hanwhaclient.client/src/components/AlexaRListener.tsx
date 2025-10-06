import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { GetDashboardDesign } from "../services/dashboardService";
import { showToast } from "./Reusable/Toast";
import { toast } from "react-toastify";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const widgetClickMap: Record<string, string> = {
  //Camera
  "Camera Online/Offline": "zoomWidgetBtnOnlineoffline",
  "Modal Types": "zoomWidgetBtnModalTypes",
  "Feature Types": "zoomWidgetBtnFeatureTypes",

  //Site
  "Capacity Utilization for People": "zoomWidgetBtnCapacityUtilizationforPeople",
  "Capacity Utilization for Vehicle": "zoomWidgetBtnCapacityUtilizationforVehicle",
  "Zone Wise Capacity Utilization for People": "zoomWidgetBtnZoneWiseCapacityUtilizationforPeople",
  "Zone Wise Capacity Utilization for Vehicle": "zoomWidgetBtnZoneWiseCapacityUtilizationforVehicle",

  //People
  "Slip & Fall Detection": "zoomwidgetBtnSlipAndFall",
  "People": "zoomwidgetBtnPeople",
  "Average People Counting": "zoomwidgetBtnAveragePeopleCounting",
  "Gender": "zoomwidgetBtnGender",
  "Cumulative People Count": "zoomwidgetBtnCumulativePeopleCount",
  "New vs Total Visitors": "zoomwidgetBtnNewVsTotalVisitors",
  "Safety Measures": "zoomwidgetBtnSafetyMeasures",
  "Zone wise People Counting": "zoomwidgetBtnZonewisePeopleCounting",

  //Vehicle
  "Vehicle by Type": "zoomwidgetBtnVehiclebyType",
  "Vehicle in Wrong Direction": "zoomwidgetBtnVehicleInWrongDirection",
  "Vehicle U Turn detection": "zoomwidgetBtnVehicleUTurnDetection",
  "Pedestrian Detection": "zoomwidgetBtnPedestrianDetection",
  "Vehicle": "zoomwidgetBtnVehicle",
  "Average Vehicle Counting": "zoomwidgetBtnAverageVehicleCounting",
  "Vehicle Queue Analysis": "zoomwidgetBtnVehicleQueueAnalysis",
  "Stopped Vehicle Count Time": "zoomwidgetBtnStoppedVehicleCountTime",
  "Vehicle Turning Movement counts": "zoomwidgetBtnVehicleTurningMovementCounts",
  "Speed Violation by Vehicle": "zoomwidgetBtnSpeedViolationbyVehicle",
  "Traffic Jam by Day": "zoomwidgetBtnTrafficJambyDay",
  "Vehicle Detection Heatmap": "zoomwidgetBtnVehicleDetectionHeatmap",

  //Retail
  "Shopping Cart Counting": "zoomwidgetBtnShoppingCartCounting",
  "Queue events for shopping cart": "zoomwidgetBtnQueueeventsforshoppingcart",
  "Queue events for people": "zoomwidgetBtnQueueeventsforpeople",
  "Blocked exit detection": "zoomwidgetBtnBlockedexitdetection",
  "Shopping Cart Heatmap": "zoomwidgetBtnShoppingCartHeatmap",

  //fectory
  "Counting for forklift": "zoomwidgetBtnCountingforforklift",
  "Queue events for forklift": "zoomwidgetBtnQueueeventsforforklift",
  "Factory Blocked exit detection": "zoomwidgetBtnFactoryBlockedexitdetection",
  "Factory Block exit detection": "zoomwidgetBtnFactoryBlockedexitdetection",
  "Detect Forklifts": "zoomwidgetBtnDetecForklifts",
  "Forklift Heatmap": "zoomwidgetBtnForkliftHeatmap",
  "Forklift Speed Detection": "zoomwidgetBtnForkliftSpeedDetection",

  //Floor plan 
  "Floor Plan": "zoomwidgetBtnFloorPlan"

};

const AlexaRListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}NotificationHub`, {
        accessTokenFactory: () => token || "",
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log(" Connected to SignalR"))
      .catch((err) => {
        console.error("Connection failed:", err)
      }
      );

    connection.on("AlexaData", async (rawData) => {
      try {
        const parsed =
          typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        const { dashboardId, widgetId, closewidgetId } = parsed;
        console.log(" Received AlexaData:", parsed);

        // If only widgetId is received (no dashboardId)
        if (!dashboardId && widgetId) {
          const currentDashboardId = new URL(
            window.location.href
          ).searchParams.get("id");
          if (currentDashboardId) {
            const correctedWidgetName = decodeVoiceString(parsed.widgetId);
            await fetchDashboardDesign(currentDashboardId, correctedWidgetName);
          } else {
            showToast("Please Select A Dashboard", "error");
          }
          return;
        }

        // If dashboardId exists, navigate
        if (dashboardId) {
          localStorage.setItem("activeRoute", `/dashboard?id=${dashboardId}`);
          navigate(`/dashboard?id=${dashboardId}`);

          // If both dashboard and widget are present
          if (widgetId) {
            // Wait for the dashboard page and DOM to fully load
            setTimeout(() => {
              const correctedWidgetName = decodeVoiceString(parsed.widgetId);
              fetchDashboardDesign(dashboardId, correctedWidgetName);
            }, 1500); // Adjust delay as needed (based on page load speed)
          }
        }
        if (closewidgetId) {
          if (typeof window.closeDialog === "function") {

            if (typeof window.closeDialog === "function") {
              window.closeDialog();
            }

          } else {
            toast.error("Encountered an error while attempting to close the widget.please try again.");
          }
        }
      } catch (err) {
        console.error("SignalR JSON parse error:", err);
      }
    });

    return () => {
      connection.stop();
    };
  }, [navigate]);

  const fetchDashboardDesign = async (
    dashboardId: string,
    chartName: string
  ) => {
    try {
      const data: any = await GetDashboardDesign(dashboardId);
      const record = data.find((item: any) => item.id === dashboardId);
      const json = record?.dashboardPreferenceJson;

      if (json && json !== "[]" && json !== "{}") {
        const parsedLayouts = JSON.parse(json);
        // const normalize = (str: string) =>
        //   str?.replace(/\s+/g, "").toLowerCase();
        const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, "").trim();

        // const item = parsedLayouts.find(
        //   (layoutItem: any) =>
        //    ( normalize(layoutItem.chartName) === normalize(chartName) ||
        //     normalize(layoutItem.displayName) === normalize(chartName))
        //     // normalize(layoutItem.chartName).includes(normalize(chartName)) ||
        //     // normalize(layoutItem.displayName).includes(normalize(chartName))
        // );

        let item = parsedLayouts.find(

          (layoutItem: any) =>

            normalize(layoutItem.chartName) === normalize(chartName) ||

            normalize(layoutItem.displayName) === normalize(chartName)

        );

        // If not found, try partial match (includes)

        if (!item) {

          item = parsedLayouts.find(

            (layoutItem: any) =>

              normalize(layoutItem.chartName).includes(normalize(chartName)) ||

              normalize(layoutItem.displayName).includes(normalize(chartName))

          );

        }


        console.log(" Matched Widget Item:", item);

        const widgetId = widgetClickMap[item?.chartName ?? ""];
        if (widgetId) {
          document.getElementById(widgetId)?.click();
        } else {
          showToast("No widget Found", "error");
        }
      }
    } catch (error) {
      console.error(" Failed to fetch dashboard design:", error);
    }
  };

  const decodeVoiceString = (input: string): string => {
    return input
      .replace(/\bslash\b/gi, "/") // Convert word "slash" to "/"
      .replace(/\s+/g, " ")
      .replace(/and\b/gi, "&") // Normalize spaces
      .replace(/versus/g, "vs")
      .trim();
  };

  return null;
};

export default AlexaRListener;
