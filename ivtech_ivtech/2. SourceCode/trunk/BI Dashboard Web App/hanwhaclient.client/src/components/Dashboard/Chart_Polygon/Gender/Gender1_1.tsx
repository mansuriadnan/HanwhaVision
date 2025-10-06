import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { GenderProps } from "../../../../interfaces/IChart";
import moment from "moment";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

interface Totals {
  totalMale: number;
  totalFemale: number;
  totalUndefined: number;
}
interface MaxData {
  date: string;
  count: number;
}
const Gender1_1: React.FC<GenderProps> = ({
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  genderDataWithTime,
  groupbyDateData

}) => {
  const [totalCount, setTotalCount] = useState<Number | null>(0);
  const { theme } = useThemeContext();
  const [maxMale, setMaxMale] = useState<MaxData | null>(null);
  const [maxFemale, setMaxFemale] = useState<MaxData | null>(null);
  const [maxUndefined, setMaxUndefined] = useState<MaxData | null>(null);

  const [minMale, setMinMale] = useState<MaxData | null>(null);
  const [minFemale, setMinFemale] = useState<MaxData | null>(null);
  const [minUndefined, setMinUndefined] = useState<MaxData | null>(null);

  const [totals, setTotals] = useState<Totals>({
    totalMale: 0,
    totalFemale: 0,
    totalUndefined: 0,
  });

  useEffect(() => {
    if (!groupbyDateData) return;

    // const formattedData = genderDataWithTime.map((d) => ({
    //   ...d,
    //   // convert ISO string to Date (or keep formatted string if you want)
    //   date: new Date(formatDateToConfiguredTimezone(d.dateTime) as string),
    // }));

    // // Group by "yyyy-MM-dd" (ignoring time part)
    // const groupedData = formattedData.reduce((acc: any, curr) => {
    //   const key = moment(curr.date).format("YYYY-MM-DD"); // "2025-08-29"

    //   if (!acc[key]) {
    //     acc[key] = {
    //       date: key,
    //       maleCount: curr.maleCount,
    //       femaleCount: curr.femaleCount,
    //       undefinedCount: curr.undefinedCount,
    //     };
    //   } else {
    //     acc[key].maleCount = Math.max(acc[key].maleCount, curr.maleCount);
    //     acc[key].femaleCount = Math.max(acc[key].femaleCount, curr.femaleCount);
    //     acc[key].undefinedCount = Math.max(acc[key].undefinedCount, curr.undefinedCount);
    //   }

    //   return acc;
    // }, {});

    // // Convert back to array
    // const groupedArray = Object.values(groupedData);

    if (!groupbyDateData.length) return;
    // ✅ find max male, female, undefined with date
    const maxMale = groupbyDateData.reduce(
      (max, curr) =>
        curr.maleCount > max.maleCount ? curr : max,
      groupbyDateData[0]
    );

    const maxFemale = groupbyDateData.reduce(
      (max, curr) =>
        curr.femaleCount > max.femaleCount ? curr : max,
      groupbyDateData[0]
    );

    const maxUndefined = groupbyDateData.reduce(
      (max, curr) =>
        curr.undefinedCount > max.undefinedCount ? curr : max,
      groupbyDateData[0]
    );

    setMaxMale({ date: maxMale.date, count: maxMale.maleCount });
    setMaxFemale({ date: maxFemale.date, count: maxFemale.femaleCount });
    setMaxUndefined({ date: maxUndefined.date, count: maxUndefined.undefinedCount });

    // ✅ Min values
    const minMale = groupbyDateData.reduce(
      (min, curr) => (curr.maleCount < min.maleCount ? curr : min),
      groupbyDateData[0]
    );

    const minFemale = groupbyDateData.reduce(
      (min, curr) => (curr.femaleCount < min.femaleCount ? curr : min),
      groupbyDateData[0]
    );

    const minUndefined = groupbyDateData.reduce(
      (min, curr) => (curr.undefinedCount < min.undefinedCount ? curr : min),
      groupbyDateData[0]
    );

    setMinMale({ date: minMale.date, count: minMale.maleCount });
    setMinFemale({ date: minFemale.date, count: minFemale.femaleCount });
    setMinUndefined({ date: minUndefined.date, count: minUndefined.undefinedCount });

    const totalsResult: Totals = groupbyDateData.reduce<Totals>(
      (acc, curr) => {
        acc.totalMale += curr.maleCount;
        acc.totalFemale += curr.femaleCount;
        acc.totalUndefined += curr.undefinedCount;
        return acc;
      },
      { totalMale: 0, totalFemale: 0, totalUndefined: 0 }
    );

    setTotals(totalsResult as Totals);
    const grandTotal =
      totalsResult.totalMale +
      totalsResult.totalFemale +
      totalsResult.totalUndefined;
    setTotalCount(grandTotal)

  }, [groupbyDateData]);


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
            <Box className="gender-data-repeat">
              <Box className="gender-data-repeated-inner">
                <Box className="gender-data-image">
                  <img src={"/images/dashboard/Male.svg"} alt="Male" />
                </Box>

                <Box className="gender-data-column-data">
                  <Typography>Male</Typography>
                  <Typography>{formatNumber(totals.totalMale ?? 0)}</Typography>
                </Box>
              </Box>
              <Box className="gender-data-repeated-inner">
                <Typography>
                  Least: <span>{formatNumber(minMale?.count ?? 0)}</span>
                </Typography>
                <Typography>
                  {minMale?.date
                    ? moment(
                      minMale.date
                    ).format("DD-MM-YYYY")
                    : " "}
                </Typography>
              </Box>

              <Box className="gender-data-repeated-inner">
                <Typography>
                  Most: <span>{formatNumber(maxMale?.count ?? 0)}</span>
                </Typography>
                <Typography>
                  {maxMale?.date
                    ? moment(maxMale?.date
                    ).format("DD-MM-YYYY")
                    : " "}
                </Typography>
              </Box>
            </Box>
            <Box className="gender-data-repeat gender-bac-blue">
              <Box className="gender-data-repeated-inner">
                <Box className="gender-data-image">
                  <img src={"/images/dashboard/Female.svg"} alt="Female" />
                </Box>
                <Box className="gender-data-column-data">
                  <Typography>Female</Typography>
                  <Typography>
                    {formatNumber(totals.totalFemale ?? 0)}
                  </Typography>
                </Box>
              </Box>
              <Box className="gender-data-repeated-inner">
                <Typography>
                  Least: <span>{formatNumber(minFemale?.count ?? 0)}</span>
                </Typography>
                <Typography>
                  {minFemale?.date
                    ? moment(minFemale.date
                    ).format("DD-MM-YYYY")
                    : " "}
                </Typography>
              </Box>
              <Box className="gender-data-repeated-inner">
                <Typography>
                  Most: <span>{formatNumber(maxFemale?.count ?? 0)}</span>
                </Typography>
                <Typography>
                  {maxFemale?.date
                    ? moment(
                      maxFemale.date
                    ).format("DD-MM-YYYY")
                    : " "}
                </Typography>
              </Box>
            </Box>
            <Box className="gender-data-repeat gender-bac-gray">
              <Box className="gender-data-repeated-inner">
                <Box className="gender-data-image">
                  <img
                    src={"/images/dashboard/Undefined.svg"}
                    alt="Undefined"
                  />
                </Box>
                <Box className="gender-data-column-data">
                  <Typography>Undefined</Typography>
                  <Typography>
                    {formatNumber(totals.totalUndefined ?? 0)}
                  </Typography>
                </Box>
              </Box>

              <Box className="gender-data-repeated-inner">
                <Typography>
                  Least: <span>{formatNumber(minUndefined?.count ?? 0)}</span>
                </Typography>
                <Typography>
                  {minUndefined?.date
                    ? moment(minUndefined.date).format("DD-MM-YYYY")
                    : " "}
                </Typography>
              </Box>

              <Box className="gender-data-repeated-inner">
                <Typography>
                  Most:
                  <span> {formatNumber(maxUndefined?.count ?? 0)}</span>
                </Typography>
                <Typography>
                  {maxUndefined?.date
                    ? moment(maxUndefined.date).format("DD-MM-YYYY")
                    : " "}
                </Typography>
              </Box>
            </Box>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of gender : </Typography>
            <span>{formatNumber(totalCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnGender">
              <img
                src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export { Gender1_1 };
