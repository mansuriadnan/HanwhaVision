import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
//import { FloorAndZoneList } from "../../components";
import { FloorAndZoneList } from "../../components/FloorPlansAndZones/FloorAndZoneList";
import { GetAllFloorService } from "../../services/floorPlanService";

const FloorPlansAndZonesPage: React.FC = () => {
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    fetchFloorData();
  }, []);

  const fetchFloorData = async () => {
    try {
      const floorData = await GetAllFloorService();
      // console.log("floorData->", floorData);
      if (floorData && floorData?.length > 0) {
        setShowNoData(false);
      } else {
        setShowNoData(true);
      }
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
    }
  };

  return (
    <Container sx={{}} maxWidth={false}>
      <FloorAndZoneList showNoData={showNoData} />
    </Container>
  );
};

export default FloorPlansAndZonesPage;
