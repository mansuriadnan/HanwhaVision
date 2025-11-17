import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { GetClientSettingsData } from "../../../../services/settingService";
import { WIDGET_API_DISPLAYNAME_MAPPING } from "../../../../utils/constants";
import { WidgetComponentMap } from "./WidgetMap";
import { FloorZonesNameByIds } from "../../../../services/floorPlanService";
import { IFloorZoneNamesRequest } from "../../../../interfaces/IFloorAndZone";
import { Typography } from "antd";
import { useRequestCounter } from "../../../../hooks/useHttpInterceptor";

const ReportSchedulerWidgetPdf: React.FC = () => {
    const [totalWidgets, setTotalWidgets] = useState(0);
    const [loadedCount, setLoadedCount] = useState(0);
    const [allWidgetsLoaded, setAllWidgetsLoaded] = useState(false);
    const [floorIds, setFloorIds] = useState([]);
    const [zoneIds, setZoneIds] = useState([]);
    const [floorNames, setFloorNames] = useState("");
    const [zoneNames, setZoneNames] = useState("");
    const [widgets, setWidgets] = useState<string[]>([]);
    const [widgetNames, setWidgetNames] = useState("");
    const [settingsData, setSettingsData] = useState<any>(null);
    const [startDate, setStartDate] = useState(dayjs);
    const [endDate, setEndDate] = useState(dayjs);

    const [isCallStarted, setIsCallStarted] = useState(false);
    const { pendingCount, isAllComplete } = useRequestCounter();
    // console.log("pendingCount->",pendingCount);
    //  console.log("isAllComplete->",isAllComplete);

    useEffect(() => {
        const fetchClientSettings = async () => {
            try {
                
                const response: any = await GetClientSettingsData();
                
                if (response?.isSuccess !== false) {
                    setIsCallStarted(true);
                    setSettingsData(response?.reportSchedule);
                    setFloorIds(response?.reportSchedule.floorIds)
                    setZoneIds(response?.reportSchedule.zoneIds)

                    const widgetTitles = getWIdgetsTitlesByIds(response?.reportSchedule?.widgets);
                    setWidgets(widgetTitles)
                    setWidgetNames(widgetTitles.join(","))
                    setTotalWidgets(widgetTitles.length)
                    if (response?.reportSchedule?.sendInterval) {
                        const { start, end } = calculateDateRange(response.reportSchedule.sendInterval);
                        setStartDate(start);
                        setEndDate(end);
                    }
                    const request:IFloorZoneNamesRequest = {
                        floorIds: response?.reportSchedule.floorIds,
                        zoneIds: response?.reportSchedule.zoneIds
                    }
                    const responseNames: any = await FloorZonesNameByIds(request);
                    if (response?.isSuccess !== false) {
                        setFloorNames(responseNames?.data?.floorNames.join(","))
                        setZoneNames(responseNames?.data?.zoneNames.join(","))
                    }
                }
            } catch (err) {
                console.error("Error fetching client settings", err);
            }
        };

        fetchClientSettings();
    }, []);

   

    const getWIdgetsTitlesByIds = (ids: string[]) => {
        return WIDGET_API_DISPLAYNAME_MAPPING
            .filter(widget => ids.includes(widget.id))
            .map(widget => widget.title);
    }

    const calculateDateRange = (interval: string) => {
        const today = dayjs();
        const yesterday = today.subtract(1, "day");

        switch (interval) {
            case "DAILY":
                return {
                    start: yesterday.startOf("day"),
                    end: yesterday.endOf("day"),
                };
            case "WEEKLY":
                return {
                    start: yesterday.subtract(6, "day").startOf("day"),
                    end: yesterday.endOf("day"),
                };
            case "MONTHLY":
                return {
                    start: yesterday.subtract(1, "month").add(1, "day").startOf("day"),
                    end: yesterday.endOf("day"),
                };
            default:
                return {
                    start: yesterday.startOf("day"),
                    end: yesterday.endOf("day"),
                };
        }
    };


    useEffect(() => {
        if (loadedCount === totalWidgets) {
            setAllWidgetsLoaded(true);
        }
    }, [loadedCount]);

    useEffect(() => {
        if (pendingCount === 0 &&  isAllComplete === true && isCallStarted === true) {
            const marker = document.createElement("div");
            marker.id = "pdf-ready-marker";
            document.body.appendChild(marker);
            (window as any).renderComplete = true;
        }
    }, [ pendingCount, isAllComplete, isCallStarted]);

    const handleWidgetLoaded = () => {
        setLoadedCount((prev) => prev + 1);
    };

    const rows = [
        {
            label: "Selected Floors",
            value: floorNames                
        },
        {
            label: "Selected Zones",
            value: zoneNames
        },
        {
            label: "Selected Widgets",
            value: widgetNames
        },
        { label: "Frequency", value: settingsData?.sendInterval },
        { label: "Generated On", value: dayjs().format("DD-MM-YYYY HH:mm:ss") },
    ];

    return (

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div
                className="widge-box-inner-pdf"
                style={{ maxWidth: "800px" }}
            >
                <div
                    style={{
                        pageBreakInside: "avoid",
                        pageBreakAfter: "auto"
                    }}
                >
                    <div style={{
                        marginBottom: "20px",
                        pageBreakInside: "avoid",
                        pageBreakAfter: "avoid"
                    }}>
                    <Typography style={{ fontWeight:600, marginBottom:"10px"}}>Applied Filters:</Typography>
                    <table className="report-table-sch"
                        style={{
                            width: "100%",
                            borderCollapse: "separate",
                            borderSpacing: "0px",
                            fontSize: "14px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid #ccc",
                        }}
                    >
                        <thead>
                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                                <th
                                    style={{
                                        padding: "8px",
                                        textAlign: "left",
                                        //border: "none",
                                        borderBottom:"1px solid #ccc",
                                        borderRight:"1px solid #ccc",
                                        width: "20%",
                                        fontWeight:600
                                    }}
                                >
                                    Parameter
                                </th>
                                <th
                                    style={{
                                        padding: "8px",
                                        textAlign: "left",
                                        borderBottom:"1px solid #ccc",
                                         fontWeight:600
                                    }}
                                >
                                    Value
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => {
                                const isFirst = index === 0;
                                const isLast = index === rows.length - 1;

                                return (
                                    <tr key={index}>
                                        <td
                                            style={{
                                                padding: "8px",
                                                verticalAlign: "top",
                                                borderTop: isFirst ? "none" : "1px solid #ccc", // no top border on first row
                                                borderLeft: "none", // let outer border show
                                                borderRight: "1px solid #ccc",
                                                // borderBottom: "1px solid #ccc",
                                            }}
                                        >
                                            {row.label}
                                        </td>
                                        <td
                                            style={{
                                                padding: "8px",
                                                whiteSpace: "pre-wrap",
                                                borderTop: isFirst ? "none" : "1px solid #ccc",
                                                borderLeft: "none",
                                                borderRight: "none", // rightmost cell — outer border will show
                                                // borderBottom: "1px solid #ccc",
                                            }}
                                        >
                                            {row.value}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>


                    </table>
                </div>
                
                <div style={{ marginBottom: "10px" }}>
                    <div
                        style={{
                            pageBreakInside: "avoid", // <== Force this block to stay together
                        }}
                    >
                        <Typography style={{ marginBottom: "10px" , fontWeight:"600"}}>Visualizations:</Typography>


                        {Array.from({ length: Math.ceil(widgets.length / 2) }, (_, rowIndex) => {
                            const firstIndex = rowIndex * 2;
                            const secondIndex = firstIndex + 1;

                            const firstWidget = widgets[firstIndex];
                            const secondWidget = widgets[secondIndex];

                            return (
                                <div
                                    key={`row-${rowIndex}`}
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginBottom: "10px",
                                        justifyContent: "flex-start",
                                    }}
                                >
                                    {[firstWidget, secondWidget].map((widgetTitle, idx) => {
                                        if (!widgetTitle) return null;

                                        const Component = WidgetComponentMap[widgetTitle];
                                        if (!Component) return null;

                                        const item = {
                                            chartID: firstIndex + idx,
                                            chartName: widgetTitle,
                                            displayName: widgetTitle,
                                            expanded: "Option1",
                                            height: 358,
                                            size: "1x1",
                                            width: 364,
                                        };

                                        return (
                                            <div
                                                key={widgetTitle}
                                                style={{
                                                    flex: 1,
                                                    maxWidth: "50%",
                                                    pageBreakInside: "avoid",
                                                }}
                                                className="widget-content-pdf"
                                            >
                                                <Component
                                                    item={item}
                                                    floor={floorIds}
                                                    zones={zoneIds}
                                                    selectedStartDate={startDate}
                                                    selectedEndDate={endDate}
                                                    onLoadComplete={handleWidgetLoaded}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
export default ReportSchedulerWidgetPdf