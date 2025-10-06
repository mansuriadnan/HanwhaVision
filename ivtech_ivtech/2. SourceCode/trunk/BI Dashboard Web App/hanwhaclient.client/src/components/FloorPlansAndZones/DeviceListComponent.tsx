import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  DeviceList,
  ChannelList,
  DeviceListProps,
} from "../../interfaces/IFloorAndZone";
import { Search } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDraggable } from "@dnd-kit/core";
import { GetAllDevicewithoutZoneService } from "../../services/floorPlanService";
import { useThemeContext } from "../../context/ThemeContext";

const DeviceListComponent: React.FC<DeviceListProps> = ({
  reFreshDeviceList,
}) => {
  const [deviceList, setDeviceList] = useState<DeviceList[] | undefined>();
  const [devicesearchTerm, setDeviceSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<string | false>(false);
  const [hoveredZoneName, setHoveredZoneName] = useState("");
  const [expandedChannel, setExpandedChannel] = useState<string | false>(false);
  const { theme } = useThemeContext();

  useEffect(() => {
    fetchDeviceData();
  }, [reFreshDeviceList]);

  // const fetchDeviceData1 = async () => {
  //   try {
  //     const devices = await GetAllDevicewithoutZoneService();
  //     console.log("Devices->", devices);

  //     const updatedDevices: DeviceList[] = devices.map((item) => {
  //       const isCamera = item.deviceType === "Camera";
  //       const isAIB =
  //         item.deviceType === "AIB" && Array.isArray(item.channelEvent);

  //       // Update missing people/vehicle lines for Camera devices
  //       if (
  //         isCamera &&
  //         item.channelEvent?.length &&
  //         item.peopleLines === null &&
  //         item.vehicleLines === null
  //       ) {
  //         item = {
  //           ...item,
  //           peopleLines: item.channelEvent[0].peopleLines,
  //           vehicleLines: item.channelEvent[0].vehicleLines,
  //         };
  //       }

  //       // Add line index arrays for Camera devices
  //       if (isCamera) {
  //         return {
  //           ...item,
  //           peopleLineIndex: [],
  //           vehicleLineIndex: [],
  //         };
  //       }

  //       // Update channelEvents for AIB devices
  //       if (isAIB) {
  //         const updatedChannelEvent = item.channelEvent?.map((channel) => ({
  //           ...channel,
  //           peopleLineIndex: [],
  //           vehicleLineIndex: [],
  //           id: `${item.id}_${channel.channel}`,
  //         }));

  //         return {
  //           ...item,
  //           channelEvent: updatedChannelEvent,
  //         };
  //       }

  //       return item; // return unchanged if neither condition matches
  //     });

  //     console.log("updatedDevices->", updatedDevices);
  //     setDeviceList(updatedDevices);
  //   } catch (err: any) {
  //     console.error("Error fetching device data:", err);
  //   }
  // };

  const fetchDeviceData = async () => {
    try {
      const Devices = await GetAllDevicewithoutZoneService();
      // console.log("Devices->", Devices);
      const tempDevices = Devices.map((item) => {
        if (item.deviceType === "Camera") {
          if (
            item?.channelEvent &&
            item?.channelEvent?.length &&
            item?.channelEvent?.length > 0 &&
            item?.peopleLines === null &&
            item?.vehicleLines === null
          ) {
            // console.log("item->", item);
            return {
              ...item,
              peopleLines: item.channelEvent[0].peopleLines,
              vehicleLines: item.channelEvent[0].vehicleLines,
            };
          } else {
            return item;
          }
        } else if (
          item.deviceType === "AIB" &&
          Array.isArray(item.channelEvent)
        ) {
          return item;
        }

        return item;
      });

      // console.log("tempDevices->", tempDevices);

      const updatedDevices = tempDevices?.map((item) => {
        if (item.deviceType === "Camera") {
          return {
            ...item,
            peopleLineIndex: [],
            vehicleLineIndex: [],
          };
        } else if (
          item.deviceType === "AIB" &&
          Array.isArray(item.channelEvent)
        ) {
          const updatedChannelEvent = item.channelEvent.map((channel) => ({
            ...channel,
            peopleLineIndex: [],
            vehicleLineIndex: [],
            id: `${item.id}_${channel.channel}`,
            //  deviceName:`${item.deviceName}-${channel.channel}`,
            deviceName: item.deviceName,
            ipAddress: item.ipAddress,
          }));

          return {
            ...item,
            channelEvent: updatedChannelEvent,
          };
        }

        return item; // return unchanged if neither condition matches
      });

      setDeviceList(updatedDevices);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const handleDeviceSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeviceSearchTerm(event.target.value);
  };

  const filteredDevices =
    devicesearchTerm?.length >= 3
      ? deviceList?.filter(
          (item) =>
            item.deviceName
              .toLowerCase()
              .includes(devicesearchTerm.toLowerCase()) ||
            item.model.toLowerCase().includes(devicesearchTerm.toLowerCase()) ||
            item.ipAddress
              .toLowerCase()
              .includes(devicesearchTerm.toLowerCase())
        )
      : deviceList;

  const DraggableItemForDeviceList: React.FC<{
    device: DeviceList | ChannelList;
  }> = ({ device }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: device.id as string,
      data: device,
      disabled: false,
    });

    return (
      <div
        key={device.id}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          width: 30,
          height: 30,
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
          // position: "absolute",
          // top: device.position?.y,
          // left: device.position?.x,
          // backgroundColor: "red",
          cursor: "grab",
          // zIndex: 10,
        }}
      >
        <img
          src={
            theme === "light"
              ? "/images/activecamera.gif"
              : "/images/dark-theme/activecamera.gif"
          }
          alt="device"
          style={{
            width: 30,
            height: 30,
          }}
        />
      </div>
    );
  };

  return (
    <Box className="search-by-device">
      <Box className="search-by-device-search-bar">
        <TextField
          fullWidth
          variant="outlined"
          onChange={handleDeviceSearch}
          InputProps={{
            endAdornment: (
              <Box
                // onClick={() => console.log("heree")}
                sx={{
                  borderRadius: "50px",
                  backgroundColor: "#ff8c00",
                  color: "#fff",
                  minWidth: "60px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Search />
              </Box>
            ),
          }}
          placeholder="Search device by name/ IP / model"
          sx={{
            "& fieldset": { border: "none" },
            "& .MuiOutlinedInput-root": {
              borderRadius: "50px",
            },
            "& .MuiOutlinedInput-input": {
              padding: "10px 20px",
            },
          }}
        />
      </Box>

      {filteredDevices &&
      filteredDevices?.length &&
      filteredDevices?.length > 0 ? (
        <div className="search-by-accordion">
          {filteredDevices?.map((device) => {
            let total: number = 0;
            let enable: number = 0;

            // console.log("device->", device);

            if (device.deviceType === "Camera") {
              total =
                (device.peopleLines ? device.peopleLines.length : 0) +
                (device.vehicleLines ? device.vehicleLines.length : 0);

              enable =
                (device.peopleLines
                  ? device.peopleLines.filter((line) => line.enable).length
                  : 0) +
                (device.vehicleLines
                  ? device.vehicleLines.filter((line) => line.enable).length
                  : 0);
            } else {
              total = device.channelEvent ? device.channelEvent.length : 0;
              enable = device.channelEvent
                ? device.channelEvent.filter((channel) => channel.connected)
                    .length
                : 0;
            }

            return (device.deviceType === "Camera" &&
              device.peopleLines !== null &&
              device.vehicleLines !== null) ||
              (device.deviceType === "AIB" &&
                device.peopleLines == null &&
                device.vehicleLines == null) ? (
              <Accordion
                key={device.id}
                expanded={expanded === device.id}
                onChange={() => {
                  setExpanded(expanded === device.id ? false : device.id);
                }}
                className="search-by-accordion-items"
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <div className="search-device-accordion-inner">
                    {device.deviceType === "Camera" ? (
                      <DraggableItemForDeviceList
                        key={device.id}
                        device={device}
                      />
                    ) : (
                      <img
                        src={
                          theme === "light"
                            ? "/images/AI_Box.gif"
                            : "/images/dark-theme/AI_Box.gif"
                        }
                        alt="device"
                      />
                    )}
                    <div className="details-of-seach-device">
                      <Tooltip title={device.deviceName}>
                        <strong>{device.deviceName}</strong>
                      </Tooltip>
                      <Typography>
                        {enable}/{total}{" "}
                        {device.deviceType === "Camera" ? "Lines" : "Channels"}
                      </Typography>
                    </div>
                  </div>
                </AccordionSummary>
                {device.deviceType === "Camera" ? (
                  <AccordionDetails>
                    <div className="floor-zones-accordion-main">
                      {device?.peopleLines
                        ?.filter((line) => line.enable)
                        ?.map((line) => {
                          const isPLineSelected =
                            device?.peopleLineIndex?.includes(line.line);

                          const handleTogglePeopleLine = () => {
                            setDeviceList((prevDevices) =>
                              prevDevices?.map(
                                (item) =>
                                  item.id === device.id
                                    ? {
                                        ...item,
                                        peopleLineIndex: isPLineSelected
                                          ? item.peopleLineIndex?.filter(
                                              (l) => l !== line.line
                                            ) // Remove line
                                          : [
                                              ...(item.peopleLineIndex ?? []),
                                              line.line,
                                            ], // Add line
                                      }
                                    : item // Return unchanged item
                              )
                            );
                          };

                          return (
                            <div className="floor-zones-accordion">
                              {/* {line.enable ? ( */}
                              <div className="floor-zones-accordion-wrapper">
                                <img
                                  src={
                                    isPLineSelected
                                      ? "/images/orange_line.svg"
                                      : "/images/gray_line.svg"
                                  }
                                  alt="device"
                                  style={{
                                    opacity: line.isMapped ? 0.5 : 1,
                                    cursor: line.isMapped
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                  onClick={
                                    line.isMapped
                                      ? undefined
                                      : handleTogglePeopleLine
                                  }
                                  onMouseEnter={() => {
                                    if (line.isMapped) {
                                      setHoveredZoneName(
                                        line?.zoneName as string
                                      );
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (line.isMapped) {
                                      setHoveredZoneName("");
                                    }
                                  }}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <IconButton>
                                    <img
                                      src={"/images/InOutLine.svg"}
                                      alt="delete"
                                      width={15}
                                      height={15}
                                    />
                                  </IconButton>
                                  <Typography sx={{ fontSize: 10 }}>
                                    In & Out
                                  </Typography>
                                </div>
                              </div>
                              {/* ) : null} */}
                            </div>
                          );
                        })}
                      {device?.vehicleLines
                        ?.filter((line) => line.enable)
                        ?.map((line,) => {
                          const isVLineSelected =
                            device?.vehicleLineIndex?.includes(line.line);

                          const handleToggleVehicleLine = () => {
                            setDeviceList((prevDevices) =>
                              prevDevices?.map(
                                (item) =>
                                  item.id === device.id
                                    ? {
                                        ...item,
                                        vehicleLineIndex: isVLineSelected
                                          ? item.vehicleLineIndex?.filter(
                                              (l) => l !== line.line
                                            ) // Remove line
                                          : [
                                              ...(item.vehicleLineIndex ?? []),
                                              line.line,
                                            ], // Add line
                                      }
                                    : item // Return unchanged item
                              )
                            );
                          };

                          return (
                            <div className="floor-zones-accordion">
                              {/* {line.enable ? ( */}
                              <div className="floor-zones-accordion-wrapper">
                                <img
                                  src={
                                    isVLineSelected
                                      ? "/images/orange_line.svg"
                                      : "/images/gray_line.svg"
                                  }
                                  alt="device"
                                  style={{
                                    width: 35,
                                    height: 35,
                                    opacity: line.isMapped ? 0.5 : 1,
                                    cursor: line.isMapped
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                  onClick={
                                    line.isMapped
                                      ? undefined
                                      : handleToggleVehicleLine
                                  }
                                  onMouseEnter={() => {
                                    if (line.isMapped) {
                                      setHoveredZoneName(
                                        line?.zoneName as string
                                      );
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (line.isMapped) {
                                      setHoveredZoneName("");
                                    }
                                  }}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <IconButton>
                                    <img
                                      src={"/images/InOutLine.svg"}
                                      alt="delete"
                                      width={15}
                                      height={15}
                                    />
                                  </IconButton>
                                  <Typography sx={{ fontSize: 10 }}>
                                    In & Out
                                  </Typography>
                                </div>
                              </div>
                              {/* ) : null} */}
                            </div>
                          );
                        })}
                    </div>
                    {hoveredZoneName ? (
                      <div className="hover-zone-name">{hoveredZoneName}</div>
                    ) : null}
                  </AccordionDetails>
                ) : (
                  <AccordionDetails>
                    {device?.channelEvent?.map((channel, index) => {
                      // console.log("channel->", channel);

                      const isConnected = channel.connected;

                      let totalChannelLine: number = 0;
                      let enableChannelLine: number = 0;

                      totalChannelLine =
                        (channel.peopleLines ? channel.peopleLines.length : 0) +
                        (channel.vehicleLines
                          ? channel.vehicleLines.length
                          : 0);

                      enableChannelLine =
                        (channel.peopleLines
                          ? channel.peopleLines.filter((line) => line.enable)
                              .length
                          : 0) +
                        (channel.vehicleLines
                          ? channel.vehicleLines.filter((line) => line.enable)
                              .length
                          : 0);

                      return isConnected ? (
                        <Accordion
                          key={index}
                          sx={{ marginBottom: 1 }}
                          expanded={expandedChannel === channel.id}
                          onChange={() => {
                            const id = channel.id ?? "";
                            setExpandedChannel(
                              expandedChannel === id ? false : id
                            );
                            // setExpandedChannel(expandedChannel === channel.id ? false : channel.id);
                          }}
                          className="search-by-accordion-items"
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <div className="search-device-accordion-inner">
                              <DraggableItemForDeviceList
                                key={channel.id}
                                device={channel}
                              />
                              <div className="details-of-seach-device">
                                <Tooltip title={`Camera ${channel.channel}`}>
                                  <strong>Camera {channel.channel}</strong>
                                </Tooltip>
                                <Typography>
                                  {enableChannelLine}/{totalChannelLine} Lines
                                </Typography>
                              </div>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails>
                            <div className="floor-zones-accordion-main">
                              {channel?.peopleLines
                                ?.filter((line) => line.enable)
                                ?.map((line, index) => {
                                  const isCPLineSelected =
                                    channel?.peopleLineIndex?.includes(
                                      line.line
                                    );

                                  const handleToggleChannel_PeopleLine = () => {
                                    setDeviceList((prevDevices) =>
                                      prevDevices?.map((item) =>
                                        item.id === device.id
                                          ? {
                                              ...item,
                                              channelEvent: item.channelEvent
                                                ? item.channelEvent.map((ch) =>
                                                    ch.channel ===
                                                    channel.channel
                                                      ? {
                                                          ...ch,
                                                          peopleLineIndex:
                                                            ch.peopleLineIndex?.includes(
                                                              line.line
                                                            )
                                                              ? ch.peopleLineIndex.filter(
                                                                  (l) =>
                                                                    l !==
                                                                    line.line
                                                                ) // Remove
                                                              : [
                                                                  ...(ch.peopleLineIndex ??
                                                                    []),
                                                                  line.line,
                                                                ], // Add
                                                        }
                                                      : ch
                                                  )
                                                : null, // If original channelEvent was null, keep it null
                                            }
                                          : item
                                      )
                                    );
                                  };

                                  return (
                                    <div
                                      key={index}
                                      className="floor-zones-accordion"
                                    >
                                      {/* {line.enable ? ( */}
                                      <div className="floor-zones-accordion-wrapper">
                                        <img
                                          src={
                                            isCPLineSelected
                                              ? "/images/orange_line.svg"
                                              : "/images/gray_line.svg"
                                          }
                                          alt="device"
                                          style={{
                                            width: 35,
                                            height: 35,
                                            opacity: line.isMapped ? 0.5 : 1,
                                            cursor: line.isMapped
                                              ? "not-allowed"
                                              : "pointer",
                                          }}
                                          onClick={
                                            line.isMapped
                                              ? undefined
                                              : handleToggleChannel_PeopleLine
                                          }
                                          onMouseEnter={() => {
                                            if (line.isMapped) {
                                              setHoveredZoneName(
                                                line?.zoneName as string
                                              );
                                            }
                                          }}
                                          onMouseLeave={() => {
                                            if (line.isMapped) {
                                              setHoveredZoneName("");
                                            }
                                          }}
                                          // onClick={
                                          //   handleToggleChannel_PeopleLine
                                          // }
                                        />
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <IconButton>
                                            <img
                                              src={"/images/InOutLine.svg"}
                                              alt="delete"
                                              width={15}
                                              height={15}
                                            />
                                          </IconButton>
                                          <Typography sx={{ fontSize: 10 }}>
                                            In & Out
                                          </Typography>
                                        </div>
                                      </div>
                                      {/* ) : null} */}
                                    </div>
                                  );
                                })}
                              {channel?.vehicleLines
                                ?.filter((line) => line.enable)
                                ?.map((line, index) => {
                                  const isCVLineSelected =
                                    channel?.vehicleLineIndex?.includes(
                                      line.line
                                    );

                                  const handleToggleChannel_VehicleLine =
                                    () => {
                                      setDeviceList((prevDevices) =>
                                        prevDevices?.map((item) =>
                                          item.id === device.id
                                            ? {
                                                ...item,
                                                channelEvent: item.channelEvent
                                                  ? item.channelEvent.map(
                                                      (ch) =>
                                                        ch.channel ===
                                                        channel.channel
                                                          ? {
                                                              ...ch,
                                                              vehicleLineIndex:
                                                                ch.vehicleLineIndex?.includes(
                                                                  line.line
                                                                )
                                                                  ? ch.vehicleLineIndex.filter(
                                                                      (l) =>
                                                                        l !==
                                                                        line.line
                                                                    ) // Remove
                                                                  : [
                                                                      ...(ch.vehicleLineIndex ??
                                                                        []),
                                                                      line.line,
                                                                    ], // Add
                                                            }
                                                          : ch
                                                    )
                                                  : null, // If original channelEvent was null, keep it null
                                              }
                                            : item
                                        )
                                      );
                                    };

                                  return (
                                    <div
                                      key={index}
                                      className="floor-zones-accordion"
                                    >
                                      {/* {line.enable ? ( */}
                                      <div className="floor-zones-accordion-wrapper">
                                        <img
                                          src={
                                            isCVLineSelected
                                              ? "/images/orange_line.svg"
                                              : "/images/gray_line.svg"
                                          }
                                          alt="device"
                                          style={{
                                            width: 35,
                                            height: 35,
                                            opacity: line.isMapped ? 0.5 : 1,
                                            cursor: line.isMapped
                                              ? "not-allowed"
                                              : "pointer",
                                          }}
                                          // onClick={
                                          //   handleToggleChannel_VehicleLine
                                          // }
                                          onClick={
                                            line.isMapped
                                              ? undefined
                                              : handleToggleChannel_VehicleLine
                                          }
                                          onMouseEnter={() => {
                                            if (line.isMapped) {
                                              setHoveredZoneName(
                                                line?.zoneName as string
                                              );
                                            }
                                          }}
                                          onMouseLeave={() => {
                                            if (line.isMapped) {
                                              setHoveredZoneName("");
                                            }
                                          }}
                                        />
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <IconButton>
                                            <img
                                              src={"/images/InOutLine.svg"}
                                              alt="delete"
                                              width={15}
                                              height={15}
                                            />
                                          </IconButton>
                                          <Typography sx={{ fontSize: 10 }}>
                                            In & Out
                                          </Typography>
                                        </div>
                                      </div>
                                      {/* ) : null} */}
                                    </div>
                                  );
                                })}
                            </div>
                            {hoveredZoneName ? (
                              <div className="hover-zone-name">
                                {hoveredZoneName}
                              </div>
                            ) : null}
                          </AccordionDetails>
                        </Accordion>
                      ) : null;
                      //  (
                      //   <div
                      //     key={index}
                      //     className="search-by-accordion-items search-by-accordion-items-inner"
                      //   >
                      //     <img
                      //       src={"/images/camera.gif"}
                      //       alt="device"
                      //       style={{ width: 30, height: 30 }}
                      //     />
                      //     <div className="details-of-seach-device">
                      //       <strong>
                      //         Camera {channel.channel}
                      //       </strong>
                      //       <Typography>
                      //         {enableChannelLine}/{totalChannelLine} Lines
                      //       </Typography>
                      //     </div>
                      //   </div>
                      // );
                    })}
                  </AccordionDetails>
                )}
              </Accordion>
            ) : null;
          })}
        </div>
      ) : (
        <Box className="sidebar-no-data">
          <Box className="sidebar-no-data-wrapper">
            <img src="/images/noData.gif" alt="No data" />
            <Typography>No data available</Typography>
            <span>There is no data to load the list of cameras.</span>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { DeviceListComponent };
