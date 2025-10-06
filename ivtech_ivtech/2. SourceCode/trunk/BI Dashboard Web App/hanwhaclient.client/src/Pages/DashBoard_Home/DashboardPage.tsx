import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  GetAllFloorsListService,
  GetAllZonesByFloorIdService,
  GetDashboardDesign,
  SaveDashboardDesign,
} from "../../services/dashboardService";
import { DraggableChart } from "../Draggable/DraggableChart";
import {
  CommonDialog,
  CustomButton,
  CustomMultiSelect,
  showToast,
} from "../../components";
import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { ILookup } from "../../interfaces/ILookup";
import {
  IFloorZoneIds,
  Layouts,
  FloorZoneState,
} from "../../interfaces/IChart";
import dayjs, { Dayjs } from "dayjs";
import {
  dashboardCharts,
  dashboardChartsType,
} from "../../constants/dashboardChartList";
import AddIcon from "@mui/icons-material/Add";
// import NoData from "../../../public/images/dashboard/Add_Widget.gif";
import { useForm } from "react-hook-form";
import { CustomDateTimeRangePicker } from "../../components/Reusable/CustomDateTimeRangePicker";
import ExportWidgetDialog from "./ExportWidgetDialog";
import {
  checkWidgetPermission,
  HasWidgetPermission,
} from "../../utils/screenAccessUtils";
import { useThemeContext } from "../../context/ThemeContext";
import { useSignalRContext } from "../../context/SignalRContext";

const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [floorList, setFloorList] = useState<ILookup[]>([]);
  const [zoneList, setZoneList] = useState<ILookup[]>([]);
  const [layouts, setLayouts] = useState<Layouts | null>(null);
  const [open, setOpen] = React.useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<number[]>([]);
  const [selectedWidgetType, setSelectedWidgetType] = useState("All");
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(
    dayjs().startOf("day")
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(
    dayjs(new Date())
  );
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const [finalFloorZone, setFinalFloorZone] = useState<FloorZoneState>({
    finlafloorList: [],
    finalzoneList: [],
  });

  const [initalLoad, setInitalLoad] = useState(true);

  const { control, setValue, watch } = useForm<IFloorZoneIds>({
    defaultValues: {
      selectedFloorIds: [],
      selectedZonesIds: [],
      selectedExport: "",
    },
  });

  const checkedWidgetPermission = checkWidgetPermission();
  const permissionMap: Record<string, string> = Object.fromEntries(
    dashboardCharts.map((chart) => [chart.chartName, chart.permission])
  );

  const selectedFloorIds = watch("selectedFloorIds");
  const selectedZonesIds = watch("selectedZonesIds");

  const { theme } = useThemeContext();
  const { triggerRefresh } = useSignalRContext();
  const defaultFloorId = "000000000000000000000000";

  useEffect(() => {
    const fetchData = async () => {
      await fetchFloorData();
      // await fetchDashboardDesign();
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchZoneData(selectedFloorIds);
  }, [selectedFloorIds]);

  const handleDateTimeApply = ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }) => {
    setSelectedStartDate(dayjs(startDate));
    setSelectedEndDate(dayjs(endDate));
    setFinalFloorZone({
      finlafloorList: selectedFloorIds,
      finalzoneList: selectedZonesIds,
    });
  };

  useEffect(() => {
    // console.log("inside dashboard");

    // setLayouts(null);
    // // setZoneList([]);
    // // setFloorList([]);
    // onDashboardDesignChange()

    // localStorage.setItem("activeRoute", `/dashboard?id=${id}`);

    // if (dashboardPrefData) {
    setLayouts(null);
    // onDashboardDesignChange();
    fetchDashboardDesign();
    localStorage.setItem("activeRoute", `/dashboard?id=${id}`);
    // }
  }, [id]);

  useEffect(() => {
    if (!selectedFloorIds || selectedFloorIds.length === 0) return;

    const lastSelectedId = selectedFloorIds[selectedFloorIds.length - 1];

    if (lastSelectedId === defaultFloorId) {
      if (selectedFloorIds.length !== 1) {
        setValue("selectedFloorIds", [defaultFloorId], {
          shouldValidate: true,
        });
      }
    } else {
      if (selectedFloorIds.includes(defaultFloorId)) {
        setValue(
          "selectedFloorIds",
          selectedFloorIds.filter((id) => id !== defaultFloorId),
          { shouldValidate: true }
        );
      }
    }
  }, [selectedFloorIds]);

  // const fetchDashboardDesign = async () => {
  //   try{
  //     const data = await GetDashboardDesign();
  //     setDashboardPrefData(data)
  //   }catch(error) {
  //     console.error("Failed to fetch dashboard design", error);
  //   }
  // }

  const handleSetFloorAndZone = () => {
    triggerRefresh(false);
    setFinalFloorZone({
      finlafloorList: selectedFloorIds,
      finalzoneList: selectedZonesIds,
    });
  };

  const fetchDashboardDesign = async () => {
    // const data: any = await GetDashboardDesign();
    // const record = data.find((item: any) => item.id === id);

    // const json = record?.dashboardPreferenceJson;

    // const record = dashboardPrefData && dashboardPrefData.find((item: any) => item.id === id);
    // const json = record?.dashboardPreferenceJson;
    // let dashData = dashboardPrefData;
    // if(!dashboardPrefData){
    //   dashData = await GetDashboardDesign();
    //   setDashboardPrefData(dashData);
    // }
    const dashData: any = await GetDashboardDesign();
    const record = dashData?.find((item: any) => item.id === id);
    const json = record?.dashboardPreferenceJson;
    if (json && json !== "[]" && json !== "{}") {
      const parsedLayouts = JSON.parse(json);

      const filteredLayouts = (parsedLayouts || []).filter((item: any) => {
        const permission = permissionMap[item.chartName];
        return !permission || checkedWidgetPermission(permission); // ✅ valid usage
      });
      if (filteredLayouts.length > 0) {
        setLayouts({
          lg: filteredLayouts,
        });
      } else {
        setLayouts(null);
      }
    } else {
      setLayouts(null);
    }
  };

  const fetchFloorData = async () => {
    try {
      const response = await GetAllFloorsListService();
      const floorData = response?.map((item) => ({
        title: item.floorPlanName,
        id: item.id,
      }));
      setFloorList(floorData as ILookup[]);
      if (floorData && floorData.length > 0 && floorData[0].id) {
        const firstFloorId = floorData[0].id;
        setValue("selectedFloorIds", firstFloorId ? [firstFloorId] : []);
      }
    } catch (err: any) {
      console.error("Error while fetching the floor data");
    }
  };

  const fetchZoneData = async (floorIds: string[]) => {
    if (!Array.isArray(floorIds) || floorIds.length === 0) {
      setZoneList([]);
      return;
    }

    try {
      const response: any = await GetAllZonesByFloorIdService(floorIds);

      const allZones: ILookup[] = (response?.data ?? []).flatMap((floor: any) =>
        Array.isArray(floor?.zones)
          ? floor.zones.map((zone: any) => ({
              id: zone.id,
              title: zone.zoneName,
            }))
          : []
      );

      setZoneList(allZones);
      if (allZones && allZones?.length > 0 && allZones[0]?.id) {
        
        setValue("selectedZonesIds", []);
        if (initalLoad) {
          setFinalFloorZone({
            finlafloorList: selectedFloorIds,
            finalzoneList: [],
          });
          setInitalLoad(false);
        }
      } else {
        setValue("selectedZonesIds", []);
        setFinalFloorZone({
          finlafloorList: selectedFloorIds,
          finalzoneList: [],
        });
        setInitalLoad(false);
      }
    } catch (err: any) {
      console.error("Error while fetching the zone data:", err?.message || err);
      setZoneList([]);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedWidgets([]);
    setOpen(false);
  };

  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  const addItem = () => {
    // Get the last item's index to continue numbering sequentially
    const lastIndex = layouts?.lg?.length || 0;

    const existingChartIds = new Set(
      layouts?.lg?.map((item) => Number(item.chartID))
    );

    const existingCount = existingChartIds.size;
    const newCount = selectedWidgets.length;

    if (existingCount + newCount > 10) {
      showToast("You can only add up to 10 widgets per dashboard", "error");
      return;
    }

    let totalWidth =
      layouts?.lg?.reduce((sum, item) => sum + item.w, 0) ??
      (lastIndex * 3) % 12;

    // const existingchartslength = existingChartIds.length
    const duplicateWidgets = selectedWidgets.filter((id) =>
      existingChartIds.has(id)
    );

    const nonDuplicateWidgets = selectedWidgets.filter(
      (id) => !existingChartIds.has(id)
    );

    setSelectedWidgets(nonDuplicateWidgets);

    const duplicateChartNames = dashboardCharts
      .filter((chart) => duplicateWidgets.includes(chart.id))
      .map((chart) => chart.chartName);

    if (duplicateWidgets.length > 0) {
      showToast(
        `Widgets are already in dashboard: ${duplicateChartNames.join(", ")}`,
        "error"
      );
    }

    if (nonDuplicateWidgets.length === 0) {
      handleClose();
      return;
    }

    nonDuplicateWidgets.forEach((chartId, index) => {
      const chart = dashboardCharts.find((chart) => chart.id === chartId);
      const width =
        chart?.id === 38 ||
        chart?.id === 39 ||
        chart?.id === 35 ||
        chart?.id === 36 ||
        chart?.id === 37 ||
        chart?.id === 41
          ? 765
          : 366;
      const height =
        chart?.id === 38 ||
        chart?.id === 39 ||
        chart?.id === 35 ||
        chart?.id === 36 ||
        chart?.id === 37 ||
        chart?.id === 41
          ? 768
          : 0;
      const w =
        chart?.id === 38 ||
        chart?.id === 39 ||
        chart?.id === 35 ||
        chart?.id === 36 ||
        chart?.id === 37 ||
        chart?.id === 41
          ? 6
          : 3;
      const h =
        chart?.id === 38 ||
        chart?.id === 39 ||
        chart?.id === 35 ||
        chart?.id === 36 ||
        chart?.id === 37 ||
        chart?.id === 41
          ? 10
          : 5;

      const x = totalWidth % 12;
      const y = Math.floor(totalWidth / 12) * 5;

      const newItem = {
        i: (chart?.id || 0).toString(),
        x,
        y,
        w,
        h,
        width,
        height,
        content: `New Item ${lastIndex + index + 1}`,
        chartID: chart?.id || 0,
        chartName: chart?.chartName || "",
        displayName: chart?.chartName || "",
        // size: "1x1",
        size:
          chart?.id === 38 ||
          chart?.id === 39 ||
          chart?.id === 35 ||
          chart?.id === 36 ||
          chart?.id === 37 ||
          chart?.id === 41
            ? "2x1"
            : "1x1",
        expanded: "Option1",
      };

      // Save each new item one-by-one
      setLayouts((prevLayouts: Layouts | null) => ({
        lg: [...(prevLayouts?.lg || []), newItem],
      }));

      // Optional: update totalWidth if needed
      totalWidth += w;
    });

    setSelectedWidgets([]);
    handleClose();
  };

  const toggleChartSelection = (id: number) => {
    setSelectedWidgets((prev) =>
      prev.includes(id)
        ? prev.filter((chartId) => chartId !== id)
        : [...prev, id]
    );
  };

  // const filteredWidgetsType =
  //   selectedWidgetType === "All"
  //     ? dashboardCharts
  //     : dashboardCharts.filter((chart) => chart.type === selectedWidgetType);

  const permittedChartTypes = dashboardChartsType.filter((typeItem) => {
    if (typeItem.type === "All") {
      // Include "All" only if at least one chart is permitted
      return dashboardCharts.some(
        (chart) => !chart.permission || HasWidgetPermission(chart.permission)
      );
    }

    // Include only if there's at least one chart of this type and permission is granted
    return dashboardCharts.some(
      (chart) =>
        chart.type === typeItem.type &&
        (!chart.permission || HasWidgetPermission(chart.permission))
    );
  });

  const filteredWidgetsType =
    selectedWidgetType === "All"
      ? dashboardCharts.filter(
          (chart) => !chart.permission || HasWidgetPermission(chart.permission)
        )
      : dashboardCharts.filter(
          (chart) =>
            chart.type === selectedWidgetType &&
            (!chart.permission || HasWidgetPermission(chart.permission))
        );

  const saveDashboardItem = async () => {
    try {
      const DesignData = {
        id: id,
        dashboardDesignjson: JSON.stringify(layouts?.lg),
      };
      await SaveDashboardDesign(DesignData);
    } catch (err: any) {
      showToast(
        "An error occurred while saving user dashboard design.",
        "error"
      );
    }
  };

  return (
    <>
      { initalLoad == false && layouts && layouts.lg && layouts.lg.length > 0 ? (
        <>
          <Box className="dashbourd-retail-details-head">
            <div className="dashbourd-retail-details-floor">
              <CustomMultiSelect
                name="selectedFloorIds"
                control={control}
                label="Select Floor(s)*"
                options={floorList}
                placeholder="Select Floor(s)*"
                // rules={{ required: "At least one role must be selected" }}
                // required
              />
            </div>
            <div className="dashbourd-retail-details-select-zone">
              <CustomMultiSelect
                name="selectedZonesIds"
                control={control}
                label="Select Zone(s)"
                options={zoneList}
                placeholder="Select Zone(s)"
                // rules={{ required: "At least one role must be selected" }}
                // required
              />
            </div>

            <div className="dashbourd-retail-details-date">
              <CustomDateTimeRangePicker
                onApply={({ startDate, endDate }) =>
                  handleDateTimeApply({
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                  })
                }
              />
              <img src="images/calendar.png" alt="" />
            </div>

            <div className="dashbourd-retail-details-export">
              <CustomButton variant="outlined" onClick={handleSetFloorAndZone}>
                <img src="images/search.svg" alt="" />
              </CustomButton>
            </div>

            <div className="dashbourd-retail-details-export">
              {/* <CustomSelect
                name="selectedExport"
                variant="filled"
                control={control}
                label="Export your report"
                options={ExportDataList}
              /> */}
              <CustomButton
                variant="outlined"
                onClick={() => setExportDialogOpen(true)}
              >
                <img src="images/directbox-notif.svg" alt="" />
              </CustomButton>
              <ExportWidgetDialog
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
                layouts={layouts}
                selectedFloors={selectedFloorIds}
                selectedZones={selectedZonesIds}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                floorList={floorList}
                zoneList={zoneList}
              />
            </div>
          </Box>
          {/* {shouldRender && ( */}
          <DraggableChart
            selectedFloors={finalFloorZone.finlafloorList}
            selectedZones={finalFloorZone.finalzoneList}
            layouts={layouts}
            setLayouts={setLayouts}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
          />
          {/* )} */}
          {/* <DraggableChart
              selectedFloors={debouncedFloors}
              selectedZones={debouncedZones}
              layouts={layouts}
              setLayouts={setLayouts}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
            /> */}
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <IconButton onClick={saveDashboardItem}>
              <img
                src="images/save_dashboard.svg"
                alt="Save Dashboard Data"
                height={"50px"}
                width={"50px"}
              />
            </IconButton>
            <IconButton
              onClick={handleClickOpen}
              sx={{
                background: "linear-gradient(180deg, #FF8C00, #FF6A00)",
                borderRadius: "12px",
                width: "50px",
                height: "50px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  background: "linear-gradient(180deg, #FF6A00, #FF8C00)",
                },
              }}
            >
              <AddIcon sx={{ color: "#fff", fontSize: "28px" }} />
            </IconButton>
          </Box>
        </>
      ) : (
        <>
          <Box className="top-orange-head" style={backgroundStyle}>
            <Box className="top-orange-head-left">
              <Typography variant="h4">New Dashboard</Typography>
              <Typography>
                Add, update & delete your dashboard information here..
              </Typography>
            </Box>
          </Box>
          <Box
            className="add-widget"
            sx={{
              backgroundImage:
                theme === "light"
                  ? "url('images/add-widget.png')"
                  : "url('images/dark-theme/add-widget-dark.png')", // Relative path from public folder
            }}
          >
            <Box className="add-widget-wrapper">
              <img
                src={
                  theme === "light"
                    ? "/images/dashboard/Add_Widget.gif"
                    : "/images/dark-theme/dashboard/Add_Widget.gif"
                }
                alt="Animated GIF"
              />
              <h3>Add Widget</h3>
              <p>
                There's no widgets for you to see yet,
                <br /> If you want to create new widget, just select button.
              </p>
              <CustomButton variant="outlined" onClick={handleClickOpen}>
                <img src={"/images/adddevice.svg"} alt="Add Devices" />
                Add Widget
              </CustomButton>
            </Box>
          </Box>
        </>
      )}
      <CommonDialog
        open={open}
        title="Add Widgets"
        fullWidth={true}
        maxWidth={"xl"}
        customClass="add-widgets-main add-widget-outer-pop"
        content={
          <Box className="add-widets-butttons" sx={{ display: "flex" }}>
            <Box className="add-widets-listing">
              <List>
                {permittedChartTypes.map((widgetType) => (
                  <ListItem
                    key={widgetType.id}
                    disablePadding
                    className={
                      selectedWidgetType === widgetType.type ? "active" : ""
                    }
                  >
                    <ListItemButton
                      onClick={() => setSelectedWidgetType(widgetType.type)}
                      // sx={{
                      //   color:
                      //     selectedWidgetType === widgetType.type
                      //       ? "orange"
                      //       : null,
                      // }}
                    >
                      <ListItemText primary={widgetType.type} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Main Content Area */}
            <Box className="add-widets-box-wrapper">
              {filteredWidgetsType.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  color="text.secondary"
                >
                  No Widgets Available
                </Box>
              ) : (
                <Grid container spacing={2} alignItems="stretch">
                  {filteredWidgetsType.map((chart) => {
                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={chart.id}
                        className={
                          selectedWidgets.includes(chart.id) ? "active" : ""
                        }
                      >
                        <Box
                          sx={{
                            position: "relative",
                            display: "inline-block",
                          }}
                          className="add-widets-box-wrapper-content"
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 15,
                              right: 10,
                              zIndex: 1,
                            }}
                          >
                            {/* <Typography
                            variant="body2"
                            sx={{ flexGrow: 1, textAlign: "center" }}
                          >
                            {chart.chartName}
                          </Typography> */}

                            <Checkbox
                              checked={selectedWidgets.includes(chart.id)}
                              onChange={() => toggleChartSelection(chart.id)}
                            />
                          </Box>

                          <Box className="add-widets-box-wrapper-image">
                            <div className="add-widets-box-image-wrapper">
                              <img
                                src={
                                  theme === "light"
                                    ? `/images/dashboard/${chart.chartName.replace(
                                        /[^a-zA-Z0-9]/g,
                                        "_"
                                      )}_1x1.webp`
                                    : `/images/dark-theme/dashboard/${chart.chartName.replace(
                                        /[^a-zA-Z0-9]/g,
                                        "_"
                                      )}_1x1.webp`
                                }
                                alt={chart.chartName.replace(
                                  /[^a-zA-Z0-9]/g,
                                  "_"
                                )}
                              />
                            </div>
                            <span style={{ fontSize: "10px" }}>
                              {chart.chartName}
                            </span>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Box>
        }
        onConfirm={addItem}
        onCancel={handleClose}
        confirmText="Ok"
        cancelText="Cancel"
      />
    </>
  );
};

export default DashboardPage;
