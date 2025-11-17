import { Box } from '@mui/material';
import { Document, Page } from 'react-pdf';
import React, {
  RefObject,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { CustomMapWidget } from '../../../index';
import { IFloorPlanData, IWidgetPayload } from '../../../../interfaces/IChart';
import { fetchForkliftCountForMapDataService, fetchPedestrianDetectionForMapDataService, fetchPeopleCountForMapDataService, fetchShoppingCountForMapDataService, fetchSlipandFallDetectionForMapDataService, fetchTrafficJamDetectionForMapDataService, fetchVehicleCountForMapDataService, fetchVehicleQueueManagementForMapDataService, fetchVehicleSpeedDetectionForMapDataService } from '../../../../services/dashboardService';
import { convertToUTC } from '../../../../utils/convertToUTC';
import { getLiveData, onReceiveMessage } from '../../../../utils/signalRService';

interface FloorPlanViewerProps {
  IsSetUpView: boolean;
  viewMode: 'image' | 'pdf' | undefined;
  imageSrc?: string;
  pdfFile?: string | File;
  containerRef: RefObject<HTMLDivElement | HTMLImageElement>;
  mappedCameras: IFloorPlanData[];
  onDocumentLoadSuccess?: (pdf: any) => void;
  ondeleteWidget?: (deviceId: number | string, feature: string) => void;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  selectedFloorId?: string;
  setLoadingCount: React.Dispatch<React.SetStateAction<number>>; 
}

const CommonFloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  IsSetUpView,
  viewMode,
  imageSrc,
  pdfFile,
  containerRef,
  mappedCameras,
  onDocumentLoadSuccess,
  ondeleteWidget,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  selectedFloorId,
  setLoadingCount
}) => {
  const [mapCameras, setMapCameras] = useState<IFloorPlanData[]>(
    mappedCameras ? mappedCameras : []
  );
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 });
  const pdfWrapperRef = useRef<HTMLDivElement>(null);
  const ruleCountMapRef = useRef<Record<number, Record<number, number>>>({});

  const [zoom, setZoom] = useState(1); // 1 = 100%
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleReset = () => setZoom(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });            // current pan offset
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);


  const shouldShowFallback =
    !viewMode || (viewMode === 'image' && !imageSrc) || (viewMode === 'pdf' && !pdfFile);

  const handlePDFRender = useCallback(() => {
    if (pdfWrapperRef.current) {
      const { offsetWidth: width, offsetHeight: height } = pdfWrapperRef.current;
      setImgSize({ width, height });
    }
  }, []);

  useEffect(() => {
    if (mappedCameras && mappedCameras.length > 0) {
      setMapCameras(mappedCameras);
      fetchWidgetDataForMap(mappedCameras);
    } else {
      setMapCameras([]);
    }
  }, [mappedCameras, zones, selectedStartDate, selectedEndDate]);
  const onMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const onMouseUp = () => setDragStart(null);


  useEffect(() => {
    if (viewMode === 'pdf') {
      const resizeObserver = new ResizeObserver(() => {
        handlePDFRender();
      });
      if (pdfWrapperRef.current) {
        resizeObserver.observe(pdfWrapperRef.current);
      }
      return () => resizeObserver.disconnect();
    }
  }, [viewMode, handlePDFRender]);

  useEffect(() => {
    if (IsSetUpView) return;

    // Slip and Fall Detection
    if (mapCameras.some(cam => cam.feature === "slipAndFallDetection")) {
      getLiveData("SlipAndFallDetectionMap", floor as string[], zones as string[]);
      onReceiveMessage("SlipAndFallDetectionMap", (data: any) => {
        const liveData = JSON.parse(data);
        if (liveData?.state === true) {
          setMapCameras((prev) =>
            prev.map((cam) =>
              cam.feature === "slipAndFallDetection" && cam.deviceId === liveData.deviceId
                ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
                : cam
            )
          );
        }
      });
    }

    // Pedestrian
    if (mapCameras.some(cam => cam.feature === "pedestriandetection")) {
      getLiveData("PedestrianDetectionMap", floor as string[], zones as string[]);
      onReceiveMessage("PedestrianDetectionMap", (data: any) => {
        const liveData = JSON.parse(data);
        if (liveData?.state === true) {
          setMapCameras((prev) =>
            prev.map((cam) =>
              cam.feature === "pedestriandetection" && cam.deviceId === liveData.deviceId
                ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
                : cam
            )
          );
        }
      });
    }

    // Vehicle Speed Violation
    if (mapCameras.some(cam => cam.feature === "vehiclespeeddetection")) {
      getLiveData("VehicleSpeedViolationMap", floor as string[], zones as string[]);
      onReceiveMessage("VehicleSpeedViolationMap", (data: any) => {
        const liveData = JSON.parse(data);
        if (liveData?.state === true) {
          setMapCameras((prev) =>
            prev.map((cam) =>
              cam.feature === "vehiclespeeddetection" && cam.deviceId === liveData.deviceId
                ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
                : cam
            )
          );
        }
      });
    }

    // Traffic Jam Detection
    if (mapCameras.some(cam => cam.feature === "trafficjamdetection")) {
      getLiveData("TrafficJamDetectionMap", floor as string[], zones as string[]);
      onReceiveMessage("TrafficJamDetectionMap", (data: any) => {
        const liveData = JSON.parse(data);
        if (liveData?.state === true) {
          setMapCameras((prev) =>
            prev.map((cam) =>
              cam.feature === "trafficjamdetection" && cam.deviceId === liveData.deviceId
                ? { ...cam, widgetData: (cam.widgetData || 0) + 1 }
                : cam
            )
          );
        }
      });
    }

    // Vehicle Queue Analysis
    if (mapCameras.some(cam => cam.feature === "vehiclequeuemanagement")) {
      getLiveData("VehicleQueueAnalysisMap", floor as string[], zones as string[]);
      onReceiveMessage("VehicleQueueAnalysisMap", (data: any) => {
        const liveData = JSON.parse(data);
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
            prev.map((cam) =>
              cam.feature === "vehiclequeuemanagement" && cam.deviceId === deviceId
                ? { ...cam, widgetData: totalCount }
                : cam
            )
          );
        }
      });
    }
  }, [floor, zones, selectedFloorId, mappedCameras]);


  const fetchWidgetDataForMap = async (mappedCameraList: IFloorPlanData[]) => {
    if (floor === undefined || floor === null) return;
      // setLoadingCount((c) => c + mappedCameraList.length);
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

          // result = maxVehicleQueue;
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

        // console.log("result->", result);

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
        console.error("Error fetching floorplan device data:", error);
        throw error;
      }
      // finally {
      //   // Decrement loader for each completed request
      //   setLoadingCount((c) => c - 1);
      // }
    });
  };

  const renderBasePlan = () => {
    if (viewMode === 'image' && imageSrc) {
      return (
        // <img
        //   src={imageSrc}
        //   alt="Floor plan"
        //   onLoad={(e) => {
        //     const width = e.currentTarget.offsetWidth;
        //     const height = e.currentTarget.offsetHeight;
        //     setImgSize({ width, height });
        //   }}
        //   style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        // />
        <Box
        // sx={{
        //   transform: `scale(${zoom})`,
        //   transformOrigin: 'top left',
        //   display: 'inline-block'
        // }}
        >
          <img
            src={imageSrc}
            alt="Floor plan"
            onLoad={(e) => {
              const width = e.currentTarget.naturalWidth; // use natural size
              const height = e.currentTarget.naturalHeight;
              //  const width ="auto"; // use natural size
              // const height ="auto"
              setImgSize({ width, height });
            }}
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
          />
        </Box>

      );
    }

    if (viewMode === 'pdf' && pdfFile) {
      return (
        <Document
          file={pdfFile}
          onLoadSuccess={(pdf) => {
            onDocumentLoadSuccess?.(pdf);
            setTimeout(handlePDFRender, 100); // ensure page is rendered before measuring
          }}
          onLoadError={(error) => console.error('PDF Load Error:', error)}
        >
          <Page
            pageNumber={1}
            scale={1}
            // scale={zoom}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      );
    }

    return null;
  };

  return (
    <>
      {/*  Fixed controls */}
      {!IsSetUpView && (
        <Box
          className="zoom-in-out-main"
        >
          <button onClick={handleZoomOut}>–</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn}>+</button>
          <button onClick={handleReset}>  <img src="/images/dashboard/reset_floorplan.png" alt="reset icon" /></button>
        </Box>
      )}


      <Box
        className="droppable-map-plans"
      // sx={{
      //   overflow: 'visible',
      //   display: 'flex',
      //   justifyContent: 'center',
      //   alignItems: 'center',
      //   position: 'relative',
      // }}
      >
        {shouldShowFallback && (
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: 14,
              textAlign: 'center',
              padding: 2,
              alignSelf: 'center'
            }}
          >
            Please select a floor in setup. No floor data available.
          </Box>
        )}


        {!shouldShowFallback && (
          <div
            ref={viewMode === 'image' ? (containerRef as RefObject<HTMLDivElement>) : pdfWrapperRef}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <Box
              sx={{
                position: 'relative',
                width: imgSize.width,
                height: imgSize.height,
                // width:'100%',
                // height:'100%',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'top left',
                cursor: dragStart ? 'grabbing' : 'grab',
              }}
              {...(!IsSetUpView && {
                onMouseDown,
                onMouseMove,
                onMouseUp,
                onMouseLeave: onMouseUp,
              })}
            >
              {renderBasePlan()}

              {mapCameras.map((device, index) => {
                // const x = device.position?.x ?? 0;
                // const y = device.position?.y ?? 0;
                const x = (device.position?.x ?? 0);
                const y = (device.position?.y ?? 0);
                const angle = device.position?.angle ?? 0;

                const xPercent = (x / imgSize.width) * 100;
                const yPercent = (y / imgSize.height) * 100;


                return (
                  <Box
                    key={`${device.deviceId}+${index}`}
                    // key={`${device.deviceId}-${device.feature}-${index}-${Math.random()}`}
                    sx={{
                      position: 'absolute',
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      transform: `scale(${1 / zoom})`,
                      transformOrigin: 'top left',
                      zIndex: 9999,
                    }}
                  >
                    <CustomMapWidget
                      IsSetUpView={IsSetUpView}
                      deleteWidget={() => {
                        ondeleteWidget?.(device.deviceId, device.feature);
                      }}
                      cam={device}
                    />
                  </Box>
                );
              })}

            </Box>

          </div>
        )}

      </Box>
    </>
  );
};

export { CommonFloorPlanViewer };

