import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetDashboardDesign } from "../services/dashboardService";
import { showToast } from "./Reusable/Toast";
import { toast } from "react-toastify";

// same mapping you already have
const widgetClickMap: Record<string, string> = {
    "Camera Online/Offline": "zoomWidgetBtnOnlineoffline",
    "Model Types": "zoomWidgetBtnModalTypes",
    "Feature Types": "zoomWidgetBtnFeatureTypes",
    "Capacity Utilization for People": "zoomWidgetBtnCapacityUtilizationforPeople",
    "Capacity Utilization for Vehicle": "zoomWidgetBtnCapacityUtilizationforVehicle",
    "Zone Wise Capacity Utilization for People": "zoomWidgetBtnZoneWiseCapacityUtilizationforPeople",
    "Zone Wise Capacity Utilization for Vehicle": "zoomWidgetBtnZoneWiseCapacityUtilizationforVehicle",
    "Slip & Fall Detection": "zoomwidgetBtnSlipAndFall",
    "People": "zoomwidgetBtnPeople",
    "Average People Counting": "zoomwidgetBtnAveragePeopleCounting",
    "Gender": "zoomwidgetBtnGender",
    "Cumulative People Count": "zoomwidgetBtnCumulativePeopleCount",
    "New vs Total Visitors": "zoomwidgetBtnNewVsTotalVisitors",
    "Safety Measures": "zoomwidgetBtnSafetyMeasures",
    "Zone wise People Counting": "zoomwidgetBtnZonewisePeopleCounting",
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
    "Shopping Cart Counting": "zoomwidgetBtnShoppingCartCounting",
    "Queue events for shopping cart": "zoomwidgetBtnQueueeventsforshoppingcart",
    "Queue events for people": "zoomwidgetBtnQueueeventsforpeople",
    "Blocked exit detection": "zoomwidgetBtnBlockedexitdetection",
    "Shopping Cart Heatmap": "zoomwidgetBtnShoppingCartHeatmap",
    "Counting for forklift": "zoomwidgetBtnCountingforforklift",
    "Queue events for forklift": "zoomwidgetBtnQueueeventsforforklift",
    "Factory Blocked exit detection": "zoomwidgetBtnFactoryBlockedexitdetection",
    "Factory Block exit detection": "zoomwidgetBtnFactoryBlockedexitdetection",
    "Detect Forklifts": "zoomwidgetBtnDetecForklifts",
    "Forklift Heatmap": "zoomwidgetBtnForkliftHeatmap",
    "Forklift Speed Detection": "zoomwidgetBtnForkliftSpeedDetection",
    "Floor Plan": "zoomwidgetBtnFloorPlan",
};

const SpeechDashboard = () => {
    const [command, setCommand] = useState("");
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            const transcript =
                event.results[event.results.length - 1][0].transcript.toLowerCase();
            setCommand(transcript);
            handleVoiceCommand(transcript);
        };

        recognition.onend = () => {
            if (listening) {
                try {
                    recognition.start(); // restart automatically
                    console.log("Restarted listening...");
                } catch (err) {
                    console.warn("Recognition already started, ignoring...");
                }
            } else {
                console.log("Speech recognition stopped manually");
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setListening(false);
        };
    }, []);

    useEffect(() => {
        if (command) {
            const timer = setTimeout(() => {
                setCommand("");
            }, 10000); // 10 seconds

            return () => clearTimeout(timer); // cleanup if command changes quickly
        }
    }, [command]);

    const startListening = () => {
        if (!recognitionRef.current) return;

        // if (listening) {
        //     try {
        //         recognitionRef.current.stop();
        //         setListening(false);
        //         setCommand("")
        //     } catch (err) {
        //         console.warn("Recognition already stopped, ignoring...");
        //     }
        // } else {
            try {
                recognitionRef.current.start();
                setListening(true);
            } catch (err) {
                console.warn("Recognition already started, ignoring...");
            }
        // }
    };


    const handleVoiceCommand = async (text: string) => {
        const correctedText = decodeVoiceString(text);
        const lower = correctedText.toLowerCase();
        // Define command patterns
        const isOpenDashboard = /(open|show|go to)\s+.*dashboard/.test(lower);
        const isOpenWidget = /(open|show|go to)\s+.*(widget|visit)?$/.test(lower);
        const isCloseWidget = /(close|hide|remove)\s+.*(widget|visit)?$/.test(lower);

        // Example: "open test dashboard / go to test dashboard / show test dashboard"
        // if (correctedText.includes("open dashboard")) {
        if (isOpenDashboard) {
            const nameMatch = lower.match(/(?:open|show|go to)\s+(.*)dashboard/);
            // const nameMatch = correctedText.match(/dashboard\s+(.+)/i);
            if (nameMatch) {
                const spokenName = nameMatch[1].trim().toLowerCase();

                const response: any = await GetDashboardDesign();
                if (Array.isArray(response)) {
                    const matchedDashboard = response.find(
                        (d: any) => d.dashboardName?.toLowerCase() === spokenName
                    );

                    if (matchedDashboard) {
                        const dashboardId = matchedDashboard.id;
                        console.log("Matched Dashboard ID:", dashboardId);
                        localStorage.setItem("activeRoute", `/dashboard?id=${dashboardId}`);
                        navigate(`/dashboard?id=${dashboardId}`);
                    } else {
                        showToast(`No dashboard found with name "${spokenName}"`, "error");
                    }
                }
            }
            return;
        }

        // Example: "open test widget / go to test widget / show test widget"
        // if (correctedText.includes("open")) {
        //     const widgetName = correctedText.replace("open", "").replace("widget", "").trim();
        if (isOpenWidget) {
            const match = lower.match(/(?:open|show|go to)\s+(.*?)(?:widget|visit)?$/);
            const widgetName = match?.[1]?.trim() ?? "";   // ✅ ensure string
            const currentDashboardId = new URL(window.location.href).searchParams.get("id");

            if (!currentDashboardId) {
                showToast("Please Select A Dashboard", "error");
                return;
            }
            await fetchDashboardDesign(currentDashboardId, widgetName);
        }

        // Example: "close test widget / hide test widget / remove test widget"
        if (isCloseWidget) {
            if (typeof window.closeDialog === "function") {
                window.closeDialog();
            } else {
                toast.error("Could not close widget. Please try again.");
            }
        }
    };

    const fetchDashboardDesign = async (dashboardId: string, chartName: string) => {
        try {
            const data: any = await GetDashboardDesign();
            const record = data.find((item: any) => item.id === dashboardId);
            const json = record?.dashboardPreferenceJson;

            if (json && json !== "[]" && json !== "{}") {
                const parsedLayouts = JSON.parse(json);
                const normalize = (str: string) =>
                    str?.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

                const rawSynonyms: Record<string, string> = {
                    "modeltype": "Model Types",
                    "modeltypes": "Model Types",
                    "modaltype": "Model Types",
                    "vehicleturningmomentcount": "Vehicle Turning Movement counts",
                    "vehicleturningmomentcounts": "Vehicle Turning Movement counts",
                    "blockexitdetection": "Blocked exit detection",
                    "capacityutilisationforpeople": "Capacity Utilization for People",
                    "capacityutilisationforvehicle": "Capacity Utilization for Vehicle",
                    "sleepandfalldetection": "Slip & Fall Detection",
                    "slipandfalldetection": "Slip & Fall Detection",
                    "slipnfalldetection": "Slip & Fall Detection",
                    "slipfalldetection": "Slip & Fall Detection",
                    "featuretypes": "Feature Types",
                    "featuretype": "Feature Types",
                };

                // normalized synonyms
                const synonyms: Record<string, string> = {};
                Object.entries(rawSynonyms).forEach(([key, value]) => {
                    synonyms[normalize(key)] = normalize(value);
                });

                const normalizedInput = normalize(chartName);
                const mappedChartName =
                    Object.keys(synonyms).includes(normalizedInput)
                        ? synonyms[normalizedInput]
                        : chartName;

                let item = parsedLayouts.find(
                    (layoutItem: any) =>
                        normalize(layoutItem.chartName) === normalize(mappedChartName) ||
                        normalize(layoutItem.displayName) === normalize(mappedChartName)
                );

                if (!item) {
                    item = parsedLayouts.find(
                        (layoutItem: any) =>
                            normalize(layoutItem.chartName).includes(normalize(mappedChartName)) ||
                            normalize(layoutItem.displayName).includes(normalize(mappedChartName))
                    );
                }

                console.log("Matched Widget Item:", item);

                const widgetId = widgetClickMap[item?.chartName ?? ""];
                if (widgetId) {
                    document.getElementById(widgetId)?.click();
                } else {
                    showToast("No widget Found", "error");
                }
            }
        } catch (error) {
            console.error("Failed to fetch dashboard design:", error);
        }
    };

    const decodeVoiceString = (input: string): string => {
        return input
            .replace(/\bslash\b/gi, "/")
            .replace(/\s+/g, " ")
            .replace(/\band\b/gi, "&")
            .replace(/\bversus\b/gi, "vs")
            .replace(/\bsleep\b/gi, "slip")  // fix "sleep" → "slip"
            .replace(/\bmodal\b/gi, "model") // fix "modal" → "model"
            .replace(/\butilisation\b/gi, "utilization")
            .replace(/\btaste\b/gi, "test")
            .trim();
    };


    return (
        // <div style={{ padding: 20 }}>
        //     <div  style={{ display: "flex", alignItems: "center", gap: "10px" ,justifyContent:"space-between"}}>
        //         {command !== "" && <text>{command}</text>}
        //         <button onClick={startListening}>
        //             {listening ? <img src="/images/mic_icon.svg" alt="mic_icon" />
        //                 : <img src="/images/mic_icon_off.svg" />}
        //         </button>
        //     </div>
        // </div>

 <div className="mic-reco">
  <div className="mic-reco-wrapper"
  >
    {/* Show text only if command exists */}
    {command && (
      <span style={{ marginRight: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {command}
      </span>
    )}

    {/* Mic button */}
    <button onClick={startListening}  
    style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        width: "32px",   // fixed button width
        height: "32px",  // fixed button height
        flexShrink: 0,   // prevent shrinking
      }} >
      {listening ? (
        <img src="/images/mic_icon.svg" alt="mic_icon"  style={{ width: "100%", height: "100%" }}  />
      ) : (
        <img src="/images/mic_icon_off.svg" alt="mic_icon_off"  style={{ width: "100%", height: "100%" }}  />
      )}
    </button>
  </div>
 </div>

    );

};


export default SpeechDashboard;
