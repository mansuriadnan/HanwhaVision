import { useMemo, useState } from "react";
import { IReport } from "../../interfaces/IReport";
import { Box, Button, List, ListItem, TextField, Typography } from "@mui/material";
import { Search, AccessTime as AccessTimeIcon } from "@mui/icons-material";
import React from "react";
import { HasPermission } from "../../utils/screenAccessUtils";
import { LABELS } from "../../utils/constants";

interface ReportListProps {
    reports: IReport[]; // Replace 'any' with your report type if available
    selectedId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, selectedId, onSelect, onAdd }) => {
    const [searchTerm, setSearchTerm] = useState("");



    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const modified = new Date(timestamp);
        const diffMs = now.getTime() - modified.getTime();

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    const filteredReports = useMemo(
        () =>
            reports.filter((report) =>
                (report.siteReport?.reportName && report.siteReport?.reportName.toLowerCase().includes(searchTerm.toLowerCase()) || (report.zoneReport?.reportName && report.zoneReport?.reportName.toLowerCase().includes(searchTerm.toLowerCase())))
            ),
        [reports, searchTerm]
    );
    return (
        <>
            <Box className="floor-plans-zones-left report-main-left">
                {HasPermission(LABELS.CanAddOrUpdateReport) && (
                    <Button
                        variant="contained"
                        className="common-btn-design-rounded"
                        onClick={onAdd}
                    >
                        + Add Report
                    </Button>
                )}

                <div className="search-plans-and-jones search-plans-and-jones-report">
                    {/* <TextField
                        placeholder="Search Report"
                        fullWidth
                        onChange={handleSearch}
                        variant="outlined"
                        value={searchTerm}
                        slotProps={{
                            input: {
                                endAdornment: <Search />,
                            },
                        }}
                        sx={{
                            backgroundColor: "white",
                            "& fieldset": { border: "none" },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "50px",
                                backgroundColor: "white",
                                paddingRight: "8px",
                                border: "1px solid #ddd",
                            },
                            "& .MuiOutlinedInput-input": {
                                padding: "10px 20px",
                            },
                        }}
                    /> */}

                    <List sx={{
                        maxHeight: 700,
                        overflowY: "auto",
                        overflowX: "hidden",
                        pr: 1,
                    }}>
                        {filteredReports?.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: "center",
                                    color: "gray",
                                    padding: "10px",
                                    fontSize: "16px",
                                }}
                            >
                                No Report Found
                            </Box>
                        ) : (
                            filteredReports?.map((item: any) => {
                                const reportName =
                                    item.siteReport?.reportName ||
                                    item.zoneReport?.reportName ||
                                    "Untitled Report";
                                const timeAgo = getTimeAgo(item.updatedOn);
                                return (
                                    <React.Fragment key={item.id}>
                                        {(
                                            <ListItem
                                                key={item.id}
                                                // sx={{
                                                //     // bgcolor: selectedId === item.id
                                                //     //     ? `orange`
                                                //     //     : `#fff`,
                                                //     // color:
                                                //     //     selectedId === item.id ? "#ffffff" : "#090909",
                                                //     display: "block !important",
                                                //     mb: 1,
                                                // }}
                                                className={ selectedId === item.id ? "active-report" : ""}
                                                onClick={() => onSelect(item.id)}
                                            >
                                                {reportName}
                                                <Typography
                                                    sx={{
                                                        color:
                                                            selectedId === item.id ? "#ffffff" : "#090909",
                                                        display: "block !important",
                                                        mb: 1,
                                                    }}>
                                                    Last edited {timeAgo}
                                                </Typography>


                                            </ListItem>
                                        )}
                                    </React.Fragment>
                                )
                            }
                            ))}
                    </List>

                </div>
            </Box>




        </>
    );
}
export { ReportList }