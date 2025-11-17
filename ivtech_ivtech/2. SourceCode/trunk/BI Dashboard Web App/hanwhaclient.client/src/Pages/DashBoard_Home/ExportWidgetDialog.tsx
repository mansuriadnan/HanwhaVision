import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Box,
  Chip,
  MenuItem,
  ListItemText,
  Checkbox,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Dayjs } from "dayjs";
import { ILookup } from "../../interfaces/ILookup";
import { convertToUTC } from "../../utils/convertToUTC";
import { csvWidgetService } from "../../services/reportServices";
import { showToast } from "../../components/Reusable/Toast";
import autoTable from "jspdf-autotable";
import {
  convertBase64ToPngBase64,
  convertImageToBase64,
} from "../../utils/convertImageToBase64";
import { LoadingManager } from "../../utils/LoadingManager";
import { Label } from "react-konva";
import { dashboardCharts } from "../../constants/dashboardChartList";
import { setExporting } from "../../utils/refreshManager";
import { useRequestCounter } from "../../hooks/useHttpInterceptor";
import { fi, is } from "date-fns/locale";

interface ExportReportDialogProps {
  open: boolean;
  onClose: () => void;
  layouts: any;
  selectedFloors?: string[];
  selectedZones?: string[];
  selectedStartDate?: Dayjs | null;
  selectedEndDate?: Dayjs | null;
  floorList: ILookup[];
  zoneList: ILookup[];
  WidgetNames?: string[];
  WidgetTitleNames?: string[];
}

const ExportWidgetDialog: React.FC<ExportReportDialogProps> = ({
  open,
  onClose,
  layouts,
  selectedFloors,
  selectedZones,
  selectedStartDate,
  selectedEndDate,
  floorList,
  zoneList,
}) => {
  const chartRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [userProfileDetails, setUserProfileDetails] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appUploadedLogo, setAppUploadedLogo] = useState<any>();
  const [appLogo, setAppLogo] = useState<any>();
  const { pendingCount, isAllComplete } = useRequestCounter();
  const [isExportPdfClicked, setIsExportPdfClicked] = useState(false);
  const [startPdfExport, setStartPdfExport] = useState(false);

  // Widget ID to Name mapping
  const widgetIdToNameMap: Record<string, { id: string; title: string }> = {
    "1": { id: "TotalCameraCount", title: "Camera Online/Offline" },
    "2": { id: "CameraCountByModel", title: "Model Types" },
    "3": { id: "CameraCountByFeatures", title: "Feature Types" },
    "4": {
      id: "PeopleCapacityUtilization",
      title: "Capacity Utilization for People",
    },
    "5": {
      id: "VehicleCapacityUtilization",
      title: "Capacity Utilization for Vehicle",
    },
    "6": {
      id: "VehicleCameraCapacityUtilizationAnalysisByZones",
      title: "Zone Wise Capacity Utilization for Vehicle",
    },
    "7": {
      id: "PeopleCameraCapacityUtilizationAnalysisByZones",
      title: "Zone Wise Capacity Utilization for People",
    },
    "8": { id: "SlipFallAnalysis", title: "Slip & Fall Detection" },
    "9": { id: "PeopleCountChart", title: "People" },
    "10": { id: "AveragePeopleCountChart", title: "Average People Counting" },
    "11": { id: "GenderWisePeopleCountAnalysis", title: "Gender" },
    "12": {
      id: "CumulativePeopleCountChart",
      title: "Cumulative People Count",
    },
    "13": { id: "NewVsTotalVisitorChart", title: "New vs Total Visitors" },
    "14": {
      id: "SafetyMeasuresStoppedVehicleByTypeAnalysis",
      title: "Safety Measures",
    },
    "15": { id: "PeopleCountByZones", title: "Zone wise People Counting" },
    "16": { id: "VehicleByType", title: "Vehicle by Type" },
    "17": { id: "WrongWayAnalysis", title: "Vehicle in Wrong Direction" },
    "18": { id: "VehicleUTurnAnalysis", title: "Vehicle U Turn detection" },
    "19": { id: "PedestrianAnalysis", title: "Pedestrian Detection" },
    "20": { id: "VehicleCountChart", title: "Vehicle" },
    "21": { id: "AverageVehicleCountChart", title: "Average Vehicle Counting" },
    "22": { id: "VehicleQueueAnalysis", title: "Vehicle Queue Analysis" },
    "23": {
      id: "StoppedVehicleByTypeAnalysis",
      title: "Stopped Vehicle Count Time",
    },
    "24": {
      id: "VehicleTurningMovementAnalysis",
      title: "Vehicle Turning Movement counts",
    },
    "25": { id: "ShoppingCartQueueAnalysis", title: "Shopping Cart Counting" },
    "26": {
      id: "ShoppingCartCountAnalysis",
      title: "Queue events for shopping cart",
    },
    "27": { id: "PeopleQueueAnalysis", title: "Queue events for people" },
    "28": {
      id: "VehicleSpeedViolationAnalysis",
      title: "Speed Violation by Vehicle",
    },
    "29": { id: "BlockedExitAnalysis", title: "Blocked exit detection" },
    "30": { id: "TrafficJamAnalysis", title: "Traffic Jam by Day" },
    "31": { id: "ForkliftCountAnalysis", title: "Counting for forklift" },
    "32": {
      id: "FactoryBlockedExitAnalysis",
      title: "Factory Blocked exit detection",
    },
    "33": { id: "BlockedExitAnalysis", title: "Blocked exit detection" },
    "34": { id: "ProxomityDetectionAnalysis", title: "Detect Forklifts" },
  };

  const selectedWidgetsOptions = [
    { id: "all", title: "All" },
    ...(layouts?.lg?.map((layout: any) => ({
      id: layout.chartID,
      title: layout.chartName,
    })) || []),
  ];
  let selectedFloorTitles = "";
  let selectedZonesTitles = "";

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      setUserProfileDetails(JSON.parse(userProfile));
    }
    let generalSettings = localStorage.getItem("generalSettings");
    if (generalSettings) {
      let parsedData = JSON.parse(generalSettings);
      setAppUploadedLogo(parsedData?.logo);
      // console.log("parsedData?.logo",parsedData?.logo);
    }

    const convertImageToBase641 = async () => {
      convertImageToBase64(
        "/images/vision_insight_logo_pdf.png",
        (base64: string | null) => {
          if (base64) {
            setAppLogo(base64);
          } else {
            console.error("Failed to convert image to Base64");
          }
        }
      );
    };

    convertImageToBase641();
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedWidgets([]);
    }
  }, [open]);

  useEffect(() => {
    const runExport = async () => {
      if (pendingCount === 0 && isAllComplete && isExportPdfClicked) {
        try {
          //await waitUntilWidgetsAreStable(selectedWidgets);
          await executeExportPDF();
        } catch (err) {
          console.error("Export aborted:", err);
          setIsExportPdfClicked(false);
          LoadingManager.hideLoading();
        }
      }
    };
    runExport();
  }, [pendingCount, isAllComplete, isExportPdfClicked]);
  //   useEffect(() => {
  //   if (startPdfExport) {
  //     const timer = setTimeout(async () => {
  //       try {
  //         await onExportPDF();   // this will call executeExportPDF
  //       } catch (err) {
  //         console.error("Export failed", err);
  //         LoadingManager.hideLoading(); // just in case
  //       } finally {
  //         setStartPdfExport(false);
  //       }
  //     }, 100); // give browser a chance to paint loader

  //     return () => clearTimeout(timer);
  //   }
  // }, [startPdfExport]);

  const formatDateRange = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = date
      .toLocaleString("en-US", options)
      .replace(",", "");
    return `${formattedDate}`;
  };

  const onExportCSV = async () => {
    try {
      setIsLoading(true);

      // Map selected widget IDs to widget names
      const widgetNames: string[] = selectedWidgets
        .map((id) => widgetIdToNameMap[id].id)
        .filter((name) => name !== undefined); // Filter out undefined values

      const widgetTitleNames: { id: string; title: string }[] = selectedWidgets
        .map((key) => widgetIdToNameMap[key])
        .filter((item) => item !== undefined);

      console.log("widgetTitleNames = ", widgetTitleNames);

      if (widgetNames.length === 0) {
        showToast("Please select at least one widget to export.", "error");
        return;
      }
      var startDateNew = selectedStartDate?.format(
        "YYYY-MM-DDTHH:mm:ssZ"
      ) as string;
      var endDateNew = selectedEndDate?.format(
        "YYYY-MM-DDTHH:mm:ssZ"
      ) as string;
      // Prepare the request payload
      const widgetRequest: any = {
        FloorIds: selectedFloors || [],
        ZoneIds: selectedZones || [],
        StartDate: convertToUTC(startDateNew),
        EndDate: convertToUTC(endDateNew),
        WidgetNames: widgetNames,
        widgetTitleNames: widgetTitleNames,
        IntervalMinute: 60,
      };

      await csvWidgetService(
        {
          data: widgetRequest,
        },
        "/api/Widget/DownloadMultipleWidgetsCsv"
      );
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("An error occurred while exporting the CSV. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const mergeHeatmap = async (
    imgEl: HTMLImageElement,
    overlayCanvasEl: HTMLCanvasElement
  ) => {
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = imgEl.naturalWidth || imgEl.width;
    mergedCanvas.height = imgEl.naturalHeight || imgEl.height;
    const ctx: any = mergedCanvas.getContext("2d");

    // Base image
    ctx.drawImage(imgEl, 0, 0, mergedCanvas.width, mergedCanvas.height);

    // Overlay
    ctx.globalAlpha = 0.4; // make it slightly lighter for PDF
    ctx.drawImage(
      overlayCanvasEl,
      0,
      0,
      mergedCanvas.width,
      mergedCanvas.height
    );
    ctx.globalAlpha = 1;

    // Return <img>
    const mergedImg = document.createElement("img");
    mergedImg.src = mergedCanvas.toDataURL("image/png");
    mergedImg.style.width = imgEl.style.width;
    mergedImg.style.height = imgEl.style.height;
    mergedImg.style.borderRadius = imgEl.style.borderRadius;
    return mergedImg;
  };
  const createLegendContainer = (legendCanvas: HTMLCanvasElement) => {
    // Create thin color bar from legend canvas
    const legendImg = document.createElement("img");
    legendImg.src = legendCanvas.toDataURL("image/png");
    legendImg.style.width = "100%";
    legendImg.style.height = "6px"; // thin like browser
    legendImg.style.borderRadius = "4px";
    legendImg.style.display = "block";

    // Create labels row (Low / High)
    const labelsRow = document.createElement("div");
    labelsRow.style.display = "flex";
    labelsRow.style.justifyContent = "space-between";
    labelsRow.style.alignItems = "center";
    labelsRow.style.fontSize = "10px";
    labelsRow.style.fontWeight = "bold";
    labelsRow.style.marginTop = "2px";
    labelsRow.style.width = "100%";
    labelsRow.style.color = "#000";

    const low = document.createElement("span");
    low.innerText = "Low";

    const high = document.createElement("span");
    high.innerText = "High";

    labelsRow.appendChild(low);
    labelsRow.appendChild(high);

    // Container for both bar + labels
    const legendContainer = document.createElement("div");
    legendContainer.style.width = "95%";
    legendContainer.style.margin = "6px auto 0 auto"; // center inside widget
    legendContainer.style.display = "flex";
    legendContainer.style.flexDirection = "column";

    legendContainer.appendChild(legendImg);
    legendContainer.appendChild(labelsRow);

    return legendContainer;
  };

  const waitUntilWidgetsAreStable = async (
    widgetIds: string[],
    options = { timeout: 15000, interval: 300 }
  ) => {
    const startTime = Date.now();

    return new Promise<void>((resolve, reject) => {
      const check = () => {
        // check global loader
        const globalLoader = document.querySelector(
          ".global-loader, .MuiCircularProgress-root"
        );
        if (globalLoader) {
          if (Date.now() - startTime > options.timeout) {
            reject(new Error("Timeout: Global loader still active"));
            return;
          }
          return setTimeout(check, options.interval);
        }

        // check widgets
        const allStable = widgetIds.every((id) => {
          const widget = document.getElementById("parent" + id);
          if (!widget) return false;

          const isLoading = widget.querySelector(
            ".loader, .spinner, .skeleton"
          );
          const isEmpty = widget.innerText
            .trim()
            .toLowerCase()
            .includes("no data found");

          return !isLoading && !isEmpty;
        });

        if (allStable) {
          resolve();
        } else if (Date.now() - startTime > options.timeout) {
          reject(new Error("Timeout: Widgets did not stabilize"));
        } else {
          setTimeout(check, options.interval);
        }
      };

      check();
    });
  };

  const onExportPDF = async () => {
    LoadingManager.showLoading();
    requestAnimationFrame(() => setIsExportPdfClicked(true));
  };

  const executeExportPDF = async () => {
    // LoadingManager.showLoading();
    const selectedWidgetIds = selectedWidgets.map((id) => parseInt(id));

    try {
      setExporting(true); // stop refresh
      const selectedWidgetNames = dashboardCharts
        .filter((chart) => selectedWidgetIds.includes(chart.id))
        .map((chart) => chart.chartName);

      // await waitUntilWidgetsAreStable(selectedWidgets);
      selectedFloorTitles =
        floorList?.length > 0
          ? floorList
              .filter((floor) => selectedFloors?.includes(floor.id))
              .map((floor) => floor.title)
              .join(", ")
          : "";
      selectedZonesTitles =
        zoneList.length > 0
          ? zoneList
              .filter((zone) => selectedZones?.includes(zone.id))
              .map((zone) => zone.title)
              .join(", ")
          : "";
      //const logoUrl = await svgToPngDataUrl(appUploadedLogo, 100, 40);;

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pagePadding = 10;
      const headerHeight = 20;
      const footerHeight = 15;
      const usableHeight = pdfHeight - headerHeight - footerHeight - 10;
      let pngBase64Applogo = "";
      if (appUploadedLogo) {
        pngBase64Applogo = await convertBase64ToPngBase64(appUploadedLogo);
      }

      const addHeaderFooter = (pageNumber: number, totalPages: number) => {
        const logoWidth = 30;
        const logoHeight = 10;
        const logoX = pagePadding;
        const logoY = pagePadding;
        if (appUploadedLogo) {
          pdf.addImage(
            pngBase64Applogo,
            "PNG",
            logoX,
            logoY,
            logoWidth,
            logoHeight
          );
        }

        const secondLogoWidth = 45;
        const secondLogoHeight = 7;
        const secondLogoX = pdfWidth - pagePadding - secondLogoWidth;
        const secondLogoY = logoY + 2;

        // Example: Replace with your actual 2nd logo base64
        pdf.addImage(
          appLogo,
          "PNG",
          secondLogoX,
          secondLogoY,
          secondLogoWidth,
          secondLogoHeight
        );

        // === Add horizontal line below the header ===
        const lineY = headerHeight + 3;
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.3);
        pdf.line(pagePadding, lineY, pdfWidth - pagePadding, lineY);

        // Footer
        pdf.setFontSize(10);
        pdf.setFont("Open Sans", "normal");
        pdf.setTextColor(0, 0, 0);
        const footerText = `Page ${pageNumber} of ${totalPages}`;
        pdf.text(
          footerText,
          pdfWidth - pagePadding - pdf.getTextWidth(footerText),
          pdfHeight - 10
        );
      };

      let currentY = headerHeight + 10;
      let pageNumber = 1;
      const verticalSpacing = 5;
      const maxChartHeight = pdfHeight - headerHeight - footerHeight - 10;

      // --- New Section: Displaying Info like zone, floor in an HTML-rendered Box using jsPDF.html() ---
      const selectedDate =
        selectedStartDate && selectedEndDate
          ? `${formatDateRange(selectedStartDate.toDate())} - ${formatDateRange(
              selectedEndDate.toDate()
            )}`
          : "N/A";

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Applied Filters:", pagePadding, currentY);
      currentY += 5;

      autoTable(pdf, {
        startY: currentY,
        margin: { left: pagePadding },
        tableWidth: pdfWidth - pagePadding * 2,
        head: [["Parameter", "Value"]],
        body: [
          ["Selected Floors", selectedFloorTitles || "N/A"],
          ["Selected Zones", selectedZonesTitles || "N/A"],
          ["Selected Date ", selectedDate || "N/A"],
          ["Selected Widgets", selectedWidgetNames.join(",")],
          [
            "Created By",
            `${userProfileDetails?.firstname} ${
              userProfileDetails?.lastname || "N/A"
            }`,
          ],
          ["Created On", formatDateRange(new Date()) || "N/A"],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          fontStyle: "normal",
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [204, 204, 204], // grey border
        },
        headStyles: {
          fillColor: [230, 230, 230],
          textColor: 0,
          fontStyle: "bold",
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: pdfWidth - pagePadding * 2 - 45 },
        },
      });
      const table = (pdf as any).lastAutoTable;

      if (table) {
        const startX = table.settings.margin.left ?? pagePadding;
        const startY = table.startY;
        const endY = table.finalY;
        const width = table.table?.width ?? pdfWidth - pagePadding * 2;
        const height = endY - startY;
        const radius = 6;

        // Avoid drawing if table spans multiple pages
        if (table.startPageNumber === table.finalPageNumber) {
          pdf.setDrawColor(100); // border color
          pdf.setLineWidth(0.3);
          pdf.roundedRect(startX, startY, width, height, radius, radius, "S");
        }

        currentY = endY + 7;
      }

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Visualizations:", pagePadding, currentY);
      currentY += 5;

      // --- End of New Section ---

      // Pre-render and measure all selected elements
      const renderedCharts = [];

      for (let chartId of selectedWidgets) {
        const original = document.getElementById("parent" + chartId);

        if (!original) continue;

        // Clone the widget for safe off-screen rendering
        const clone = original.cloneNode(true) as HTMLElement;
        clone.style.transform = "none";
        clone.style.position = "relative";
        clone.style.overflow = "visible";

        if (selectedWidgetNames.includes("Map Plan")) {
          clone
            .querySelectorAll(
              ".gm-fullscreen-control, .gm-svpc, a.leaflet-control-zoom-in,a.leaflet-control-zoom-out"
            )
            .forEach((el) => el.remove());
        }

        // Calculate dynamic size
        const width = original.scrollWidth;
        const height = original.scrollHeight;
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;

        // Fix images
        clone.querySelectorAll("img").forEach((img: any) => {
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          img.style.objectFit = "contain";
        });

        // Remove resize handles or undesired extras
        clone
          .querySelectorAll(".react-resizable-handle")
          .forEach((el) => el.remove());

        // Render off-screen
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        container.style.zIndex = "-1";
        container.appendChild(clone);
        document.body.appendChild(container);

        await new Promise((res) => setTimeout(res, 300)); // let layout settle

        const canvas = await html2canvas(clone, {
          backgroundColor: "#fff",
          useCORS: true,
          scale: 2,
          width,
          height,
          scrollX: 0,
          scrollY: 0,
        });
        document.body.removeChild(container);
        const imgData = canvas.toDataURL("image/png");

        const imgProps = pdf.getImageProperties(imgData);
        const contentWidth = pdfWidth - pagePadding * 2;
        const contentHeight = 81.9; //(imgProps.height * contentWidth) / imgProps.width;
        const sizeClassMap: Record<string, string> = {
          "one-by-one": "smallCharts",
          "two-by-one": "largeCharts",
          "extra-large-charts": "extraLargeCharts",
          "map-floor-plan-charts": "mapFloorCharts",
        };

        let chartSize = "";

        if (original) {
          const found = Object.keys(sizeClassMap).find((cls) =>
            original.classList.contains(cls)
          );
          chartSize = found ? sizeClassMap[found] : "";
        }

        renderedCharts.push({
          id: chartId,
          imgData,
          widthMm: contentWidth,
          heightMm: contentHeight,
          originalWidth: width,
          originalHeight: height,
          chartSize: chartSize,
        });
      }

      // Now continue with your existing chart rendering logic
      const largeCharts = renderedCharts.filter(
        (c) => c.chartSize == "largeCharts"
      );
      const smallCharts = renderedCharts.filter(
        (c) => c.chartSize == "smallCharts"
      );
      const extraLargeCharts = renderedCharts.filter(
        (c) => c.chartSize == "extraLargeCharts"
      );
      const mapFloorCharts = renderedCharts.filter(
        (c) => c.chartSize == "mapFloorCharts"
      );

      for (let chart of largeCharts) {
        let displayHeight = chart.heightMm;
        let displayWidth = chart.widthMm;
        const remainingHeight = pdfHeight - footerHeight - currentY;

        if (displayHeight > maxChartHeight) {
          const ratio = maxChartHeight / chart.heightMm;
          displayHeight *= ratio;
          displayWidth *= ratio;
        }

        if (displayHeight > remainingHeight) {
          pdf.addPage();
          pageNumber++;
          currentY = headerHeight + verticalSpacing;
        }

        const offsetX = (pdfWidth - displayWidth) / 2;

        pdf.addImage(
          chart.imgData,
          "PNG",
          offsetX,
          currentY,
          displayWidth,
          displayHeight
        );
        currentY += displayHeight + verticalSpacing;
      }

      // ---- Then render small charts (width <= 421px) in 2 per row ----
      for (let i = 0; i < smallCharts.length; ) {
        const chart1 = smallCharts[i];
        const chart2 = smallCharts[i + 1];

        const colWidth = (pdfWidth - pagePadding * 3) / 2;
        const h1 = chart1.heightMm;
        const h2 = chart2?.heightMm || 0;
        const rowHeight = Math.max(h1, h2);
        const remainingHeight = pdfHeight - footerHeight - currentY;

        if (rowHeight > remainingHeight) {
          pdf.addPage();
          pageNumber++;
          currentY = headerHeight + verticalSpacing;
        }

        pdf.addImage(
          chart1.imgData,
          "PNG",
          pagePadding,
          currentY,
          colWidth,
          h1
        );

        if (chart2) {
          pdf.addImage(
            chart2.imgData,
            "PNG",
            pagePadding * 2 + colWidth,
            currentY,
            colWidth,
            h2
          );
          i += 2;
        } else {
          i += 1;
        }

        currentY += rowHeight + verticalSpacing;
      }

      // ---- Render Extra-Large Charts at the End ----
      for (let chart of extraLargeCharts) {
        const originalEl = document.getElementById("parent" + chart.id);
        if (!originalEl) continue;

        if (
          originalEl.innerText.trim().toLowerCase().includes("no data found")
        ) {
          console.log(`Skipping chart ${chart.id} - No Data Found`);
          continue;
        }

        const realImg = originalEl.querySelector(
          ".cmn-heatmap-wrapper img"
        ) as HTMLImageElement;
        const overlayCanvas = originalEl.querySelector(
          ".cmn-heatmap-wrapper canvas"
        ) as HTMLCanvasElement;
        const legendCanvas = originalEl.querySelector(
          ".cmn-heatmap-low-high canvas"
        ) as HTMLCanvasElement;

        let mergedImgEl: HTMLImageElement | null = null;
        if (realImg && overlayCanvas) {
          mergedImgEl = await mergeHeatmap(realImg, overlayCanvas);
        }

        // Clone full widget DOM
        const clone = originalEl.cloneNode(true) as HTMLElement;

        // Replace base heatmap image in clone
        if (mergedImgEl) {
          const cloneImg = clone.querySelector(".cmn-heatmap-wrapper img");
          if (cloneImg) cloneImg.replaceWith(mergedImgEl);
        }

        // Remove the overlay canvas (heatmap area only)
        const overlayCanvasClone = clone.querySelector(
          ".cmn-heatmap-wrapper canvas"
        );
        if (overlayCanvasClone) overlayCanvasClone.remove();

        // ===== Handle legend canvas =====
        if (legendCanvas) {
          const legendContainer = createLegendContainer(legendCanvas);
          const legendParent = clone.querySelector(".cmn-heatmap-low-high");
          if (legendParent) {
            legendParent.innerHTML = ""; // Clear old legend canvas
            legendParent.appendChild(legendContainer);
          }
        }
        // ================================

        // Render off-screen
        // const container = document.createElement("div");
        // container.style.position = "absolute";
        // container.style.left = "-9999px";
        // container.style.top = "-9999px";
        // document.body.appendChild(container);
        // container.appendChild(clone);

        // await new Promise(res => setTimeout(res, 200));

        // const renderCanvas = await html2canvas(clone, {
        //   backgroundColor: "#fff",
        //   useCORS: true,
        //   scale: 2
        // });

        // document.body.removeChild(container);

        // // PDF placement
        // const imgData = renderCanvas.toDataURL("image/png");
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        document.body.appendChild(container);
        container.appendChild(clone);

        await new Promise((res) => setTimeout(res, 200));

        const renderCanvas = await html2canvas(clone, {
          backgroundColor: "#fff",
          useCORS: true,
          scale: 2,
        });

        document.body.removeChild(container);

        const imgData = renderCanvas.toDataURL("image/png");
        pdf.addPage();
        pageNumber++;
        currentY = headerHeight + verticalSpacing;

        let displayWidth = pdfWidth - pagePadding * 2;
        let displayHeight =
          (renderCanvas.height * displayWidth) / renderCanvas.width;

        if (displayHeight > maxChartHeight) {
          const ratio = maxChartHeight / displayHeight;
          displayWidth *= ratio;
          displayHeight *= ratio;
        }

        const offsetX = (pdfWidth - displayWidth) / 2;
        pdf.addImage(
          imgData,
          "PNG",
          offsetX,
          currentY,
          displayWidth,
          displayHeight
        );
        currentY += displayHeight + verticalSpacing;
      }

      // ---- Render Map/Floor Plan Charts (1 widget per page) ----
      for (let chart of mapFloorCharts) {
        pdf.addPage();
        pageNumber++;
        currentY = headerHeight + verticalSpacing;

        let displayWidth = pdfWidth - pagePadding * 2;
        let displayHeight =
          (chart.originalHeight * displayWidth) / chart.originalWidth;

        // Scale down if taller than max usable height
        if (displayHeight > maxChartHeight) {
          const ratio = maxChartHeight / displayHeight;
          displayWidth *= ratio;
          displayHeight *= ratio;
        }

        const offsetX = (pdfWidth - displayWidth) / 2;

        pdf.addImage(
          chart.imgData,
          "PNG",
          offsetX,
          currentY,
          displayWidth,
          displayHeight
        );

        currentY += displayHeight + verticalSpacing;
      }

      // After all pages are added, update header/footer to reflect total pages
      const totalPages = pageNumber;
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        addHeaderFooter(p, totalPages); // now with real total pages count
      }

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = now.getFullYear();
      const fileName = `Dashboard_Widgets_${day}_${month}_${year}.pdf`;
      //LoadingManager.hideLoading();
      pdf.save(fileName);
      onClose();
    } catch (error) {
      LoadingManager.hideLoading();
      console.error("Error exporting PDF:", error);
    } finally {
      setExporting(false); // stop refresh
      setIsExportPdfClicked(false); // Reset the flag after export
      LoadingManager.hideLoading();
    }
  };

  const handleChange = (event: any) => {
    const value = event.target.value;

    if (value.includes("all")) {
      const allOptionIds = selectedWidgetsOptions
        .filter((opt) => opt.id !== "all")
        .map((opt) => opt.id);
      const isAllSelected = allOptionIds.every((id) =>
        selectedWidgets.includes(id)
      );
      setSelectedWidgets(isAllSelected ? [] : allOptionIds);
    } else {
      setSelectedWidgets(value);
    }
  };
  const isAllSelected = selectedWidgetsOptions
    .filter((o) => o.id !== "all")
    .every((o) => selectedWidgets.includes(o.id));

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      sx={{
        "& .MuiPaper-root": { borderRadius: "24px", position: "relative" },
      }}
      className="cmn-pop-design-parent advance-report-popup"
    >
      <DialogTitle className="cmn-pop-header">
        <Typography component="h1" variant="h5">
          Advance Report
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FormControl fullWidth margin="normal">
            <div className="advance-report-wrapper">
              <Label>Widgets</Label>
              <Select
                displayEmpty
                multiple
                value={selectedWidgets}
                onChange={handleChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return (
                      <span style={{ color: "#aaa" }}>Select widgets...</span>
                    ); // placeholder text
                  }
                  const selectedTitles = selected
                    .map(
                      (id) =>
                        selectedWidgetsOptions.find((o) => o.id === id)?.title
                    )
                    .filter(Boolean);

                  return selectedTitles.join(", ");
                  // return (
                  //   <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  //     {selected.map((id) => (
                  //       <Chip
                  //         key={id}
                  //         label={
                  //           selectedWidgetsOptions.find((o) => o.id === id)?.title
                  //         }
                  //       />
                  //     ))}
                  //   </Box>
                  // )
                }}
              >
                {selectedWidgetsOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Checkbox
                      checked={
                        option.id === "all"
                          ? isAllSelected
                          : selectedWidgets.includes(option.id)
                      }
                    />
                    <ListItemText primary={option.title} />
                  </MenuItem>
                ))}
              </Select>
            </div>
            <DialogActions className="advance-report-buttons-wrapper">
              <Button
                className="common-btn-design common-btn-design-transparent"
                onClick={() => {
                  setSelectedWidgets([]); // clear only when cancel
                  onClose();
                }}
                sx={{
                  backgroundColor: "#F9F9FA",
                  color: "#424242",
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>
              <Button
                className="common-btn-design"
                onClick={async () => {
                  await onExportCSV();
                  onClose();
                }}
                sx={{
                  background: "linear-gradient(to right, #FF8A00, #FE6500)",
                  color: "white",
                  textTransform: "none",
                }}
                autoFocus
              >
                Export CSV
              </Button>
              <Button
                className="common-btn-design"
                onClick={async () => {
                  try {
                    await onExportPDF();
                    //onClose();
                  } catch (err) {
                    LoadingManager.hideLoading();
                    console.error("Export failed", err);
                  }
                }}
                sx={{
                  background: "linear-gradient(to right, #FF8A00, #FE6500)",
                  color: "white",
                  textTransform: "none",
                }}
                autoFocus
              >
                Export PDF
              </Button>
            </DialogActions>
          </FormControl>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default ExportWidgetDialog;
