import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { ReportHeader } from '../../interfaces/IReport';
import { formatDateToConfiguredTimezone } from '../../utils/formatDateToConfiguredTimezone';
import moment from 'moment';

type ReportTypeInfoProps = {
  reportHeader?: ReportHeader
};

const ReportTypeInfo: React.FC<ReportTypeInfoProps> = ({ reportHeader }) => {
   const [formatedStartDate, setFormatedStartDate] = useState<string>('');
  const [formatedEndDate, setFormatedEndDate] = useState<string>('');

  useEffect(() => {
 
    if (reportHeader?.reportStartDate && reportHeader?.reportEndDate) {
      const convertedStartDate = formatDateToConfiguredTimezone(reportHeader.reportStartDate);
      const convertedEndDate = formatDateToConfiguredTimezone(reportHeader.reportEndDate);

      setFormatedStartDate(moment(convertedStartDate).format("MMM DD YYYY, h:mm A"));
      setFormatedEndDate(moment(convertedEndDate).format("MMM DD YYYY, h:mm A"));
    }
  },[reportHeader]);
  return (
    <Box className="report-box">
       <Paper className="report-type-wrapper">
        <Grid className="report-type-wrapper-repeat">
          <Grid item >
            <Typography>Report Type</Typography>
            <span>{reportHeader?.reportType == "site report" ? "Site Performance Comparison Report" : "Zone Performance Comparison Report"}</span>
          </Grid>
          <Grid item>
            <Typography>Report Name</Typography>
            <span>{reportHeader?.reportName}</span>
          </Grid>
          <Grid item>
            <Typography>Sites</Typography>
            <span>{reportHeader?.sites}</span>
          </Grid>
          {
            (reportHeader?.reportType && reportHeader?.reportType?.toLowerCase() == "zone report") && (
              <>
                <Grid item>
                  <Typography>Floors</Typography>
                  <span>{reportHeader?.floors}</span>
                </Grid>
                <Grid item>
                  <Typography>Zones</Typography>
                  <span>{reportHeader?.zones}</span>
                </Grid>
              </>
            )
          }
          <Grid item>
            <Typography>Date & Time</Typography>
            <span>{formatedStartDate}-{formatedEndDate}</span>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export { ReportTypeInfo };