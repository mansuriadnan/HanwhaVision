export interface TimezoneConfig {
    timeZoneName: string;    
    timeZoneAbbr?: string;   
    utcOffset?: string;      
}
// note : Use ISO string as a Input for DataTime(eg. '2025-06-17T06:40:00.000Z')

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(timezone);

export const convertToUTC = (isoInput: string): string => {
  try {
   // isoInput = "2025-06-17T06:30:00";
     
    if (!isoInput) {
      throw new Error("Date string is missing");
    }

    let offset: string | null = null;

    const configuredTimeZoneDetails = localStorage.getItem("userProfileReferenceData");
    if (configuredTimeZoneDetails) {
      const parsedData = JSON.parse(configuredTimeZoneDetails);
      const configuredZoneLabel = parsedData?.timeZone?.label ?? null;
      offset = configuredZoneLabel?.utcOffset ?? null;
    }
    let utcDate;
    if (offset) {
      const match = offset.match(/^([+-])(\d{2}):(\d{2})$/);
      if (!match) throw new Error("Invalid UTC offset format");

      const localTime = dayjs(isoInput, "YYYY-MM-DDTHH:mm:ss").utcOffset(offset, true); // convert to UTC from Offset
      utcDate = localTime.utc();
    } else {
      // If no offset: use browser/OS time zone
      const localTime = dayjs(isoInput); 
      utcDate = localTime.utc(); // convert to UTC from OS local time
    }

    return utcDate.toISOString();

  } catch (error: any) {
    console.error("convertToUTC error:", error.message ?? error);
    throw error;
  }
};
