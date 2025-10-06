import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import { KeyPerformanceMetrics } from '../../interfaces/IReport';
import { useThemeContext } from '../../context/ThemeContext';



interface keyPerformanceMetricsProps {
  keyPerformanceMetrics?: KeyPerformanceMetrics
  comperisionType?: string[] | undefined;
}

const KeyPerformanceMetricsDetails: React.FC<keyPerformanceMetricsProps> = ({ keyPerformanceMetrics,comperisionType }) => {
  const { theme } = useThemeContext();

  const allMetrics  = [
    {
      icon: <img src={ theme === 'light' ? "/images/PeopleCountReportIcon.svg" : "/images/dark-theme/PeopleCountReportIcon.svg"} alt="People Count" width={32} height={32} />,
      label: 'Total People Count',
      value: keyPerformanceMetrics?.totalPeopleCount,
      type: 'people',
    },
    {
      icon: <img src={ theme === 'light' ? "/images/PeopleOccupancyReportIcon.svg" : "/images/dark-theme/PeopleOccupancyReportIcon.svg"} alt="People Count" width={32} height={32} />,
      label: 'Average People Occupancy Rate',
      value: keyPerformanceMetrics?.averagePeopleOccupancyRate,
      suffix: '%',
      type: 'people',
    },
    {
      icon: <img src={ theme === 'light' ? "/images/VehicleCountReportIcon.svg" :"/images/dark-theme/VehicleCountReportIcon.svg" } alt="People Count" width={32} height={32} />,
      label: 'Total Vehicle Count',
      value: keyPerformanceMetrics?.totalVehicleCount,
      type: 'vehicle',
    },
    {
      icon: <img src={ theme === 'light' ? "/images/VehicleOccupancyReportIcon.svg" : "/images/dark-theme/VehicleOccupancyReportIcon.svg"} alt="People Count" width={32} height={32} />,
      label: 'Average Vehicle Occupancy Rate',
      value: keyPerformanceMetrics?.averageVehicleOccupancyRate,
      suffix: '%',
      type: 'vehicle',
    },
  ];
  
  const metrics = allMetrics.filter(item => {
    if (!comperisionType || comperisionType.length === 0) {
      return true;
    }
    return comperisionType.includes(item.type);
  });

  return (
    <Box className='performance-metric-main'>
      <Typography variant="h6">
        Key Performance Metric
      </Typography>
      <Grid className='performance-metric'>
        {metrics.map((item, index) => (
          <Grid item className='performance-metric-wrapper' key={index}>
            <Paper
              elevation={0}
              className='performance-metric-items-wrapper'
            >
              <Box>
                {item.icon}
              </Box>
              <Box>
                <Typography >{item.label}</Typography>
                <strong>
                  {item.value ? item.value.toLocaleString() : "0"}{item.suffix || ''}
                </strong>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export { KeyPerformanceMetricsDetails };