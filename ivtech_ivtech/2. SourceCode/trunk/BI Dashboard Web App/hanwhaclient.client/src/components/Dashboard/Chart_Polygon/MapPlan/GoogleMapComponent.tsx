import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  IGoogleMapProps,
  IMapPlanData,
  IWidgetPayload,
} from "../../../../interfaces/IChart";
import { CustomMapWidget } from "../../../index";
import { Box } from "@mui/material";
import {
  GoogleMap,
  OverlayView,
  Autocomplete,
  MarkerF,
} from "@react-google-maps/api";
import {
  fetchPeopleCountForMapDataService,
  fetchSlipandFallDetectionForMapDataService,
  fetchVehicleCountForMapDataService,
  fetchPedestrianDetectionForMapDataService,
  // fetchVehicleQueueManagementForMapDataService,
  fetchVehicleSpeedDetectionForMapDataService,
  fetchTrafficJamDetectionForMapDataService,
  fetchShoppingCountForMapDataService,
  fetchForkliftCountForMapDataService,
} from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useMapContext } from "../../../../context/MapContext";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 23.0225,
  lng: 72.5714,
};

const GoogleMapComponent: React.FC<IGoogleMapProps> = ({
  IsSetUpView,
  mappedCameras,
  ondeleteWidget,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
}) => {
  const [mapCameras, setMapCameras] = useState<IMapPlanData[]>(
    mappedCameras ? mappedCameras : []
  );
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { currentPosition, zoomLevel, setNewCurrentPosition, setNewZoomLevel } =
    useMapContext();
  const ruleCountMapRef = useRef<Record<number, Record<number, number>>>({});

  useEffect(() => {
    if (mappedCameras && mappedCameras.length > 0) {
      setMapCameras(mappedCameras);
      fetchWidgetDataForMap(mappedCameras);
    } else {
      setMapCameras([]);
    }
  }, [mappedCameras]);

  useEffect(() => {
    if (IsSetUpView) return;

    getLiveData(
      "SlipAndFallDetectionMap",
      floor as string[],
      zones as string[]
    );

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);
      // console.log("Slip And Fall Live Data->", liveData);
      if (liveData && liveData?.state === true) {
        setMapCameras((prev) =>
          prev.map((cam) => {
            const isMatch =
              cam.feature === "slipAndFallDetection" &&
              cam.deviceId === liveData.deviceId;

            return isMatch
              ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
              : cam;
          })
        );
      }
    };
    onReceiveMessage("SlipAndFallDetectionMap", handleSignalRMessage);
  }, [floor, zones]);

  useEffect(() => {
    if (IsSetUpView) return;

    getLiveData("PedestrianDetectionMap", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);
      // console.log("Pedestrian Live Data->", liveData);
      if (liveData && liveData?.state === true) {
        setMapCameras((prev) =>
          prev.map((cam) => {
            const isMatch =
              cam.feature === "pedestriandetection" &&
              cam.deviceId === liveData.deviceId;

            return isMatch
              ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
              : cam;
          })
        );
      }
    };

    onReceiveMessage("PedestrianDetectionMap", handleSignalRMessage);
  }, [floor, zones]);

  useEffect(() => {
    if (IsSetUpView) return;

    getLiveData(
      "VehicleSpeedViolationMap",
      floor as string[],
      zones as string[]
    );

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);
      // console.log("Vehicle Speed Violation Live Data->", liveData);
      if (liveData && liveData?.state === true) {
        setMapCameras((prev) =>
          prev.map((cam) => {
            const isMatch =
              cam.feature === "vehiclespeeddetection" &&
              cam.deviceId === liveData.deviceId;

            return isMatch
              ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
              : cam;
          })
        );
      }
    };
    onReceiveMessage("VehicleSpeedViolationMap", handleSignalRMessage);
  }, [floor, zones]);

  useEffect(() => {
    if (IsSetUpView) return;

    getLiveData("TrafficJamDetectionMap", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);
      // console.log("Traffic Jam Detection Live Data->", liveData);
      if (liveData && liveData?.state === true) {
        setMapCameras((prev) =>
          prev.map((cam) => {
            const isMatch =
              cam.feature === "trafficjamdetection" &&
              cam.deviceId === liveData.deviceId;

            return isMatch
              ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
              : cam;
          })
        );
      }
    };
    onReceiveMessage("TrafficJamDetectionMap", handleSignalRMessage);
  }, [floor, zones]);

  useEffect(() => {
    if (IsSetUpView) return;

    getLiveData(
      "VehicleQueueAnalysisMap",
      floor as string[],
      zones as string[]
    );

    const handleSignalRMessage = (data: any) => {
      const liveData = JSON.parse(data);
      // console.log("Vehicle Queue Analysis Live Data->", liveData);
      const { EventName, RuleIndex, count, deviceId } = liveData;

      if (EventName === "OpenSDK.WiseAI.VehicleQueueCountChanged") {
        if (!ruleCountMapRef.current[deviceId]) {
          ruleCountMapRef.current[deviceId] = {};
        }

        ruleCountMapRef.current[deviceId][RuleIndex] = count;

        const totalCount = Object.values(ruleCountMapRef.current)
          .flatMap((ruleMap) => Object.values(ruleMap))
          .reduce((sum, val) => sum + val, 0);

        setMapCameras((prev) =>
          prev.map((cam) => {
            const isMatch =
              cam.feature === "vehiclequeuemanagement" &&
              cam.deviceId === liveData.deviceId;

            return isMatch ? { ...cam, widgetData: totalCount } : cam;
          })
        );
      }
    };

    onReceiveMessage("VehicleQueueAnalysisMap", handleSignalRMessage);
  }, [floor, zones]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    map.setTilt(60);
    map.setMapTypeId("roadmap");
  }, []);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (place?.geometry?.location) {
      const location = place.geometry.location;
      const newCenter = {
        lat: location.lat(),
        lng: location.lng(),
      };
      map?.panTo(newCenter);
      map?.setZoom(15); // Optional: zoom in on result
      setNewZoomLevel(15);
      setNewCurrentPosition({
        lat: location.lat(),
        lng: location.lng(),
      });
    }
  };

  const handleMapDragEnd = () => {
    if (map) {
      const center = map.getCenter();
      if (center) {
        const newCenter = { lat: center.lat(), lng: center.lng() };
        setNewCurrentPosition(newCenter);
      }
    }
  };

  const handleZoomChanged = () => {
    if (map) {
      const zoom = map.getZoom();
      setNewZoomLevel(zoom as number);
    }
  };

  const fetchWidgetDataForMap = async (mappedCameraList: IMapPlanData[]) => {
    if (IsSetUpView) return;
    if (floor === undefined || floor === null) return;
    mappedCameraList?.map(async (item) => {
      try {
        const data = {
          floorIds: floor,
          zoneIds: zones,
          startDate: convertToUTC(selectedStartDate || ""),
          endDate: convertToUTC(selectedEndDate || ""),
          deviceId: item.deviceId,
          channel: item.channelNo,
        };

        let result = null;

        if (item.feature === "PeopleCount") {
          const res: any = await fetchPeopleCountForMapDataService(
            data as IWidgetPayload
          );
          result = res?.data;
        } else if (item.feature === "slipAndFallDetection") {
          const res: any = await fetchSlipandFallDetectionForMapDataService(
            data as IWidgetPayload
          );
          const totalCount = res?.data?.reduce(
            (sum: number, item: any) => sum + item.queueCount,
            0
          );
          result = totalCount;
        } else if (item.feature === "VehicleCount") {
          const res: any = await fetchVehicleCountForMapDataService(
            data as IWidgetPayload
          );
          result = res?.data;
        } else if (item.feature === "pedestriandetection") {
          const res: any = await fetchPedestrianDetectionForMapDataService(
            data as IWidgetPayload
          );
          const totalCount = res?.data?.reduce(
            (sum: number, item: any) => sum + item.queueCount,
            0
          );
          result = totalCount;
        } else if (item.feature === "vehiclequeuemanagement") {
          // const res: any = await fetchVehicleQueueManagementForMapDataService(
          //   data as IWidgetPayload
          // );

          // const maxVehicleQueue =
          //   Array.isArray(res?.data) && res.data.length > 0
          //     ? Math.max(...res.data.map((item: any) => item.queueCount))
          //     : 0;

          result = 0;
        } else if (item.feature === "vehiclespeeddetection") {
          const res: any = await fetchVehicleSpeedDetectionForMapDataService(
            data as IWidgetPayload
          );
          const maxVehicleSpeed =
            Array.isArray(res?.data) && res.data.length > 0
              ? Math.max(...res.data.map((item: any) => item.queueCount))
              : 0;

          result = maxVehicleSpeed;
        } else if (item.feature === "trafficjamdetection") {
          const res: any = await fetchTrafficJamDetectionForMapDataService(
            data as IWidgetPayload
          );
          const totalCount = res?.data?.reduce(
            (sum: number, item: any) => sum + item.queueCount,
            0
          );
          result = totalCount;
        } else if (item.feature === "ShoppingCartcounting") {
          const res: any = await fetchShoppingCountForMapDataService(
            data as IWidgetPayload
          );
          const maxShoppingCart =
            Array.isArray(res?.data) && res.data.length > 0
              ? Math.max(...res.data.map((item: any) => item.queueCount))
              : 0;

          result = maxShoppingCart;
        } else if (item.feature === "Forkliftcounting") {
          const res: any = await fetchForkliftCountForMapDataService(
            data as IWidgetPayload
          );
          const maxForklift =
            Array.isArray(res?.data) && res.data.length > 0
              ? Math.max(...res.data.map((item: any) => item.queueCount))
              : 0;

          result = maxForklift;
        }

        if (result) {
          setMapCameras((prev) =>
            prev.map((cam) =>
              cam.deviceId === item.deviceId && cam.feature === item.feature
                ? { ...cam, widgetData: result }
                : cam
            )
          );
        }
      } catch (error) {
        console.error("Error fetching Gender data:", error);
        throw error;
      }
    });
  };

  return (
    <Box className="google-map-widget">
      {/* <Box
        style={{ height: "100%", width: "100%"}}
        // onDragOver={handleDragOver}
        // onDrop={(e) => handleDrop(e)}
      > */}
      {/* <LoadScript
        googleMapsApiKey={APIkey || ""}
        libraries={["places", "geometry", "drawing"]}
      > */}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition || defaultCenter}
        zoom={zoomLevel}
        onLoad={handleMapLoad}
        ref={mapRef}
        onDragEnd={handleMapDragEnd}
        onZoomChanged={handleZoomChanged}
      >
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Search location"
            style={{
              boxSizing: "border-box",
              border: "1px solid transparent",
              width: "240px",
              height: "40px",
              padding: "0 12px",
              borderRadius: "3px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
              fontSize: "16px",
              outline: "none",
              position: "absolute",
              left: "50%",
              marginLeft: "-120px",
              top: "10px",
            }}
          />
        </Autocomplete>

        {IsSetUpView && currentPosition && (
          <MarkerF
            position={currentPosition}
            icon={{
              url: "/images/dashboard/Marker.svg",
            }}
          />
        )}

        {mapCameras?.length > 0 &&
          mapCameras?.map((cam, index) => {
            return (
              <React.Fragment
                // key={index}
                key={`${cam.deviceId}-${cam.feature}-${index}-${Math.random()}`}
              >
                <OverlayView
                  position={{
                    lat: cam.position[0],
                    lng: cam.position[1],
                  }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <CustomMapWidget
                    IsSetUpView={IsSetUpView}
                    deleteWidget={() => {
                      ondeleteWidget?.(cam.deviceId as number, cam.feature);
                    }}
                    // widgetData={cam.widgetData}
                    cam={cam}
                  />
                </OverlayView>
              </React.Fragment>
            );
          })}
      </GoogleMap>
      {/* </LoadScript> */}
      {/* </Box> */}
    </Box>
  );
};

export { GoogleMapComponent };
