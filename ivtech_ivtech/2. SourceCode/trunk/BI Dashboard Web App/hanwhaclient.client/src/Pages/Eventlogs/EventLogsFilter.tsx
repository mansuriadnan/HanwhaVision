import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Chip,
  Box,
  FormLabel,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { ILookup } from "../../interfaces/ILookup";
import { GetAllFloorsListService, GetAllZonesByFloorIdService } from "../../services/dashboardService";
import { IFloorZoneIds } from "../../interfaces/IChart";
import { stat } from "fs";
import { CustomDateTimeRangePicker } from "../../components/Reusable/CustomDateTimeRangePicker";
import dayjs, { Dayjs } from "dayjs";
import { DEVICE_EVENTS_OPTIONS } from "../../utils/constants";
import { CustomMultiSelect } from "../../components/Reusable/CustomMultiSelect";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (filters: any) => void;
}


const statusOptions = ["All", "Acknowledged", "Pending"];

const EventLogsFilter: React.FC<FilterModalProps> = ({ open, onClose, onSubmit }) => {

  const [status, setStatus] = useState("All");
  const [floorList, setFloorList] = useState<ILookup[]>([]);
  const [zoneList, setZoneList] = useState<ILookup[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(
    dayjs().startOf("day")
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(
    dayjs(new Date())
  );

  const { control, setValue, watch, reset } = useForm<IFloorZoneIds & { selectedEvents: string[] }>({
    defaultValues: {
      selectedFloorIds: [],
      selectedZonesIds: [],
      selectedEvents: []
    },
  });

  const selectedFloorIds = watch("selectedFloorIds");
  const selectedZonesIds = watch("selectedZonesIds");
  const selectedEvents = watch("selectedEvents");

  useEffect(() => {
    fetchZoneData(selectedFloorIds);
  }, [selectedFloorIds]);

  useEffect(() => {
    setSelectedStartDate(dayjs().startOf("day"))
    setSelectedEndDate(dayjs(new Date()))
    setZoneList([]);
    setFloorList([]);
    fetchFloorData();
  }, []);



  const resetFilters = () => {
    reset({
      selectedFloorIds: [],
      selectedZonesIds: [],
      selectedEvents: [],
    });
    setStatus("All");
    setSelectedStartDate(dayjs().startOf("day"));
    setSelectedEndDate(dayjs(new Date()));
  };
  const handleDateTimeApply = ({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }) => {

    setSelectedStartDate(dayjs(startDate));
    setSelectedEndDate(dayjs(endDate));
  };

  const handleSubmit = () => {
    onSubmit({ selectedFloorIds, selectedZonesIds, selectedEvents, status, selectedStartDate, selectedEndDate });
    onClose();
  };
  const fetchFloorData = async () => {
    try {
      const response = await GetAllFloorsListService();
      const floorData = response?.map((item) => ({
        title: item.floorPlanName,
        id: item.id,
      }));
      setFloorList(floorData as ILookup[]);
      if (floorData && floorData.length > 0 && floorData[0].id) {
        const firstFloorId = floorData[0].id;
        // setValue("selectedFloorIds", firstFloorId ? [firstFloorId] : []);
      }
    } catch (err: any) {
      console.error("Error while fetching the floor data");
    } finally {
    }
  };

  const fetchZoneData = async (floorIds: string[]) => {
    if (!Array.isArray(floorIds) || floorIds.length === 0) {
      setZoneList([]);
      return;
    }

    try {
      const response: any = await GetAllZonesByFloorIdService(floorIds);

      const allZones: ILookup[] = (response?.data ?? []).flatMap((floor: any) =>
        Array.isArray(floor?.zones)
          ? floor.zones.map((zone: any) => ({
            id: zone.id,
            title: zone.zoneName,
          }))
          : []
      );

      setZoneList(allZones);
    } catch (err: any) {
      console.error("Error while fetching the zone data:", err?.message || err);
      setZoneList([]);
    }
  };


  return (
    <Dialog open={open} onClose={(event, reason) => {
      if (reason !== "backdropClick") {
          onClose();
        }
      }} 
      maxWidth="sm" fullWidth disableEscapeKeyDown className="filter-pop-up-design" >
      {/* <DialogTitle>Filter</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton> */}
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Filter</Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>

        {/* Floor Dropdown */}
        <FormControl fullWidth   className="filter-pop-floor">
          <CustomMultiSelect
            name="selectedFloorIds"
            control={control}
            label="Floor(s)"
            options={floorList}
            placeholder="Floor(s)"
           
          />
        </FormControl>

        {/* Zone Selection */}
       
          
            <CustomMultiSelect
              name="selectedZonesIds"
              control={control}
              label="Zone(s)"
              options={zoneList}
              placeholder="Zone(s)"
            />
        
       

        {/* Event Selection */}
                
          
            <CustomMultiSelect
              name="selectedEvents"
              control={control}
              label="Event(s)"
              options={DEVICE_EVENTS_OPTIONS}
              placeholder="Event(s)"
            />
        
     

        {/* Video Selection */}
        <FormControl fullWidth margin="normal" variant="outlined" className="select-status-all">
          <FormLabel>
            Status
          </FormLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}            
          >
            {statusOptions.map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Range - Placeholder (optional DatePicker integration) */}
        <Box className="filter-select-range">
          <CustomDateTimeRangePicker          
            initialStartDate={selectedStartDate?.toDate()}
            initialEndDate={selectedEndDate?.toDate()}
            onApply={({ startDate, endDate }) => {
              setSelectedStartDate(dayjs(startDate));
              setSelectedEndDate(dayjs(endDate));
              handleDateTimeApply({ startDate, endDate });
            }}
            label="Date Range"
          />
          <img src="images/calendar-gray.png" alt="calendar" />
          </Box>
        

      </DialogContent>

      <DialogActions className="filter-pop-buttons">
        <Button onClick={resetFilters} className="common-btn-design-transparent common-btn-design">
          Reset
        </Button>
        <Button onClick={handleSubmit} variant="contained" className="common-btn-design">
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventLogsFilter;
