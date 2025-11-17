import React, { useState, useEffect } from "react";
import {
  CommonDialog,
  CustomSelect,
  GoogleMapComponent,
  showToast,
  CustomEditableWidgetName,
} from "../../../index";
import { Box, Typography, TextField, Button } from "@mui/material";
import {
  WidgetSetUpProps,
  IMapPlanData,
  IFeatureWiseCameraList,
  ISelectedFeaturesWiseWidget,
} from "../../../../interfaces/IChart";
import { getCameraListByFeaturesService } from "../../../../services/dashboardService";
import { useForm } from "react-hook-form";
import { Search } from "@mui/icons-material";
import { useMapContext } from "../../../../context/MapContext";

const FeaturesTypeList = [
  {
    id: "PeopleCount",
    title: "People In & Out Count",
  },
  {
    id: "slipAndFallDetection",
    title: "Slip & Fall Count",
  },
  {
    id: "VehicleCount",
    title: "Vehicle In & Out Count",
  },
  {
    id: "pedestriandetection",
    title: "Pedestrian Detection Count",
  },
  {
    id: "vehiclequeuemanagement",
    title: "Vehicle Queue Analysis Count",
  },
  {
    id: "vehiclespeeddetection",
    title: "Speed Violation by Vehicle Count",
  },
  {
    id: "trafficjamdetection",
    title: "Traffic Jam by Day",
  },
  {
    id: "ShoppingCartcounting",
    title: "Shopping Cart counting",
  },
  {
    id: "Forkliftcounting",
    title: "Forklift counting",
  },
];

const MapWidgetSetup: React.FC<WidgetSetUpProps> = ({
  item,
  openSetup,
  onClose,
  OnMapApply,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  onChangeWidgetName,
}) => {
  const { configurationData } = item;
  const { currentPosition, zoomLevel } = useMapContext();

  const [mapCameras, setMapCameras] = useState<IMapPlanData[]>(
    configurationData?.features ? configurationData?.features : []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [featureWiseCameraList, setFeatureWiseCameraList] = useState<
    IFeatureWiseCameraList[]
  >([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<
    number | string | null
  >(null);

  const { control, watch } = useForm({
    defaultValues: {
      selectedFeaturesType: "",
    },
  });

  const selectedFeaturesType = watch("selectedFeaturesType");

  useEffect(() => {
    setSelectedDeviceId(null);
    getCameraListByFeatures(selectedFeaturesType);
  }, [selectedFeaturesType]);

  const getCameraListByFeatures = async (selectedFeaturesType: string) => {
    if (selectedFeaturesType != null && selectedFeaturesType != "") {
      let suburl: string;
      suburl = `?feature=${selectedFeaturesType.trim()}`;
      try {
        const response: any = await getCameraListByFeaturesService(suburl);

        if (response && response.length && response.length > 0) {
          setFeatureWiseCameraList(response);
        }
      } catch (err: any) {
        console.error(
          "Error while fetching the feature wise camera data:",
          err?.message || err
        );
        setFeatureWiseCameraList([]);
      }
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCameraList = featureWiseCameraList?.filter((item) =>
    item.cameraName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCameraClicked = (device: IFeatureWiseCameraList) => {
    // console.log("device->", device);
    // event.preventDefault();
    setSelectedDeviceId(device.deviceId + "-" + device.channelNo);

    // if (!map) return;
    // const mapCenter = map?.getCenter();
    // if (!mapCenter) return;

    // Check if the camera is already placed on the map
    const isAlready = mapCameras.filter(
      (item) =>
        item.feature === selectedFeaturesType &&
        item.deviceId === device.deviceId &&
        item.channelNo === device.channelNo
    );

    if (isAlready?.length > 0) {
      showToast("Device already present in the map", "error");
      return;
    }

    setMapCameras((prev) => [
      ...prev,
      {
        feature: selectedFeaturesType,
        deviceId: device.deviceId,
        channelNo: device.channelNo,
        position: [
          currentPosition?.lat as number,
          currentPosition?.lng as number,
        ],
      },
    ]);
  };

  const handleDeleteWidget = (deviceId: number, feature: string) => {
    setMapCameras((prev) => {
      if (!Array.isArray(prev)) {
        // console.warn("mapCameras is not an array:", prev);
        return []; // Or return prev, depending on your use case
      }
      return prev.filter(
        (cam) => !(cam.deviceId === deviceId && cam.feature === feature)
      );
    });
  };

  return (
    <>
      <CommonDialog
        open={openSetup}
        // title={item.chartName}
        customClass={"cmn-pop-design-parent widget_popup_floor_plan"}
        title={
          <CustomEditableWidgetName
            displayName={item.displayName}
            onChangeWidgetName={(name) => onChangeWidgetName?.(name)}
          />
        }
        fullWidth={true}
        maxWidth={"xl"}
        content={
          <Box className="custom-setup-pop-data">
            <Box className="custom-setup-pop-data-left">
              <Box className="custom-set-pop-left-inner">
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Select feature
                </Typography>
                <CustomSelect
                  name="selectedFeaturesType"
                  variant="filled"
                  control={control}
                  label="Feature"
                  options={FeaturesTypeList}
                />

                <label className="MuiFormLabel-root">Cameras</label>

                <TextField
                  // className="search-bar-plans-and-jones"
                  placeholder="Search IP Address/Camera Name..."
                  fullWidth
                  onChange={handleSearch}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Search />,
                  }}
                />
                <Box className="common-map-list-scroll">
                  {filteredCameraList?.map((item: IFeatureWiseCameraList) => {
                    return (
                      <Box
                        key={item.deviceId + "-" + item.channelNo}
                        onClick={() => handleCameraClicked(item)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              selectedDeviceId ===
                              item.deviceId + "-" + item.channelNo
                                ? "#FE6500"
                                : null,
                          }}
                        >
                          {item.cameraName} - {item.channelNo}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              <Box className="analysis-buttons">
                <Button
                  variant="outlined"
                  onClick={onClose}
                  className="common-btn-design common-btn-design-transparent"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  className="common-btn-design"
                  onClick={() => {
                    let tempobj: ISelectedFeaturesWiseWidget = {
                      lat: currentPosition?.lat as number,
                      lng: currentPosition?.lng as number,
                      zoom: zoomLevel,
                      features: mapCameras,
                    };
                    OnMapApply?.(tempobj);
                  }}
                  sx={{
                    background: "linear-gradient(to right, #FF8A00, #FE6500)",
                    textTransform: "none",
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
            <Box className="custom-setup-pop-data-right">
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Map Plan
              </Typography>
              <Box className="widget-main-body google-map-widget-main">
                <div className="widget-data-wrapper">
                  <GoogleMapComponent
                    IsSetUpView={true}
                    mappedCameras={mapCameras}
                    ondeleteWidget={(deviceId, feature) => {
                      handleDeleteWidget(deviceId, feature);
                    }}
                    floor={floor}
                    zones={zones}
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                  />
                </div>
              </Box>
            </Box>
          </Box>
        }
        // onConfirm={() => {
        //   let tempobj: ISelectedFeaturesWiseWidget = {
        //     lat: currentPosition?.lat as number,
        //     lng: currentPosition?.lng as number,
        //     zoom: zoomLevel,
        //     features: mapCameras,
        //   };
        //   OnMapApply?.(tempobj);
        // }}
        onCancel={onClose}
        hideActions={true}
        // confirmText="Apply"
        // cancelText="Cancel"
      />
    </>
  );
};

export { MapWidgetSetup };
