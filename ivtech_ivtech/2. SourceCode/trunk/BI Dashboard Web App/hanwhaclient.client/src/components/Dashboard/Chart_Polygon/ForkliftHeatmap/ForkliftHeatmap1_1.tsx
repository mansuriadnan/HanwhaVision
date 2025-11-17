import { IHeatmapProps } from "../../../../interfaces/IChart";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";
const ForkliftHeatmap1_1: React.FC<IHeatmapProps> = ({
  heatmapData,
  customizedHeight,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  onSelectChange,
  filetredDevices,
  selectedDeviceDD,
  setIsDraggable,
}) => {
  const img =
    "https://10.37.58.245/stw-cgi/video.cgi?msubmenu=stream&action=view&Profile=1&CodecType=MJPEG";
  //if (Number(customizedWidth) > 792) return
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const legendRef = useRef<HTMLCanvasElement | null>(null);
  const CANVAS_WIDTH = 170; //heatmapData?.resolutionWidth ?? 96;
  const CANVAS_HEIGHT = 96; //heatmapData?.resolutionHeight ?? 170;
  const data = heatmapData?.heatMapData ?? [];
  const effectiveWidth = Number(customizedWidth) || 366;
  //   const effectiveHeight = Number(customizedHeight) || 328;
  const { theme } = useThemeContext();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const max = d3.max(data ?? []) ?? 1;
    const logScale = d3
      .scaleLog()
      .domain([1, max + 1])
      .range([0, 1]);
    const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0, 1]);
    if (data.length <= 0) return;
    const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      const ratio = logScale(val + 1); // avoids log(0)
      const colorStr = colorScale(ratio);
      const color = d3.color(colorStr)?.rgb();

      const idx = i * 4;
      if (color) {
        imageData.data[idx] = color.r;
        imageData.data[idx + 1] = color.g;
        imageData.data[idx + 2] = color.b;
        imageData.data[idx + 3] = 180; // try more opaque for testing
      } else {
        console.warn(`No color for value: ${val}, ratio: ${ratio}`);
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const canvasLegend = legendRef.current;
    const ctxLegend = canvasLegend?.getContext("2d");
    if (!canvasLegend || !ctxLegend || data.length === 0) return;

    const width = canvasLegend.width;
    const height = canvasLegend.height;

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);

    const colorScaleL = d3
      .scaleSequential(d3.interpolateTurbo) // or any other interpolator
      .domain([minValue, maxValue]); // Data-driven domain

    const gradient = ctx.createLinearGradient(0, 0, width, 0);

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const value = minValue + (i / steps) * (maxValue - minValue);
      gradient.addColorStop(i / steps, colorScaleL(value));
    }

    ctxLegend.fillStyle = gradient;
    ctxLegend.fillRect(0, 0, width, height);
  }, [heatmapData, customizedWidth]);

    useEffect(() => {
      if (filetredDevices.length > 0 && !selectedDeviceDD && onSelectChange) {
        const firstValue = `${filetredDevices[0].deviceId}-${filetredDevices[0].channelNo}`;
  
        const syntheticEvent = {
          target: { value: firstValue },
        } as SelectChangeEvent;
  
        onSelectChange(syntheticEvent);
      }
    }, [filetredDevices, selectedDeviceDD, onSelectChange]);

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header heatmap-ddl-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
          {filetredDevices?.length > 0  && !openZoomDialog && (
            <Box className="cmn-heatmap">
              <FormControl fullWidth size="small">
                {/* <InputLabel id="device-select-label">
                      Select Device
                    </InputLabel> */}
                <Select
                  labelId="device-select-label"
                  value={selectedDeviceDD}
                  onChange={onSelectChange}
                  label="Select Device"
                  input={<OutlinedInput notched={false} />}
                >
                  {filetredDevices.map((device) => (
                    <MenuItem
                      key={`${device.deviceId}-${device.channelNo}`}
                      value={`${device.deviceId}-${device.channelNo}`}
                    >
                      {device.cameraName}{" "}
                      {device.deviceType == "AIB"
                        ? `- ${device.channelNo}`
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
        <Box className="widget-main-body heatmap-body-main">
          <div className="widget-data-wrapper">
            <div className="People-counting-heatmap">              
              {data.length == 0 ?
                <Box
                  className="no-data-image"
                  sx={{
                    color: "#888"
                  }}
                >
                  No Data Found
                </Box>
                :
                <div
                  className="cmn-heatmap-wrapper"
                >
                  <img
                    //src={`https://localhost:5173/${apiUrls.ManageAddDevice}/StreamCamera/${245}?cacheBust=${Date.now()}`}// Replace with actual image path
                    src={heatmapData?.heatmapImage}
                    alt="heatmap-bg"
                    style={{
                      width: effectiveWidth,
                      height: "200px",
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      borderRadius: 8,
                      pointerEvents: "none",
                      width: customizedWidth,
                      height: customizedHeight,
                      opacity: 0.5,
                    }}
                  />
                </div>}              
              {data.length > 0 && (
                <div className="cmn-heatmap-low-high">
                  <canvas ref={legendRef} width={effectiveWidth} />
                  <div className="low-to-high">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Box>

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
          {!openZoomDialog ? (
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnForkliftHeatmap">
              <img
                src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};
export { ForkliftHeatmap1_1 };
