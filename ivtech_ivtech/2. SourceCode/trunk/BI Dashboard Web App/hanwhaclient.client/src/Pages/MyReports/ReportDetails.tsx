
import { IPdfReportRequest, IReport, OccupancyChartRef, PeopleVehicleChartRef, PerformanceComparisonItem, PerformanceReport, TrafficCompositionChartRef } from "../../interfaces/IReport";
import {
    Button, Box, Typography,
    Avatar
} from "@mui/material";
import { KeyPerformanceMetricsDetails } from "./KeyPerformanceMetricsDetails";
import { ReportTypeInfo } from "./ReportTypeInfo";
import { PerformanceComparisonTable } from "./PerformanceComparisonTable";
import { ReportPerformanceSummary } from "./ReportPerformanceSummary";
// import EditIcon from "../../../public/images/EditReportIcon.svg";
// import DeleteReportIcon from "../../../public/images/DeleteReportIcon.svg";
// import PDFDownloadReportIcon from "../../../public/images/PDFDownloadReportIcon.svg";
import { PeopleVehicleCountChart } from "./PeopleVehicleCountChart";
import { OccupancyRateComparisonChart } from "./OccupancyRateComparisonChart";
import { TrafficCompositionChart } from "./TrafficCompositionChart";
import { useEffect, useRef, useState } from "react";
import { GetReportDetailsbyId, pdfReportService } from "../../services/reportServices";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import moment from "moment";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useThemeContext } from "../../context/ThemeContext";
import { showToast } from "../../components/Reusable/Toast";

interface ReportDetailsProps {
    report: IReport; // Replace 'any' with your report type if available
    onEdit: () => void;
    onDelete: () => void;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({ report, onEdit, onDelete }) => {
    const peopleVehicleChartRef = useRef<PeopleVehicleChartRef>(null);
    const occupancyChartRef = useRef<OccupancyChartRef>(null);
    const trafficCompositionChartRef = useRef<TrafficCompositionChartRef>(null);


    const [performanceReportDetails, setPerformanceReportDetails] = useState<PerformanceReport>();
    const [peopleVehicleCountChartStackColor, setPeopleVehicleCountChartStackColor] = useState<string[]>([]);
    const [chartData, setChartData] = useState<PerformanceComparisonItem[]>([]);
    const [svgDataList, setSvgDataList] = useState<{ widgetName: string, svgData: string }[]>([]);
    const [hasError, setHasError] = useState<boolean>(false);
    const { theme } = useThemeContext();
    
    const fetchAndProcessData = async () => {
        try {
            const reportId = report.id ? report.id : "";
            const response: PerformanceReport = await GetReportDetailsbyId(reportId) as PerformanceReport;

            setPerformanceReportDetails(response);
            setHasError(false)
            
            // Set colors based on report type
            const color =
                (report?.reportType && report?.reportType.toLowerCase() === "site report")
                    ? ["#6C5BFF", "#FBB33E"]
                    : ["#5BA2FF", "#8FDD21"];

            setPeopleVehicleCountChartStackColor(color);

            // Filter out "Average" row
            const filteredChartData = response?.performanceComparisonTable?.filter(
                (d, index) =>
                    !(index === response.performanceComparisonTable.length - 1 && d.siteZoneName === "Average")
            ) || [];

            setChartData(filteredChartData);

        } catch (error) {
            setHasError(true);
            setPerformanceReportDetails(undefined);
            console.error("Failed to fetch report details:", error);
        }
    };
    const isAllPerformanceDataZero = (table: any[]) => {
        return table.every(item =>
            item.peopleCount === 0 &&
            item.vehicleCount === 0 &&
            item.peopleOccupancy === 0 &&
            item.vehicleOccupancy === 0
        );
    };
    // useEffect(() => {
    //     fetchAndProcessData();
    // }, [])
    useEffect(() => {
        //fetchAndProcessData();
        // if (report?.id) {
        //     fetchAndProcessData();
        // }
        const handler = setTimeout(() => {
            if (report?.id) fetchAndProcessData();
        }, 300); // wait 300ms

        return () => clearTimeout(handler);
    }, [report])

    const handleExportPDF = async () => {



        const widgets = [
            { name: 'People & Vehicle Count', ref: peopleVehicleChartRef },
            { name: 'Occupancy Rate Comparison', ref: occupancyChartRef },
            { name: 'Traffic Composition', ref: trafficCompositionChartRef },
        ];

        const newList: { widgetName: string; svgData: string }[] = [];

        widgets.forEach(widget => {
            const svg = widget.ref.current?.getSvgElement();
            if (svg) {
                const svgString = new XMLSerializer().serializeToString(svg);
                newList.push({
                    widgetName: widget.name,
                    svgData: svgString,
                });
            }
        });

        setSvgDataList(newList);

        let request: IPdfReportRequest = {
            reportId: report.id,
            svgData: newList
        }
        try {
            const fileName = report.reportType == "site report" ? report.siteReport?.reportName : report.zoneReport?.reportName;
            await pdfReportService({
                data: request,
                fileName: `${fileName}.pdf`,
            });

        } catch (err: any) {
            setError(err.message || "An error occurred while fetching users.");
            showToast("An error occurred while updating user.", "error");
        }
    };


    return (
        <>
            <div className="roles-permissions-tab reports-tab">

                <Box className="roles-permissions-head"
                >
                    {/* Report Title */}
                    <Typography variant="h6" fontWeight="bold">
                        {(report?.reportType && report?.reportType.toLowerCase() === "site report") ? report?.siteReport?.reportName : report?.zoneReport?.reportName}
                    </Typography>

                    {/* Action Buttons */}
                    <Box display="flex" gap={1}>
                        {HasPermission(LABELS.CanDeleteReport) && (
                            <Button
                                variant="outlined"
                                startIcon={<Avatar src={"/images/DeleteReportIcon.svg"} alt="edit" sx={{ width: 24, height: 24 }} />}
                                sx={{ borderRadius: '30px', textTransform: 'none', borderColor: '#D5D5D5', color: '#252525' }}
                                onClick={onDelete}
                            >
                                Delete
                            </Button>
                        )}
                        {HasPermission(LABELS.CanAddOrUpdateReport) && (
                            <Button
                                variant="outlined"
                                startIcon={<Avatar src={"/images/EditReportIcon.svg"} alt="edit" sx={{ width: 24, height: 24 }} />}
                                sx={{ borderRadius: '30px', textTransform: 'none', borderColor: '#D5D5D5', color: '#252525' }}
                                onClick={onEdit}
                            >
                                Edit
                            </Button>
                        )}

                        {!hasError && (performanceReportDetails && !isAllPerformanceDataZero(performanceReportDetails?.performanceComparisonTable)) && HasPermission(LABELS.CanExportPdfReport) && (
                            <Button
                                variant="contained"
                                startIcon={<Avatar src={"/images/PDFDownloadReportIcon.svg"} alt="edit" sx={{ width: 24, height: 24 }} />}
                                sx={{
                                    backgroundColor: '#ff8c00',
                                    borderRadius: '30px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#e67e00'
                                    }
                                }}
                                onClick={handleExportPDF}
                            >
                                Export as PDF
                            </Button>
                        )}
                    </Box>
                </Box>
                {performanceReportDetails && (<><Box className="reports-repeated">
                    <Box className="report-title-with-buttons">
                        {/* Report Title */}
                        <Typography variant="h6">
                            Filter Applied
                        </Typography>

                        {/* Action Buttons */}
                        <Box display="flex" gap={1}>
                            <Typography

                                sx={{ textTransform: 'none' }}
                            >
                                <b>Created By</b>:
                            </Typography>
                            <Typography sx={{ color: '#FF8A01', fontWeight: "bold" }}>{performanceReportDetails?.createdBy || ""}</Typography>
                            <Typography

                                sx={{ textTransform: 'none', color: '#252525' }}
                            >
                                <b>Created On</b>:
                            </Typography>
                            <Typography sx={{ color: '#FF8A01', fontWeight: "bold" }}>{moment(formatDateToConfiguredTimezone(performanceReportDetails?.createdOn || "")).format("MMM DD YYYY, h:mm A")}</Typography>
                        </Box>
                    </Box>
                </Box>
                    <Box className="reports-repeated"><ReportTypeInfo reportHeader={performanceReportDetails?.reportHeader ?? undefined} /> </Box>
                    {!isAllPerformanceDataZero(performanceReportDetails?.performanceComparisonTable) && !hasError ? (<><Box className="reports-repeated"><KeyPerformanceMetricsDetails keyPerformanceMetrics={performanceReportDetails?.keyPerformanceMetrics ?? undefined} comperisionType={report.comperisionType}/> </Box>
                        <Box className="reports-repeated"><PerformanceComparisonTable performanceReportDetails={performanceReportDetails?.performanceComparisonTable ?? []} reportType={report.reportType} comperisionType={report.comperisionType}/> </Box>
                        <Box className="reports-repeated"><ReportPerformanceSummary performanceReportDetails={performanceReportDetails?.performanceComparisonTable ?? []} comperisionType={report.comperisionType}/> </Box>
                        <Box className="reports-repeated"><PeopleVehicleCountChart ref={peopleVehicleChartRef} chartData={chartData} colors={peopleVehicleCountChartStackColor} reportType={report.reportType} comperisionType={report.comperisionType}/> </Box>
                        <Box className="reports-repeated"><OccupancyRateComparisonChart ref={occupancyChartRef} chartData={chartData} colors={peopleVehicleCountChartStackColor} comperisionType={report.comperisionType}/> </Box>
                        <Box className="reports-repeated"><TrafficCompositionChart ref={trafficCompositionChartRef} chartData={chartData} colors={peopleVehicleCountChartStackColor} reportType={report.reportType}  comperisionType={report.comperisionType}/> </Box>
                    </>) : (<Box textAlign="center" py={4} className="report-no-data">
                        <img src={theme === "light" ? "/images/noData.gif" : "/images/dark-theme/noData.gif"} alt="Animated GIF" width="20" height="20" />
                        <Typography variant="h6" color="textSecondary">No data found for the selected filters. Please adjust your filters and try again.</Typography>
                    </Box>)}
                </>)}
                {hasError && (<div className="report-details-error"><ErrorOutlineIcon sx={{ color: "#d32f2f", fontSize: 50 }} /><span className="no-report-select">An unexpected error occurred while processing your request. Please try again or contact your administrator if the issue persists.</span></div>)}
            </div>

        </>
    )
}


export { ReportDetails }

function setError(arg0: any) {
    throw new Error("Function not implemented.");
}
