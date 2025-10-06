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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  DataGrid,
  GridCloseIcon,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";

import { IEventlogs } from "../../interfaces/IEventlogs";
import dayjs, { Dayjs } from "dayjs";
import { formatDateToConfiguredTimezone } from "../../utils/formatDateToConfiguredTimezone";
import { formatDate } from "../../utils/dateUtils";
import { useThemeContext } from "../../context/ThemeContext";
import { CustomDateTimeRangePicker } from "../../components/Reusable/CustomDateTimeRangePicker";
import { CommonDialog } from "../../components";
import { GetAllExceptionLogsListService } from "../../services/exceptionService";
import { IExceptionLogResponse } from "../../interfaces/IExceptionlogs";

const ErrorLogsPage: React.FC = () => {
  const [errorLogsListData, setErrorLogsListData] = useState<IExceptionLogResponse[]>([]);
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
    { field: "loggedAt", sort: "desc" }, // default sorting
  ]);

  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(
    dayjs().startOf("day")
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(
    dayjs(new Date())
  );
  const [selectedStatus, setSelectedStatus] = useState<"all" | "success" | "fail">("fail");
  const [openDescription, setOpenDescription] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<{ title: string; value: string }>({
    title: "",
    value: "",
  });
  const { theme } = useThemeContext();

  useEffect(() => {
     fetchExceptionLogsData({
      selectedStartDate,
      selectedEndDate,
      status: mapStatusForBackend(selectedStatus),
      searchTerm,
      // include pagination + sorting
      pageNumber: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      sortBy: sortModel[0]?.field || "loggedAt",
      sortOrder: sortModel[0]?.sort === "desc" ? -1 : 1,
    });
  }, [
    selectedStartDate,
    selectedEndDate,
    selectedStatus,
    // searchTerm,
    paginationModel.page,
    paginationModel.pageSize,
    sortModel,
  ]);
  // useEffect(() => {
  //   // whenever any of these values change, reset to first page
  //   resetpagination();
    
  // }, [selectedStartDate, selectedEndDate, searchTerm, selectedStatus]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0 ) {
        let filters = {
          selectedStartDate: selectedStartDate,
          selectedEndDate: selectedEndDate,
          status: mapStatusForBackend(selectedStatus),
        };
        fetchExceptionLogsData(filters);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const mapStatusForBackend = (status: "all" | "success" | "fail") => {
    if (status === "success") return true;
    if (status === "fail") return false;
    return "";
  };


  const fetchExceptionLogsData = async (filter?: any) => {
    try {
      const sortBy = sortModel[0]?.field || "loggedAt";
      const sortOrder = sortModel[0]?.sort === "desc" ? -1 : 1;
      let request = {
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
        searchText: searchTerm
      };

      const exceptionLogsData: any = await GetAllExceptionLogsListService(request);
      if (
        exceptionLogsData?.data?.exceptionLogsDetails &&
        exceptionLogsData?.data?.exceptionLogsDetails.length > 0
      ) {
        setErrorLogsListData(
          exceptionLogsData?.data?.exceptionLogsDetails as IExceptionLogResponse[]
        );
        SetTotalRecord(exceptionLogsData?.data?.totalCount);
      } else {
        setErrorLogsListData([]);
        SetTotalRecord(0);
      }

    } catch (err: any) {
      console.error("Error fetching event data:", err);
    }
  };

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    resetpagination();
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

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value as "all" | "success" | "fail");
    resetpagination();
  };

  const handleOpenDescription = (info: { title: string | undefined; value: string }) => {
    setSelectedDescription(info);
    setOpenDescription(true);
  };

  const handleCloseDescription = () => {
    setOpenDescription(false);
  };

  const columns: GridColDef[] = [

    {
      field: "exceptionMessage", headerName: "Exception Message", flex: 1,
      renderCell: (params) => (
        <Typography
          className="inner-link"
          variant="body2"
          onClick={() =>
            handleOpenDescription({
              title: params.colDef.headerName, // or params.field
              value: params.value,
            })
          }
        >
          {params.value}
        </Typography>
      )
    },

    {
      field: "stackTrace", headerName: "Stack Trace", flex: 1,
      renderCell: (params) => (
        <Typography
          className="inner-link"
          variant="body2"
          onClick={() =>
            handleOpenDescription({
              title: params.colDef.headerName, // or params.field
              value: params.value,
            })
          }
        >
          {params.value}
        </Typography>
      )
    },
    {
      field: "exceptionType", headerName: "Exception Type", flex: 1,

    },
    {
      field: "loggedAt", headerName: "Logged At", flex: 1,
      renderCell: (params) => {
        const convertedDateTime = formatDateToConfiguredTimezone(params.value);
        return <span>{formatDate(convertedDateTime)}</span>;
      },
    },
    { field: "requestPath", headerName: "Request Path", flex: 1, },

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
            <Typography variant="h4">Error Logs</Typography>
            <Typography>Track your all the errors here..</Typography>
          </Box>
        </div>

        <div className="top-list-bar">
          <Typography variant="h5" gutterBottom>
            List of Errors
          </Typography>

          <div className="top-listing-items">
            <div className="dashbourd-retail-details-date dashbourd-retail-details-date-for-error" style={{ width: '500px' }}>
              <CustomDateTimeRangePicker
                onApply={({ startDate, endDate }) =>
                  handleDateTimeApply({
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                  })
                }
              />
              <img src="images/calendar.png" alt="" />
            </div>
            <TextField
              variant="outlined"
              placeholder="Search by Exception Message, Stack Trace, Request Path, Exception Type"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ borderRadius: 8 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <img
                      src={"/images/search.svg"}
                      alt="Search"
                      style={{ cursor: "pointer" }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
              <InputLabel id="floor-select-label">Status</InputLabel>
              <Select
                labelId="floor-select-label"
                value={selectedStatus}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="fail">Fail</MenuItem>
              </Select>
            </FormControl> */}
          </div>
        </div>

        <DataGrid
          rows={errorLogsListData}
          columns={columns}
          getRowId={(row) => row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          rowCount={errorLogsListData.length === 0 ? 0 : TotalRecord}
          paginationMode="server"
          pageSizeOptions={[5, 10, 15, 20, 25]}
          sortingMode="server"
          // sortModel={sortModel}  // commented for resolving multiple call
          onSortModelChange={handleSortModelChange}
          hideFooter={errorLogsListData.length === 0}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
        />

      </div>
      <CommonDialog
        open={openDescription}
        title={selectedDescription.title}
        customClass="cmn-description-popup"
        content={selectedDescription.value}
        onConfirm={handleCloseDescription}
        onCancel={handleCloseDescription}
        confirmText="Close"
        titleClass={true}
        showCloseIcon={true}
        maxWidth={"lg"}
      />
    </>
  );
};

export default ErrorLogsPage;
