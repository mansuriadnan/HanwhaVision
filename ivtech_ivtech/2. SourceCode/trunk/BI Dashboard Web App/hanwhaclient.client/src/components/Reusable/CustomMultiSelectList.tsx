import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  fetchAllDevicesForHeatMapService,
  fetchAllDevicesForWidgetWiseHeatMapService,
} from "../../services/dashboardService";
import { IAllDevices } from "../../interfaces/IChart";
import { useUser } from "../../context/UserContext";

interface DeviceItem {
  deviceId: string;
  deviceName: string;
  channelNo: string;
}

interface DeviceSelectorProps {
  onSelectionChange: (
    selectedIds: { deviceId: string; channelNo: number }[]
  ) => void;
  initialSelection?: { deviceId: string; channelNo: number }[];
  features: string;
  floorId: string | null;
  widgetType?: string;
}

const CustomMultiSelectList: React.FC<DeviceSelectorProps> = ({
  onSelectionChange, // Optional,
  initialSelection,
  features,
  floorId,
  widgetType,
}) => {
  const [selectedDevices, setSelectedDevices] = useState<
    { deviceId: string; channelNo: number }[]
  >([]);

  const [allDevices, setAllDevices] = useState<IAllDevices[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // const suburl = `?feature=heatmap`;
        // const suburl = `?feature=${features}`;

        let suburl: string = "";

        if (features === "heatmap") {
          suburl = `?heatmapType=${widgetType}`;
        } else {
          suburl = `?feature=${features}`;
        }

        if (floorId) {
          suburl += `&floorId=${floorId}`;
        }

        //const response: any = await fetchAllDevicesForHeatMapService(suburl);

        let response: any;
        if (floorId) {
          response = await fetchAllDevicesForHeatMapService(suburl);
        } else {
          response = await fetchAllDevicesForWidgetWiseHeatMapService(suburl);
        }

        if (response && response.length > 0) {
          setAllDevices(response);
        } else {
          setAllDevices([]);
        }
      } catch (err: any) {
        console.error(
          "Error while fetching the Devices data:",
          err?.message || err
        );
        setAllDevices([]);
      }
    };

    fetchDevices();
  }, [floorId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const filteredList =
    searchText.length >= 3
      ? allDevices.filter((item) =>
          item.cameraName.toLowerCase().includes(searchText.toLowerCase())
        )
      : allDevices;

  const handleToggleDevice = (deviceId: string, channelNo: number) => {
    setSelectedDevices((prev) => {
      const exists = prev.some(
        (d) => d.deviceId === deviceId && d.channelNo === channelNo
      );
      if (exists) {
        return prev.filter(
          (d) => !(d.deviceId === deviceId && d.channelNo === channelNo)
        );
      } else {
        return [...prev, { deviceId, channelNo }];
      }
    });
  };

  // Notify parent whenever selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDevices);
    }
  }, [selectedDevices, onSelectionChange]);

  useEffect(() => {
    if (initialSelection?.length) {
      setSelectedDevices(initialSelection);
    }
  }, [initialSelection]);

  return (
    <Box sx={{ ml: 2, mt: 2 }}>
      <TextField
        placeholder="Search IP Address/Camera Name..."
        fullWidth
        variant="outlined"
        onChange={handleSearch}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      <Box
        sx={{
          maxHeight: 300, // Adjust height as needed
          overflowY: "auto",
          pr: 1, // optional padding for scrollbar spacing
        }}
      >
        {filteredList?.map((item) => {
          const isChecked = selectedDevices.some(
            (d) =>
              d.deviceId === item.deviceId && d.channelNo === item.channelNo
          );
          return (
            <Box
              key={`${item.deviceId}-${item.channelNo}`}
              onClick={() => handleToggleDevice(item.deviceId, item.channelNo)}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: 1,
                backgroundColor: isChecked ? "#f5f5f5" : "transparent",
              }}
            >
              <Checkbox
                checked={isChecked}
                onChange={() =>
                  handleToggleDevice(item.deviceId, item.channelNo)
                }
                onClick={(e) => e.stopPropagation()}
              />
              <Typography sx={{ color: isChecked ? "#FE6500" : "inherit" }}>
                {item.cameraName}{" "}
                {item.deviceType == "AIB" ? `- ${item.channelNo}` : ""}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CustomMultiSelectList;
