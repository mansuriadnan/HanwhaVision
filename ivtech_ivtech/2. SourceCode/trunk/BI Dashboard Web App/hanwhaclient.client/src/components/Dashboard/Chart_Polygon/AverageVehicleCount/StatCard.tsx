import React from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";

interface StatCardProps {
  title: string | null;
  avg: number | null;
  min: number | null;
  max: number | null;
  mindate: string | "";
  maxdate: string | "";
  color: {
    bg: string | null; // background color of the card
    main: string | null; // color of the average value
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  avg,
  min,
  max,
  mindate,
  maxdate,
  color,
}) => {
  const formatDateToDDMMYYYY = (dateStr:string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return (
    <Box
      className="incoming-outgoing-average "
    >
      {/* Title and Average Value */}
      <Box
       className="incoming-outgoing-average-details"
      >
        <Typography variant="subtitle1" fontWeight={400} fontSize={12}>
          {title}
        </Typography>
        <Typography fontWeight={600} fontSize={16} color={color.main || "inherit"}>
          {formatNumber(avg ?? 0)}
        </Typography>
      </Box>
      {/* Min / Max Box */}
       <Box
       className="incoming-outgoing-average-value"
      >
        <Box className="incoming-outgoing-average-value-repeat">
          <Typography fontWeight={500} fontSize={13}>
            Min: <strong>{formatNumber(min ?? 0)}</strong>
          </Typography>

          <Typography color="textSecondary" fontWeight={500} fontSize={13}>
            {mindate ? formatDateToDDMMYYYY(mindate) : "N/A"}
          </Typography>
        </Box>
        <Box className="incoming-outgoing-average-value-repeat">
          <Typography fontWeight={500} fontSize={13}>
            Max: <strong>{formatNumber(max ?? 0)}</strong>
          </Typography>
          <Typography fontWeight={500} fontSize={13} color="textSecondary">
            {maxdate ? formatDateToDDMMYYYY(maxdate) :  "N/A"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatCard;
