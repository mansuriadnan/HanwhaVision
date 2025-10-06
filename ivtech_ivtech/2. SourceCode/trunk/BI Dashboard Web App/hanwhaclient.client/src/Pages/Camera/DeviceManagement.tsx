import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Typography,
  Container,
  TextField,
  Box,
  IconButton,
  Tooltip,
  FormControl,
  Grid,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  TablePagination,
  Drawer,
  Checkbox,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import handleResponse from "../../utils/handleResponse";
import { DataGrid, GridCloseIcon, GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { DeviceAddEdit } from "../Camera/DeviceAddEdit";
import { ICamera, IGetAllDeviceRequest } from "../../interfaces/ICamera";
import {
  DeleteCameraService,
  GetAllCameraListService,
} from "../../services/cameraService";
import { CustomButton } from "../../components/Reusable/CustomButton";
import { CommonDialog } from "../../components/Reusable/CommonDialog";

import Divider from '@mui/material/Divider';
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";
import { useThemeContext } from "../../context/ThemeContext";

const DeviceManagement: React.FC = () => {
  const [cameraGridData, setCameraGridData] = useState<ICamera[]>([]);
  const [cameraListData, setCameraListData] = useState<ICamera[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openAddCamera, setOpenAddCamera] = useState<boolean>(false);
  const [openEditCamera, setOpenEditCamera] = useState<boolean>(false);
  const [selectedCamera, setSelectedCamera] = useState<ICamera | undefined>(
    undefined
  );
  const [TotalRecord, SetTotalRecord] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const [gridPaginationModel, setGridPaginationModel] = useState<GridPaginationModel>({
    pageSize: 8,
    page: 0,
  });
  // const [gridpage, setGridPage] = useState(1);
  // const [loading, setLoading] = useState(false);
  // const [hasMore, setHasMore] = useState(true);
  const [displayView, setDisaplayView] = useState<string>('listview')
  // const observer = useRef<IntersectionObserver | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'deviceName', sort: 'desc' }, // default sorting
  ]);

  const { theme } = useThemeContext();

  // useEffect(() => {
  //   if (displayView === "gridview") {
  //     fetchGridCameraData();
  //   } else {
  //     fetchListCameraData();
  //   }
  // }, [displayView, paginationModel, gridPaginationModel, sortModel]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (displayView === "gridview") {
        fetchGridCameraData();
      } else {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
          fetchListCameraData();
        }
      }
    }, 500); // Optional debounce to limit rapid-fire calls

    return () => clearTimeout(delayDebounce);
  }, [displayView, paginationModel, gridPaginationModel, sortModel, searchTerm]);


  // useEffect(() => {
  //   const delayDebounce = setTimeout(() => {
  //     if (searchTerm.length >= 3) {
  //       fetchListCameraData();

  //     }
  //     resetpagination();
  //   }, 1000);

  //   return () => clearTimeout(delayDebounce);
  // }, [searchTerm])

  const fetchGridCameraData = async () => {
    // if (loading || !hasMore) return;
    // setLoading(true);
    try {

      let request: IGetAllDeviceRequest = {
        searchText: searchTerm.length > 0 ? searchTerm : "",
        pageNo: gridPaginationModel.page + 1,
        pageSize: gridPaginationModel.pageSize,
        deviceIds: null,
        sortBy:"deviceName",
        sortOrder:-1

      }
      if (searchTerm.length === 0 || searchTerm.length >= 3) {
        // suburl = `?searchText=${searchTerm.trim()}&PageSize=${gridPaginationModel.pageSize
        //   }&PageNo=${gridPaginationModel.page + 1}`;

        const cameraData: any = await GetAllCameraListService(request);

        setCameraGridData(cameraData.data.deviceDetails as ICamera[]);
        SetTotalRecord(cameraData.data.totalCount);
      }


      // suburl = `?gridPaginationModel.=${10}&PageNo=${gridpage+1}`;

      // setCameraGridData((prevCameras) => {
      //   const updatedCameras = [...prevCameras, ...cameraData.cameraDetails];

      //   if (updatedCameras.length >= cameraData.totalCount) {
      //     setHasMore(false);
      //   }

      //   return updatedCameras;
      // });

      // if (cameraData.cameraDetails.length > 0) {
      //   setGridPage((prev) => prev + 1);
      // } else {
      //   setHasMore(false);
      // }
    } catch (err: any) {
      console.error("Error fetching camera data:", err);
    } finally {
      // setLoading(false);
    }
  };

  const fetchListCameraData = async (isReload = false) => {

    try {
      const sortBy = sortModel[0]?.field || "deviceName";
      const sortOrder = sortModel[0]?.sort === 'desc' ? -1 : 1;
      let deviceIds: string[];
      if (displayView === "gridview") { // need to add condition as reload is common for both gridview and listview
        deviceIds = cameraGridData.map(device => device.id!);
      } else {
        deviceIds = cameraListData.map(device => device.id!)
      }
      let request: IGetAllDeviceRequest = {
        searchText: searchTerm.length > 0 ? searchTerm : "",
        pageNo: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        deviceIds: isReload ? deviceIds : null,
        sortBy: sortBy,
        sortOrder: sortOrder,
      }
      if (searchTerm.length === 0 || searchTerm.length >= 3) {
        // suburl = `?searchText=${searchTerm.trim()}&PageSize=${paginationModel.pageSize
        //   }&PageNo=${paginationModel.page + 1}`;

        const cameraData: any = await GetAllCameraListService(request);
        if (cameraData.data?.deviceDetails.length > 0) {
          setCameraListData(cameraData.data.deviceDetails as ICamera[]);
          SetTotalRecord(cameraData.data.totalCount);
        } else {
          setCameraListData([])
          SetTotalRecord(0)
        }
      }
    } catch (err: any) {
      console.error("Error fetching camera data:", err);
    }
  };

  // const lastElementRef = useCallback(
  //   (node: HTMLDivElement | null) => {
  //     if (loading) return;
  //     if (observer.current) observer.current.disconnect();

  //     observer.current = new IntersectionObserver((entries) => {
  //       if (entries[0].isIntersecting && hasMore && !loading) {
  //         console.log("Fetching more data...");
  //         fetchGridCameraData();
  //       }
  //     });

  //     if (node) observer.current.observe(node);
  //   },
  //   [loading, hasMore]
  // );

  const getChipStyle = (type: string) => {
    return type === "AIB"
      ? { bgcolor: "#FFF7D6 !important", color: "#FF8A01  !important", fontWeight: 600, height: "22px" }
      : { bgcolor: "#E0FFD6  !important", color: "#1E7A00  !important", fontWeight: 600, height: "22px" };
  };

  const refreshCameraData = async () => {
    await Promise.all([fetchListCameraData(), fetchGridCameraData()]);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);

  };


  const handleCloseConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const finalDeleteDevices = async () => {
    if (selectedDevices.length > 0) {
      try {
        const deleteData = await DeleteCameraService(selectedDevices);
        // handleResponse(deleteData);
        if (deleteData !== undefined) {
          setOpenDeleteConfirm(false);

        }
        refreshCameraData();
      } catch (err: any) { }
    }
  };

  const handleAddCamera = () => {
    setOpenAddCamera(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddCamera(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditCamera(false);
  };

  const handleEdit = (camera: ICamera) => {
    setSelectedCamera(camera);
    setOpenEditCamera(true);
  };

  const handleDelete = () => {
    setOpenDeleteConfirm(true);
  };

  const columns: GridColDef[] = [

    {
      field: "deviceName",
      headerName: "Device name",
      width: 200,
      filterable: false,
      renderCell: (params) => {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {params.row.deviceType === "AIB" ? (
              params.row.isOnline ?
                <img src={ theme === 'light' ? "/images/AI_Box.gif" : "/images/dark-theme/AI_Box.gif" } alt="Online AI Box" width="34" height="34" />
                : <img src={ theme === 'light' ? "/images/offline_AI_Box.svg" :  "/images/dark-theme/offline_AI_Box.svg"} alt="Offline AI Box" width="34" height="34" />
            ) :
              (
                params.row.isOnline ?
                  <img src={ theme === 'light' ? "/images/activecamera.gif" : "/images/dark-theme/activecamera.gif"  } alt="Online Camera" width="34" height="34" />
                  :
                  <img src={ theme === 'light' ? "/images/offlineCamera.svg" : "/images/dark-theme/offlineCamera.svg"} alt="Offline Camera" width="24" height="24" />
              )}
            <span>{params.value}</span>
          </div>
        );
      }

    },
    { field: "model", headerName: "Model", width: 200, filterable: false, },
    {
      field: "ipAddress",
      headerName: "IP Address",
      width: 200,
      filterable: false,
      renderCell: (params) => {
        const protocol = params.row.isHttps ? "https" : "http";
       return(<a
          // href={`http://${params.value}`}
          href={`${protocol}://${params.value}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1168D0', textDecoration: 'underline', fontWeight: 600 }}
        >
          {params.value}
        </a>);
      },
    },
    { field: "location", headerName: "Location", width: 200, filterable: false, },
    // {
    //   field: "cameraType",
    //   headerName: "cameraType",
    //   width: 250,
    //   renderCell: (params) => {
    //     return (
    //       <Box>
    //         {(params.value || []).map((cameratype: string, index: number) => (
    //           <Chip
    //             key={index}
    //             label={cameratype === "people_count" ? "People Count" : "Vehicle Count"}
    //             size="small"
    //             color="warning"
    //             variant="outlined"
    //             style={{ margin: 2 }}
    //           />
    //         ))}
    //       </Box>
    //     );
    //   }

    // },
    { field: "zoneNames", headerName: "Zones", width: 200, filterable: false, },
    { field: "serialNumber", headerName: "Serial number", width: 200, filterable: false, },

    // {
    //   field: "direction",
    //   headerName: "direction",
    //   width: 150,
    //   renderCell: (params) => {
    //     return (
    //       <Box>
    //         {(params.value || []).map((direction: string, index: number) => (
    //           <Chip
    //             key={index}
    //             label={direction === "in" ? "In" : "Out"}
    //             size="small"
    //             color={direction === "in" ? "success" : "error"}
    //             variant="outlined"
    //             style={{ margin: 2 }}
    //           />
    //         ))}
    //       </Box>
    //     );
    //   }
    // },
    // {
    //   field: "apiType",
    //   headerName: "apiType",
    //   width: 150,
    //   renderCell: (params) => {
    //     return (
    //       <Box>
    //         {params.value === "wise_api" ? "Wise Api" : "Sun Api"}
    //       </Box>
    //     );
    //   }


    // },
    { field: "macAddress", headerName: "macAddress", width: 220, filterable: false, },
    {
      field: "deviceType",
      headerName: "DeviceType",
      width: 150,
      filterable: false,
      renderCell: (params) => {
        return (
          <Chip label={params.value} sx={getChipStyle(params.value)} />
        );
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          {HasPermission(LABELS.Can_Add_Or_Update_Device) && (
            <Tooltip title="Edit Camera">
              <IconButton onClick={() => handleEdit(params.row)}>
                <img src={theme === 'light' ?"/images/edit.svg" :"/images/dark-theme/edit.svg"} alt="Edit Camera" width="20" height="20" />
              </IconButton>
            </Tooltip>
          )}
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

  const changeDisaplayView = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setDisaplayView(nextView);
    setSelectedDevices([])
  }

  const handleCheckboxChange = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    );
  };

  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };
  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
  };



  const CameraGrid = () => {


    return (
      <>
        <div className="grid-view-table">
          <Grid
            className="table-grid-main"
          >
            {cameraGridData.length > 0 ? cameraGridData.map((camera, index) =>
            (
              <Grid item className="table-grid-items">
                <Card className="table-grid-card" style={{height:"100%"}}>
                  <Grid className="table-grid-head">

                    {camera.deviceType === "AIB" ? (
                      camera.isOnline ? (
                        <img src={theme === 'light' ? "/images/AI_Box.gif" : "/images/dark-theme/AI_Box.gif"} alt="Online AI Box" width="34" height="34" />
                      ) : (
                        <img src={theme === 'light' ? "/images/offline_AI_Box.svg" : "/images/dark-theme/offline_AI_Box.svg" } alt="Offline AI Box" width="34" height="34" />
                      )
                    ) : (
                      camera.isOnline ? (
                        <img src={theme === 'light' ? "/images/activecamera.gif" : "/images/dark-theme/activecamera.gif"} alt="Online Camera" width="34" height="34" />
                      ) : (
                        <img src={theme === 'light' ? "/images/offlineCamera.svg" : "/images/dark-theme/offlineCamera.svg"} alt="Offline Camera" width="24" height="24" />
                      )
                    )}

                    <Box className="grid-avtar-detail">
                      <Typography>Device name</Typography>
                      <Typography>{camera.deviceName}</Typography>
                    </Box>

                    <Box className="table-grid-details">
                      {HasPermission(LABELS.Can_Add_Or_Update_Device) && (
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(camera)}>
                            <img src={theme === 'light' ?"/images/edit.svg" :"/images/dark-theme/edit.svg"} alt="Edit Devices" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Checkbox
                        checked={selectedDevices.includes(camera.id as string)}
                        onChange={() => handleCheckboxChange(camera.id as string)}
                      />
                    </Box>
                  </Grid>
                  <CardContent>
                    <Grid className="table-grid-items-list">
                      <Grid item className="table-grid-items-half">
                        <Typography variant="body2" className="table-grid-items-label">Model</Typography>
                        <Typography>{camera.model}</Typography>
                      </Grid>
                      <Grid item className="table-grid-items-half">
                        <Typography variant="body2" className="table-grid-items-label">Location</Typography>
                        <Typography>{camera.location}</Typography>
                      </Grid>
                      <Grid item className="table-grid-items-half">
                        <Typography variant="body2" className="table-grid-items-label">Mac address</Typography>
                        <Typography>{camera.macAddress}</Typography>
                      </Grid>
                      <Grid item className="table-grid-items-half">
                        <Typography variant="body2" className="table-grid-items-label">Serial number</Typography>
                        <Typography>{camera.serialNumber}</Typography>
                      </Grid>
                      <Grid item className="table-grid-items-half">
                        <Typography variant="body2" className="table-grid-items-label">Zones</Typography>
                        <Typography>{camera.zoneNames}</Typography>
                      </Grid>
                      <Grid item className="table-grid-items-full">
                        <Typography variant="body2" className="table-grid-items-label">Device type</Typography>
                        <Chip label={camera.deviceType} sx={getChipStyle(camera.deviceType)} />
                      </Grid>
                      <Grid item className="table-grid-items-full">
                        <Typography variant="body2" className="table-grid-items-label">IP Address</Typography>
                        <Tooltip title={`http://${camera.ipAddress}`}>
                          <Typography
                            component="a"
                            href={`http://${camera.ipAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: '#1976d2',
                              textDecoration: 'underline',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'inline-block',
                              maxWidth: '150px', // adjust width to fit your layout
                              fontWeight: "600",
                            }}
                          >
                            {camera.ipAddress.length > 20
                              ? `${camera.ipAddress.slice(0, 17)}...`
                              : camera.ipAddress}
                          </Typography>
                        </Tooltip>
                      </Grid>
                      
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
              :
              <Box className="no-data-douns"
              >
                <Box sx={{ width: 200, justifyItems: "center", flex: 1, }}>
                  <img src={theme === 'light' ? '/images/noData.gif' : '/images/dark-theme/noData.gif'} alt="Animated GIF" width="100" height="100" />
                  <Typography
                    sx={{ FontWeight: 600, fontSize: 24, color: "#090909" }}
                  >
                    No data found
                  </Typography>
                  {/* <Typography
                    sx={{ FontWeight: 400, fontSize: 12, color: "#212121" }}
                  >
                   No data available to display Users. Please add a new user by clicking the <strong>Add New User</strong> button.
                  </Typography> */}
                </Box>
              </Box>}
          </Grid >
        </div>

        {cameraGridData.length > 0 && (
          <TablePagination
            component="div"
            count={TotalRecord}
            page={gridPaginationModel.page}
            rowsPerPage={gridPaginationModel.pageSize}
            onPageChange={(event, newPage) =>
              setGridPaginationModel((prev) => ({ ...prev, page: newPage }))}
            onRowsPerPageChange={(event) =>
              setGridPaginationModel({ pageSize: parseInt(event.target.value, 10), page: 0 })}
            rowsPerPageOptions={[4, 8, 12]}
          />
        )}
      </>
    );
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
        {/* <Typography
            sx={{ FontWeight: 400, fontSize: 12, color: "#212121" }}
          >
           No data available to display Users. Please add a new user by clicking the <strong>Add New User</strong> button.
          </Typography> */}
      </Box>
    </Box>
  );

  return (
    <>

      {/* <Container sx={{ mt: 4, width: "100%" }}> */}
      <div className="main-dashbourd-wrapper">
        <div className="top-orange-head" style={backgroundStyle} >
          <Box className="top-orange-head-left">
            <Typography variant="h4">
              Manage Devices
            </Typography>
            <Typography>Add new devices like Smart Cameras & AI Boxes..</Typography>
          </Box>
          {HasPermission(LABELS.Can_Add_Or_Update_Device) && (
            <CustomButton
              size="small"
              variant="outlined"
              onClick={handleAddCamera}
            // onClick={handleAddDevices}
            >
              <img src={"/images/adddevice.svg"} alt="Add Devices" />
              Add Devices
            </CustomButton>
          )}
        </div>

        <div className="top-list-bar">

          <Typography variant="h5" gutterBottom>List Of Devices</Typography>

          <div className='top-listing-items'>
            <TextField
              placeholder="Search by device name, model, serial number, ip address, zone or mac address..."
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
                      style={{ cursor: "pointer" }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {(cameraListData && cameraListData.length > 0) && (
              <CustomButton
                variant="outlined" onClick={() => fetchListCameraData(true)}
              >
                <img src={"/images/reload.svg"} alt="Reload Devices" />
                Reload
              </CustomButton>
            )}

            {HasPermission(LABELS.Can_Delete_Device) && (
              <CustomButton
                variant="outlined"
                size="small"
                onClick={() => handleDelete()}
                disabled={selectedDevices.length > 0 ? false : true}
              >
                {selectedDevices.length > 0 ? <img src={"/images/remove.svg"} alt="Remove Devices" /> : <img src={"/images/remove_disabled.svg"} alt="Remove Devices disabled" />}
                Remove
              </CustomButton>
            )}

            <ToggleButtonGroup
              exclusive
              value={displayView}
              onChange={changeDisaplayView}
              className="list-and-grid"
            >
              <ToggleButton className="list-button" value="listview" aria-label="listview">
                <img src={"/images/ListView.svg"} alt="listview" />  List
              </ToggleButton>
              <ToggleButton className="grid-buttons" value="gridview" aria-label="gridview">
                <img src={"/images/grid-orange.svg"} alt="gridview" /> Grid
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

        </div>


        {displayView === "gridview" ? (
          CameraGrid()
        ) : (
          <DataGrid
            rows={cameraListData}
            columns={columns}
            getRowId={(row) => row.id}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={cameraListData.length === 0 ? 0 : TotalRecord}
            paginationMode="server"
            pageSizeOptions={[5, 10, 15, 20, 25]}
            checkboxSelection
            onRowSelectionModelChange={(ids) => {
              setSelectedDevices(ids as string[])
            }}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            hideFooter={cameraListData.length === 0}
          />
        )}
      </div>

      {/* <CommonDialog
        open={openAddCamera}
        title={"Add New Camera"}
        content={
          <DeviceAddEdit
            onClose={handleCloseAddModal}
            refreshData={refreshCameraData}
          />
        }
        onCancel={handleCloseAddModal}
      //cancelText="Cancel"
      /> */}

      <Drawer
        anchor={"right"}
        open={openAddCamera}
        onClose={() => {
          //  reset();
          setOpenAddCamera(false);
        }}
        ModalProps={{
          onClose: (event, reason) => {
            if (reason !== 'backdropClick') {
              setOpenAddCamera(false);
            }
          }
        }}
        className="cmn-pop"
      >
        <Box className="cmn-pop-head">
          {/* Title on Left */}
          <Typography variant="h6">Add Device</Typography>

          {/* Close Icon on Right */}
          <IconButton onClick={() => setOpenAddCamera(false)}>
            <GridCloseIcon />
          </IconButton>
        </Box>

        <DeviceAddEdit
          onClose={handleCloseAddModal}
          refreshData={refreshCameraData}
        />
      </Drawer>

      {/* <CommonDialog
        open={openEditCamera}
        title={"Edit Camera"}
        content={
          <DeviceAddEdit
            cameras={selectedCamera}
            onClose={handleCloseEditModal}
            refreshData={refreshCameraData}
          />
        }
        onCancel={handleCloseEditModal}
      //cancelText="Cancel"
      /> */}


      <Drawer
        anchor={"right"}
        open={openEditCamera}
        onClose={() => {
          //  reset();
          setOpenEditCamera(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: "20px 0 0 20px",
          },
        }}
        ModalProps={{
          onClose: (event, reason) => {
            if (reason !== 'backdropClick') {
              setOpenEditCamera(false);
            }
          }
        }}
        className="cmn-pop"
      >
        <Box
          className="cmn-pop-head"
        >
          {/* Title on Left */}
          <Typography variant="h6">Edit Device</Typography>

          {/* Close Icon on Right */}
          <IconButton onClick={() => setOpenEditCamera(false)}>
            <GridCloseIcon />
          </IconButton>
        </Box>

        <DeviceAddEdit
          cameras={selectedCamera}
          onClose={handleCloseEditModal}
          refreshData={refreshCameraData}
        />
      </Drawer>

      <CommonDialog
        open={openDeleteConfirm}
        title="Delete Confirmation!"
        // content="Are you sure you want to Continue?"
        content={
          <div>
            <p>Are you sure you want to continue?</p>
            <p className="deleted-colors-text">
              Once you confirm, all mappings between the selected device(s) and their associated{' '}
              <span style={{ color: '#f57c00' }}>floors and zones will be automatically removed</span>.
              You may no longer be able to view data from these{' '}
              <span style={{ color: '#f57c00' }}>deleted device(s)</span> moving forward.
            </p>
          </div>
        }
        onConfirm={() =>
          selectedDevices.length > 0 && finalDeleteDevices()
        }
        type="delete"
        onCancel={handleCloseConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        titleClass={true}
        customClass="cmn-confirm-delete-icon cmn-confirm-delete-icon-new"

      />
    </>

  );
};

export default DeviceManagement;
