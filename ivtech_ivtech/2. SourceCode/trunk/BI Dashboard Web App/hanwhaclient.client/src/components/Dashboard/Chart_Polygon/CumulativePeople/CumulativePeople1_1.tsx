import React, { useEffect, useState } from "react";
import {
  CumulativeTotalProps,
  IParsedDataWithCategory,
  ParsedDataFormat,
} from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { ChartTicksSelector } from "../../../index";
import { formatNumber } from "../../../../utils/formatNumber";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { useThemeContext } from "../../../../context/ThemeContext";

const CumulativePeople1_1: React.FC<CumulativeTotalProps> = ({
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  cumulativePeopleChart,
  startDate,
  endDate,
  setIsDraggable,
}) => {
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const [cumulativePCount, setCumulativePCount] = useState(0);
  const { theme } = useThemeContext();

  useEffect(() => {
    if (!cumulativePeopleChart) return;

    const updatedParsedData: IParsedDataWithCategory = {};

    updatedParsedData["CPData"] = cumulativePeopleChart.map((d) => ({
      date: new Date(formatDateToConfiguredTimezone(d.dateTime as string)),
      value: d.inCount,
    }));

    setParsedDataWithCategory(updatedParsedData);
  }, [cumulativePeopleChart]);

  const getCumulativeData = (data: ParsedDataFormat[]) => {
    const cumulative: any = [];
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        cumulative.push(data[0]);
      } else {
        var add = 0;
        if (data[i].date.getDate() === data[i - 1].date.getDate()) {
          const diff = data[i].value - data[i - 1].value;
          add = diff < 0 ? data[i].value : diff;
        } else {
          add = data[i].value;
        }
        cumulative.push({
          date: data[i].date,
          value: add + cumulative[i - 1].value,
        });
      }
    }

    return cumulative.map((d: { date: any; value: any }) => ({
      date: d.date,
      value: d.value,
    }));
  };

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <Box className="widget-main-body">
          <div className="widget-data-wrapper">
            <div className="cumulative-people-image">
              <Box className="cumulative-people-image">
                <img
                  src="/images/dashboard/Cumulative_People_Count.gif"
                  alt="Walking person"
                />
              </Box>

              <Box className="cumulative-people-details">
                <Typography variant="subtitle2">Cumulative People</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatNumber(Number(cumulativePCount))}
                </Typography>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of cumulative people : </Typography>
            <span style={{ fontWeight: 600 }}>{formatNumber(Number(cumulativePCount))}</span>
          </Box>
          {!openZoomDialog ? (
            <Box
              className="widget-main-footer-zoom-i"
              onMouseEnter={() => setIsDraggable?.(true)}
              onMouseLeave={() => setIsDraggable?.(false)}
            >
              <img
                src={theme === 'light' ? "/images/dashboard/drag.svg" : "/images/dark-theme/dashboard/drag.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
          {!openZoomDialog ? (
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnCumulativePeopleCount">
              <img
                src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
        </Box>

        <div style={{ display: "none" }}>
          {parsedDataWithCategory && (
            <ChartTicksSelector
              startDate={startDate as Date}
              endDate={endDate as Date}
              parsedDataWithCategory={parsedDataWithCategory}
              operation="max"
              chartTicksChange={(data) => null}
              onChartDataChange={(result) => {
                const cpData = result?.["CPData"] as ParsedDataFormat[];
                var tempdata = getCumulativeData(cpData);
                if (tempdata && tempdata?.length && tempdata?.length > 0) {
                  setCumulativePCount(tempdata[tempdata.length - 1].value);
                } else {
                  setCumulativePCount(0);
                }
              }}
            />
          )}
        </div>
      </Box>
    </Box>
  );
};

export { CumulativePeople1_1 };
