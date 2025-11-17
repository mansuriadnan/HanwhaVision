import React, { useEffect, useState, useRef } from "react";
import {
  IZoneDetails,
  XyPosition,
  IMappedDevice,
  IFloorAndZoneProps,
  IDeviceList,
  IImgDimensions,
} from "../../interfaces/IFloorAndZone";
import {
  Box,
  Typography,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Popover,
  Tooltip,
} from "@mui/material";
import {
  uploadFloorPlanImageService,
  GetFloorPlanImageService,
  AddZonePlanDetailService,
  DeleteMappedCameraService,
} from "../../services/floorPlanService";
import { SketchPicker } from "react-color";
import { Document, Page, pdfjs } from "react-pdf";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Arc, Circle, Stage, Layer } from "react-konva";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { useBlocker } from "react-router-dom";
import { useThemeContext } from "../../context/ThemeContext";
import { DeviceListComponent } from "./DeviceListComponent";
import { CommonDialog } from "../Reusable/CommonDialog";
import { CustomButton } from "../Reusable/CustomButton";
import { showToast } from "../Reusable/Toast";
import { FloorList } from "./FloorList";
import { RectanglePolygon } from "./RectanglePolygon";
import { ZoneList } from "./ZoneList";
import { NoFloorData } from "./NoFloorData";
import { CameraStream } from "./CameraStream";

// pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker_4_8_69.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker_5_3_31.mjs";

const FloorAndZoneList: React.FC<IFloorAndZoneProps> = ({ showNoData }) => {
  /* Floor hooks */
  const [showNoDatapage, setShowNoDatapage] = useState(showNoData);
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const selectedFloorIdRef = useRef(selectedFloorId);
  /* Zone hooks */
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("");
  const [selectedZoneArea, setSelectedZoneArea] = useState<
    XyPosition[] | null
  >();
  const [zoom, setZoom] = useState(1);
  const [ColorAnchorEl, setColorAnchorEl] = useState<HTMLDivElement | null>(
    null
  );
  const [isdragZone, setIsDragZone] = useState(false);
  const [reFreshZoneList, setReFreshZoneList] = useState(false);
  const [reFreshDeviceList, setReFreshDeviceList] = useState(false);
  const [openCamreDeleteConfirm, setOpenCameraDeleteConfirm] = useState(false);
  const openColorBar = Boolean(ColorAnchorEl);
  const [mappedDevices, setMappedDevices] = useState<IMappedDevice[] | null>();
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"pdf" | "image" | "">("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [openPreview, setOpenPreview] = useState(false);

  const [imgDimensions, setImgDimensions] = useState<IImgDimensions>({
    width: 0,
    height: 0,
  });
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // const outputRef = useRef<HTMLTextAreaElement>(null);
  // const cadCoreRef = useRef<CadCore | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const imgRef = useRef<HTMLImageElement | null>(null);
  const dropzoneRef = useRef<HTMLDivElement | null>(null);
  // const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<XyPosition[]>([]);
  const { theme } = useThemeContext();

  let defaultPoints = [
    { x: 250, y: 150 },
    { x: 250, y: 350 },
    { x: 450, y: 350 },
    { x: 450, y: 150 },
  ];

  let currentScroll = { x: 0, y: 0 };

  function hexToRGBA(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changesssss. Do you really want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useBlocker(() => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      return !confirmLeave;
    } else {
      // Logic for when there are no unsaved changes (optional)
      // console.log("No unsaved changes, proceeding without confirmation.");
      return false;
    }
  });

  useEffect(() => {
    if (!dropzoneRef.current) return;

    const handleScroll = () => {
      currentScroll.x = dropzoneRef.current?.scrollLeft as number;
      currentScroll.y = dropzoneRef.current?.scrollTop as number;
    };

    const el = dropzoneRef.current;
    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [dropzoneRef.current]);

  useEffect(() => {
    selectedFloorIdRef.current = selectedFloorId;
  }, [selectedFloorId]);

  const GetFloorPlanImageByFloorId = async (id: string) => {
    if (id != "" && id != undefined) {
      const response: string = await GetFloorPlanImageService(id);
      // console.log("floorId->",id,response);
      if (response != undefined && response != "") {
        if (response.startsWith("data:image/")) {
          setIsFileUploaded(true);
          setViewMode("image");
          setImageSrc(response);

          const img = new Image();
          img.onload = () => {
            setImgDimensions({ width: img.width, height: img.height });
          };
          img.src = response;
        } else if (response.startsWith("data:application/pdf")) {
          setIsFileUploaded(true);
          setViewMode("pdf");
          setPdfFile(response);

          const byteCharacters = atob(response.split(",")[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);

          const loadingTask = pdfjs.getDocument(url);
          const pdfDocument = await loadingTask.promise;
          const page = await pdfDocument.getPage(1);
          const viewport = page.getViewport({ scale: 1 });

          setImgDimensions({ width: viewport.width, height: viewport.height });
        }
        // else if (response.startsWith("data:application/octet")) {
        //   setIsFileUploaded(true);
        //   setViewMode("dwg");
        //   loadBase64DWG(response, "123.dwg");
        // }
      } else {
        setIsFileUploaded(false);
        setViewMode("");
        setImageSrc(null);
        setPdfFile(null);
      }
    }
  };

  const handleZoom = (factor: number) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom + factor;
      return newZoom >= 0.5 && newZoom <= 2 ? newZoom : prevZoom; // Restrict zoom between 50% and 200%
    });
  };

  const handleFileChange = async (ev: any) => {
    const target = ev.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      // setIsLoading(true);
      const fileType = file.type;

      if (fileType === "application/pdf" || fileType.startsWith("image/")) {
        // await uploadFloorPlanImage(file as File);

        if (fileType === "application/pdf") {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const blob = new Blob([e.target?.result as ArrayBuffer], {
                type: "application/pdf",
              });
              const url = URL.createObjectURL(blob);

              const loadingTask = pdfjs.getDocument(url);
              const pdfDocument = await loadingTask.promise;

              // Added for PDF height/width - start
              const page = await pdfDocument.getPage(1); // first page
              const viewport = page.getViewport({ scale: 1 });

              // console.log("PDF Width (points):", viewport.width);
              // console.log("PDF Height (points):", viewport.height);

              setImgDimensions({
                width: viewport.width,
                height: viewport.height,
              });

              // End

              if (pdfDocument.numPages > 1) {
                setIsFileUploaded(false);
                setPdfFile(null);
                setViewMode("");
                showToast("Only single-page PDF is allowed!", "error");
              } else {
                await uploadFloorPlanImage(file as File);
                setIsFileUploaded(true);
                setPdfFile(url);
                setImageSrc(null);
                setViewMode("pdf");
              }

              // setIsLoading(false);
            } catch (error) {
              console.error("Error loading PDF:", error);
            } finally {
              // setIsLoading(false);
            }
          };
          reader.readAsArrayBuffer(file);
        } else if (fileType.startsWith("image/")) {
          setPdfFile(null);
          setViewMode("image");
          await uploadFloorPlanImage(file as File);
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              // console.log("Image Width:", img.width);
              // console.log("Image Height:", img.height);

              setImgDimensions({
                width: img.width,
                height: img.height,
              });

              setImageSrc(e.target?.result as string);

              setIsFileUploaded(true);
              // setIsLoading(false);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      } else {
        showToast(
          "Unsupported file format. Only JPG, JPEG, PNG, SVG, and PDF formats are supported.",
          "error"
        );
        // setIsLoading(false);
        setIsFileUploaded(false);
      }
    }
  };

  const uploadFloorPlanImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadFloorPlanImageService(formData, selectedFloorIdRef.current);
    } catch (error) {
      console.error(`Failed to upload the file. Please try again.`, "error");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
  //   if (numPages > 1) {
  //     setIsFileUploaded(false);
  //     setPdfFile(null);
  //     // setStatus("");
  //     setViewMode("");
  //     alert("Only single-page PDFs are allowed!");
  //   }
  // };

  // const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);

  let dragMoveTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleDragMove = (
    e: KonvaEventObject<DragEvent, Node<NodeConfig>>,
    centerX: number,
    centerY: number,
    cameraId: string
  ) => {
    const x = e.target.x() - centerX;
    const y = e.target.y() - centerY;
    const angle = (Math.atan2(y, x) * 180) / Math.PI;

    if (dragMoveTimeout) clearTimeout(dragMoveTimeout);

    // Set new debounce timer
    dragMoveTimeout = setTimeout(() => {
      setMappedDevices((prevDevices) =>
        prevDevices?.map((device) =>
          device.mappedDeviceid === cameraId
            ? {
                ...device,
                position: {
                  ...(device.position || { x: 0, y: 0, angle: 0 }),
                  angle: angle,
                },
              }
            : device
        )
      );
      setscrollBar();
    }, 100); // Adjust delay (ms) as needed, e.g., 100-300ms

    // setMappedDevices((prevDevices) =>
    //   prevDevices?.map((device) =>
    //     device.IsActive === true
    //       ? // device.mappedDeviceid === cameraId
    //         {
    //           ...device,
    //           position: {
    //             ...(device.position || { x: 0, y: 0, angle: 0 }),
    //             angle: angle,
    //           },
    //         }
    //       : device
    //   )
    // );
  };

  const calculateHandlePosition = (
    angle: number,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian),
    };
  };

  const DraggableItemForMappedDevice: React.FC<{
    mappedDevice: IMappedDevice;
  }> = ({ mappedDevice }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: `mapped_${mappedDevice.mappedDeviceid}`,
      data: mappedDevice,
      disabled: true,
    });

    const imageSize = 30;
    const radius = imageSize;
    const handleRadius = imageSize * 0.3;
    // const stageSize = radius * 2 + handleRadius * 2;
    const stageSize = 210;
    const centerX = stageSize / 2;
    const centerY = stageSize / 2;

    // Calculate the position of the handle using the current angle
    const { x: handleX, y: handleY } = calculateHandlePosition(
      mappedDevice.position?.angle || 0,
      centerX,
      centerY,
      radius
    );

    return (
      <div
        key={mappedDevice.mappedDeviceid}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          width: imageSize,
          height: imageSize,
        }}
      >
        <Tooltip
          title={
            <Box>
              <Typography fontSize={12}>
                Device Name :{" "}
                {mappedDevice.deviceType === "Camera"
                  ? mappedDevice.deviceName
                  : mappedDevice.deviceName + "-" + mappedDevice.channel}
              </Typography>
              <Typography fontSize={12}>
                Ip Address : {mappedDevice.ipAddress}
              </Typography>
            </Box>
          }
        >
          <img
            src={"/images/mapped_Device.svg"}
            alt="mappedDevice"
            style={{
              width: imageSize,
              height: imageSize,
              // transform: transform
              //   ? `translate(${transform.x}px, ${transform.y}px)`
              //   : undefined,
              position: "absolute",
              top: mappedDevice.position?.y,
              left: mappedDevice.position?.x,
              // backgroundColor: "pink",
              // cursor: "grab",
              zIndex: 10,
              // transform: `translate(${transform?.x || 0}px, ${
              //   transform?.y || 0
              // }px) rotate(${mappedDevice.position?.angle || 0}deg)`,
            }}
            // className="MappedCameraImg"
            onClick={(e) => {
              e.stopPropagation();

              setMappedDevices(
                (prevDevices) =>
                  prevDevices?.map((device) => {
                    // if it's the clicked device
                    if (
                      device.mappedDeviceid === mappedDevice.mappedDeviceid &&
                      device.channel === mappedDevice.channel
                    ) {
                      return {
                        ...device,
                        IsActive: !device.IsActive, // 🔄 toggle active state
                      };
                    }

                    // all other devices -> inactive
                    return { ...device, IsActive: false };
                  }) || []
              );

              setscrollBar();

              // setMappedDevices(
              //   (prevDevices) =>
              //     prevDevices?.map((device) => ({
              //       ...device,
              //       IsActive:
              //         device.mappedDeviceid === mappedDevice.mappedDeviceid &&
              //         device.channel === mappedDevice.channel, // Set true for the clicked device, false for others , Added channel for AIB camera - need to check deviceId and channel
              //     })) || []
              // );
            }}
          />
        </Tooltip>

        <Stage
          width={stageSize}
          height={stageSize}
          style={{
            pointerEvents: mappedDevice.IsActive ? "auto" : "none",
            // border: "1px solid red",
            position: "absolute",
            top:
              (mappedDevice?.position?.y ?? 0) - stageSize / 2 + imageSize / 2,
            left:
              (mappedDevice?.position?.x ?? 0) - stageSize / 2 + imageSize / 2,
            // zIndex: 5,
            // cursor: "pointer",
            zIndex: isdragZone ? 0 : 5, // 💥 dynamic zIndex
          }}
        >
          <Layer>
            {mappedDevice.isSphere ? (
              <Circle
                x={centerX}
                y={centerY}
                // x={handleX }
                // y={handleY}
                radius={mappedDevice?.fovlength || 0}
                fill={hexToRGBA(mappedDevice?.fovcolor as string, 0.3)}
                stroke="black"
                strokeWidth={1.5}
              />
            ) : (
              <Arc
                x={centerX}
                y={centerY}
                // x={handleX }
                // y={handleY}
                innerRadius={0}
                outerRadius={mappedDevice?.fovlength || 0}
                angle={90}
                rotation={(mappedDevice?.position?.angle || 0) - 45}
                // rotation={(mappedDevice?.position?.angle || 0) - 90 / 2}
                fill={hexToRGBA(mappedDevice?.fovcolor as string, 0.3)}
                stroke="black"
                strokeWidth={1.5}
              />
            )}
            {/* <Arc
              key={mappedDevice.mappedDeviceid}
              // x={handleX}
              // y={handleY}
              // x={mappedDevice.isSphere ? handleX - 30 : handleX}
              x={handleX - 30}
              y={handleY}
              innerRadius={0}
              outerRadius={mappedDevice?.fovlength || 0}
              angle={mappedDevice.isSphere ? 360 : 90}
              // angle={90}
              // angle={device.focalAngle}
              // rotation={
              //   (sliderAngles[device.id] || 0) - device.focalAngle / 2
              // }
              rotation={(mappedDevice?.position?.angle || 0) - 45}
              fill="rgba(0, 255, 0, 0.2)"
              // stroke="black"
              stroke={mappedDevice.isSphere ? "transparent" : "black"}
              strokeWidth={1.5}
            /> */}
            {mappedDevice.IsActive ? (
              <>
                <Circle
                  x={centerX}
                  y={centerY}
                  radius={radius}
                  // stroke="#ddd"
                  stroke={mappedDevice?.fovcolor}
                  strokeWidth={3}
                  // onClick={() => handleImageClick(device.id)}
                />
                <Circle
                  x={handleX}
                  y={handleY}
                  radius={handleRadius}
                  // fill="#007BFF"
                  fill={"black"}
                  draggable
                  dragBoundFunc={(pos) => {
                    const dx = pos.x - centerX; // Distance from the center
                    const dy = pos.y - centerY; // Distance from the center
                    const distance = Math.sqrt(dx * dx + dy * dy); // Calculate the distance
                    return {
                      x: centerX + (dx / distance) * radius, // Keep the handle on the circle
                      y: centerY + (dy / distance) * radius, // Keep the handle on the circle
                    };
                  }}
                  onDragMove={(e) =>
                    handleDragMove(
                      e,
                      centerX,
                      centerY,
                      mappedDevice.mappedDeviceid as string
                    )
                  }
                />
              </>
            ) : null}
          </Layer>
        </Stage>
      </div>
    );
  };

  const DroppableItem = () => {
    // const { setNodeRef } = useDroppable({
    //   id: "droppable",
    // });

    const hasActiveCamera = mappedDevices?.some((item) => item.IsActive);

    const { setNodeRef, isOver } = useDroppable({
      id: "droppable",
    });

    const isDragging = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });

    if (isdragZone || hasActiveCamera) isDragging.current = false;

    const handleMouseDown = (e: React.MouseEvent) => {
      if (isdragZone || hasActiveCamera) return;
      isDragging.current = true;
      lastPosition.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isdragZone || hasActiveCamera) return;
      if (!isDragging.current || !dropzoneRef.current) return;

      const dx = e.clientX - lastPosition.current.x;
      const dy = e.clientY - lastPosition.current.y;

      dropzoneRef.current.scrollLeft -= dx;
      dropzoneRef.current.scrollTop -= dy;

      lastPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (isdragZone || hasActiveCamera) return;
      isDragging.current = false;
    };

    return (
      <Box
        className="droppable-map-plans"
        id="droppable"
        ref={(node) => {
          setNodeRef(node);
          dropzoneRef.current = node;
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          overflow: "auto",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          border: "none",
          cursor:
            isdragZone || hasActiveCamera
              ? "default" // ❌ no drag when active camera/zone
              : isDragging.current
              ? "grabbing" // ✊ while dragging
              : "grab", // 🤚 idle state, draggable
        }}
      >
        {/* Apply zoom to this container */}
        <Box
          sx={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            transition: "transform 0.2s ease-in-out",
            position: "relative", // Important for absolute children
            width: "100%",
            height: "100%",
          }}
        >
          {/* Render image or PDF */}
          {viewMode === "image" && imageSrc && (
            <img
              src={imageSrc}
              alt="Uploaded Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          )}

          {viewMode === "pdf" && pdfFile && (
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <Document
                file={pdfFile}
                onLoadError={(error) => console.error("PDF Load Error:", error)}
              >
                <Page
                  pageNumber={1}
                  scale={1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}

          {/* Mapped devices and zones - these will now scale along with image/PDF */}
          {mappedDevices?.map((item) => (
            <DraggableItemForMappedDevice
              key={item.mappedDeviceid}
              mappedDevice={item}
            />
          ))}

          {selectedZoneArea && selectedZoneArea?.length > 0 && (
            <RectanglePolygon
              key={selectedZoneId}
              // imageWidth={3000}
              // imageHeight={3000}
              imageWidth={imgDimensions.width}
              imageHeight={imgDimensions.height}
              onSelectionChange={handleSelectionChange}
              // initialPoints={selectedZoneArea}
              initialPoints={pointsRef.current} // For Zoom In/Out zone commented upeer line
              SelectedColor={"#6AEB00"}
              isdragZone={isdragZone}
              zoom={zoom}
            />
          )}
        </Box>
      </Box>

      // <Box
      //   className="droppable-map-plans"
      //   id="droppable"
      //   // ref={setNodeRef}
      //   ref={(node) => {
      //     setNodeRef(node);
      //     dropzoneRef.current = node;
      //   }}
      //   sx={{
      //     overflow: "auto",
      //     width: "100%",
      //     height: "100%",
      //     display: "flex",
      //     justifyContent: "center",
      //     alignItems: "center",
      //     position: "relative",
      //     border: "none",
      //     // border: isOver ? "2px dashed black" : "2px dashed green",
      //     // backgroundColor: "pink",
      //   }}
      // >
      //   {viewMode === "image" && imageSrc && (
      //     <img
      //       // ref={imgRef}
      //       src={imageSrc}
      //       alt="Uploaded Preview"
      //       style={{
      //         transform: `scale(${zoom})`,
      //         transformOrigin: "center",
      //         transition: "transform 0.2s ease-in-out",
      //         position: "absolute",
      //         maxWidth: "100%",
      //         maxHeight: "100%",
      //         cursor: "grab",
      //         objectFit: "contain",
      //         width: "95%",
      //         height: "95%",
      //       }}
      //     />
      //   )}
      //   {viewMode === "pdf" && pdfFile && (
      //     <div
      //       // ref={pdfContainerRef}
      //       style={{
      //         transform: `scale(${zoom})`,
      //         transformOrigin: "center",
      //         transition: "transform 0.2s ease-in-out",
      //         position: "absolute",
      //         maxWidth: "100%",
      //         maxHeight: "100%",
      //         cursor: "grab",
      //         objectFit: "contain",
      //         width: "95%",
      //         height: "95%",
      //       }}
      //     >
      //       <Document
      //         file={pdfFile}
      //         // onLoadSuccess={onDocumentLoadSuccess}
      //         onLoadError={(error) => console.error("PDF Load Error:", error)}
      //       >
      //         <Page
      //           pageNumber={1}
      //           scale={1}
      //           renderTextLayer={false}
      //           renderAnnotationLayer={false}
      //         />
      //       </Document>
      //     </div>
      //   )}
      //   {mappedDevices?.map((item) => (
      //     <DraggableItemForMappedDevice
      //       key={item.mappedDeviceid}
      //       mappedDevice={item}
      //     />
      //   ))}

      //   {selectedZoneArea && selectedZoneArea.length > 0 ? (
      //     <RectanglePolygon
      //       key={selectedZoneId}
      //       imageWidth={800}
      //       imageHeight={800}
      //       onSelectionChange={handleSelectionChange}
      //       initialPoints={selectedZoneArea}
      //       SelectedColor={"#6AEB00"}
      //     />
      //   ) : null}
      // </Box>
    );
  };

  // console.log("selectedZoneArea->",selectedZoneArea);

  const isPointInPolygon = (
    x: number,
    y: number,
    polygon: { x: number; y: number }[]
  ) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;

      const intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const tempMappedDevice = active.data.current;

    if (!tempMappedDevice) return;

    // const isCamera = tempMappedDevice.deviceType === "Camera";
    const peopleLines = tempMappedDevice?.peopleLineIndex;
    const vehicleLines = tempMappedDevice?.vehicleLineIndex;

    if ((peopleLines?.length ?? 0) === 0 && (vehicleLines?.length ?? 0) === 0) {
      showToast("Please select line to map device", "error");
      return;
    }

    if (!over || over.id !== "droppable") {
      showToast("You can only drop cameras inside the uploaded file!", "error");
      return;
    }

    const dropzone = dropzoneRef.current;
    if (!dropzone) {
      showToast("No valid drop area detected!", "error");
      return;
    }

    const imageRect = dropzone.getBoundingClientRect();

    // Scroll offsets (if inside a scrollable div)
    const scrollLeft = dropzone.scrollLeft || 0;
    const scrollTop = dropzone.scrollTop || 0;

    // const dropX = event.delta.x + imageRect.left;
    // const dropY = event.delta.y + imageRect.top;
    const dropX = active.rect.current.translated?.left ?? imageRect.left;
    const dropY = active.rect.current.translated?.top ?? imageRect.top;

    if (
      dropX >= imageRect.left &&
      dropX <= imageRect.right &&
      dropY >= imageRect.top &&
      dropY <= imageRect.bottom
    ) {
      const device = active.data.current;
      if (!device) return;

      // const relativeX = dropX - imageRect.left;
      // const relativeY = dropY - imageRect.top;
      let relativeX = dropX - imageRect.left + scrollLeft;
      let relativeY = dropY - imageRect.top + scrollTop;

      const isInsideZone = isPointInPolygon(
        relativeX,
        relativeY,
        selectedZoneArea as XyPosition[]
        // pointsRef.current as XyPosition[]
      );

      if (isInsideZone) {
        setHasUnsavedChanges(true);
        // your existing logic to update mappedDevices

        if (
          device?.peopleLines?.length === device?.peopleLineIndex?.length &&
          device?.vehicleLines?.length === device?.vehicleLineIndex?.length
        ) {
          // setDeviceList((prev) => prev?.filter((x) => x.id !== device.id));
        }

        setMappedDevices((prev = []) => {
          const prevDevices = prev || []; // Ensure prev is always an array
          let existingDevice: IMappedDevice = {};

          if (device.deviceType === "Camera") {
            existingDevice = prevDevices?.find(
              (d) => d.mappedDeviceid === device.id
            ) as IMappedDevice;
          } else {
            existingDevice = prevDevices?.find(
              (d) =>
                d.mappedDeviceid === device.id.split("_")[0] &&
                d.channel === device.channel
            ) as IMappedDevice;
          }

          if (existingDevice) {
            // Update only x and y if the device exists
            if (existingDevice.deviceType === "Camera") {
              return prevDevices?.map((d) =>
                d.mappedDeviceid === device.id
                  ? {
                      ...d,
                      position: {
                        x: relativeX,
                        y: relativeY,
                        angle: d.position?.angle ?? 0,
                      },
                      peopleLineIndex: [
                        ...(d.peopleLineIndex ?? []),
                        ...(device.peopleLineIndex ?? []),
                      ],
                      vehicleLineIndex: [
                        ...(d.vehicleLineIndex ?? []),
                        ...(device.vehicleLineIndex ?? []),
                      ],
                      zoneCameraId: d.zoneCameraId ? d.zoneCameraId : "",
                    }
                  : d
              );
            } else {
              return prevDevices?.map((d) =>
                d.mappedDeviceid === device.id.split("_")[0] &&
                d.channel === device.channel
                  ? {
                      ...d,
                      position: {
                        x: relativeX,
                        y: relativeY,
                        angle: d.position?.angle ?? 0,
                      },
                      peopleLineIndex: [
                        ...(d.peopleLineIndex ?? []),
                        ...(device.peopleLineIndex ?? []),
                      ],
                      vehicleLineIndex: [
                        ...(d.vehicleLineIndex ?? []),
                        ...(device.vehicleLineIndex ?? []),
                      ],
                      zoneCameraId: d.zoneCameraId ? d.zoneCameraId : "",
                    }
                  : d
              );
            }
          } else {
            // Add new device if it does not exist
            let ChannelDeviceID = device.id.split("_")[0];
            return [
              ...prevDevices,
              {
                deviceType: device.deviceType,
                mappedDeviceid:
                  device.deviceType === "Camera" ? device.id : ChannelDeviceID,
                zoneCameraId: device.zoneCameraId,
                position: { x: relativeX, y: relativeY, angle: 0 },
                peopleLines: device.peopleLines,
                vehicleLines: device.vehicleLines,
                peopleLineIndex: device.peopleLineIndex,
                vehicleLineIndex: device.vehicleLineIndex,
                fovcolor: "#266ee0", //blue
                isSphere: false,
                fovlength: 50,
                channel:
                  device.channel != null && device.channel != undefined
                    ? device.channel
                    : null,
                deviceName: device.deviceName,
                ipAddress: device.ipAddress,
                id:
                  device.deviceType === "Camera" ? device.id : ChannelDeviceID, // Added to solve already mapped device drag-drop issue
              },
            ];
          }
        });
      } else {
        showToast(
          "You can only drop cameras inside the defined zone!",
          "error"
        );
        return;
      }

      setscrollBar();
    } else {
      showToast("You can only drop cameras inside the uploaded file!", "error");
    }
  };

  const handleFloorChange = (selectedItemId: string) => {
    // setStatus("");
    setPdfFile(null);
    setImageSrc(null);
    setSelectedFloorId(selectedItemId);
    // GetAllZoneDataByFloorId(selectedItemId);
    GetFloorPlanImageByFloorId(selectedItemId);
  };

  const setscrollBar = () => {
    const ZoneArea = pointsRef.current;

    if (ZoneArea && ZoneArea?.length && ZoneArea?.length > 0) {
      const cx =
        (Math.min(...ZoneArea.map((p) => p.x)) +
          Math.max(...ZoneArea.map((p) => p.x))) /
        2;
      const cy =
        (Math.min(...ZoneArea.map((p) => p.y)) +
          Math.max(...ZoneArea.map((p) => p.y))) /
        2;

      if (dropzoneRef.current) {
        const { offsetWidth, offsetHeight } = dropzoneRef.current;

        requestAnimationFrame(() => {
          dropzoneRef.current!.scrollLeft = cx - offsetWidth / 2;
          dropzoneRef.current!.scrollTop = cy - offsetHeight / 2;
        });
      }
    } else {
      if (dropzoneRef.current) {
        const { x, y } = currentScroll;

        requestAnimationFrame(() => {
          dropzoneRef.current!.scrollLeft = x;
          dropzoneRef.current!.scrollTop = y;
        });
      }
    }
  };

  const handleZoneChange = (
    zoneID: string,
    ZoneArea: XyPosition[] | null,
    MappedDevice: any
  ) => {
    // setHasUnsavedChanges(true);
    setSelectedZoneId(zoneID);
    setSelectedZoneArea(ZoneArea);
    setIsDragZone(false);
    if (ZoneArea) {
      pointsRef.current = ZoneArea as XyPosition[];
    } else {
      pointsRef.current = [];
    }
    if (MappedDevice) {
      setMappedDevices(() => [
        // ...(prev || []), // Ensuring prev is always an array
        ...MappedDevice.map((item: any) => ({
          zoneCameraId: item.zoneCameraId,
          mappedDeviceid: item.deviceId,
          id: item.deviceId,
          peopleLines: item.peopleLines || null,
          vehicleLines: item.vehicleLines || null,
          peopleLineIndex: item.peopleLineIndex || null,
          vehicleLineIndex: item.vehicleLineIndex || null,
          position: item.position || undefined,
          fovlength: item.fovlength || undefined,
          fovcolor: item.fovcolor || undefined,
          isSphere: item.isSphere || undefined,
          IsActive: false,
          deviceType: item.deviceType,
          channel: item.channel,
          deviceName: item.deviceName,
          ipAddress: item.ipAddress,
        })),
      ]);

      if (ZoneArea) {
        setTimeout(() => {
          setscrollBar();
        }, 2000);
      }
    } else {
      setMappedDevices([]);
    }
  };

  const handleSelectionChange = (points: any) => {
    pointsRef.current = points;
    // console.log(" pointsRef.current = ", pointsRef.current);
    // setSelectedZoneArea(pointsRef.current);
  };

  const SaveZoneDetails = async () => {
    const zoneDetails: IZoneDetails = {
      floorId: selectedFloorId,
      zoneId: selectedZoneId as string,
      zoneArea: pointsRef.current as XyPosition[],
      devices:
        (mappedDevices?.map((device) => ({
          deviceId: device.mappedDeviceid,
          zoneCameraId: device.zoneCameraId ? device.zoneCameraId : "",
          position: device.position,
          fovlength: device.fovlength,
          fovcolor: device.fovcolor,
          peopleLineIndex: device?.peopleLineIndex,
          vehicleLineIndex: device?.vehicleLineIndex,
          isSphere: device.isSphere,
          channel: device.channel ? device.channel : 0,
          // deviceName: device.deviceName,
          // ipAddress: device.ipAddress,
        })) as IDeviceList[]) || [],
    };

    try {
      await AddZonePlanDetailService(zoneDetails);
      // fetchDeviceData();
      setReFreshDeviceList(!reFreshDeviceList);
      setReFreshZoneList(!reFreshZoneList);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Error saving distributor:", err);
    }
  };

  const DeleteMappedCamera = async () => {
    const ActiveCamera = mappedDevices?.filter((item) => item.IsActive);
    let ActiveCameraId = "";
    if (ActiveCamera) {
      ActiveCameraId = ActiveCamera[0].zoneCameraId as string;
    }

    if (ActiveCameraId) {
      try {
        const deleteData = await DeleteMappedCameraService(
          ActiveCameraId as string
        );
        if (deleteData?.isSuccess) {
          setReFreshZoneList(!reFreshZoneList);
          setReFreshDeviceList(!reFreshDeviceList);
        }
      } catch (err: any) {
        console.error("Error deleting role:", err);
      }
    } else {
      setMappedDevices((prev) => prev?.filter((x) => x.IsActive != true));
      // setReFreshZoneList(!reFreshZoneList);
    }
    setOpenCameraDeleteConfirm(false);
  };

  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  return showNoDatapage ? (
    <NoFloorData />
  ) : (
    <>
      <div className="top-orange-head" style={backgroundStyle}>
        <Box className="top-orange-head-left">
          <Typography variant="h4">Floor Plans & Zones</Typography>
          <Typography>
            Configure your floor plans, define their associated zones, and
            manage camera configurations on the specific zone here.
          </Typography>
        </Box>
      </div>

      <Box className="floor-plans-zones">
        {/* Left Sidebar */}
        <div className="floor-plans-zones-left floor-plans-zones-left-main">
          <FloorList
            onSelectFloor={handleFloorChange}
            onDeleteFloor={() => {
              setReFreshZoneList(!reFreshZoneList);
              setReFreshDeviceList(!reFreshDeviceList);
            }}
            OnDeleteAllFloor={() => setShowNoDatapage(true)}
          />
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          {/* Middle Section */}
          <div className="floor-plans-zone-middle">
            {/* <DndContext onDragEnd={handleDragEnd}> */}
            <Box>
              {HasPermission(LABELS.View_List_of_Zones) && (
                <ZoneList
                  selectedFloorId={selectedFloorId}
                  onSelectZone={handleZoneChange}
                  reFreshZoneList={reFreshZoneList}
                  onDeleteZone={() => setReFreshDeviceList(!reFreshDeviceList)}
                  isFileUploaded={isFileUploaded}
                />
              )}

              {isFileUploaded ? (
                <Box className="map-drop-height">
                  <DroppableItem />

                  <Box className="map-area-bottom-row">
                    <Box sx={{ marginRight: 2 }}>
                      {selectedZoneId ? (
                        isdragZone ? (
                          <Tooltip title="Drag and drop of zones is enabled">
                            <IconButton
                              onClick={() => {
                                setIsDragZone(false);
                                setscrollBar();
                              }}
                            >
                              <img
                                src={
                                  theme === "light"
                                    ? "/images/Hand.svg"
                                    : "/images/dark-theme/Hand.svg"
                                }
                                alt="zoom"
                                width={35}
                                height={35}
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Drag and drop of zones is disabled">
                            <IconButton
                              onClick={() => {
                                setIsDragZone(true);
                                setscrollBar();
                              }}
                            >
                              <img
                                src={
                                  theme === "light"
                                    ? "/images/Cross_hand.svg"
                                    : "/images/dark-theme/Cross_hand.svg"
                                }
                                alt="zoom"
                                width={35}
                                height={35}
                              />
                            </IconButton>
                          </Tooltip>
                        )
                      ) : null}
                    </Box>

                    {selectedZoneId ? (
                      <CustomButton
                        onClick={() => {
                          defaultPoints = [
                            {
                              x: currentScroll.x + 250,
                              y: currentScroll.y + 150,
                            },
                            {
                              x: currentScroll.x + 250,
                              y: currentScroll.y + 350,
                            },
                            {
                              x: currentScroll.x + 450,
                              y: currentScroll.y + 350,
                            },
                            {
                              x: currentScroll.x + 450,
                              y: currentScroll.y + 150,
                            },
                          ];

                          setSelectedZoneArea(defaultPoints);
                          pointsRef.current = defaultPoints;
                          setHasUnsavedChanges(true);
                          setscrollBar();

                          // setSelectedZoneDetails((prevDetails) => ({
                          //   id: prevDetails?.id ?? null,
                          //   floorId: prevDetails?.floorId ?? null,
                          //   name: prevDetails?.name ?? null,
                          //   maxOccupancy: prevDetails?.maxOccupancy ?? null,
                          //   peopleOccupancy: prevDetails?.peopleOccupancy ?? null,
                          //   peopleDefaultOccupancy:
                          //     prevDetails?.peopleDefaultOccupancy ?? null,
                          //   vehicleOccupancy: prevDetails?.vehicleOccupancy ?? null,
                          //   vehicleDefaultOccupancy:
                          //     prevDetails?.vehicleDefaultOccupancy ?? null,
                          //   resetAt: prevDetails?.resetAt ?? null,
                          //   zoneArea: defaultPoints,
                          // }));
                        }}
                        fullWidth
                        variant="outlined"
                      >
                        {selectedZoneArea && selectedZoneArea.length > 0
                          ? "Re Draw Zone "
                          : "Draw Zone"}
                      </CustomButton>
                    ) : null}

                    <Box>
                      <IconButton
                        onClick={() => {
                          handleZoom(-0.1);
                          setscrollBar();
                        }}
                      >
                        <img
                          src={
                            theme === "light"
                              ? "/images/zoomIn.svg"
                              : "/images/dark-theme/zoomIn.svg"
                          }
                          alt="zoom"
                          width={35}
                          height={35}
                        />
                      </IconButton>

                      <Typography>{Math.round(zoom * 100)}%</Typography>

                      <IconButton
                        onClick={() => {
                          handleZoom(0.1);
                          setscrollBar();
                        }}
                      >
                        <img
                          src={
                            theme === "light"
                              ? "/images/zoomOut.svg"
                              : "/images/dark-theme/zoomOut.svg"
                          }
                          alt="zoom"
                          width={35}
                          height={35}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box className="replace-floor-buttons">
                    {mappedDevices
                      ?.filter((item) => item.IsActive)
                      .map((device) => (
                        <>
                          <Box className="replace-floor-buttons-wrapper">
                            <Box className="place-floor-buttons-left">
                              <RadioGroup
                                value={device.isSphere ? "sphere" : "focal"}
                                onChange={(event) => {
                                  const tempisSphere =
                                    event.target.value === "sphere"
                                      ? true
                                      : false;
                                  setMappedDevices((prevDevices) =>
                                    prevDevices?.map((device) =>
                                      device.IsActive
                                        ? { ...device, isSphere: tempisSphere }
                                        : { ...device }
                                    )
                                  );
                                }}
                                row
                              >
                                <FormControlLabel
                                  value="focal"
                                  control={<Radio />}
                                  label="Focal"
                                />
                                <FormControlLabel
                                  value="sphere"
                                  control={<Radio />}
                                  label="Sphere"
                                />
                              </RadioGroup>
                              <Box>
                                <Typography>{device.fovlength}%</Typography>
                              </Box>
                            </Box>
                            <Box className="place-floor-buttons-bar">
                              <input
                                id="label"
                                type="range"
                                min="0"
                                max="100"
                                value={device.fovlength}
                                onChange={(e) => {
                                  setMappedDevices((prevDevices) =>
                                    prevDevices?.map((device) =>
                                      device.IsActive
                                        ? {
                                            ...device,
                                            fovlength: Number(e.target.value),
                                          }
                                        : { ...device }
                                    )
                                  );
                                }}
                              />
                              <label htmlFor="label" id="value"></label>
                            </Box>
                          </Box>
                          <Box className="replace-floor-bar">
                            <Typography>Color fill</Typography>
                            <Box
                              onClick={(event) => {
                                setColorAnchorEl(event.currentTarget);
                              }}
                            >
                              <Box
                                sx={{
                                  width: 15,
                                  height: 15,
                                  backgroundColor: device.fovcolor
                                    ? device.fovcolor
                                    : "#266ee0",
                                  borderRadius: "4px",
                                  border: `1px solid ${device.fovcolor}`,
                                }}
                              />
                              <Box>{device.fovcolor}</Box>
                            </Box>

                            <Popover
                              open={openColorBar}
                              anchorEl={ColorAnchorEl}
                              onClose={() => setColorAnchorEl(null)}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "center",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "center",
                              }}
                            >
                              <SketchPicker
                                color={device.fovcolor}
                                onChangeComplete={(newColor) => {
                                  setMappedDevices((prevDevices) =>
                                    prevDevices?.map((device) =>
                                      device.IsActive
                                        ? {
                                            ...device,
                                            fovcolor: newColor.hex,
                                          }
                                        : { ...device }
                                    )
                                  );
                                }}
                              />
                            </Popover>
                          </Box>
                        </>
                      ))}

                    <Box className="place-floor-buttons-wraps">
                      {mappedDevices?.filter((item) => item.IsActive).length !=
                      0 ? (
                        <>
                          <IconButton
                            onClick={() => {
                              setOpenPreview(true);
                              setscrollBar();
                            }}
                            className="play"
                          >
                            <img
                              src={"/images/play_video.svg"}
                              alt="play"
                              width={35}
                              height={35}
                            />
                          </IconButton>

                          <CustomButton
                            onClick={
                              () => setOpenCameraDeleteConfirm(true)
                              // DeleteMappedCamera(device.zoneCameraId as string)
                            }
                            className="common-btn-design"
                            variant="outlined"
                            // disabled={
                            //   mappedDevices?.filter((item) => item.IsActive)
                            //     .length == 0
                            //     ? true
                            //     : false
                            // }
                          >
                            Delete Camera
                          </CustomButton>
                        </>
                      ) : null}

                      {HasPermission(LABELS.CanAddOrUpdateFloorPlan) && (
                        <CustomButton
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click(); // Programmatically click the file input
                            }
                          }}
                          className="common-btn-design"
                          variant="outlined"
                        >
                          Replace Floor
                        </CustomButton>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e)}
                        style={{ display: "none" }}
                      />
                      {selectedZoneId != null && selectedZoneId !== "" && (
                        <CustomButton
                          onClick={SaveZoneDetails}
                          className="common-btn-design"
                          variant="outlined"
                        >
                          Save Changes
                        </CustomButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box className="upload-your-work-plan">
                  {/* <div className="emscripten" id="status">
                    {status}
                  </div>  */}

                  {HasPermission(LABELS.CanAddOrUpdateFloorPlan) && (
                    <div className="upload-plan-main">
                      <h3>Upload Your Floor Plan</h3>
                      <div className="upload-plan-wrapper">
                        <label htmlFor="demo">
                          <div className="Upload-icons"></div>
                          <h4>
                            Drop your image here, or <span>Browse</span>
                          </h4>
                          <p>Supports: JPG, JPEG, PNG, SVG, PDF</p>
                        </label>
                        <input
                          id="demo"
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e)}
                        />
                      </div>
                    </div>
                  )}
                </Box>
              )}
            </Box>
            {/* </DndContext> */}
          </div>
          <div className="floor-plans-zone-right">
            {/* Right Sidebar */}
            <DeviceListComponent reFreshDeviceList={reFreshDeviceList} />
          </div>
        </DndContext>
        <CommonDialog
          customClass="cmn-confirm-delete-icon"
          open={openCamreDeleteConfirm}
          title="Delete Confirmation!"
          content="Are you sure you want to continue?"
          onConfirm={() => DeleteMappedCamera()}
          onCancel={() => setOpenCameraDeleteConfirm(false)}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
          titleClass={true}
        />
        <CommonDialog
          open={openPreview}
          // title="Live Preview"
          title={`${
            mappedDevices?.find((item) => item.IsActive)?.deviceName
          } | ${mappedDevices?.find((item) => item.IsActive)?.ipAddress}`}
          content={
            <CameraStream
              selectedcamera={mappedDevices?.find((item) => item.IsActive)}
              isOpen={openPreview}
            />
          }
          onConfirm={() => {
            setOpenPreview(false);
            setscrollBar();
          }}
          onCancel={() => {
            setOpenPreview(false);
            setscrollBar();
          }}
          titleClass={true}
          customClass="livestreaming-fpnz"
          maxWidth="lg"
        />
      </Box>
    </>
  );
};

export { FloorAndZoneList };
