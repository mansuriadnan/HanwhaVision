import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IFloorPlanData,
  ISelectedFloorFeaturesWiseWidget,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  Box,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import {
  CommonDialog,
  FloorPlanWidgetSetup,
  LocalLoader,
} from "../../../index";
import { CommonFloorPlanViewer } from "./CommonFloorPlanViewer";
import {
  GetFloorPlanImageService,
  GetFloorPlanImageServicelocalloader,
} from "../../../../services/floorPlanService";
import { useThemeContext } from "../../../../context/ThemeContext";
import { useSignalRContext } from "../../../../context/SignalRContext";

const FloorPlanWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  onDeleteWidget,
  onSavefloorWidgetSetUpData,
  setIsDraggable,
  onChangeWidgetName,
}) => {
  const { width, height, displayName, floorConfigurationData, chartName } =
    item as LayoutItem;
  const { theme } = useThemeContext();

  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [openSetup, setOpenSetup] = useState(false);
  const [floorWiseData, setFloorWiseData] = useState<
    ISelectedFloorFeaturesWiseWidget[]
  >(floorConfigurationData?.floorWiseData || []);
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [mapCameras, setMapCameras] = useState<IFloorPlanData[]>([]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"image" | "pdf" | undefined>(
    undefined
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => { };
  const [loadingCount, setLoadingCount] = useState(0);
  const { IsDisplayLoader } = useSignalRContext();

  const availableFloors = useMemo(() => {
    return floorWiseData?.filter((f) => floor?.includes(f.floorId)) || [];
  }, [floorWiseData, floor]);

  useEffect(() => {
    if (!selectedFloorId && availableFloors.length > 0) {
       setSelectedFloorId(availableFloors[0].floorId);
    }
  }, [availableFloors]);

  useEffect(() => {
    if (selectedFloorId !== "") {
      const selectedFloorData = floorWiseData.find(
        (f) => f.floorId === selectedFloorId
      );
      if (selectedFloorData) {
        const cameras = selectedFloorData.featureWiseMapping.flatMap(
          (f) => f.devices
        );
        setMapCameras(cameras);
        GetFloorPlanImageByFloorId(selectedFloorId);
      }
    }
  }, [selectedFloorId, floorWiseData]);

  
  const GetFloorPlanImageByFloorId = async (id: string) => {
    if (!id) return;
    setLoadingCount((c) => c + 1);
    try {
      setImageSrc(null);
      setPdfFile(null);

      const response: string = await GetFloorPlanImageServicelocalloader(id);

      if (response?.startsWith("data:image/")) {
        setViewMode("image");
        setImageSrc(response);
      } else if (response?.startsWith("data:application/pdf")) {
        setViewMode("pdf");
        setPdfFile(response);
      } else {
        setViewMode(undefined);
      }
    } catch (error) {
      console.error("Error fetching floor plan image:", error);
      setViewMode(undefined);
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };

  const handleFloorChange = (event: SelectChangeEvent) => {
    setSelectedFloorId(event.target.value);
  };

  const handleZoomClick = () => {
    setOpenZoomDialog(true);
  };

  const handleCloseZoom = () => {
    setOpenZoomDialog(false);
  };

  const renderLayout = () => {
    return (
      <Box sx={{ height: height, display: "flex" }} className="only-floor-plan">
        <Box sx={{ width: width }}>
          <Box className="widget-main-wrapper">
            <Box className="widget-main-header widget-main-header-floor-plan-head-in">
              {/* Header */}
              <Typography variant="h6" component="h2">
                {displayName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {availableFloors.length > 0 && !openZoomDialog && (
                  <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                    <InputLabel id="floor-select-label">Floor</InputLabel>
                    <Select
                      labelId="floor-select-label"
                      value={selectedFloorId}
                      onChange={handleFloorChange}
                      label="Floor"
                    >
                      {availableFloors.map((floor) => (
                        <MenuItem key={floor.floorId} value={floor.floorId}>
                          {floor.floorName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {!openZoomDialog && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(true);
                      setMenuAnchor(e.currentTarget);
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Floor Viewer */}
            <Box className="widget-main-body google-map-widget-main">
              <div className="widget-data-wrapper floor-plan-widget-main">
                {availableFloors.length === 0 ? (
                  <Box
                    sx={{
                      height: height - 80,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: 14,
                    }}
                  >
                    Please select a floor in setup. No floor data available.
                  </Box>
                ) :
                  (
                    <div style={{ maxHeight: height, maxWidth: width }}>
                      <CommonFloorPlanViewer
                        IsSetUpView={false}
                        viewMode={viewMode}
                        imageSrc={imageSrc}
                        pdfFile={pdfFile}
                        containerRef={containerRef}
                        mappedCameras={mapCameras}
                        onDocumentLoadSuccess={onDocumentLoadSuccess}
                        floor={floor}
                        zones={zones}
                        selectedStartDate={selectedStartDate}
                        selectedEndDate={selectedEndDate}
                        selectedFloorId = {selectedFloorId}
                        setLoadingCount = {setLoadingCount}
                      />
                    </div>
                  )}
              </div>
            </Box>

            {/* Setup Modal */}
            {openSetup && (
              <FloorPlanWidgetSetup
                item={item}
                openSetup={openSetup}
                onClose={() => setOpenSetup(false)}
                OnFloorApply={(data) => {
                  onSavefloorWidgetSetUpData?.(data);
                  setOpenSetup(false);
                  setFloorWiseData(data);
                  const firstValid = data.find((d) => floor?.includes(d.floorId));
                  if (firstValid) {
                    setSelectedFloorId(firstValid.floorId);
                  }
                }}
                floorWiseData={floorWiseData}
                onChangeWidgetName={onChangeWidgetName}
              />
            )}

            {/* Zoom Button */}
            <Box className="widget-main-footer">
              <Box className="widget-main-footer">
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
              </Box>
              {!openZoomDialog ? (
                <Box
                  className="widget-main-footer-zoom-i"
                  onClick={handleZoomClick}
                  id="zoomwidgetBtnFloorPlan"
                >
                  <img
                    src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                    alt="vehicle"
                    width={35}
                    height={35}
                  />
                </Box>
              ) : null}
            </Box>
            <Box className="widget-label-bottom">
              <span>{chartName}</span>
              <img
                src="/images/question_circle_icon_widget_bottom_title.svg"
                alt="info Icon"
                className="widget-label-icon-bottom"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {loadingCount > 0 && !IsDisplayLoader ? (
        <LocalLoader width={width} height={height} size={50} color="warning" />
      ) : (
        <>
          {renderLayout()}
          <CommonDialog
            open={openZoomDialog}
            title={"Expanded View"}
            onCancel={handleCloseZoom}
            maxWidth={"lg"}
            content={renderLayout()}
            isWidget={true}
            customClass={"cmn-pop-design-parent widget_popup_floor_plan"}
          />
          {/* Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={openMenu}
            onClose={() => {
              setOpenMenu(false);
              setMenuAnchor(null);
            }}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: 2, pr: 1 },
            }}
             className="list-menus"
          >
            <MenuItem onClick={() => setOpenSetup(true)}>
              <IconButton>
                <img
                  src="/images/keyboard.svg"
                  alt="setup"
                  width={20}
                  height={20}
                />
              </IconButton>
              <ListItemText primary="Setup" />
            </MenuItem>
            <MenuItem onClick={onDeleteWidget}>
              <IconButton>
                <img
                  src="/images/trash.svg"
                  alt="delete"
                  width={20}
                  height={20}
                />
              </IconButton>
              <ListItemText primary="Delete" />
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  );
};

export { FloorPlanWidget };
