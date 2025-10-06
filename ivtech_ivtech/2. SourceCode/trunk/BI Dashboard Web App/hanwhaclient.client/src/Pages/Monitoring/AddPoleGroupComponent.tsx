import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { PoleGroupList, PoleMonitoring } from '../index'
import { IGroupItem, IMonitoringGroup } from '../../interfaces/IMonitoring';

import { Dispatch, SetStateAction } from "react";
import { useSearchParams } from 'react-router-dom';
import { HasPermission } from '../../utils/screenAccessUtils';
import { LABELS } from '../../utils/constants';

interface AddPoleGroupComponentProps {
    fetchGroupAndItemData: () => Promise<void>;
    groupList: IMonitoringGroup[];
    setGroupList: Dispatch<SetStateAction<IMonitoringGroup[]>>;
}

const AddPoleGroupComponent: React.FC<AddPoleGroupComponentProps> = ({
    fetchGroupAndItemData,
    groupList,
    setGroupList
}

) => {
    const [selectedGroup, setSelectedGroup] = useState<IMonitoringGroup | undefined>();
    const [searchParams] = useSearchParams();
    const monitoringId = searchParams.get("id");
    const [selectedItem, setSelectedItem] = useState<IGroupItem | null>();

    // useEffect(() => {
    //     setSelectedGroup(undefined);
    //     setSelectedItem(null);
    // }, [monitoringId]);

    useEffect(() => {
        if (groupList.length > 0) {
            const preservedItem = localStorage.getItem("MonitoringGroupItem");
            if (preservedItem) {
                const savedItem = JSON.parse(preservedItem) as IGroupItem;
                let foundGroup = groupList.find(group =>
                    group.groupItems.some(item => item.groupItemId === savedItem.groupItemId)
                );

                if (foundGroup) {
                    setSelectedGroup(foundGroup)
                    setSelectedItem(savedItem)
                }
                localStorage.removeItem("MonitoringGroupItem");
                return;
            }
            else {
                const firstGroup = groupList[0];
                setSelectedGroup(firstGroup);
                if (firstGroup.groupItems && firstGroup.groupItems.length > 0) {
                    setSelectedItem(firstGroup.groupItems[0]);
                } else {
                    setSelectedItem(null);
                }
            }
        } else {
            setSelectedGroup(undefined);
            setSelectedItem(null);
        }
    }, [groupList]);




    const handleGroupChange = (group: IMonitoringGroup) => {
        setSelectedGroup(group);
        if (group.groupItems && group.groupItems.length > 0) {
            setSelectedItem(group.groupItems[0]); // Auto-select first item
        } else {
            setSelectedItem(null); // Clear selection if no items
        }
    };
    const handleGroupItemchange = (item: IGroupItem) => {
        setSelectedItem(item);
    };


    return (
        HasPermission(LABELS.View_List_of_Monitoring_Groups) ?
            <Box className="floor-plans-zones">
                {/* Left Sidebar */}

                <div className="floor-plans-zones-left">

                    <PoleGroupList
                        onSelectGroup={handleGroupChange}
                        fetchGroupAndItemData={fetchGroupAndItemData}
                        groupList={groupList}
                        setGroupList={setGroupList}
                        onSelectGroupItem={handleGroupItemchange}
                        selectedItem={selectedItem}
                        selectedGroup={selectedGroup}
                    />
                </div>
                {/* Middle Section */}
                <div className="roles-permissions-tab roles-permissions-monitoring">
                    <PoleMonitoring
                        selectedGroup={selectedGroup !== undefined && selectedGroup}
                        refreshData={fetchGroupAndItemData}
                        selectedItem={selectedItem}
                    />
                </div>

            </Box>
            :
            <div>you do not have permission for view the monitoring group</div>

    )
}

export { AddPoleGroupComponent }