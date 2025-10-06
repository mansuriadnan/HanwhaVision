import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, SelectChangeEvent, TextField } from "@mui/material";
import { LABELS } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { IDashBoardOverview, IClient } from "../../interfaces/IGetAllClients";
import { GetOverviewDataService, GetTopClientsService, GetTopLicenseService } from "../../services/clientService";
import { ILicence, ITopLicenseDue } from "../../interfaces/ILicense";
import moment from "moment";
import { format } from "date-fns";
import { DateRangeSelector } from "../../components/DateRangePicker/DateRangeSelector";

export const Dashboard: React.FC = () => {
  const [filterTimeRange, setFilterTimeRange] = React.useState("today");
  const [topClients, setTopClients] = useState<IClient[]>([]);
  const [topLicense, setTopLicense] = useState<ITopLicenseDue[]>([]);
  const [dashboardOverviewData, setDashboardOverviewData] = useState<IDashBoardOverview | null>(null);
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (state[0].startDate !== null && state[0].endDate !== null && !open) {
      let startDate = moment(state[0].startDate).format('YYYY-MM-DD');
      let endDate = moment(state[0].endDate).format('YYYY-MM-DD');
      GetOverViewDataByDateRange(startDate, endDate)
    }
  }, [state,open])

  const GetOverViewDataByDateRange = async (startDate: string, endDate: string) => {
    try {
      const overViewData = await GetOverviewDataService(startDate, endDate);
      if (overViewData) {
        setDashboardOverviewData(overViewData);
      }

    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  }

  const fetchInitialData = async () => {
    let startDate = moment().format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');

    try {
      const [clientData, overViewData, licenseData] = await Promise.all([
        GetTopClientsService(),
        GetOverviewDataService(startDate, endDate),
        GetTopLicenseService()
      ]);

      setTopClients(clientData);
      setDashboardOverviewData(overViewData);
      setTopLicense(licenseData)

    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };



  const handleChangeTimeRange = (event: SelectChangeEvent) => {
    setFilterTimeRange(event.target.value as string);
  };

  return (
    <Box p={3} className='mainDashboardBox'>
      {/* <Typography variant="h6" fontWeight="bold" className="overviewTitle">Dashboard</Typography> */}
      <Grid container spacing={3} width="100%">
        <Grid item xs={12} md={12} container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="BoxDashboardOverview">
              <Box>
                <Typography variant="h6" sx={{ color: "#424242" }}>Overview</Typography>
              </Box>
              <Box className="timerangeFilter">
                {/* <Select
                  id="demo-simple-select"
                  value={filterTimeRange}
                  onChange={handleChangeTimeRange}
                  sx={{
                    border: 'none', // Removes the border
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none', // Removes the outline
                    },
                    color: "#424242"
                  }}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="thisweek">This Week</MenuItem>
                  <MenuItem value="lastweek">Last Week</MenuItem>
                  <MenuItem value="thismonth">This Month</MenuItem>
                  <MenuItem value="lastmonth">Last Month</MenuItem>
                </Select> */}

                <TextField
                  value={`${format(state[0].startDate, "yyyy-MM-dd")} - ${format(state[0].endDate, "yyyy-MM-dd")}`}
                  className="border p-2 rounded cursor-pointer w-64"
                  onClick={() => setOpen(!open)}
                  InputProps={{
                    readOnly: true,
                  }}
                />

                {open && <DateRangeSelector state={state} setState={setState} setOpen={setOpen} />}

              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} >
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" className="overviewTitle">Total Users</Typography>
                    <Typography variant="h5" fontWeight="bold" className="overviewValue">
                      {dashboardOverviewData?.totalUsers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4} >
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" className="overviewTitle">Total Active Users</Typography>
                    <Typography variant="h5" fontWeight="bold" className="overviewValue">
                      {dashboardOverviewData?.totalActiveCustomer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4} >
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" className="overviewTitle">Total Active Customers</Typography>
                    <Typography variant="h5" fontWeight="bold" className="overviewValue">
                      {dashboardOverviewData?.totalActiveCustomer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4} >
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" className="overviewTitle">Total Generated Licenses</Typography>
                    <Typography variant="h5" fontWeight="bold" className="overviewValue">
                      {dashboardOverviewData?.totalGeneratedLicenses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4} >
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" className="overviewTitle">Total Active Licenses</Typography>
                    <Typography variant="h5" fontWeight="bold" className="overviewValue">
                      {dashboardOverviewData?.totalActiveLicenses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4} >
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" className="overviewTitle">Total Users</Typography>
                    <Typography variant="h5" fontWeight="bold" className="overviewValue">
                      {dashboardOverviewData?.totalUsers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, marginTop: "3rem", backgroundColor: "#FFFFFF" }} >
              <Typography variant="h6" sx={{ color: "#424242", margin: "1rem" }}>Progress of License Statistics</Typography>
              <CardContent sx={{ marginTop: "3%" }}>

                <Grid container spacing={2} mt={1}>
                  <Grid item xs={4}>
                    <Card sx={{ backgroundColor: "#F3F3F3", borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" textAlign="center" className="overviewTitle" >Active</Typography>
                        <Typography variant="h5" fontWeight="bold" textAlign="center" className="overviewValue">
                          {dashboardOverviewData?.activeLicenses}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ backgroundColor: "#F3F3F3", borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" textAlign="center" className="overviewTitle" >Expired</Typography>
                        <Typography variant="h5" fontWeight="bold" textAlign="center" className="overviewValue">
                          {dashboardOverviewData?.expiredLicenses}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ backgroundColor: "#F3F3F3", borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" textAlign="center" className="overviewTitle" >Future</Typography>
                        <Typography variant="h5" fontWeight="bold" textAlign="center" className="overviewValue">
                          {dashboardOverviewData?.futureLicenses}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid container item spacing={3} mt={4} width="100%" xs={12} md={12}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }} >
            <CardContent>
              <Box className="BoxDashboardOverview">
                <Typography variant="h6" sx={{ color: "#424242" }}>Top Customers</Typography>
                {/* <Button className="seeAllbtn" onClick={() => navigate("/client-management", { state: { label: LABELS.Client_master } })}>See all &gt;&gt;</Button> */}
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3 }} >
                <Table >
                  <TableHead sx={{ backgroundColor: "#FDF1E8" }}>
                    <TableRow>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Contact No</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topClients.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell>{customer.contactPersonName}</TableCell>
                        <TableCell>{customer.customerName}</TableCell>
                        <TableCell>{customer.contactPersonMobile}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>


        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }} >
            <CardContent>
              <Box className="BoxDashboardOverview">
                <Typography variant="h6" sx={{ color: "#424242" }} >Top License Due</Typography>
                {/* <Button className="seeAllbtn" onClick={() => navigate("/client-management", { state: { label: LABELS.License_master } })}>See all &gt;&gt;</Button> */}
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table sx={{ color: "#616161" }}>
                  <TableHead sx={{ backgroundColor: "#FDF1E8" }}>
                    <TableRow>
                      <TableCell>Client Name</TableCell>
                      <TableCell>No. Of Cameras</TableCell>
                      <TableCell>No. Of Users</TableCell>
                      <TableCell>Expired On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topLicense.map((license, index) => (
                      <TableRow key={index} >
                        <TableCell>{license.customerName}</TableCell>
                        <TableCell>{license.noCamera}</TableCell>
                        <TableCell>{license.noUser}</TableCell>
                        <TableCell>{moment(license.expiredOn).format("DD/MM/YYYY")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;
