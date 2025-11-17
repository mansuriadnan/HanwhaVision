import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CommonDialog } from "../../components/Reusable/CommonDialog";
import { CustomTextFieldWithButton } from "../../components/Reusable/CustomTextFieldWithButton";
import { useForm } from "react-hook-form";
import {
  GroupListProps,
  IAddGroup,
  IGroupData,
  IGroupItem,
  IMonitoringGroup,
} from "../../interfaces/IMonitoring";
import { useSearchParams } from "react-router-dom";
import {
  AddMonitoringGroupService,
  DeleteGroupService,
  DeleteItemService,
  GetGroupAndItemDataService,
} from "../../services/monitoringService";
import { COMMON_CONSTANTS, LABELS } from "../../utils/constants";
import { ExpandLess, ExpandMore, MoreVert } from "@mui/icons-material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { MonitoringGroupItemAddEditForm } from "../index";
import { HasPermission } from "../../utils/screenAccessUtils";

const PoleGroupList: React.FC<GroupListProps> = ({
  onSelectGroup,
  onSelectGroupItem,
  onDeleteGroup,
  fetchGroupAndItemData,
  groupList,
  setGroupList,
  selectedItem,
  selectedGroup
}) => {
  const [searchParams] = useSearchParams();
  const monitoringId = searchParams.get("id");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedItemId, setselectedItemId] = useState("");
  const [groupToBeDelete, setGroupToBeDelete] = useState("");
  const [itemToBeEdit, setItemToBeEdit] = useState<IGroupItem>();
  const [openGroupDeleteConfirm, setOpenGroupDeleteConfirm] = useState(false);
  const [openItemDeleteConfirm, setOpenItemDeleteConfirm] = useState(false);
  const [openEditItem, setOpenEditItem] = useState<boolean>(false);
  const [itemToBeDelete, setItemToBeDelete] = useState("");

  const [menuAnchor, setMenuAnchor] = useState<{
    anchorEl: HTMLElement | null;
    group: any | null;
  }>({
    anchorEl: null,
    group: null,
  });

  const [itemMenuAnchor, setItemMenuAnchor] = useState<{
    anchorEl: HTMLElement | null;
    item: any | null;
  }>({
    anchorEl: null,
    item: null,
  });

  const [groupEditItem, setGroupEditItem] = useState<
    IMonitoringGroup | undefined
  >();

  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
  } = useForm<IAddGroup>({
    defaultValues: {
      groupName: "",
    },
  }); // for Add group

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    reset: resetEditForm,
  } = useForm<IAddGroup>({
    defaultValues: {
      groupName: "",
    },
  }); // for Edit group

  const open = Boolean(menuAnchor.anchorEl);

  useEffect(() => {
    if (selectedGroup?.groupId) {
      setSelectedGroupId(selectedGroup.groupId);
        setExpandedGroup(selectedGroup.groupId);
    }

    if (selectedItem?.groupItemId) {
      setselectedItemId(selectedItem.groupItemId);
    }
  }, [selectedGroup, selectedItem]);


  const handleToggle = (groupId: string) => {
    setExpandedGroup((prev) => (prev === groupId ? null : groupId));
  };

  const handleClose = () => {
    setMenuAnchor({ anchorEl: null, group: null });
  };

  const AddGroup = async (data: IAddGroup) => {
    try {
      const newGroup: IGroupData = {
        groupId: "",
        groupName: data.groupName,
        monitoringId: monitoringId,
      };

      var result: any = await AddMonitoringGroupService(newGroup as IGroupData);
      if (result && result.isSuccess) {
        fetchGroupAndItemData && fetchGroupAndItemData();
        resetAddForm();
        // setFloorEditItem(undefined);
      }
      // console.log("result", result);
    } catch (error) {
      console.error("Submission Error:", error);
    }
  };

  const EditGroup = async (data: IAddGroup) => {
    try {
      if (!groupEditItem) return;

      const updatedGroup: IGroupData = {
        ...groupEditItem,
        groupName: data.groupName,
        monitoringId: monitoringId as string,
      };
      const result: any = await AddMonitoringGroupService(
        updatedGroup as IGroupData
      );
      if (result && result.isSuccess) {
        fetchGroupAndItemData && fetchGroupAndItemData();
        resetEditForm();
        setGroupEditItem(undefined);
      }
    } catch (error) {
      console.error("Edit Error:", error);
    }
  };

  const DeleteGroup = async (groupId: string) => {
    try {
      const deleteData = await DeleteGroupService(groupId, monitoringId);

      if (deleteData?.isSuccess) {
        setOpenGroupDeleteConfirm(false);
        fetchGroupAndItemData && fetchGroupAndItemData();
        handleClose();
        onDeleteGroup && onDeleteGroup();

        const updatedList = await GetGroupAndItemDataService(monitoringId as string) as IMonitoringGroup[];
        if (updatedList && updatedList.length > 0) {
          setGroupList(updatedList as IMonitoringGroup[]); // Update local state
          onSelectGroup && onSelectGroup(updatedList[0] as IMonitoringGroup); // Select first group
        } else {
          setGroupList([]);
          onSelectGroup && onSelectGroup(undefined as any); // Clear selection if no group left
        }
      }

    } catch (err: any) {
      console.error("Error deleting role:", err);
    }
  };

  const DeleteItem = async (itemId: string, groupId: string) => {
    try {
      const deleteData = await DeleteItemService(itemId, groupId, monitoringId);

      if (deleteData?.isSuccess) {
        setOpenItemDeleteConfirm(false);
        fetchGroupAndItemData && fetchGroupAndItemData();
        handleClose();
        onDeleteGroup && onDeleteGroup();
      }
    } catch (err: any) {
      console.error("Error deleting role:", err);
    }
  };

  const handleItemMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    item: any,
    groupId: string
  ) => {
    e.stopPropagation(); // Prevent item selection
    setItemMenuAnchor({ anchorEl: e.currentTarget, item });
    setSelectedGroupId(groupId);
  };

  const handleItemMenuClose = () => {
    setItemMenuAnchor({ anchorEl: null, item: null });
  };

  const handleCloseEditDrawer = () => {
    setOpenEditItem(false);
  };

  return (
    <>
      <div className="search-plans-and-jones monitoring-plan">
        <List className="list-plans-and-jones">
          {groupList &&
            groupList?.map((group) => (
              <li key={group.groupId} className={selectedGroupId === group.groupId ? "active" : ""}>
                {groupEditItem?.groupId === group.groupId ? (
                  <Box
                    component="form"
                    onSubmit={handleEditSubmit(EditGroup)}
                    key={group.groupId}
                    className="monitoring-accordion"
                  >
                    <CustomTextFieldWithButton
                      ShowAddButton={false}
                      name="groupName"
                      control={editControl}
                      rules={{
                        required: "Group name is required",
                        maxLength: {
                          value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                          message: "Group name cannot exceed 50 characters",
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <div
                    key={group.groupId}
                    className="monitoring-accordion"
                    onClick={() => {
                      if (selectedGroupId !== group.groupId) {
                        setSelectedGroupId(group.groupId);
                        onSelectGroup && onSelectGroup(group);
                        setselectedItemId("");
                      }
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 400 }}
                      color={
                        selectedGroupId === group.groupId ? "white" : "#223311"
                      }
                    >
                      {group.groupName}
                    </Typography>

                    <Box>
                      {(HasPermission(LABELS.CanAddOrUpdateGroup) ||
                        HasPermission(LABELS.CanDeleteMonitoringGroup)) && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAnchor({ anchorEl: e.currentTarget, group });
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(group.groupId);
                        }}
                      >
                        {expandedGroup === group.groupId ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                    </Box>
                  </div>
                )}

                {/* Group Items (expandable) */}
                <Collapse
                  in={expandedGroup === group.groupId}
                  timeout="auto"
                  unmountOnExit
                  className="monitoring-collapse"
                >
                  {group.groupItems?.map((item, index) => (
                    <div
                      key={index}
                      // className="collapse-inner"
                      className={`collapse-inner${selectedItemId === item.groupItemId ? " active" : ""}`}
                      onClick={() => {
                        if (selectedItemId !== item.groupItemId) {
                          setselectedItemId(item.groupItemId);
                          setSelectedGroupId(group.groupId);
                          onSelectGroup && onSelectGroup(group);
                          onSelectGroupItem && onSelectGroupItem(item);
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography fontWeight={600}>{item.name}</Typography>
                        {(HasPermission(LABELS.CanAddOrUpdateGroupItem) ||
                          HasPermission(
                            LABELS.CanDeleteMonitoringGroupItem
                          )) && (
                            <IconButton
                              size="small"
                              sx={{ color: "black" }}
                              onClick={(e) =>
                                handleItemMenuOpen(e, item, group.groupId)
                              }
                            >
                              <MoreVert />
                            </IconButton>
                          )}
                      </Box>
                      <Tooltip title={item.url}>
                        <Typography>{item.url}</Typography>
                      </Tooltip>
                    </div>
                  ))}
                </Collapse>

                {menuAnchor?.group?.groupId === group.groupId && (
                  <Menu
                    // anchorEl={anchorEl}
                    anchorEl={menuAnchor.anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        borderRadius: 2,
                        pl: 1,
                        pr: 1,
                      },
                    }}
                    className="edit-delete-pop"
                  >
                    {HasPermission(LABELS.CanAddOrUpdateGroup) && (
                      <MenuItem
                        onClick={() => {
                          setGroupEditItem(group);
                          setEditValue("groupName", group.groupName);
                          handleClose();
                        }}
                      >
                        <IconButton>
                          <img
                            src={"/images/edit.svg"}
                            alt="edit"
                            width={20}
                            height={20}
                          />
                        </IconButton>

                        <ListItemText primary="Edit" />
                      </MenuItem>
                    )}
                    {HasPermission(LABELS.CanDeleteMonitoringGroup) && (
                      <MenuItem
                        onClick={() => {
                          setGroupToBeDelete(group.groupId);
                          setOpenGroupDeleteConfirm(true);
                        }}
                      >
                        <IconButton>
                          <img
                            src={"/images/delete_gray.svg"}
                            alt="delete"
                            width={20}
                            height={20}
                          />
                        </IconButton>

                        <ListItemText primary="Delete" />
                      </MenuItem>
                    )}
                  </Menu>
                )}

                {itemMenuAnchor?.item && (
                  <Menu
                    anchorEl={itemMenuAnchor.anchorEl}
                    open={Boolean(itemMenuAnchor.anchorEl)}
                    onClose={handleItemMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        borderRadius: 2,
                        pl: 1,
                        pr: 1,
                      },
                    }}
                    className="edit-delete-pop"
                  >
                    {HasPermission(LABELS.CanAddOrUpdateGroupItem) && (
                      <MenuItem
                        onClick={() => {
                          setItemToBeEdit(itemMenuAnchor.item);
                          setOpenEditItem(true);
                          handleItemMenuClose();
                        }}
                      >
                        <IconButton>
                          <img
                            src="/images/edit.svg"
                            alt="edit"
                            width={20}
                            height={20}
                          />
                        </IconButton>

                        <ListItemText primary="Edit" />
                      </MenuItem>
                    )}
                    {HasPermission(LABELS.CanDeleteMonitoringGroupItem) && (
                      <MenuItem
                        onClick={() => {
                          setItemToBeDelete(itemMenuAnchor.item.groupItemId);
                          setOpenItemDeleteConfirm(true);
                          handleItemMenuClose();
                        }}
                      >
                        <IconButton>
                          <img
                            src="/images/delete_gray.svg"
                            alt="delete"
                            width={20}
                            height={20}
                          />
                        </IconButton>

                        <ListItemText primary="Delete" />
                      </MenuItem>
                    )}
                  </Menu>
                )}
              </li>
            ))}
        </List>
      </div>

      {HasPermission(LABELS.CanAddOrUpdateGroup) && (
        <Box
          component="form"
          onSubmit={handleAddSubmit(AddGroup)}
          sx={{ marginTop: 2 }}
        >
          <CustomTextFieldWithButton
            name="groupName"
            control={addControl}
            rules={{
              required: "Group Name is required",
              maxLength: {
                value: COMMON_CONSTANTS.MAX_TEXT_FIELD_LENGTH,
                message: "Group name cannot exceed 50 characters",
              },
            }}
            placeholder="Enter group name"
          />
        </Box>
      )}

      <CommonDialog
        open={openGroupDeleteConfirm}
        customClass="cmn-confirm-delete-icon"
        title="Delete Confirmation!"
        content="Are you sure you want to continue?"
        onConfirm={() => groupToBeDelete && DeleteGroup(groupToBeDelete)}
        onCancel={() => setOpenGroupDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        titleClass={true}
      />

      <CommonDialog
        open={openItemDeleteConfirm}
        customClass="cmn-confirm-delete-icon"
        title="Delete Confirmation!"
        content="Are you sure you want to continue?"
        onConfirm={() =>
          itemToBeDelete && DeleteItem(itemToBeDelete, selectedGroupId)
        }
        onCancel={() => setOpenItemDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        titleClass={true}
      />

      <Drawer
        anchor={"right"}
        open={openEditItem}
        onClose={() => {
          // handleCloseAddDrawer();
        }}
        className="cmn-pop"
         ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                 setOpenEditItem(false);
              }
            }
          }}
      >
        <Box className="cmn-pop-head">
          <Typography variant="h6">Edit URL Preview</Typography>
          <IconButton onClick={handleCloseEditDrawer}>
            <GridCloseIcon />
          </IconButton>
        </Box>
        <MonitoringGroupItemAddEditForm
          onClose={handleCloseEditDrawer}
          groupId={selectedGroupId}
          groupItem={itemToBeEdit && itemToBeEdit}
          refreshData={fetchGroupAndItemData}
        />
      </Drawer>
    </>
  );
};

export { PoleGroupList };
