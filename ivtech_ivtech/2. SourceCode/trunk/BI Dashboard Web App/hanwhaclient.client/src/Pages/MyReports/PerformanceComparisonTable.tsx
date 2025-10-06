import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
} from '@mui/material';
import { PerformanceComparisonItem } from '../../interfaces/IReport';

const average = {
    peopleCount: 15200,
    peopleOccupancy: '80%',
    vehicleCount: 4100,
    vehicleOccupancy: '80%',
};

interface PerformanceComparisonTableProps {
    performanceReportDetails: PerformanceComparisonItem[],
    reportType:string;
    comperisionType?: string[] | undefined;
}

const PerformanceComparisonTable: React.FC<PerformanceComparisonTableProps> = ({ performanceReportDetails, reportType, comperisionType}) => {

    const averageData = performanceReportDetails.find((item: any) => item.siteZoneName === 'Average');
    // console.log(performanceReportDetails);
    // Determine which columns to show
    const showPeople = !comperisionType || comperisionType.length === 0 || comperisionType.includes('people');
    const showVehicle = !comperisionType || comperisionType.length === 0 || comperisionType.includes('vehicle');
    return (
        <>
            <Typography variant="h6">
                Performance Comparison Table
            </Typography>

            <TableContainer component={Paper} elevation={0} className="performance-comarison-table-wrapper">
                <Table className="performance-comarison-table" >
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableCell><b>{(reportType && reportType?.toLowerCase() == "site report") ? "Site" : "Zone"}</b></TableCell>
                            {showPeople && <TableCell><b>People Count</b></TableCell>}
                            {showPeople && <TableCell><b>People Occupancy</b></TableCell>}                            
                            {showVehicle && <TableCell><b>Vehicle Count</b></TableCell>}
                            {showVehicle && <TableCell><b>Vehicle Occupancy</b></TableCell>}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {performanceReportDetails.map((row, index) => {
                            const isLastRow = index === performanceReportDetails.length - 1;
                            return (
                                <TableRow key={index} sx={{ backgroundColor: isLastRow ? '#eaf2fd' : '' , color:"#212121"}}>
                                    <TableCell><b>{row.siteZoneName}</b></TableCell>
                                    {showPeople && (<TableCell sx={{ color: row.peopleCount < (averageData?.peopleCount || 0) ? 'red !important' : 'green !important' }}>
                                        {row.peopleCount.toLocaleString()}
                                    </TableCell>)}
                                    {showPeople && (<TableCell>{row.peopleUtilization?.toLocaleString('en-US', {minimumFractionDigits: 2,maximumFractionDigits: 2}) ?? ''} ({row.peopleOccupancy?.toLocaleString('en-US', {minimumFractionDigits: 2,maximumFractionDigits: 2}) ?? '0'}%)</TableCell>)}
                                    {showVehicle && (<TableCell sx={{ color: row.vehicleCount < (averageData?.vehicleCount || 0) ? 'red !important' : 'green !important' }}>
                                        {row.vehicleCount.toLocaleString()}
                                    </TableCell>)}
                                    {showVehicle && (<TableCell>{row.vehicleUtilization?.toLocaleString('en-US', {minimumFractionDigits: 2,maximumFractionDigits: 2}) ?? ''} ({row.vehicleOccupancy?.toLocaleString('en-US', {minimumFractionDigits: 2,maximumFractionDigits: 2}) ?? '0'}%)</TableCell>)}
                                </TableRow>
                            )
                        })}

                    </TableBody>
                </Table>
            </TableContainer>


        </>
    );
};

export { PerformanceComparisonTable };
