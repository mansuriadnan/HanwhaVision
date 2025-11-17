import React, { useState, useEffect } from "react";
import {
  CommonWidgetProps,
  LayoutItem,
  ISelectedFeaturesWiseWidget,
  IMapPlanData,
} from "../../../../interfaces/IChart";
import { GoogleMapComponent, MapWidgetSetup } from "../../../index";
import {
  Box,
  IconButton,
  MenuItem,
  Menu,
  ListItemText,
  Typography,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useJsApiLoader } from "@react-google-maps/api";
import { useSettingsContext } from "../../../../context/SettingContext";
const LIBRARIES = ["places", "geometry", "drawing"] as const;
import { useMapContext } from "../../../../context/MapContext";

const MapPlanWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  onDeleteWidget,
  onSaveWidgetSetUpData,
  setIsDraggable,
  onChangeWidgetName,
}) => {
  const { width, height, displayName, configurationData, chartName } =
    item as LayoutItem;
  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [openSetup, setOpenSetup] = useState(false);
  const [mapCameras, setMapCameras] = useState<IMapPlanData[]>(
    configurationData?.features ? configurationData?.features : []
  );

  const { settings } = useSettingsContext();
  const { setNewCurrentPosition, setNewZoomLevel } = useMapContext();

  useEffect(() => {
    if (configurationData?.zoom) {
      setNewZoomLevel(configurationData?.zoom);
    } else {
      setNewZoomLevel(8);
    }

    if (configurationData?.lat && configurationData?.lng) {
      setNewCurrentPosition({
        lat: configurationData.lat,
        lng: configurationData.lng,
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setNewCurrentPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }
  }, []);

  if (!settings?.googleApiKey) {
    // return null;
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: settings?.googleApiKey,
    libraries: [...LIBRARIES],
    id: "google-map-script",
  });

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  const renderLayout = () => {
    return (
      <Box sx={{ height: height, display: "flex" }}>
        <Box sx={{ width: width }}>
          <Box className="widget-main-wrapper">
            <Box className="widget-main-header">
              <Typography variant="h6" component="h2">
                {displayName}
              </Typography>
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
            </Box>

            <Box className="widget-main-body google-map-widget-main">
              <div className="widget-data-wrapper">
                <GoogleMapComponent
                  IsSetUpView={false}
                  mappedCameras={mapCameras}
                  floor={floor}
                  zones={zones}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                />
              </div>
            </Box>

            <Box className="widget-main-footer">
              <Box
                className="widget-main-footer-zoom-i"
                onMouseEnter={() => setIsDraggable?.(true)}
                onMouseLeave={() => setIsDraggable?.(false)}
              >
                <img
                  src={"/images/dashboard/drag.svg"}
                  alt="vehicle"
                  width={35}
                  height={35}
                />
              </Box>
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
      {renderLayout()}
      {/* <CommonDialog
        open={openZoomDialog}
        title={"Expanded View"}
        onCancel={handleCloseZoom}
        maxWidth={"lg"}
        customClass={"widget_popup cmn-pop-design-parent"}
        content={renderLayout()}
      /> */}
      <Menu
        anchorEl={menuAnchor}
        open={openMenu}
        onClose={() => {
          setOpenMenu(false);
          setMenuAnchor(null);
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            pr: 1,
          },
        }}
        className="list-menus"
      >
        <MenuItem
          onClick={() => {
            setOpenSetup(true);
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

        <MenuItem onClick={onDeleteWidget}>
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

      {openSetup && (
        <MapWidgetSetup
          item={item as LayoutItem}
          openSetup={openSetup}
          onClose={() => {
            setOpenSetup(false);
          }}
          floor={floor}
          zones={zones}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          OnMapApply={(data: ISelectedFeaturesWiseWidget) => {
            onSaveWidgetSetUpData?.(data as ISelectedFeaturesWiseWidget);
            setOpenSetup(false);
            // setZoomLevel(data.zoom);
            // setCurrentPosition({
            //   lat: data.lat,
            //   lng: data.lng,
            // });
            setMapCameras(data.features as IMapPlanData[]);
          }}
          onChangeWidgetName={onChangeWidgetName}
        />
      )}
    </>
  );
};

export { MapPlanWidget };
