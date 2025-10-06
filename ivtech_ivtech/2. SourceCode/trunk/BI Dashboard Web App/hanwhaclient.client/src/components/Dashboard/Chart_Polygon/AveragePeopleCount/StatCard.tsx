import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
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
    main: string | null; // color of the line
    mainAvgFont: string | null; // color of the average value  
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
  const formatDateToDDMMYYYY = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const lineColor = title === "Incoming Average" ? "rgba(17, 104, 208, 1)" : "rgba(239, 122, 113, 1)";
  
  const [bgImage, setBgImage] = useState<string>("");
  // useEffect(() => {
  //   const canvas = document.createElement("canvas");
  //   const width = 600;
  //   const height = 200;
  //   canvas.width = width;
  //   canvas.height = height;
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // Radial gradient
  //   const radial = ctx.createRadialGradient(
  //     width / 2,
  //     height / 2,
  //     0,
  //     width / 2,
  //     height / 2,
  //     width / 2
  //   );
  //   radial.addColorStop(0, color.bg || "#000000");
  //   radial.addColorStop(0.4, color.bg || "#000000");
  //   radial.addColorStop(1, color.bg ? `${color.bg}CC` : "#000000CC");
  //   ctx.fillStyle = radial;
  //   ctx.fillRect(0, 0, width, height);

  //   const transparentLineColor = lineColor.startsWith("rgba")
  //     ? lineColor.replace(/rgba?\((.+?),\s*1\)/, 'rgba($1, 0.25)')
  //     : lineColor + "40"; // Append 40 hex = 25% opacity for hex colors

  //   ctx.strokeStyle = transparentLineColor;
  //   ctx.lineWidth = 3;
  //   // Repeating vertical lines
  //   // ctx.strokeStyle = lineColor;
  //   // ctx.lineWidth = 3;
  //   const spacing = 14;

  //   // Draw diagonal lines crossing each other in each "square"
  //   for (let x = 0; x <= width; x += spacing) {
  //     for (let y = 0; y <= height; y += spacing) {


  //       ctx.beginPath();
  //       // Diagonal from bottom-left to top-right of each square
  //       ctx.moveTo(x, y + spacing);
  //       ctx.lineTo(x + spacing, y);
  //       ctx.stroke();
  //     }
  //   }

  //   const dataUrl = canvas.toDataURL("image/png");
  //   setBgImage(dataUrl);
  // }, [color.bg, lineColor]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const width = 600;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Radial gradient background
    const radial = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width / 2
    );
    radial.addColorStop(0, color.bg || "#000000");
    radial.addColorStop(0.4, color.bg || "#000000");
    radial.addColorStop(1, color.bg ? `${color.bg}CC` : "#000000CC");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Set line color with transparency
    const transparentLineColor = lineColor.startsWith("rgba")
      ? lineColor.replace(/rgba?\((.+?),\s*1\)/, 'rgba($1, 0.25)')
      : lineColor + "40";

    ctx.strokeStyle = transparentLineColor;
    ctx.lineWidth = 1.5;
    const spacing = 15;

    for (let x = 0; x <= width; x += spacing) {
      for (let y = 0; y <= height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, y + spacing);
        ctx.lineTo(x + spacing, y);
        ctx.stroke();
      }
    }

    const dataUrl = canvas.toDataURL("image/png");
    setBgImage(dataUrl);
  }, [color.bg, lineColor]);

  return (
    <Box
      className="incoming-outgoing-average"
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        borderRadius: 5,
        padding: 1.5,
      }}
    >
      {/* Title and Average Value */}
      <Box
        className="incoming-outgoing-average-details"
      >
        <Typography variant="subtitle1" fontWeight={400} fontSize={11}> {/* smaller font */}
          {title}
        </Typography>
        <Typography fontWeight={600} fontSize={14} color={color.mainAvgFont || "inherit"}>
          {formatNumber(avg ?? 0)}
        </Typography>
      </Box>

      {/* Min / Max Box */}
      <Box
        className="incoming-outgoing-average-value"
      >
        <Box className="incoming-outgoing-average-value-repeat">
          <p>
            Least: <strong>{formatNumber(min ?? 0)}</strong>
          </p>
          <span>
            {mindate ? formatDateToDDMMYYYY(formatDateToConfiguredTimezone(mindate)) : "N/A"}
          </span>
        </Box>
        <Box className="incoming-outgoing-average-value-repeat">
          <p>
            Most: <strong>{formatNumber(max ?? 0)}</strong>
          </p>
          <span>
            {maxdate ? formatDateToDDMMYYYY(formatDateToConfiguredTimezone(maxdate)) : "N/A"}
          </span>
        </Box>
      </Box>
    </Box>
  );
};

export default StatCard;
