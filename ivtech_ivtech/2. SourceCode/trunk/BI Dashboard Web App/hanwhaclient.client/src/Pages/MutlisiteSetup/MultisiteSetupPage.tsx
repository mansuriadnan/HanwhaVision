import { Box, Container, Drawer, FormControl, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { HasPermission } from '../../utils/screenAccessUtils'
import { CustomButton } from '../../components/Reusable/CustomButton'
import { CommonDialog } from '../../components/Reusable/CommonDialog'
import { LABELS } from '../../utils/constants'
import { useEffect, useState } from 'react'
import { ChildSiteAddEditForm, SubChildSiteAddEditForm } from "../index"
import { ChildSite, IDeleteSite, IDeleteSubSite, ISite } from '../../interfaces/IMultiSite'
import { DeleteChildSiteService, DeleteSubChildSiteService, GetAllSiteService } from '../../services/siteManagementService'
import { Space, Switch, Table as AntDTable, ConfigProvider, Button as AntdButton } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import './MultisiteSetupPage.css';
import { IReferenceDatatype } from '../../interfaces/IManageUsers'
import { GridCloseIcon } from "@mui/x-data-grid";
import { formatDateToConfiguredTimezone } from '../../utils/formatDateToConfiguredTimezone'
import { formatDate } from '../../utils/dateUtils'
import { useThemeContext } from '../../context/ThemeContext'


const MultisiteSetupPage = () => {
  const [siteList, setSiteList] = useState<ISite[]>([]);
  const [referenceData, setReferenceData] = useState<IReferenceDatatype>();
  const [openAddSite, setOpenAddSite] = useState<boolean>(false);
  const [openEditSite, setOpenEditSite] = useState<boolean>(false);
  const [openEditSubSite, setOpenEditSubSite] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedChildSite, setSelectedChildSite] = useState<ISite | undefined>(undefined);
  const [selectedSubChildSite, setSelectedSubChildSite] = useState<ChildSite | undefined>(undefined);

  const [openAddSubChildSite, setOpenAddSubChildSite] = useState<boolean>(false);
  const [siteToBeDelete, setSiteToBeDelete] = useState<IDeleteSite | null>(null);
  const [openSiteDeleteConfirm, setOpenSiteDeleteConfirm] = useState(false);

  const [subSiteToBeDelete, setSubSiteToBeDelete] = useState<IDeleteSubSite | null>(null);
  const [openSubSiteDeleteConfirm, setOpenSubSiteDeleteConfirm] = useState(false);
  const { theme } = useThemeContext();


  useEffect(() => {
    fetchInitialData();
  }, [])


  const fetchInitialData = async () => {
    try {
      const siteData: any = await GetAllSiteService();
      setSiteList(siteData.data as ISite[]);
      setReferenceData(siteData.referenceData);

    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };


  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  // Filter sites based on search term
  const filteredSites = searchTerm?.length >= 3 ? siteList.filter(site =>
    site.siteName.toLowerCase().includes(searchTerm) ||
    site.hostingAddress.toLowerCase().includes(searchTerm) ||
    site.username.toLowerCase().includes(searchTerm) ||
    (site.childSites && site.childSites.some(child =>
      child.siteName.toLowerCase().includes(searchTerm) ||
      child.hostingAddress.toLowerCase().includes(searchTerm) ||
      child.username.toLowerCase().includes(searchTerm)
    ))
  ) : siteList;

  // Start functions for Child Site------------
  const handleAddSite = () => {
    setOpenAddSite(true);
    setSelectedChildSite(undefined);
  }


  const handleEditChildSite = (childSite: ISite) => {
    setSelectedChildSite(childSite);
    setOpenEditSite(true)
  }

  const handleCloseAddSiteDrawer = () => {
    setOpenAddSite(false);
    setSelectedChildSite(undefined);
  }

  const handleCloseEditSiteDrawer = () => {
    setSelectedChildSite(undefined)
    setOpenEditSite(false);
  }

  const handleDeleteChildSite = (childSiteID: string, hasChildrens: boolean) => {
    setSiteToBeDelete({ childID: childSiteID, hasChildrens });
    setOpenSiteDeleteConfirm(true);
  }

  const handleSiteCloseConfirm = () => {
    setOpenSiteDeleteConfirm(false);
  };

  const finalDeleteSite = async (childID: string) => {
    try {
      const deleteData = await DeleteChildSiteService(childID);
      if (deleteData.isSuccess) {
        setOpenSiteDeleteConfirm(false);
        fetchInitialData();
      }
    } catch (err: any) { }
  };

  // End functions for Child Site------------

  // Start functions for SUB Child Site------------

  const handleAddChildSubSite = (childSite: ISite) => {
    setSelectedChildSite(childSite);
    setSelectedSubChildSite(undefined);
    setOpenAddSubChildSite(true);
  }
  const handleEditSubChildSite = (childSubSite: ISite) => {
    const parentSite = siteList.find(site =>
      site.childSites?.some(child => child.id === childSubSite.id)
    );

    setSelectedChildSite(parentSite);
    setSelectedSubChildSite(childSubSite);
    setOpenEditSubSite(true);
  }

  const CloseAddSubChildSiteDrawer = () => {
    setOpenAddSubChildSite(false);
    setSelectedChildSite(undefined);
    setSelectedSubChildSite(undefined)
  }

  const CloseEditSubSiteDrawer = () => {
    setOpenEditSubSite(false);
    setSelectedChildSite(undefined)
    setSelectedSubChildSite(undefined);

  }

  const handleDeleteSubChildSite = (subChildSiteID: string) => {
    const parentSite = siteList.find(site =>
      site.childSites?.some(child => child.id === subChildSiteID)
    );

    if (parentSite !== undefined) {
      setSubSiteToBeDelete({
        subChildID: subChildSiteID,
        childID: parentSite?.id as string
      });
      setOpenSubSiteDeleteConfirm(true);
    } else {
      console.error("Parent site not found for sub-child site ID:", subChildSiteID);
      return;
    }
  }

  const handleSubSiteCloseConfirm = () => {
    setOpenSubSiteDeleteConfirm(false);
  };

  const finalDeleteSubSite = async (ObjDeleteSubSite: IDeleteSubSite) => {
    try {
      const deleteData = await DeleteSubChildSiteService(ObjDeleteSubSite.childID, ObjDeleteSubSite.subChildID);
      if (deleteData.isSuccess) {
        setOpenSubSiteDeleteConfirm(false);
        fetchInitialData();
      }
    } catch (err: any) { }
  };

  // End functions for SUB Child Site------------

  const columns: TableColumnsType<ISite> = [
    { title: 'Site Name', dataIndex: 'siteName', key: 'siteName' },
    { title: 'hosting Address', dataIndex: 'hostingAddress', key: 'hostingAddress' },
    { title: 'User Name', dataIndex: 'username', key: 'username' },
    {
      title: 'Created By', dataIndex: 'createdBy', key: 'createdBy',
      render: (_, record) => {
        const createdByID = record.createdBy as string;
        const filteredData = referenceData?.createdBy?.find(
          (item) => item.value === createdByID
        );
        return <Space>{filteredData && <label>{filteredData.label}</label>}</Space>;
      },
    },
    {
      title: 'Created On', dataIndex: 'createdOn', key: 'createdOn',
      render: (_, record) => {
        const createdOnStr = record.createdOn as string;
        const convertedDateTime = formatDateToConfiguredTimezone(createdOnStr);
        return <Space>{formatDate(convertedDateTime)}</Space>;
      },
    },
    {
      title: 'Last Updated By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      render: (_, record) => {
        const updatedByID = record.updatedBy as string;
        const filteredData = referenceData?.updatedBy?.find(
          (item) => item.value === updatedByID
        );
        return <Space>{filteredData && <label>{filteredData.label}</label>}</Space>;
      },

    },
    {
      title: 'Last Updated On', dataIndex: 'updatedOn', key: 'updatedOn',
      render: (_, record) => {
        const updatedOnStr = record.updatedOn as string;
        const convertedDateTime = formatDateToConfiguredTimezone(updatedOnStr);
        return <Space>{formatDate(convertedDateTime)}</Space>;
      },
    },
    {
      title: "Actions",
      key: "Actions",
      render: (_, record) => {
        return (
          <Space>
            {record.isParent && HasPermission(LABELS.Add_Update_Child_SubChild_Sites) && (

              <AntdButton
                type="link"
                icon={<img
                  src={"/images/add_site.svg"}
                  alt="Child Sub Site Action Add Icon"
                  width={20}
                  height={20} />}
                onClick={() => handleAddChildSubSite(record)}
              />
            )}

            {
              (HasPermission(LABELS.Add_Update_Child_SubChild_Sites))
              && (
                <AntdButton
                  type="link"
                  icon={<img
                    src={"/images/user-action-edit.svg"}
                    alt="Site Action Edit Icon"
                    width={20}
                    height={20} />}
                  onClick={() => record.isParent ? handleEditChildSite(record) : handleEditSubChildSite(record)}
                />
              )}

            {
              ( HasPermission(LABELS.Delete_Existing_Child_SubChild_Site))
              &&
              (
                <AntdButton
                  type="link"
                  icon={<img
                    src={"/images/user-action-delete.svg"}
                    alt="Site Action Delete Icon"
                    width={20}
                    height={20} />}
                  onClick={() =>
                    record.isParent ?
                      handleDeleteChildSite(record.id as string, !!record.children && record.children.length > 0)
                      :
                      handleDeleteSubChildSite(record.id as string)}

                />
              )}

          </Space>
        )
      },
    },
  ];



  const transformData = (sites: ISite[]): ISite[] => {
    return sites.map((site) => ({
      ...site,
      key: site.id, // Ensure unique key
      children: site.childSites && site.childSites.length > 0
        ? site.childSites.map(child => ({
          ...child,
          key: child.id, // Ensure unique key for child sites
        }))
        : undefined,
    }));
  };

  const backgroundStyle = {
    backgroundImage: ` url('/images/lines.png'), linear-gradient(287.68deg, #FE6500 -0.05%, #FF8A00 57.77%)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
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
      <Container sx={{}} maxWidth={false}>
        <div className="top-orange-head" style={backgroundStyle} >
          <Box className="top-orange-head-left">
            <Typography variant="h4">
              Multisite Setup
            </Typography>
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: 14,
                color: "#FFFFFF",
                marginTop: 0.5,
              }}
            >
              Configure your associated child and sub-child sites here..
            </Typography>
          </Box>
          {HasPermission(LABELS.Add_Update_Child_SubChild_Sites) && (
            <CustomButton
              size="small"
              variant="outlined"
              customStyles={{
                background: "#FFFFFF",
                color: "#090909",
                borderRadius: 8,
              }}
              onClick={handleAddSite}
            >
              <img src={"/images/adddevice.svg"} alt="Add Site" /> Add Child Site
            </CustomButton>
          )}
        </div>



        <Box className="top-list-bar">
          <h5>List Of Child & Sub-Child Sites</h5>
          <div className="top-listing-items">
            <FormControl sx={{ minWidth: 450 }} size="small">
              <TextField
                variant="outlined"
                placeholder="Search by site name, hosting address, username"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  style: {
                    borderRadius: "20px",
                  },
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
            </FormControl>
          </div>
        </Box>

        {/* <ConfigProvider theme={{ token: { colorPrimary: "#1890ff" } }}> */}

        <div className="antd-container">
          <AntDTable<ISite>
            columns={columns}
            // rowSelection={{ ...rowSelection }}
            dataSource={transformData(filteredSites)}
            pagination={false}
            expandable={{ defaultExpandAllRows: true }}
            className='ant-table'
            locale={{
              emptyText: <CustomNoRowsOverlay />,
            }}
            rowClassName={(record) => {
              return record.isParent ? '' : 'sub-child-row';
            }}
          />
        </div>
        {/* </ConfigProvider> */}

        {/* Add Drawer for Add Site */}
        <Drawer
          anchor={"right"}
          open={openAddSite}
          onClose={() => {
            handleCloseAddSiteDrawer();
          }}
          PaperProps={{
            sx: {
              borderRadius: "20px 0 0 20px",
            },
          }}
          ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                handleCloseAddSiteDrawer();
              }
            }
          }}
          className="cmn-pop"
        >
          <Box className="cmn-pop-head"
          >
            <Typography variant="h6">Add Child Site</Typography>
            <IconButton onClick={handleCloseAddSiteDrawer}>
              <GridCloseIcon />
            </IconButton>
          </Box>
          <ChildSiteAddEditForm
            onClose={handleCloseAddSiteDrawer}
            refreshData={fetchInitialData}
          />
        </Drawer>

        {/* Edit Drawer for Add Site */}
        <Drawer
          anchor={"right"}
          open={openEditSite}
          onClose={() => {
            handleCloseEditSiteDrawer();
          }}
          PaperProps={{
            sx: {
              borderRadius: "20px 0 0 20px",
            },
          }}
          ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                handleCloseEditSiteDrawer();
              }
            }
          }}
          className="cmn-pop"
        >
          <Box className="cmn-pop-head">
            <Typography variant="h6">Edit Child Site</Typography>
            <IconButton onClick={handleCloseEditSiteDrawer}>
              <GridCloseIcon />
            </IconButton>
          </Box>
          <ChildSiteAddEditForm
            sites={selectedChildSite}
            onClose={handleCloseEditSiteDrawer}
            refreshData={fetchInitialData}
          />
        </Drawer>

        {/* Add Drawer for Add Sub Site */}
        <Drawer
          anchor={"right"}
          open={openAddSubChildSite}
          onClose={() => {
            CloseAddSubChildSiteDrawer();
          }}
          PaperProps={{
            sx: {
              borderRadius: "20px 0 0 20px",
            },
          }}
          ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                 CloseAddSubChildSiteDrawer();
              }
            }
          }}
          className="cmn-pop"
        >
          <Box className="cmn-pop-head">
            <Typography variant="h6">Add Sub Child Site</Typography>
            <IconButton onClick={CloseAddSubChildSiteDrawer}>
              <GridCloseIcon />
            </IconButton>
          </Box>
          <SubChildSiteAddEditForm
            sites={selectedChildSite}
            onClose={CloseAddSubChildSiteDrawer}
            refreshData={fetchInitialData}
          />
        </Drawer>


        {/* Edit Drawer for Add Sub Site */}
        <Drawer
          anchor={"right"}
          open={openEditSubSite}
          onClose={() => {
            CloseEditSubSiteDrawer();
          }}
          PaperProps={{
            sx: {
              borderRadius: "20px 0 0 20px",
            },
          }}
          ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                CloseEditSubSiteDrawer();
              }
            }
          }}
          className="cmn-pop"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding={2}
            borderBottom="1px solid #ddd"
          >
            <Typography variant="h6">Edit Sub Child Site</Typography>
            <IconButton onClick={CloseEditSubSiteDrawer}>
              <img src={"/images/close.svg"} alt="close" />
            </IconButton>
          </Box>
          <SubChildSiteAddEditForm
            sites={selectedChildSite}
            subSites={selectedSubChildSite}
            onClose={CloseEditSubSiteDrawer}
            refreshData={fetchInitialData}
          />
        </Drawer>

        <CommonDialog
          open={openSiteDeleteConfirm}
          customClass="cmn-confirm-delete-icon"
          title="Delete Confirmation!"
          content={
            siteToBeDelete?.hasChildrens ?
              <p>You're about to delete a child site, which will also remove all its sub-child sites.<br />
                Are you sure you want to proceed?</p>
              :
              <p>Are you sure you want to delete this Site?</p>
          }
          onConfirm={() => siteToBeDelete && finalDeleteSite(siteToBeDelete.childID)}
          onCancel={handleSiteCloseConfirm}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
          titleClass={true}
        />


        <CommonDialog
          open={openSubSiteDeleteConfirm}
          customClass="cmn-confirm-delete-icon"
          title="Delete Confirmation!"
          content="Are you sure you want to delete this Site?"
          onConfirm={() => subSiteToBeDelete && finalDeleteSubSite(subSiteToBeDelete)}
          onCancel={handleSubSiteCloseConfirm}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
          titleClass={true}
        />

      </Container >


    </>
  )
}

export default MultisiteSetupPage;