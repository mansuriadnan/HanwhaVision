import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CommonDialog,
  CustomEditableWidgetName,
} from "../../../index";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { CustomSelect } from "../../../Reusable/CustomSelect";
import {
  ICameraDevice,
  IFeatureWiseCameraList,
  IFloorPlanData,
  ISelectedFloorFeaturesWiseWidget,
  WidgetSetUpProps,
} from "../../../../interfaces/IChart";
import { useForm } from "react-hook-form";
import {
  GetAllFloorService,
  GetAllZoneByFloorIdService,
  GetFloorPlanImageService,
} from "../../../../services/floorPlanService";
import {
  IFloorPlan,
  IMappedDevice,
  IZoneList,
} from "../../../../interfaces/IFloorAndZone";
import { ILookup } from "../../../../interfaces/ILookup";
import { getCameraListByFeaturesService } from "../../../../services/dashboardService";
import { CommonFloorPlanViewer } from "./CommonFloorPlanViewer";
import { toast } from "react-toastify";

const FloorPlanWidgetSetup: React.FC<WidgetSetUpProps> = ({
  item,
  openSetup,
  onClose,
  OnFloorApply,
  floorWiseData,
  onChangeWidgetName,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
}) => {
  const { floorConfigurationData } = item;
  const FeaturesTypeList = [
    {
      id: "PeopleCount",
      title: "People Count",
    },
    {
      id: "VehicleCount",
      title: "Vehicle Count",
    },
    {
      id: "multilanevehiclecounting",
      title: "Multi lane vehicle counting",
    },
    {
      id: "pedestriandetection",
      title: "Pedestrian detection",
    },
    {
      id: "stoppedvehicledetection",
      title: "Stopped vehicle detection",
    },
    {
      id: "trafficjamdetection",
      title: "Traffic jam detection",
    },
    {
      id: "vehiclequeuemanagement",
      title: "Vehicle queue management",
    },
    {
      id: "vehiclespeeddetection",
      title: "Vehicle speed detection",
    },
    {
      id: "wrongwaydetection",
      title: "Wrong way detection",
    },
  ];

  const [floorList, setFloorList] = useState<ILookup[]>([]);
  const [featureWiseCameraList, setFeatureWiseCameraList] = useState<
    ICameraDevice[]
  >([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<
    number | string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [viewMode, setViewMode] = useState<"dwg" | "pdf" | "image" | "">("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Downloading...");
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [ZoneWiseDeviceData, setZoneWiseDeviceData] = useState<
    IZoneList[] | undefined
  >();
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfPageRef = useRef<HTMLDivElement>(null);
  const [mapCameras, setMapCameras] = useState<IFloorPlanData[]>([]);

  useEffect(() => {
    fetchFloorData();
  }, []);

  useEffect(() => {
    if (floorWiseData && floorWiseData?.length > 0 && floorList?.length > 0) {
      const firstFloor = floorWiseData[0];
      setValue("selectedFloor", firstFloor.floorId);

      const firstFeature = firstFloor.featureWiseMapping?.[0];
      if (firstFeature) {
        setValue("selectedFeaturesType", firstFeature.feature);
      }

      // Flatten mapped devices
      const preMappedCameras = floorWiseData.flatMap((f) =>
        f.featureWiseMapping.flatMap((fw) =>
          fw.devices.map((d) => ({
            ...d,
          }))
        )
      );

      setMapCameras(preMappedCameras);
    }
  }, [floorWiseData, floorList]);

  const fetchFloorData = async () => {
    try {
      const response = await GetAllFloorService();

      const floorData = response?.map((item) => ({
        title: item.floorPlanName,
        id: item.id,
      }));
      setFloorList(floorData as ILookup[]);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const { control, setValue, watch } = useForm({
    defaultValues: {
      selectedFloor: "",
      selectedFeaturesType: "",
    },
  });

  const selectedFeaturesType = watch("selectedFeaturesType");
  const selectedFloor = watch("selectedFloor");

  useEffect(() => {
    if (selectedFeaturesType !== "" && selectedFloor !== "") {
      setSelectedDeviceId(null);
      getCameraListByFeaturesandFloor(selectedFeaturesType, selectedFloor);
    }
    // else {
    //   toast.error("Please select both Feature Type and Floor");
    // }
  }, [selectedFeaturesType, selectedFloor]);



  useEffect(() => {
    if (selectedFloor !== "") {
      GetFloorPlanImageByFloorId(selectedFloor);
      GetAllZoneDataByFloorId(selectedFloor);
    }
  }, [selectedFloor]);


  // const filteredMappedDevices: IMappedDevice[] = useMemo(() => {
  //   if (!ZoneWiseDeviceData || !featureWiseCameraList) return [];
  //   return ZoneWiseDeviceData.flatMap(
  //     (zone) =>
  //       zone?.mappedDevices?.filter((device) =>
  //         featureWiseCameraList.some((cam) => cam.deviceId === device.deviceId)
  //       ) || []
  //   );
  // }, [ZoneWiseDeviceData, featureWiseCameraList]);

  const filteredMappedDevices: IMappedDevice[] = useMemo(() => {
    if (!ZoneWiseDeviceData?.length || !featureWiseCameraList?.length) return [];

    const featureDeviceIds = new Set(featureWiseCameraList.map(cam => cam.deviceId));

    return ZoneWiseDeviceData.flatMap(zone =>
      zone.mappedDevices?.filter(device => featureDeviceIds.has(device.deviceId)) || []
    );
  }, [ZoneWiseDeviceData, featureWiseCameraList]);

  const GetAllZoneDataByFloorId = async (id: string) => {
    if (id != "" && id != undefined) {
      const response = await GetAllZoneByFloorIdService(id);
      setZoneWiseDeviceData(response);
    }
  };

  const GetFloorPlanImageByFloorId = async (id: string) => {
    if (id != "" && id != undefined) {
      setImageSrc(null);
      const response: string = await GetFloorPlanImageService(id);
      if (response != undefined && response != "") {
        if (response.startsWith("data:image/")) {
          setIsFileUploaded(true);
          setViewMode("image");
          setImageSrc(response);
        } else if (response.startsWith("data:application/pdf")) {
          setIsFileUploaded(true);
          setViewMode("pdf");
          setPdfFile(response);
        } else if (response.startsWith("data:application/octet")) {
          setIsFileUploaded(true);
          setViewMode("dwg");
          // loadBase64DWG(response, "123.dwg");
        }
      } else {
        // setStatus("");
        setIsFileUploaded(false);
        setViewMode("");
        setImageSrc(null);
        setPdfFile(null);
      }
    }
  };

  const getCameraListByFeaturesandFloor = async (
    selectedFeaturesType: string,
    selectedFloor: string
  ) => {
    if (
      selectedFeaturesType != null &&
      selectedFeaturesType != "" &&
      selectedFloor != null &&
      selectedFloor != ""
    ) {
      let suburl: string;
      suburl = `?feature=${selectedFeaturesType.trim()}&floorId=${selectedFloor.trim()}`;
      try {
        const response: any = await getCameraListByFeaturesService(suburl);

        if (response && response.length && response.length > 0) {
          setFeatureWiseCameraList(response);
        }
        else {
          setFeatureWiseCameraList([])
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    if (numPages > 1) {
      setIsFileUploaded(false);
      setPdfFile(null);
      setStatus("");
      setViewMode("");
      alert("Only single-page PDFs are allowed!");
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const filteredCameraList = useMemo(() => {
    if (!featureWiseCameraList) return [];

    return featureWiseCameraList.filter((item) => {
      const cameraNameMatch = item.cameraName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return cameraNameMatch;
    });
  }, [featureWiseCameraList, searchTerm]);


  //added allSelected and  someSelected for selectAll checkbox feature
  const allSelected = filteredCameraList?.every(item =>
    mapCameras.some(d =>
      d.deviceId === item.deviceId &&
      d.channelNo === item.channelNo &&
      d.feature === selectedFeaturesType &&
      d.floorId === selectedFloor
    )
  );
  const someSelected = filteredCameraList?.some(item =>
    mapCameras.some(d =>
      d.deviceId === item.deviceId &&
      d.channelNo === item.channelNo &&
      d.feature === selectedFeaturesType &&
      d.floorId === selectedFloor
    )
  );


  const handleToggleDevice = (device: IFeatureWiseCameraList) => {
    // setSelectedDeviceId(device.deviceId);
    setSelectedDeviceId(device.deviceId + "-" + device.channelNo);

    if (!imageSrc && !pdfFile) return;

    const exists = mapCameras.some(
      (item) =>
        item.feature === selectedFeaturesType &&
        item.deviceId === device.deviceId &&
        item.channelNo === device.channelNo &&
        item.floorId === selectedFloor
    );

    if (exists) {
      // Remove device
      setMapCameras((prev) =>
        prev.filter(
          (item) =>
            !(
              item.feature === selectedFeaturesType &&
              item.deviceId === device.deviceId &&
              item.channelNo === device.channelNo &&
              item.floorId === selectedFloor
            )
        )
      );
    } else {
      const matchedDevice = filteredMappedDevices.find(
        (d) => d.deviceId === device.deviceId
      );

      setMapCameras(
        (prev) =>
          [
            ...prev,
            {
              feature: selectedFeaturesType,
              deviceId: device.deviceId,
              channelNo: device.channelNo,
              position: matchedDevice?.position || null,
              floorId: selectedFloor,
            },
          ] as IFloorPlanData[]
      );
    }
  };

  //added handleSelectAll for selectAll checkbox feature
  const handleSelectAll = () => {
    if (allSelected) {
      // All are currently selected → remove them
      filteredCameraList.forEach(item => {
        const exists = mapCameras.some(d =>
          d.deviceId === item.deviceId &&
          d.channelNo === item.channelNo &&
          d.feature === selectedFeaturesType &&
          d.floorId === selectedFloor
        );
        if (exists) handleToggleDevice(item);
      });
    } else {
      // Not all selected → add missing ones
      filteredCameraList.forEach(item => {
        const exists = mapCameras.some(d =>
          d.deviceId === item.deviceId &&
          d.channelNo === item.channelNo &&
          d.feature === selectedFeaturesType &&
          d.floorId === selectedFloor
        );
        if (!exists) handleToggleDevice(item);
      });
    }
  };


  const handleDeleteWidget = (deviceId: string, feature: string) => {
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
              {/* ---------------------------Fisrt Section------------------------ */}
              <Box className="custom-set-pop-left-inner">
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Select feature
                </Typography>

                <CustomSelect
                  name="selectedFloor"
                  variant="filled"
                  control={control}
                  // label="Feature"
                  options={floorList}
                />

                <CustomSelect
                  name="selectedFeaturesType"
                  variant="filled"
                  control={control}
                  // label="Feature"
                  options={FeaturesTypeList}
                />
                <Box

                  className="cmn-pop-map-floor common-map-list-scroll"
                >
                  <Typography variant="h6" fontWeight={400} mb={2}>
                    Cameras
                  </Typography>

                  <TextField
                    // className="search-bar-plans-and-jones"
                    placeholder="Search IP Address/Camera Name..."
                    fullWidth
                    onChange={handleSearch}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <img src={"/images/search.svg"} alt="Search" />
                        </InputAdornment>
                      ),
                    }}

                  />

                  <Box
                    sx={{
                      maxHeight: 250, // Adjust height as needed
                      overflowY: "auto",
                      pr: 1, // optional padding for scrollbar spacing
                    }}
                    className="cmn-pop-map-floor-check"
                  >
                    {/* ✅ Select All checkbox */}
                    {selectedFeaturesType !== "" && selectedFloor !== "" && filteredCameraList?.length>0 &&
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          mb: 1,
                        }}
                        onClick={handleSelectAll}
                      >
                        <Checkbox
                          checked={allSelected}
                          indeterminate={!allSelected && someSelected}
                          onChange={handleSelectAll}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Typography>Select All</Typography>
                      </Box>
                    }
                    {filteredCameraList?.map((item) => {
                      const isChecked = mapCameras.some(
                        (d) =>
                          d.deviceId === item.deviceId &&
                          d.channelNo === item.channelNo &&
                          d.feature === selectedFeaturesType &&
                          d.floorId === selectedFloor

                      );
                      return (
                        <Box
                          key={`${item.deviceId}-${item.channelNo}`}
                          onClick={() => handleToggleDevice(item)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            borderRadius: 1,
                            backgroundColor: isChecked
                              ? "#f5f5f5"
                              : "transparent",
                          }}
                        >
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleToggleDevice(item)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Typography
                            sx={{ color: isChecked ? "#FE6500" : "inherit" }}
                          >
                            {item.cameraName} - {item.channelNo}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
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
                    if (mapCameras.length === 0) {
                      toast.error("Select at least one device");
                      return;
                    }

                    const groupedByFloor = mapCameras.reduce<Record<string, IFloorPlanData[]>>(
                      (acc, device) => {
                        if (!acc[device.floorId]) acc[device.floorId] = [];
                        acc[device.floorId].push(device);
                        return acc;
                      },
                      {}
                    );

                    const floorWiseResult: ISelectedFloorFeaturesWiseWidget[] = Object.entries(
                      groupedByFloor
                    ).map(([floorId, devices]) => {
                      const featureWiseMapping = Object.entries(
                        devices.reduce<Record<string, IFloorPlanData[]>>((acc, device) => {
                          if (!acc[device.feature]) acc[device.feature] = [];
                          acc[device.feature].push(device);
                          return acc;
                        }, {})
                      ).map(([feature, devices]) => ({
                        feature,
                        devices,
                      }));

                      const floorName = floorList.find((f) => f.id === floorId)?.title || "";
                      return {
                        floorId,
                        floorName,
                        featureWiseMapping,
                      };
                    });

                    OnFloorApply?.(floorWiseResult);
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

            {/*------------------------- Second Section------------------------------- */}
            <Box
              className="custom-setup-pop-data-right"
            >
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Floor Plan
              </Typography>

              <CommonFloorPlanViewer
                IsSetUpView={true}
                viewMode={viewMode}
                imageSrc={imageSrc}
                pdfFile={pdfFile}
                containerRef={viewMode === "pdf" ? pdfPageRef : containerRef}
                // mappedCameras={mapCameras}
                mappedCameras={mapCameras.filter((cam) => cam.floorId === selectedFloor && cam.feature === selectedFeaturesType)} // ✅ Filtered by selected floor
                onDocumentLoadSuccess={onDocumentLoadSuccess}
                ondeleteWidget={handleDeleteWidget}
                floor={floor}
                zones={zones}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
              />

            </Box>
          </Box>
        }
        onCancel={onClose}
        // confirmText="Apply"
        // cancelText="Cancel"
        hideActions={true}
      />
    </>
  );
};

export { FloorPlanWidgetSetup };
