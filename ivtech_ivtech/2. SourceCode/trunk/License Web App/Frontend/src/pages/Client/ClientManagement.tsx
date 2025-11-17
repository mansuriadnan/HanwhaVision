import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  Grid,
  InputAdornment,
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";
import { IRoleDelete } from "../../interfaces/IRoleUser";
import handleResponse from "../../utils/handleResponse";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CommonDialog from "../../components/Reusable/CommonDialog";
import moment from "moment";
import {
  DeleteClientService,
  GetAllClientsService,
} from "../../services/clientService";
import { IClient, referenceDatatype } from "../../interfaces/IGetAllClients";
import { usePermissions } from "../../context/PermissionsContext";
import { filterByScreenName } from "../../utils/screenAccessUtils";
import { LABELS, REGEX } from "../../utils/constants";
import { ClientAddEditPage } from "./ClientAddEditPage";
import { FaHome, FaUserAlt, FaBars, FaTimes, FaUndo } from "react-icons/fa";
import { divIcon } from "leaflet";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  ILicence,
  IReferenceData,
  IResendLicensePayload,
} from "../../interfaces/ILicense";
import {
  GenerateLicenseService,
  GetDownloadLicense,
  GetLicenceByClientIDService,
  resendLicenseService,
} from "../../services/licenceService";
import { formatDate } from "../../utils/dateUtils";
import CustomRadio from "../../components/Reusable/CustomRadio";
import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { CustomButton, CustomTextField } from "../../components";
import { toast } from "react-toastify";
import { HasPermission } from "../../utils/screenAccessUtils";

const ClientManagement = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<IClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [clientToBeDelete, setClientToBeDelete] = useState<IRoleDelete | null>(
    null
  );
  const [distributorForResendLisence, setDistributorForResendLisence] =
    useState<IRoleDelete | null>(null);
  // const { permissions }: { permissions: any[] } = usePermissions();
  // const location = useLocation();
  // const label = location.state?.label;
  // const [filteredChildren, setFilteredChildren] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [openEditClient, setOpenEditClient] = useState(false);
  const [openAddClient, setOpenAddClient] = useState(false);
  const [clientForLicense, setClientForLicense] = useState<IClient | null>(
    null
  );
  const [openLicenseModal, setOpenLicenseModal] = useState(false);
  const [allLicenseDetail, setAllLicenseDetail] = useState<ILicence[]>([]);
  const [licenseSearchTerm, setLicenseSearchTerm] = useState("");
  const [openConfirmLicense, setOpenConfirmLicense] = useState(false);
  const [openConfirmResendLicense, setOpenConfirmResendLicense] =
    useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10, // Default page size
    page: 0, // Default page index
  });

  const [licenseReferenceData, setLicenseReferenceData] =
    useState<IReferenceData>({
      clientMapping: [],
      clientMachineId: [],
      createdBy: [],
    });
  const [referenceData, setReferenceData] = useState<referenceDatatype>();
  const [licenseData, setLicenseData] = useState<LicenseFormInputs | null>(
    null
  );
  const [isDisableDurationRadio, setIsDisableDurationRadio] = useState(false);
  const [isDisableSingleDuration, setIsDisableSingleDuration] = useState(false);

  interface LicenseFormInputs {
    licenseType: string;
    trialDurationDays: number;
    siteName: string;
    macAddress: string;
    // machineID: string,
    // users: number | null;
    noOfUsers: number | null;
    noOfChannel: number | null;
    baseChannelSWBL: number | null;
    channelLicenseSW1CH: number | null;
    startDate: Dayjs | null;
  }

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<LicenseFormInputs>({
    defaultValues: {
      licenseType: "Trial",
      trialDurationDays: 15,
      siteName: "",
      macAddress: "",
      // machineID: "",
      // users: 4,
      noOfUsers: 4,
      noOfChannel: 4,
      baseChannelSWBL: 4,
      channelLicenseSW1CH: 0,
      startDate: null,
    },
  });

  const selectedLicenceType = watch("licenseType");
  const NoOfchannelForTrial = watch("noOfChannel") || 0;
  const changebaseChannelSWBL = Number(watch("baseChannelSWBL")) || 0;
  const changeChannelLicenseSW1CH = Number(watch("channelLicenseSW1CH")) ?? 0;
  const NoOfchannelForpermenent =
    changebaseChannelSWBL + changeChannelLicenseSW1CH;
  const seletedTrialDurationDays = watch("trialDurationDays");

  const NoOfchannelForTrialUser =
    NoOfchannelForTrial + changeChannelLicenseSW1CH;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedLicenceType) {
      setValue("channelLicenseSW1CH", 0);
    }
  }, [selectedLicenceType, setValue]);

  const fetchInitialData = async () => {
    try {
      const clientData = await GetAllClientsService();
      setClients(clientData.data as IClient[]);
      setReferenceData(clientData.referenceData as any);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  const columns: GridColDef[] = [
    { field: "customerNo", headerName: "Customer ID", width: 150 },
    { field: "customerName", headerName: "Customer Name", width: 150 },
    { field: "distributorName", headerName: "Dist. Name", width: 150 },
    { field: "contactPersonName", headerName: "Contact Person", width: 150 },
    { field: "contactPersonMobile", headerName: "Mobile No", width: 150 },
    // { field: "officePhone", headerName: "Office Phone", width: 150 },
    { field: "emailAddress", headerName: "Email", width: 200 },
    { field: "address", headerName: "Address", width: 250 },
    // {
    //   field: "createdBy",
    //   headerName: "Created By",
    //   width: 150,
    //   renderCell: (params) => {
    //     const createdByID = params.row.createdBy as string;
    //     const filteredData =
    //       referenceData &&
    //       referenceData.createdBy.find((item) => item.value === createdByID);
    //     return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
    //   },
    // },
    // {
    //   field: "createdOn",
    //   headerName: "Created On",
    //   width: 180,
    //   // renderCell: (params) => formatDateTime(params.value as string | null),
    //   renderCell: (params) => {
    //     return <span>{formatDate(params.value)}</span>;
    //   },
    // },
    // {
    //   field: "updatedBy",
    //   headerName: "Last Updated By",
    //   width: 150,
    //   renderCell: (params) => {
    //     const updatedByID = params.row.updatedBy as string;
    //     const filteredData =
    //       referenceData &&
    //       referenceData.updatedBy.find((item) => item.value === updatedByID);
    //     return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
    //   },
    // },
    // {
    //   field: "updatedOn",
    //   headerName: "Updated On",
    //   width: 180,
    //   renderCell: (params) => {
    //     return <span>{formatDate(params.value)}</span>;
    //   },

    //   // renderCell: (params) => formatDateTime(params.value as string | null),
    // },
    {
      field: "actions",
      headerName: "Action",
      width: 150,
      sortable: false,
      headerClassName: "sticky-column",
      cellClassName: "sticky-column",
      renderCell: (params) => (
        <Box>
          {HasPermission(LABELS.Can_Add_Or_Update_Customer) && (
            <Tooltip title="Edit Customer">
              <IconButton onClick={() => handleEdit(params.row)}>
                <img
                  src={"/images/edit.svg"}
                  alt="Distributor Icon"
                  width={22}
                  height={22}
                />
              </IconButton>
            </Tooltip>
          )}
          {HasPermission(LABELS.Can_Delete_the_Customer) && (
            <Tooltip title="Delete Customer">
              <IconButton onClick={() => handleDelete(params.id as string)}>
                <img
                  src={"/images/trash.svg"}
                  alt="Distributor Icon"
                  width={22}
                  height={22}
                />
              </IconButton>
            </Tooltip>
          )}

          {HasPermission(LABELS.Can_View_License) && (
            <Tooltip title="Generate License">
              <IconButton onClick={() => handleOpenLicenseModal(params.row)}>
                <img
                  src={"/images/LicenseDetail.svg"}
                  alt="Generate License"
                  width="24"
                  height="24"
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleLicenseSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseSearchTerm(event.target.value);
  };

  const handleEdit = (client: IClient) => {
    setSelectedClient(client);
    setOpenEditClient(true);
  };

  const handleDelete = (clientid: string) => {
    setClientToBeDelete({ id: clientid });
    setOpenDeleteConfirm(true);
  };

  const handleAddClient = () => {
    setOpenAddClient(true);
  };

  const customerRows = clients.map((client, index) => {
    const distributorName =
      referenceData &&
      referenceData.distributorId.find(
        (item) => item.value === client.distributorId
      );
    return {
      id: client.id,
      customerName: client.customerName,
      distributorId: client.distributorId,
      contactPersonName: client.contactPersonName,
      contactPersonMobile: client.contactPersonMobile,
      officePhone: client.officePhone,
      emailAddress: client.emailAddress,
      countryId: client.countryId,
      stateId: client.stateId,
      cityId: client.cityId,
      postalCode: client.postalCode,
      address: client.address,
      macAddress: client.macAddress,
      customerNo: client.customerNo,
      createdOn: client.createdOn,
      createdBy: client.createdBy,
      updatedOn: client.updatedOn,
      updatedBy: client.updatedBy,
      distributorName: distributorName?.label,
    };
  });

  const filteredClients = customerRows.filter(
    (clients) =>
      clients.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clients?.customerNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clients.contactPersonMobile
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      clients.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clients.distributorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (licenseData) {
      handleGenerateLicense(licenseData);
    }
  };

  const handleCloseConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditClient(false);
  };

  const handleCloseAddModal = () => {
    setOpenAddClient(false);
  };

  const handleCloseLicenseModal = () => {
    setOpenLicenseModal(false);
    reset();
    setAllLicenseDetail([]);
    setLicenseReferenceData({
      clientMapping: [],
      clientMachineId: [],
      createdBy: [],
    });
  };

  const finalDeleteClient = async (id: string) => {
    try {
      const deleteData = await DeleteClientService(id);
      // setRoles(data as IRole[]);
      if (deleteData.isSuccess) {
        setOpenDeleteConfirm(false);
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err);
    }
  };

  const handleResendLicense = async (id: string) => {
    try {
      const data: IResendLicensePayload = {
        licenseId: id,
      };
      const resendLicense: any = await resendLicenseService(data);
      if (resendLicense?.isSuccess) {
        handleCloseConfirmLicenseResend();
      }
      //handleResponse(resendLicense);
    } catch (err: any) {
      toast.error(err);
    }
  };

  const handleUpgrateLicense = (selectedLicense: LicenseFormInputs) => {
    if (selectedLicense.trialDurationDays === 30) {
      setValue("licenseType", "Permanent");
      setIsDisableDurationRadio(true);
    } else if (selectedLicense.trialDurationDays === 15) {
      setValue("licenseType", "Trial");
      setValue("trialDurationDays", 30);
      setIsDisableSingleDuration(true);
    } else {
      setValue("licenseType", "Trial");
      setValue("trialDurationDays", 30);
      setIsDisableDurationRadio(false);
    }
    if (selectedLicense.licenseType === "Permanent") {
      setValue("licenseType", "Permanent");
      setValue("channelLicenseSW1CH", (selectedLicense?.noOfChannel ?? 4) - 4);
      setIsDisableDurationRadio(true);
    }

    // setValue("trialDurationDays", selectedLicense.trialDurationDays);
    setValue("siteName", selectedLicense.siteName);
    setValue("macAddress", selectedLicense.macAddress);
    // setValue("users", selectedLicense.users);
    setValue("noOfUsers", selectedLicense.noOfUsers);
    setValue("noOfChannel", selectedLicense.noOfChannel);
    setValue(
      "startDate",
      selectedLicense.startDate ? dayjs(selectedLicense.startDate) : null
    );
  };

  const handleGenerateLicense: SubmitHandler<LicenseFormInputs> = async (
    data: any
  ) => {
    const licenseData = {
      siteName: data.siteName,
      // clientId: clientForLicense?.id,
      customerId: clientForLicense?.id,
      // users: data.users,
      noOfUsers: data.noOfUsers,
      //startDate: data.startDate ? dayjs(data.startDate).toISOString() : "",
      startDate: data.startDate
        ? dayjs(data.startDate).startOf("day").format("YYYY-MM-DD") // Format date as YYYY-MM-DD
        : "",
      licenseType: data.licenseType,
      trialDurationDays:
        data.licenseType !== "Permanent" ? data.trialDurationDays : 0,
      noOfChannel:
        data.licenseType === "Trial"
          ? NoOfchannelForTrialUser
          : NoOfchannelForpermenent,
      macAddress: data.macAddress,
    };

    try {
      const response: any = await GenerateLicenseService(
        licenseData as ILicence
      );
      if (response?.isSuccess) {
        handleGetLicenseList(clientForLicense?.id as string);
        setOpenConfirmLicense(false);
        reset();
      }
    } catch (err: any) {
      toast.error("Error generating license");
    }
    // };
  };

  const downloadLicense = async (licenseID: string) => {
    const url = `${process.env.REACT_APP_API_BASE_URL}license/DownloadLicense/${licenseID}`;
    const publicKeyUrl = `${process.env.REACT_APP_API_BASE_URL}license/DownloadPublicKey/${licenseID}`;
    const token = localStorage.getItem("accessToken");

    try {
      // Download License File
      const licenseResponse = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!licenseResponse.ok) {
        throw new Error("Failed to download license file");
      }

      const licenseBlob = await licenseResponse.blob();
      const licenseFileUrl = window.URL.createObjectURL(licenseBlob);
      const licenseAnchor = document.createElement("a");
      licenseAnchor.href = licenseFileUrl;
      licenseAnchor.download = "license_file.lic";
      document.body.appendChild(licenseAnchor);
      licenseAnchor.click();
      licenseAnchor.remove();
      window.URL.revokeObjectURL(licenseFileUrl);

      // Download Public Key File
      const publicKeyResponse = await fetch(publicKeyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!publicKeyResponse.ok) {
        throw new Error("Failed to download public key file");
      }

      const publicKeyBlob = await publicKeyResponse.blob();
      const publicKeyFileUrl = window.URL.createObjectURL(publicKeyBlob);
      const publicKeyAnchor = document.createElement("a");
      publicKeyAnchor.href = publicKeyFileUrl;
      publicKeyAnchor.download = "public_key.pem";
      document.body.appendChild(publicKeyAnchor);
      publicKeyAnchor.click();
      publicKeyAnchor.remove();
      window.URL.revokeObjectURL(publicKeyFileUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };
  const LicenseColumns = [
    { field: "siteName", headerName: "Site Name", flex: 1 },
    { field: "macAddress", headerName: "MAC Address", flex: 1 },
    {
      field: "licenseType",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => {
        return (
          <span
            style={{
              color: params.row.licenseType === "Trial" ? "#856404" : "#155724",
              paddingTop: "4px",
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    // { field: "users", headerName: "No. Of Users", flex: 1 },
    { field: "noOfUsers", headerName: "No. Of Users", flex: 1 },
    { field: "noOfChannel", headerName: "No. Of Channels", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => moment(params.value).format("DD/MM/YYYY"),
    },
    {
      field: "expiryDate",
      headerName: "End Date",
      flex: 1,
      // renderCell: (params) => moment(params.value).format("DD/MM/YYYY"),
      renderCell: (params) =>
        params.row.licenseType === "Trial"
          ? moment(params.value).format("DD/MM/YYYY")
          : "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        let statusColor = "default";
        if (params.value === "Future") statusColor = "warning";
        if (params.value === "Active") statusColor = "success";
        if (params.value === "Expired") statusColor = "error";
        return (
          <Chip
            label={params.value}
            size="small"
            color={
              statusColor as
                | "default"
                | "primary"
                | "secondary"
                | "success"
                | "error"
                | "info"
                | "warning"
            }
            variant="outlined"
            sx={{
              backgroundColor:
                statusColor === "success"
                  ? "#dff0d8"
                  : statusColor === "error"
                  ? "#f8d7da"
                  : statusColor === "warning"
                  ? "#fff3cd"
                  : "transparent",
              color:
                statusColor === "success"
                  ? "#155724"
                  : statusColor === "error"
                  ? "#721c24"
                  : statusColor === "warning"
                  ? "#856404"
                  : "inherit",
            }}
          />
        );
      },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      flex: 1,
      renderCell: (params) => {
        const createdByID = params.row.createdBy as string;
        const filteredData =
          licenseReferenceData &&
          licenseReferenceData.createdBy.find(
            (item) => item.value === createdByID
          );
        return <Box>{filteredData && <label>{filteredData.label}</label>}</Box>;
      },
    },
    {
      field: "createdOn",
      headerName: "Created On",
      width: 150,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "file",
      headerName: "File",
      width: 70,
      renderCell: (params) => {
        return (
          HasPermission(LABELS.Can_Download_License_File) && (
            <Tooltip title="File">
              <IconButton
                onClick={() => downloadLicense(params.row.id)}
                // href={`https://localhost:7259/api/license/DownloadLicense/${params.row.id}`}
                // download
              >
                <img
                  src="/images/folderImg.svg"
                  alt="File"
                  width="20"
                  height="20"
                />
              </IconButton>
            </Tooltip>
          )
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      headerClassName: "sticky-column",
      cellClassName: "sticky-column",
      renderCell: (params) => (
        <>
          {HasPermission(LABELS.Can_Resend_License) && (
            <Tooltip title="Resend">
              <IconButton
                onClick={() => openConfirmForLiceneseResend(params.row.id)}
              >
                <img
                  src="/images/resend.svg"
                  alt="Resend"
                  width="20"
                  height="20"
                />
              </IconButton>
            </Tooltip>
          )}
          {HasPermission(LABELS.Can_Generate_License) && (
            <Tooltip title="Upgrade">
              <IconButton onClick={() => handleUpgrateLicense(params.row)}>
                <img
                  src="/images/upgrade_license.svg"
                  alt="Upgrade License"
                  width="20"
                  height="20"
                />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  const licenseRows = allLicenseDetail.map((license, index) => {
    const currentDate = new Date();
    const startDate = new Date(license.startDate);
    const expiryDate = new Date(license.expiryDate);

    let status = "";
    if (license.licenseType === "Trial") {
      if (currentDate < startDate) status = "Future";
      else if (currentDate >= startDate && currentDate <= expiryDate)
        status = "Active";
      else status = "Expired";
    } else {
      if (currentDate < startDate) {
        status = "Future";
      } else if (currentDate >= startDate && currentDate <= expiryDate) {
        status = "Active";
      } else {
        status = license.licenseType === "Trial" ? "Expired" : "Active"; // Non-trial licenses stay "Active" even after expiry
      }
    }

    return {
      id: license.id,
      siteName: license.siteName,
      macAddress: license.macAddress,
      licenseType: license.licenseType,
      // users: license.users,
      noOfUsers: license.noOfUsers,
      noOfChannel: license.noOfChannel,
      startDate: license.startDate,
      expiryDate: license.expiryDate,
      status,
      trialDurationDays: license.trialDurationDays,
      createdBy: license.createdBy,
      createdOn: license.createdOn,
    };
  });

  const filteredLicense = licenseRows.filter(
    (license) =>
      license.siteName
        ?.toLowerCase()
        .includes(licenseSearchTerm.toLowerCase()) ||
      license.macAddress
        ?.toLowerCase()
        .includes(licenseSearchTerm.toLowerCase()) ||
      license.licenseType
        ?.toLowerCase()
        .includes(licenseSearchTerm.toLowerCase()) ||
      moment(license.startDate)
        .format("DD/MM/YYYY")
        .toLowerCase()
        .includes(licenseSearchTerm.toLowerCase())
  );

  const CustomNoRowsOverlay = () => (
    <Box className="no-data-douns">
      <Box sx={{ width: 200, justifyItems: "center", flex: 1 }}>
        <img
          src={"/images/noData.gif"}
          alt="Animated GIF"
          width="100"
          height="100"
        />
        <Typography sx={{ FontWeight: 600, fontSize: 24, color: "#090909" }}>
          No data found
        </Typography>
      </Box>
    </Box>
  );

  const openConfirmForLiceneseGenerate = () => {
    setOpenConfirmLicense(true);
  };

  const openConfirmForLiceneseResend = (id: string) => {
    const data = { id: id };
    setDistributorForResendLisence(data);
    setOpenConfirmResendLicense(true);
  };

  const handleCloseConfirmLicense = () => {
    setOpenConfirmLicense(false);
  };

  const handleCloseConfirmLicenseResend = () => {
    setOpenConfirmResendLicense(false);
    setDistributorForResendLisence(null);
  };

  const LicenseDetailContent = (
    <>
      {HasPermission(LABELS.Can_Generate_License) && (
        <Grid
          item
          alignItems="center"
          justifyContent="space-between"
          className="license-detail-for"
        >
          <Grid item className="license-type">
            <label>Select License Type </label>
            <Box className="select-license">
              <FormControl
                component="fieldset"
                variant="filled"
                className="select-license-redio"
              >
                <CustomRadio
                  label=""
                  name="licenseType"
                  control={control}
                  options={[
                    { label: "Trial", value: "Trial" },
                    { label: "Permanent", value: "Permanent" },
                  ]}
                  row={true}
                  rules={{ required: "License type is required" }} // Validation rule
                />
              </FormControl>

              {selectedLicenceType === "Trial" && (
                <FormControl
                  className="select-licence-type"
                  component="fieldset"
                >
                  <CustomRadio
                    label=""
                    name="trialDurationDays"
                    control={control}
                    options={[
                      { label: "15 Days", value: 15 },
                      { label: "30 Days", value: 30 },
                    ]}
                    row={true}
                    rules={{ required: "Trial duration is required" }}
                    disabled={isDisableDurationRadio}
                    disabledOptions={isDisableSingleDuration ? [15] : []}
                  />
                </FormControl>
              )}
            </Box>
          </Grid>
          {/* <Grid item xs={6} container justifyContent="flex-end" alignItems="center" > */}
          <Grid item className="channel-license">
            <Box className="total-channel-license">
              <Typography color="textSecondary">
                Total Channel License
              </Typography>
              <Typography component="span">
                {selectedLicenceType === "Trial"
                  ? NoOfchannelForTrialUser
                  : NoOfchannelForpermenent}
              </Typography>
            </Box>

            <CustomButton
              // fullWidth
              //s
              // onClick={openConfirmForLiceneseGenerate}
              // onClick={handleSubmit(handleGenerateLicense)}
              onClick={handleSubmit((data) => {
                setLicenseData(data); // Store form data
                openConfirmForLiceneseGenerate(); // Open confirmation dialog
              })}
            >
              Generate License
            </CustomButton>
          </Grid>
        </Grid>
      )}
      {HasPermission(LABELS.Can_Generate_License) && (
        <>
          <Grid className="license-details">
            <Grid item className="license-details-wraper">
              <CustomTextField
                name="siteName"
                label="Site Name"
                control={control}
                rules={{
                  required: "Site name is required.",
                }}
                fullWidth
                autoFocus
                placeholder="Enter site name"
                required
              />
            </Grid>
            <Grid item className="license-details-wraper">
              <CustomTextField
                name="macAddress"
                label="MAC Address"
                control={control}
                rules={{
                  required: "Mac address is required.",
                  pattern: {
                    value: /^([0-9A-Fa-f]{2}-){5}([0-9A-Fa-f]{2})$/, // enforce dash format
                    message: "Enter a valid MAC address.",
                  },
                }}
                fullWidth
                autoFocus
                placeholder="Enter MAC address"
                required
                formatType="mac" // <-- enables automatic "-" insertion
              />
            </Grid>

            <Grid item className="license-details-wraper">
              <CustomTextField
                // name="users"
                name="noOfUsers"
                label="Number Of User"
                type="number"
                control={control}
                rules={{
                  required: "Number of user is required.",
                }}
                fullWidth
                autoFocus
                placeholder="Enter number of user"
                required
                // disabled={selectedLicenceType === "Trial" ? true : false}
              />
            </Grid>

            <Grid item className="license-details-wraper">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{
                    required: "License start date is required",
                    validate: (value) => {
                      if (!value || !dayjs(value).isValid()) {
                        return "Invalid date format"; // Custom validation message
                      }
                      if (dayjs(value).isBefore(dayjs().startOf("day"))) {
                        return "Date cannot be in the past"; // Restrict past dates
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="License Start Date"
                      value={field.value}
                      onChange={(newValue) => {
                        const selectedDate = dayjs(newValue);
                        const today = dayjs().startOf("day");

                        if (selectedDate.isBefore(today)) {
                          field.onChange(today); // Reset to today's date if invalid
                        } else {
                          field.onChange(newValue);
                        }
                      }} // Pass new value back to the form state
                      minDate={dayjs().startOf("day")}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal",
                          required: true,
                          error: !!errors.startDate, // If there's an error, show error styling
                          helperText:
                            (errors.startDate as FieldValues)?.message || "", // Display error message if validation fails
                          variant: "filled",
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            {selectedLicenceType === "Trial" && (
              <Grid item className="license-details-wraper">
                <CustomTextField
                  name="noOfChannel"
                  label="Base Channel 4ch-VI-SWBL"
                  control={control}
                  type="number"
                  rules={{
                    required: "Number of channels is required.",
                  }}
                  fullWidth
                  autoFocus
                  placeholder="Enter number of channels"
                  required
                  disabled={true}
                />
              </Grid>
            )}
            {selectedLicenceType === "Permanent" && (
              <>
                {/* <Grid container item> */}
                <Grid item className="license-details-wraper">
                  <CustomTextField
                    name="baseChannelSWBL"
                    label="Base Channel 4ch-VI-SWBL"
                    type="number"
                    control={control}
                    fullWidth
                    autoFocus
                    placeholder="Enter number of base channel 4ch-VI-SWBL"
                    required
                    disabled={true}
                  />
                </Grid>

                {/* </Grid> */}
              </>
            )}
            <Grid item className="license-details-wraper">
              <CustomTextField
                name="channelLicenseSW1CH"
                label="Channel License-VI-SW1CH"
                control={control}
                type="number"
                fullWidth
                autoFocus
                placeholder="Enter number of channel license-VI-SW1CH"
                rules={{
                  required: "Channel license-VI-SW1CH is required.",
                }}
                required
              />
            </Grid>
          </Grid>
        </>
      )}
      <Box className="license-detail-main">
        <TextField
          //label="Search"
          variant="outlined"
          className="license-detail-search"
          fullWidth
          sx={{ flexGrow: 1, mr: 2 }}
          value={licenseSearchTerm}
          onChange={handleLicenseSearch}
          placeholder="Search by site name, MAC Address,type,start date..."
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <img src={"/images/search.svg"} alt="Search" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataGrid
        rows={filteredLicense}
        columns={LicenseColumns}
        getRowId={(row) => row.id}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50, 100]}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
      />
    </>
  );

  const handleGetLicenseList = async (clientID) => {
    try {
      const allLicense = await GetLicenceByClientIDService(clientID as string);
      setAllLicenseDetail(allLicense.data as ILicence[]);
      setLicenseReferenceData(allLicense.referenceData as IReferenceData);
    } catch (err: any) {
      toast.error(err);
    }
  };

  const handleOpenLicenseModal = async (client: IClient) => {
    setClientForLicense(client);
    await handleGetLicenseList(client.id);
    setOpenLicenseModal(true);
  };

  const findDistributorData = () => {
    const disId =
      clientForLicense && (clientForLicense.distributorId as string);
    const filteredDistributorName =
      referenceData &&
      referenceData.distributorId.find((item) => item.value === disId);
    const filteredDistributorEmail =
      referenceData &&
      referenceData.distributorIdEmail.find((item) => item.value === disId);
    const distributorDataobj = {
      filteredDistributorName,
      filteredDistributorEmail,
    };
    return distributorDataobj;
  };

  return (
    <>
      <Box className="rightbar-main-content">
        <Box className="top-dash-details">
          <Typography
            variant="h5"
            sx={{ color: "#424242", justifySelf: "flex-start" }}
          >
            List of Customers
          </Typography>
          <Box className="top-dash-details-right">
            <TextField
              variant="outlined"
              fullWidth
              sx={{ mr: 2, ml: 2 }}
              className="InputSearch"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by Customer ID, Customer Name, Distributor Name, Mobile No or Email"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <img src={"/images/search.svg"} alt="Search" />
                  </InputAdornment>
                ),
              }}
            />
            {HasPermission(LABELS.Can_Add_Or_Update_Customer) && (
              <CustomButton onClick={handleAddClient}>
                Add New Customer
              </CustomButton>
            )}
          </Box>
        </Box>
        <DataGrid
          rows={filteredClients}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          sx={{
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#FDF1E8",
            },
          }}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
        />
      </Box>

      <CommonDialog
        open={openDeleteConfirm}
        title="Delete Confirmation!"
        content="Are you sure you want to continue?"
        onConfirm={() =>
          clientToBeDelete && finalDeleteClient(clientToBeDelete.id)
        }
        onCancel={handleCloseConfirm}
        confirmText={"Delete"}
        cancelText={"Cancel"}
        type="delete"
        customClass="common-dialog-with-icon"
      />

      <CommonDialog
        open={openEditClient}
        title={
          selectedClient && selectedClient?.customerNo ? (
            <span>
              Edit Customer{" "}
              <span style={{ color: "#F4731F" }}>
                {selectedClient?.customerName} ({selectedClient?.customerNo})
              </span>
            </span>
          ) : (
            "Edit Customer"
          )
        }
        content={
          <ClientAddEditPage
            client={selectedClient}
            onClose={handleCloseEditModal}
            refreshData={fetchInitialData}
          />
        }
        onCancel={handleCloseEditModal}
        //cancelText="Cancel"
        customClass="add-edit-dialog"
      />
      <CommonDialog
        open={openAddClient}
        title={"Add New Customer"}
        content={
          <ClientAddEditPage
            onClose={handleCloseAddModal}
            refreshData={fetchInitialData}
          />
        }
        onCancel={handleCloseAddModal}
        //cancelText="Cancel"
        customClass="add-edit-dialog"
      />

      <CommonDialog
        open={openLicenseModal}
        title={
          clientForLicense && clientForLicense.customerNo ? (
            <span>
              License Detail for{" "}
              <span style={{ color: "#F4731F" }}>
                {clientForLicense?.customerName} ({clientForLicense?.customerNo}
                )
              </span>
            </span>
          ) : (
            "License Detail for"
          )
        }
        content={LicenseDetailContent}
        onCancel={handleCloseLicenseModal}
        //cancelText="Cancel"
        maxWidth={false}
        fullWidth={true}
        customClass={"license-detail-content-pop"}
      />

      <CommonDialog
        open={openConfirmLicense}
        title="Are you sure you want to continue?"
        content={
          <center>
            <span
              style={{
                justifyContent: "center",
                color: "#616161",
                fontSize: "20px",
              }}
            >
              A license file will be generated and sent to the distributor{" "}
              <br />
              <span style={{ color: "#F4731F", fontSize: "20px" }}>
                {findDistributorData()?.filteredDistributorName?.label ||
                  "Unknown Distributor"}
              </span>{" "}
              at{" "}
              <span style={{ color: "#F4731F", fontSize: "20px" }}>
                {findDistributorData()?.filteredDistributorEmail?.label ||
                  "No Email Provided"}
              </span>
            </span>
          </center>
        }
        onConfirm={handleConfirm}
        onCancel={handleCloseConfirmLicense}
        confirmText="Proceed"
        cancelText="Cancel"
        type="GenerateLicense"
        customClass="common-dialog-with-icon"
      />

      <CommonDialog
        open={openConfirmResendLicense}
        title="Are you sure you want to continue?"
        content={
          <center>
            <span
              style={{
                justifyContent: "center",
                color: "#616161",
                fontSize: "20px",
              }}
            >
              A license file will be sent to the distributor <br />
              <span style={{ color: "#F4731F", fontSize: "20px" }}>
                (
                {findDistributorData()?.filteredDistributorName?.label ||
                  "Unknown Distributor"}
                )
              </span>{" "}
              at{" "}
              <span style={{ color: "#F4731F", fontSize: "20px" }}>
                {findDistributorData()?.filteredDistributorEmail?.label ||
                  "No Email Provided"}
              </span>
            </span>
          </center>
        }
        onConfirm={() =>
          handleResendLicense(distributorForResendLisence?.id as string)
        }
        onCancel={handleCloseConfirmLicenseResend}
        confirmText="Proceed"
        cancelText="Cancel"
        type="GenerateLicense"
        customClass="common-dialog-with-icon"
      />
    </>
  );
};
export { ClientManagement };
