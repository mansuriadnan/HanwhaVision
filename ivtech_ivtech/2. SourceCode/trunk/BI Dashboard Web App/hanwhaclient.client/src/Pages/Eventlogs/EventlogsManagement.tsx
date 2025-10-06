import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Typography,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  Button,
  Link,
} from "@mui/material";
import {
  DataGrid,
  GridCloseIcon,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import {
  GetAllEventLogsListService,
  UpdateEventLogsStatusService,
} from "../../services/cameraService";

import { IEventlogs } from "../../interfaces/IEventlogs";
import EventLogsFilter from "./EventLogsFilter";
import dayjs from "dayjs";
import { Ipayload } from "../../interfaces/Inotifications";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import { formatDate } from "../../utils/dateUtils";
import { VideoPlayer } from "../Welcome/VideoPlayer";
import { useThemeContext } from "../../context/ThemeContext";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";

const EventlogsManagement: React.FC = () => {
  const [eventLogsListData, setEventLogsListData] = useState<IEventlogs[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [TotalRecord, SetTotalRecord] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const [gridPaginationModel, setGridPaginationModel] =
    useState<GridPaginationModel>({
      pageSize: 8,
      page: 0,
    });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdOn", sort: "desc" }, // default sorting
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [filterState, setFilterState] = useState<any>(null);
  const [videoKey, setVideoKey] = useState<number>(0);
  const { theme } = useThemeContext();

  // useEffect(() => {
  //     fetchListEventLogsData();
  // }, []);
  useEffect(() => {
    let filters = {
      selectedFloorIds: filterState?.selectedFloorIds,
      selectedZonesIds: filterState?.selectedZonesIds,
      selectedEvents: filterState?.selectedEvents,
      status: filterState?.status,
      selectedStartDate: filterState?.selectedStartDate,
      selectedEndDate: filterState?.selectedEndDate,
    };

    fetchListEventLogsData(filters);
  }, [paginationModel, gridPaginationModel, sortModel]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 3) {
        let filters = {
          selectedFloorIds: filterState?.selectedFloorIds,
          selectedZonesIds: filterState?.selectedZonesIds,
          selectedEvents: filterState?.selectedEvents,
          status: filterState?.status,
          selectedStartDate: filterState?.selectedStartDate,
          selectedEndDate: filterState?.selectedEndDate,
        };
        fetchListEventLogsData(filters);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchListEventLogsData = async (filter?: any) => {
    try {
      const sortBy = sortModel[0]?.field || "createdOn";
      const sortOrder = sortModel[0]?.sort === "desc" ? -1 : 1;
      let request = {
        floorIds: filter?.selectedFloorIds,
        zoneIds: filter?.selectedZonesIds,
        eventNames: filter?.selectedEvents,
        status: filter?.status,
        fromDate: filter?.selectedStartDate
          ? filter?.selectedStartDate.toISOString()
          : dayjs(new Date()).startOf("day").toISOString(),
        toDate: filter?.selectedEndDate
          ? filter?.selectedEndDate.toISOString()
          : dayjs(new Date()).toISOString(),
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      const eventLogsData: any = await GetAllEventLogsListService(request);
      if (
        eventLogsData?.data?.eventsLogsDetails &&
        eventLogsData?.data?.eventsLogsDetails.length > 0
      ) {
        setEventLogsListData(
          eventLogsData?.data?.eventsLogsDetails as IEventlogs[]
        );
        SetTotalRecord(eventLogsData?.data?.totalCount);
      } else {
        setEventLogsListData([]);
        SetTotalRecord(0);
      }

    } catch (err: any) {
      console.error("Error fetching event data:", err);
    }
  };

  const getChipStyle = (type: string) => {
    return type === "Acknowledged"
      ? { bgcolor: "#DCFFD6", color: "#007E0D", fontWeight: 500 }
      : { bgcolor: "#FFF7D6", color: "#FF8A01", fontWeight: 500 };
  };

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    resetpagination();
  };

  const handleStatusChange = async (id: string) => {
    try {
      const request: Ipayload = {
        deviceEventId: id,
      };
      const eventLogsUpdateStatus: any = await UpdateEventLogsStatusService(
        request
      );
      if (eventLogsUpdateStatus) {
        const updatedEvents = eventLogsListData.map((event) =>
          event.id === id ? { ...event, isAcknowledged: true } : event
        );
        setEventLogsListData(updatedEvents);
      }
    } catch (err: any) {
      console.error("Error updating status data:", err);
    }
  };

  // const handleOpenDialog = () => setOpen(true);
  // const handleCloseDialog = () => setOpen(false);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const handleVideoClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsVideoModalOpen(true);
    setVideoKey(Date.now());
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedEventId("");
  };

  const columns: GridColDef[] = [
    {
      field: "createdOn",
      headerName: "Date & Time",
      width: 200,
      flex: 1,
      renderCell: (params) => {
        const convertedDateTime = formatDateToConfiguredTimezone(params.value);
        return formatDate(convertedDateTime);
      },
    },
    { field: "eventName", headerName: " Event Name", width: 200 },
    {
      field: "eventDescription",
      headerName: "Description",
      width: 200,
      flex: 1,
    },
    { field: "floorName", headerName: "Floor name", width: 200 },

    { field: "zoneName", headerName: "Zone name", width: 200 },

    // { field: "videoLink", headerName: "Video link", width: 250 },
    {
      field: "videoLink",
      headerName: "Video link",
      width: 250,
      flex: 1,
      renderCell: (params: any) => {
        return (
          <button
            onClick={() => handleVideoClick(params.row.id)} // Adjust based on your data structure
           disabled = {!HasPermission(LABELS.View_Event_Video)}
            style={{
              color: "#1976d2",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              font: "inherit",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Click to play video"
          >
            <img
              src={theme === 'light' ? "/images/video-link-icon.svg" : "/images/dark-theme/video-link-icon.svg"}
              alt="Video Icon"
              style={{ width: "20px", height: "20px" }}
            />
          </button>
        );
      },
    },
    {
      field: "isAcknowledged",
      headerName: "Status",
      width: 150,
      flex: 1,
      renderCell: (params) => {
        return (
          <Chip
            label={params.value ? "Acknowledged" : "Pending"}
            sx={getChipStyle(params.value ? "Acknowledged" : "Pending")}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Box>
          {HasPermission(LABELS.Acknowledge_Event) &&
            <Tooltip
              title={params.row.isAcknowledged ? "Acknowledged" : "Pending"}
            >
              {params.row.isAcknowledged ? (
                <IconButton>
                  <img
                    src={theme === 'light' ? "/images/EventLogsAcknowledgedIcon.svg" : "/images/dark-theme/EventLogsAcknowledgedIcon.svg"}
                    alt="Acknowledged"
                    width="20"
                    height="20"
                  />
                </IconButton>
              ) : (
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    handleStatusChange(params.row.id);
                  }}
                >
                  <img
                    src={theme === 'light' ? "/images/EventLogsPendingIcon.svg" : "/images/dark-theme/EventLogsPendingIcon.svg"}
                    alt="Pending"
                    width="20"
                    height="20"
                  />
                </IconButton>
              )}
            </Tooltip>
          }
        </Box>
      ),
    },
  ];

  const handlePaginationModelChange = (
    newPaginationModel: GridPaginationModel
  ) => {
    setPaginationModel(newPaginationModel);
  };

  const resetpagination = () => {
    setPaginationModel({
      ...paginationModel,
      page: 0,
    });
  };

  const handleFilterSubmit = (filters: any) => {
    setFilterState(filters);
    fetchListEventLogsData(filters);
  };

  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  const CustomNoRowsOverlay = () => (
    <Box className="no-data-douns"
    >
      <Box sx={{ width: 200, justifyItems: "center", flex: 1, }}>
        <img src={theme === 'light' ? '/images/noData.gif' : '/images/dark-theme/noData.gif'} alt="Animated GIF" width="100" height="100" />
        <Typography
          sx={{ FontWeight: 600, fontSize: 24, color: "#090909" }}
        >
          No data found
        </Typography>

      </Box>
    </Box>
  );

  return (
    <>
      {/* <Container sx={{ mt: 4, width: "100%" }}> */}
      <div className="main-dashbourd-wrapper">
        <div className="top-orange-head" style={backgroundStyle}>
          <Box className="top-orange-head-left">
            <Typography variant="h4">Event Logs</Typography>
            <Typography>Track your all the events here..</Typography>
          </Box>
        </div>

        <div className="top-list-bar">
          <Typography variant="h5" gutterBottom>
            List of Events
          </Typography>

          <div className="top-listing-items">
            {/* <TextField
                            label="Search"
                            variant="outlined"
                            // size="small"
                            value={searchTerm}
                            onChange={handleSearch}
                            sx={{ borderRadius: 8 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <img
                                            src={"/images/search.svg"}
                                            alt="Search"
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        /> */}

            {/* <CustomButton
                            variant="outlined" onClick={fetchListEventLogsData}
                        >
                            <img src={"/images/reload.svg"} alt="Reload Devices" />
                            Reload
                        </CustomButton> */}

            <div className="filter-top">
              <Button variant="outlined" onClick={() => setOpen(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5.4 2.1001H18.6C19.7 2.1001 20.6 3.0001 20.6 4.1001V6.3001C20.6 7.1001 20.1 8.1001 19.6 8.6001L15.3 12.4001C14.7 12.9001 14.3 13.9001 14.3 14.7001V19.0001C14.3 19.6001 13.9 20.4001 13.4 20.7001L12 21.6001C10.7 22.4001 8.9 21.5001 8.9 19.9001V14.6001C8.9 13.9001 8.5 13.0001 8.1 12.5001L4.3 8.5001C3.8 8.0001 3.4 7.1001 3.4 6.5001V4.2001C3.4 3.0001 4.3 2.1001 5.4 2.1001Z"
                    stroke="#212121"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10.93 2.1001L6 10.0001"
                    stroke="#212121"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </Button>

              <EventLogsFilter
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleFilterSubmit}
              />
            </div>
          </div>
        </div>

        <DataGrid
          rows={eventLogsListData}
          columns={columns}
          getRowId={(row) => row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          rowCount={eventLogsListData.length === 0 ? 0 : TotalRecord}
          paginationMode="server"
          pageSizeOptions={[5, 10, 15, 20, 25]}
          checkboxSelection
          onRowSelectionModelChange={(ids) => {
            setSelectedDevices(ids as string[]);
          }}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          hideFooter={eventLogsListData.length === 0}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
        />
        <VideoPlayer
          key={videoKey}
          isOpen={isVideoModalOpen}
          onClose={handleCloseModal}
          eventId={selectedEventId}
        />
      </div>
    </>
  );
};

export default EventlogsManagement;
