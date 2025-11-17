
import { Dispatch, SetStateAction } from "react";

export interface IAddGroup {
    groupName: string;
}

export interface IGroupData {
    monitoringId: string,
    groupId: string,
    groupName: string;
}

export interface IMonitoringGroup {
    groupId: string;
    groupName: string;
    groupItems: IGroupItem[];
}

export interface IGroupItem {
    groupItemId: string;
    name: string;
    url: string;
    location: string;
}

export interface GroupListProps {
    onSelectGroup: (group: IMonitoringGroup) => void;
    onDeleteGroup?: () => void;
    onSelectGroupItem: (item: IGroupItem) => void;
    fetchGroupAndItemData?: () => void;
    groupList: IMonitoringGroup[];
    setGroupList: Dispatch<SetStateAction<IMonitoringGroup[]>>;
    selectedItem?: IGroupItem;
    selectedGroup: IGroupData;
    onSelectGroupAndItem?: (groupId: string, groupItemId: string) => void;
    setShouldAutoSelect?: (value: boolean) => void;
    refreshData: () => void;
}

export interface MonitoringListProps {
    selectedGroup: IMonitoringGroup,
    refreshData: () => void;
    selectedItem: IGroupItem;
    setSelectedGroupId: (id: string) => void;
    setSelectedGroupItemId: (id: string) => void;
    onSelectGroupAndItem?: (groupId: string, groupItemId: string) => void;
    setShouldAutoSelect?: (value: boolean) => void;
}

export interface MonitoringGroupItemAddEditFormProps {
    onClose: () => void;
    groupItem?: IGroupItem | null | undefined;
    groupId: string;
    refreshData: () => void;
    onSelectGroupAndItem?: (groupId: string, groupItemId: string) => void;
    setShouldAutoSelect?: (value: boolean) => void;
}

export interface AddUpdateGroupItemPayload {
    monitoringId: string,
    groupId: string,
    groupItemId?: string,
    name: string,
    url: string,
    location: string,
}
