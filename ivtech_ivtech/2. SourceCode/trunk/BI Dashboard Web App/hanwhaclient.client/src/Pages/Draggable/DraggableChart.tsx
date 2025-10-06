import React, { useState, useLayoutEffect, useCallback, useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { MenuItem, IconButton, Menu, ListItemText } from "@mui/material";
import {
  CameraByFeatureWidget,
  CameraOnlineOfflineWidget,
  VehicleQueueAnalysisWidget,
  CapacityUtilizationForPeopleWidget,
  ModaltypesWidget,
  GenderWidget,
  ZoneWiseCapacityUtilizationForPeopleWidget,
  PedestrianDetectionWidget,
  SlipAndFallDetectionWidget,
  CapacityUtilizationForVehicleWidget,
  VehicleInWrongDirectionWidget,
  VehicleUTurnWidget,
  VehicleTurningMovementWidget,
  ShoppingQueueEventWidget,
  ForkliftQueueEventWidget,
  ZoneWiseCapacityUtilizationForVehicleWidget,
  ZoneWisePeopleCountingWidget,
  SpeedViolationbyVehicleWidget,
  TrafficJambyDayWidget,
  CountingForForkliftWidget,
  MapPlanWidget,
  FloorPlanWidget,
  SafetyMeasuresWidgets,
  AveragePeopleCountWidget,
  PeopleInOutWidget,
  NewVsTotalVisitorsWidget,
  VehicleByTypeWidget,
  AverageVehicleCountWidget,
  CumulativePeopleWidget,
  BlockedExitDetectionWidget,
  VehicleInOutWidget,
  StoppedVehicleCountByTypeWidget,
  PeopleQueueEventWidget,
  DetectForkliftsWidget,
  VehicleDetectionHeatmapWidget,
  ForkliftHeatmapWidget,
  ShoppingcartHeatmapWidget,
  ForkliftSpeedDetectionWidget,
  ShoppingCartCountingWidget,
  CommonDialog,
} from "../../components";
import {
  IDashboardProps,
  ISelectedFeaturesWiseWidget,
  ISelectedFloorFeaturesWiseWidget,
  LayoutItem,
  Layouts,
} from "../../interfaces/IChart";
import { MoreVert } from "@mui/icons-material";
import { WidgetSetup } from "../index";
import { useUser } from "../../context/UserContext";
import { PeopleCountingHeatmapWidget } from "../../components/Dashboard/Chart_Polygon/PeopleCountingHeatmap/PeopleCountingHeatmapWidget";
import * as d3 from "d3";
const ResponsiveGridLayout = WidthProvider(Responsive);

// Create tooltip div
const tooltip = d3.select("#tooltip");

if (tooltip.empty()) {
  d3.select("body").append("div").attr("id", "tooltip");
}

const DraggableChart: React.FC<IDashboardProps> = ({
  selectedFloors,
  selectedZones,
  layouts,
  setLayouts,
  selectedStartDate,
  selectedEndDate,
}) => {
  const [selectedChartItem, setSelectedChartItem] = useState<LayoutItem>();
  const [openSetup, setOpenSetup] = useState(false);
  const [openDeleteWidgetConfirm, setOpenDeleteWidgetConfirm] = useState(false);
  const [widgetToBeDelete, setWidgetToBeDelete] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    anchorEl: HTMLElement | null;
    // item: any | null;
    selectedItemId: number;
  }>({
    anchorEl: null,
    // item: null,
    selectedItemId: 0,
  });
  const {
    setSelectedCameraHeatMap,
    setSelectedForkliftHeatMap,
    setSelectedShoppingHeatMap,
    setSelectedPeopleCountingHeatMap,
  } = useUser();

  const openMenu = Boolean(menuAnchor.anchorEl);
  const [isDraggable, setIsDraggable] = useState(false);

  // Changed: Use a Map to store export handlers for each widget
  const [exportHandlers, setExportHandlers] = useState<
    Map<number, (item: LayoutItem) => void>
  >(new Map());

  const advancedReportExtraLargeChartList = [
    "Vehicle Detection Heatmap",
    "Forklift Heatmap",
    "Shopping Cart Heatmap",
    "People Counting Heatmap",
  ];
  const mapPlanFloorPlanWidgetList = ["Map Plan", "Floor Plan"];
  

  // Modified function to use separate maps
  const setExportHandlerForWidget = useCallback(
    (chartID: number, handler: (item: LayoutItem) => void) => {
      // Set the handler in the existing map
      setExportHandlers((prev) => {
        const newMap = new Map(prev);
        newMap.set(chartID, handler);
        return newMap;
      });

      // Set the size in the new map
      // setExportHandlerSizes((prev) => {
      //   const newMap = new Map(prev);
      //   newMap.set(chartID, size);
      //   return newMap;
      // });
    },
    []
  );

  // Modified handleExport function
  const handleExport = (chartID: number) => {
    handleClose();
    const handler = exportHandlers.get(chartID);
    const item = layouts.lg.find(
      (layout: LayoutItem) => layout.chartID === chartID
    );

    if (handler && item) {
      // Check if the stored size matches the current size
      handler(item);
    } else {
      console.log(`No export handler found for widget ${chartID}`);
    }
  };

  // const [exportHandler, setExportHandler] = useState<() => void>(() => () => {
  //   console.log("No export handler set");
  // });

  // const handleExport = () => {
  //   handleClose();
  //   exportHandler(); // This will call the child's export logic
  // };

  // useEffect(() => {
  //   setConvertedStartDate(
  //     convertToUTC(selectedStartDate.format("YYYY-MM-DDTHH:mm:ssZ"))
  //   );
  //   setConvertedEndDate(
  //     convertToUTC(selectedEndDate.format("YYYY-MM-DDTHH:mm:ssZ"))
  //   );
  // }, [selectedStartDate, selectedEndDate, layouts]);

  const handleLayoutChange = (_: any, allLayouts: any) => {
    allLayouts?.lg.map((item: LayoutItem, index: number) => {
      const parentDiv: any = document.getElementById(`parent${item.i}`);

      if (parentDiv) {
        const resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          const { width, height } = entry.contentRect;

          setLayouts((prevLayouts: Layouts) => ({
            ...prevLayouts,
            lg: prevLayouts?.lg?.map((layout, idx) =>
              idx === index
                ? {
                    ...layout,
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h,
                    width,
                    height,
                  }
                : layout
            ),
          }));
        });

        resizeObserver.observe(parentDiv);
      } else {
      }
    });
  };

  useLayoutEffect(() => {}, [layouts]); // Run when layouts are updated

  const handleDeletewidget = (item: any) => {
    setOpenDeleteWidgetConfirm(true);
    setWidgetToBeDelete(item);
  };

  const handleCloseConfirm = () => {
    setOpenDeleteWidgetConfirm(false);
    setWidgetToBeDelete(null);
  };

  const removeItem = (item: any) => {
    const id = item.i;

    setLayouts((prevLayouts: any) => ({
      ...prevLayouts,
      lg: prevLayouts.lg.filter((layout: any) => layout.i !== id),
    }));

    // Clean up export handler for deleted widget
    setExportHandlers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(item.chartID);
      return newMap;
    });

    if (item.chartName == "Vehicle Detection Heatmap")
      setSelectedCameraHeatMap([]);
    if (item.chartName == "Forklift Heatmap") setSelectedForkliftHeatMap([]);
    if (item.chartName == "Shopping Cart Heatmap")
      setSelectedShoppingHeatMap([]);
    if (item.chartName == "People Counting Heatmap")
      setSelectedPeopleCountingHeatMap([]);

    setOpenDeleteWidgetConfirm(false);
  };

  const handleClose = () => {
    setMenuAnchor({
      anchorEl: null,
      selectedItemId: 0,
    });
  };

  const handleSaveWidgetSetUpData = (
    data: ISelectedFeaturesWiseWidget,
    chartID: number
  ) => {
    setLayouts((prevLayouts: Layouts) => ({
      ...prevLayouts,
      lg: prevLayouts?.lg?.map((layout) => {
        if (layout.chartID === chartID) {
          return {
            ...layout,
            configurationData: data,
          };
        }
        return layout;
      }),
    }));
  };

  const handleSaveFloorPlanWidgetSetUpData = (
    data: ISelectedFloorFeaturesWiseWidget[],
    chartID: number
  ) => {
    setLayouts((prevLayouts: Layouts) => ({
      ...prevLayouts,
      lg: prevLayouts?.lg?.map((layout) => {
        if (layout.chartID === chartID) {
          return {
            ...layout,
            floorConfigurationData: {
              floorWiseData: data,
            },
          };
        }
        return layout;
      }),
    }));
  };

  // const handleZoomClick = (widgetItem: any) => {
  //   setZoomedWidget(widgetItem);
  //   setOpenZoomDialog(true);
  // };

  // const handleCloseZoom = () => {
  //   setOpenZoomDialog(false);
  //   setZoomedWidget(null);
  // };

  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.ctrlKey) {
  //       setIsDraggable(true);
  //     }
  //   };

  //   const handleKeyUp = (e: KeyboardEvent) => {
  //     if (!e.ctrlKey) {
  //       setIsDraggable(false);
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   window.addEventListener("keyup", handleKeyUp);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("keyup", handleKeyUp);
  //   };
  // }, []);

  const handlechangeWidgetName = (widgetName: string, chartID: number) => {
    setLayouts((prevLayouts: Layouts) => ({
      ...prevLayouts,
      lg: prevLayouts?.lg?.map((layout) => {
        if (layout.chartID === chartID) {
          return {
            ...layout,
            displayName: widgetName,
          };
        }
        return layout;
      }),
    }));
  };

  const getWidgetClass = (item: any) => {
    const chartName = item.chartName;

    if (mapPlanFloorPlanWidgetList.includes(chartName)) {
      return "map-floor-plan-charts";
    }
    if (advancedReportExtraLargeChartList.includes(chartName)) {
      return "extra-large-charts";
    }
    if (item.size === "1x1") {
      return "one-by-one";
    }

    if (
      (item.size === "2x1" || item.size === "3x1") &&
      !advancedReportExtraLargeChartList.includes(item.chartName) &&
      !mapPlanFloorPlanWidgetList.includes(chartName)
    ) {
      return "two-by-one";
    }
  };

  const memoizedFloor = useMemo(
    () => [...selectedFloors],
    [JSON.stringify(selectedFloors)]
  );
  const memoizedZones = useMemo(
    () => [...selectedZones],
    [JSON.stringify(selectedZones)]
  );
  const memoizedStartDate = useMemo(
    () => selectedStartDate,
    [selectedStartDate?.toISOString()]
  );

  const memoizedEndDate = useMemo(
    () => selectedEndDate,
    [selectedEndDate?.toISOString()]
  );

  return (
    <div className="widget-wrapper-main">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={50}
        isResizable={false}
        isDraggable={isDraggable}
        onLayoutChange={handleLayoutChange}
        margin={[30, 30]}
        autoSize={false}
        preventCollision={true}
        // compactType="vertical"
      >
        {layouts?.lg?.map((item: LayoutItem) => (
          <div
            key={item.i}
            className={`draggableItem widge-box-main ${getWidgetClass(item)}`}
            id={`parent${item.i}`}
          >
            <div className="widge-box-inner">
              {item.chartName === "Capacity Utilization for People" && (
                <CapacityUtilizationForPeopleWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Capacity Utilization for Vehicle" && (
                <CapacityUtilizationForVehicleWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName ===
                "Zone Wise Capacity Utilization for People" && (
                <ZoneWiseCapacityUtilizationForPeopleWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName ===
                "Zone Wise Capacity Utilization for Vehicle" && (
                <ZoneWiseCapacityUtilizationForVehicleWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Zone wise People Counting" && (
                <ZoneWisePeopleCountingWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Model Types" && (
                <ModaltypesWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Feature Types" && (
                <CameraByFeatureWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Camera Online/Offline" && (
                <CameraOnlineOfflineWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Vehicle Queue Analysis" && (
                <VehicleQueueAnalysisWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setIsDraggable={setIsDraggable}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                />
              )}
              {item.chartName === "Vehicle by Type" && (
                <VehicleByTypeWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "New vs Total Visitors" && (
                <NewVsTotalVisitorsWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Average People Counting" && (
                <AveragePeopleCountWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Average Vehicle Counting" && (
                <AverageVehicleCountWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Blocked exit detection" && (
                <BlockedExitDetectionWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Factory Blocked exit detection" && (
                <BlockedExitDetectionWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Stopped Vehicle Count Time" && (
                <StoppedVehicleCountByTypeWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Queue events for people" && (
                <PeopleQueueEventWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Detect Forklifts" && (
                <DetectForkliftsWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Safety Measures" && (
                <SafetyMeasuresWidgets
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Vehicle Detection Heatmap" && (
                <VehicleDetectionHeatmapWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Forklift Heatmap" && (
                <ForkliftHeatmapWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Shopping Cart Heatmap" && (
                <ShoppingcartHeatmapWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "People Counting Heatmap" && (
                <PeopleCountingHeatmapWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Gender" && (
                <GenderWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "People" && (
                <PeopleInOutWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Cumulative People Count" && (
                <CumulativePeopleWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Pedestrian Detection" && (
                <PedestrianDetectionWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Slip & Fall Detection" && (
                <SlipAndFallDetectionWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Vehicle in Wrong Direction" && (
                <VehicleInWrongDirectionWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Vehicle U Turn detection" && (
                <VehicleUTurnWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Vehicle Turning Movement counts" && (
                <VehicleTurningMovementWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Queue events for shopping cart" && (
                <ShoppingQueueEventWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Queue events for forklift" && (
                <ForkliftQueueEventWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Speed Violation by Vehicle" && (
                <SpeedViolationbyVehicleWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Traffic Jam by Day" && (
                <TrafficJambyDayWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Vehicle" && (
                <VehicleInOutWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}

              {item.chartName === "Counting for forklift" && (
                <CountingForForkliftWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
              {item.chartName === "Map Plan" && (
                <MapPlanWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  onDeleteWidget={() => handleDeletewidget(item)}
                  onSaveWidgetSetUpData={(data) =>
                    handleSaveWidgetSetUpData(data, item.chartID)
                  }
                  setIsDraggable={setIsDraggable}
                  onChangeWidgetName={(editableName) =>
                    handlechangeWidgetName(editableName, item.chartID)
                  }
                />
              )}

              {item.chartName === "Floor Plan" && (
                <FloorPlanWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  onSavefloorWidgetSetUpData={(data) =>
                    handleSaveFloorPlanWidgetSetUpData(data, item.chartID)
                  }
                  onDeleteWidget={() => handleDeletewidget(item)}
                  setIsDraggable={setIsDraggable}
                  onChangeWidgetName={(editableName) =>
                    handlechangeWidgetName(editableName, item.chartID)
                  }
                />
              )}

              {item.chartName === "Forklift Speed Detection" && (
                <ForkliftSpeedDetectionWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setIsDraggable={setIsDraggable}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                />
              )}

              {item.chartName === "Shopping Cart Counting" && (
                <ShoppingCartCountingWidget
                  item={item}
                  floor={memoizedFloor}
                  zones={memoizedZones}
                  selectedStartDate={memoizedStartDate}
                  selectedEndDate={memoizedEndDate}
                  setExportHandler={(handler) =>
                    setExportHandlerForWidget(item.chartID, handler)
                  }
                  setIsDraggable={setIsDraggable}
                />
              )}
            </div>
            {item.chartID != 38 && item.chartID != 39 ? (
              <div className="MoreInfo">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAnchor({
                      anchorEl: e.currentTarget,
                      selectedItemId: item.chartID,
                    });
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </div>
            ) : null}
            {menuAnchor?.selectedItemId === item.chartID && (
              <Menu
                className="widget-side-menu"
                anchorEl={menuAnchor.anchorEl}
                open={openMenu}
                onClose={handleClose}
                // anchorOrigin={{
                //   vertical: 'top',
                //   horizontal: 'left',
                // }}
                // transformOrigin={{
                //   vertical: 'top',
                //   horizontal: 'left',
                // }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    borderRadius: 2,
                    pr: 1,
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleExport(item.chartID)} // Changed: Pass the specific chartID
                >
                  <IconButton>
                    <img
                      src={"/images/export.svg"}
                      alt="export"
                      width={20}
                      height={20}
                    />
                  </IconButton>
                  <ListItemText primary="Export" />
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleClose();
                    setOpenSetup(true);
                    setSelectedChartItem(item as LayoutItem);
                  }}
                >
                  <IconButton>
                    <img
                      src={"/images/keyboard.svg"}
                      alt="setup"
                      width={20}
                      height={20}
                    />
                  </IconButton>
                  <ListItemText primary="Setup" />
                </MenuItem>

                <MenuItem
                  // onClick={() => {
                  //   removeItem(item);
                  // }}
                  onClick={() => {
                    handleClose();
                    handleDeletewidget(item);
                  }}
                >
                  <IconButton>
                    <img
                      src={"/images/trash.svg"}
                      alt="delete"
                      width={20}
                      height={20}
                    />
                  </IconButton>
                  <ListItemText primary="Delete" />
                </MenuItem>
              </Menu>
            )}

            {selectedChartItem &&
              selectedChartItem?.chartID === item.chartID && (
                <WidgetSetup
                  item={selectedChartItem}
                  openSetup={openSetup}
                  onClose={() => {
                    setOpenSetup(false);
                    setSelectedChartItem(undefined);
                  }}
                  onApply={(
                    size,
                    expanded,
                    deivceListforPVCount,
                    deivceListforHeatMap
                  ) => {
                    setOpenSetup(false);
                    setSelectedChartItem(undefined);
                    setLayouts((prevLayouts: Layouts) => ({
                      ...prevLayouts,
                      lg: prevLayouts?.lg?.map((layout) => {
                        if (layout.chartID === item.chartID) {
                          return {
                            ...layout,
                            w: size === "3x1" ? 9 : size === "2x1" ? 6 : 3,
                            size: size,
                            expanded: expanded,
                            deivceListforPVCount: deivceListforPVCount,
                            deivceListforHeatMap: deivceListforHeatMap,
                          };
                        }
                        return layout;
                      }),
                    }));
                  }}
                  onChangeWidgetName={(editableName) =>
                    handlechangeWidgetName(editableName, item.chartID)
                  }
                />
              )}
          </div>
        ))}
      </ResponsiveGridLayout>

      <CommonDialog
        open={openDeleteWidgetConfirm}
        title="Delete Confirmation!"
        customClass="cmn-confirm-delete-icon"
        content="Are you sure you want to Delete this Widget?"
        onConfirm={() => widgetToBeDelete && removeItem(widgetToBeDelete)}
        onCancel={handleCloseConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        titleClass={true}
      />
    </div>
  );
};

export { DraggableChart };
