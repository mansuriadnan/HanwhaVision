import { useCallback, useEffect } from "react";
import { GetMinutesByInterval } from "../components/Reusable/GetMinutesByInterval";
import { csvWidgetService } from "../services/reportServices";
import { convertToUTC } from "../utils/convertToUTC";

interface ExportHandlerProps {
  apiEndpoint: string;
  startDate: string;
  endDate: string;
  floor?: string[];
  zones?: string[];
  selectedIntervalNameRef: React.RefObject<any>;
  setExportHandler?: (handler: (item: any) => void) => void;
}

// Alternative simpler approach - only register the handler once
export const useExportHandler = ({
  apiEndpoint,
  startDate,
  endDate,
  floor,
  zones,
  selectedIntervalNameRef,
  setExportHandler,
}: ExportHandlerProps) => {
  useEffect(() => {
    // Only register the handler once when component mounts
    if (setExportHandler) {
      const exportFunction = async (item?: any) => {
        var selectedIntervalMin = GetMinutesByInterval(
          selectedIntervalNameRef.current
        );
        const payload = {
          StartDate: convertToUTC(startDate.replace(".000Z", "")),
          EndDate: convertToUTC(endDate.replace(".000Z", "")),
          FloorIds: floor,
          ZoneIds: zones,
          intervalMinute: selectedIntervalMin,
          WidgetName: item?.chartName,
        };

        await csvWidgetService(
          {
            data: payload,
          },
          apiEndpoint
        );
      };

      setExportHandler(exportFunction);
    }
  }, [startDate, endDate, floor, zones]); // Empty dependency array - only run once on mount

  // Note: This approach will use the initial values of props.
  // If you need fresh values, you might want to use refs for the changing values
};
