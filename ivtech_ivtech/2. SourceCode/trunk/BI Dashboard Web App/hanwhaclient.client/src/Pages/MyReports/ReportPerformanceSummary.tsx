import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { PerformanceComparisonItem } from '../../interfaces/IReport';

interface PerformanceComparisonTableProps {
    performanceReportDetails: PerformanceComparisonItem[],
    comperisionType?: string[] | undefined;
}

const ReportPerformanceSummary:  React.FC<PerformanceComparisonTableProps> = ({performanceReportDetails, comperisionType}) =>{
   

    // const generateSummaryInsights = (data: any[]) => {
    //     if (!data || data.length === 0) return ["No data available to generate insights."];

    //     // Filter out "Average" row and rows with zero values for comparisons
    //     const filteredData = data.filter(site =>
    //         (site?.siteZoneName && site?.siteZoneName?.toLowerCase() !== "average") &&
    //         site?.vehicleOccupancy > 0 &&
    //         site?.peopleOccupancy > 0 &&
    //         site?.vehicleCount > 0 &&
    //         site?.peopleCount > 0
    //     );

    //     if (filteredData.length === 0) return ["No valid data available to generate insights."];

    //     const insights: string[] = [];

    //     const maxVehicleOccupancySite = filteredData.reduce((max, site) =>
    //         site.vehicleOccupancy > max.vehicleOccupancy ? site : max
    //     );

    //     const maxPeopleOccupancySite = filteredData.reduce((max, site) =>
    //         site.peopleOccupancy > max.peopleOccupancy ? site : max
    //     );

    //     const maxVehicleCountSite = filteredData.reduce((max, site) =>
    //         site.vehicleCount > max.vehicleCount ? site : max
    //     );

    //     const maxPeopleCountSite = filteredData.reduce((max, site) =>
    //         site.peopleCount > max.peopleCount ? site : max
    //     );

    //     // Insight 1 – Highest occupancy rate and vehicle count
    //     if (
    //         maxVehicleOccupancySite.siteZoneName === maxPeopleOccupancySite.siteZoneName &&
    //         maxVehicleOccupancySite.vehicleOccupancy === maxPeopleOccupancySite.peopleOccupancy
    //     ) {
    //         insights.push(
    //             `${maxPeopleOccupancySite.siteZoneName} has the highest people occupancy rate (${maxPeopleOccupancySite.peopleOccupancy.toFixed(2)}%) and vehicle occupancy rate.`
    //         );
    //     } else if (
    //         maxVehicleOccupancySite.siteZoneName === maxPeopleOccupancySite.siteZoneName
    //     ) {
    //         insights.push(
    //             `${maxPeopleOccupancySite.siteZoneName} has the highest people occupancy rate (${maxPeopleOccupancySite.peopleOccupancy.toFixed(2)}%) and vehicle occupancy rate (${maxVehicleOccupancySite.vehicleOccupancy.toFixed(2)}%).`
    //         );
    //     } else {
    //         insights.push(
    //             `${maxVehicleOccupancySite.siteZoneName} has the highest vehicle occupancy rate (${maxVehicleOccupancySite.vehicleOccupancy.toFixed(2)}%).`
    //         );
    //         insights.push(
    //             `${maxPeopleOccupancySite.siteZoneName} has the highest people occupancy rate (${maxPeopleOccupancySite.peopleOccupancy.toFixed(2)}%).`
    //         );
    //     }

    //     // Insight 2 – Highest number of people counted
    //     insights.push(
    //         `${maxPeopleCountSite.siteZoneName} has the highest number of people counted (${maxPeopleCountSite.peopleCount.toLocaleString()}).`
    //     );

    //     // Insight 3 – Compare average or other occupancy insights
    //     const avgVehicleOccupancy =
    //         filteredData.reduce((sum, s) => sum + s.vehicleOccupancy, 0) / filteredData.length;

    //     const busierSites = filteredData.filter(site => site.vehicleOccupancy > avgVehicleOccupancy);
    //     const lessBusySites = filteredData.filter(site => site.vehicleOccupancy <= avgVehicleOccupancy);

    //     if (busierSites.length && lessBusySites.length) {
    //         insights.push(
    //             `Occupancy levels suggest ${busierSites.map(s => s.siteZoneName).join(" and ")} are busier than ${lessBusySites.map(s => s.siteZoneName).join(" and ")}.`
    //         );
    //     }

    //     return insights;
    // }

    // const insights = generateSummaryInsights(performanceReportDetails);

    // return (
    //     <Box className="summery-report">
    //         <Typography variant="h6">
    //             Summary Insights
    //         </Typography>
    //         <Box
    //            className="reports-repeated-insights-box"
    //         >
    //         <List dense>
    //             {insights.map((text, index) => (
    //                 <ListItem key={index}>
    //                     <ListItemIcon sx={{ minWidth: 24 }}>
    //                         <CircleIcon fontSize="small" sx={{ color: '#f97316' }} />
    //                     </ListItemIcon>
    //                     <ListItemText primary={text} primaryTypographyProps={{ fontSize: 14 }} />
    //                 </ListItem>
    //             ))}
    //         </List>
    //     </Box>
    // </Box>
        
    // );

     const generateSummaryInsights = (data: PerformanceComparisonItem[]) => {
        if (!data || data.length === 0) return ["No data available to generate insights."];

        const filteredData = data.filter(site =>
            (site?.siteZoneName && site?.siteZoneName.toLowerCase() !== "average") &&
            site?.vehicleOccupancy > 0 &&
            site?.peopleOccupancy > 0 &&
            site?.vehicleCount > 0 &&
            site?.peopleCount > 0
        );

        if (filteredData.length === 0) return ["No valid data available to generate insights."];

        const insights: string[] = [];

        const types = comperisionType || ["vehicle", "people"]; // default to both if nothing selected

        // Generate vehicle-related insights if selected
        if (types.includes("vehicle")) {
            const maxVehicleOccupancySite = filteredData.reduce((max, site) =>
                site.vehicleOccupancy > max.vehicleOccupancy ? site : max
            );

            const maxVehicleCountSite = filteredData.reduce((max, site) =>
                site.vehicleCount > max.vehicleCount ? site : max
            );

            insights.push(
                `${maxVehicleOccupancySite.siteZoneName} has the highest vehicle occupancy rate (${maxVehicleOccupancySite.vehicleOccupancy.toFixed(2)}%).`
            );

            insights.push(
                `${maxVehicleCountSite.siteZoneName} has the highest number of vehicles counted (${maxVehicleCountSite.vehicleCount.toLocaleString()}).`
            );

            const avgVehicleOccupancy =
                filteredData.reduce((sum, s) => sum + s.vehicleOccupancy, 0) / filteredData.length;

            const busierSites = filteredData.filter(site => site.vehicleOccupancy > avgVehicleOccupancy);
            const lessBusySites = filteredData.filter(site => site.vehicleOccupancy <= avgVehicleOccupancy);

            if (busierSites.length && lessBusySites.length) {
                insights.push(
                    `Vehicle occupancy levels suggest ${busierSites.map(s => s.siteZoneName).join(", ")} are busier than ${lessBusySites.map(s => s.siteZoneName).join(", ")}.`
                );
            }
        }

        // Generate people-related insights if selected
        if (types.includes("people")) {
            const maxPeopleOccupancySite = filteredData.reduce((max, site) =>
                site.peopleOccupancy > max.peopleOccupancy ? site : max
            );

            const maxPeopleCountSite = filteredData.reduce((max, site) =>
                site.peopleCount > max.peopleCount ? site : max
            );

            insights.push(
                `${maxPeopleOccupancySite.siteZoneName} has the highest people occupancy rate (${maxPeopleOccupancySite.peopleOccupancy.toFixed(2)}%).`
            );

            insights.push(
                `${maxPeopleCountSite.siteZoneName} has the highest number of people counted (${maxPeopleCountSite.peopleCount.toLocaleString()}).`
            );

            const avgPeopleOccupancy =
                filteredData.reduce((sum, s) => sum + s.peopleOccupancy, 0) / filteredData.length;

            const busierSites = filteredData.filter(site => site.peopleOccupancy > avgPeopleOccupancy);
            const lessBusySites = filteredData.filter(site => site.peopleOccupancy <= avgPeopleOccupancy);

            if (busierSites.length && lessBusySites.length) {
                insights.push(
                    `People occupancy levels suggest ${busierSites.map(s => s.siteZoneName).join(", ")} are busier than ${lessBusySites.map(s => s.siteZoneName).join(", ")}.`
                );
            }
        }

        // Generate combined insights if both are selected
        if (types.includes("vehicle") && types.includes("people")) {
            const maxVehicleOccupancySite = filteredData.reduce((max, site) =>
                site.vehicleOccupancy > max.vehicleOccupancy ? site : max
            );

            const maxPeopleOccupancySite = filteredData.reduce((max, site) =>
                site.peopleOccupancy > max.peopleOccupancy ? site : max
            );

            if (
                maxVehicleOccupancySite.siteZoneName === maxPeopleOccupancySite.siteZoneName &&
                maxVehicleOccupancySite.vehicleOccupancy === maxPeopleOccupancySite.peopleOccupancy
            ) {
                insights.push(
                    `${maxPeopleOccupancySite.siteZoneName} has the highest people and vehicle occupancy rates (${maxPeopleOccupancySite.peopleOccupancy.toFixed(2)}%).`
                );
            } else if (
                maxVehicleOccupancySite.siteZoneName === maxPeopleOccupancySite.siteZoneName
            ) {
                insights.push(
                    `${maxPeopleOccupancySite.siteZoneName} has the highest people occupancy rate (${maxPeopleOccupancySite.peopleOccupancy.toFixed(2)}%) and vehicle occupancy rate (${maxVehicleOccupancySite.vehicleOccupancy.toFixed(2)}%).`
                );
            }
        }

        if (insights.length === 0) {
            return ["No valid data insights available based on the selection."];
        }

        return insights;
    }

    const insights = generateSummaryInsights(performanceReportDetails);

    return (
        <Box className="summery-report">
            <Typography variant="h6">
                Summary Insights
            </Typography>
            <Box className="reports-repeated-insights-box">
                <List dense>
                    {insights.map((text, index) => (
                        <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                                <CircleIcon fontSize="small" sx={{ color: '#f97316' }} />
                            </ListItemIcon>
                            <ListItemText primary={text} primaryTypographyProps={{ fontSize: 14 }} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
}

export { ReportPerformanceSummary };