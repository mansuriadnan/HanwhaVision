

import { DateTime } from "luxon";

export interface TimezoneConfig {
    timeZoneName: string;     // "Brazil Standard Time" (optional)
    timeZoneAbbr?: string;    // "BRT" (optional)
    utcOffset?: string;       // "-03:00" (optional)
}

export const formatDateToConfiguredTimezone = (
    utcDateString: string,
    format: string = "yyyy-LL-dd HH:mm:ss"):  string => {

    if (!utcDateString) return utcDateString;

    const utcDate = DateTime.fromISO(utcDateString, { zone: "utc" });

    if (!utcDate.isValid) {
        return utcDateString;
    }

    let configuredZoneLabel: any = null;
   
    const configuredTimeZoneDetails = localStorage.getItem("userProfileReferenceData");
    
    if (configuredTimeZoneDetails) {
        try {
            const parsedData = JSON.parse(configuredTimeZoneDetails);
            configuredZoneLabel = parsedData?.timeZone?.label ?? null;
        } catch (e) {
            console.warn("Error in format date func()", e);
        }
    }



    if (configuredZoneLabel?.utcOffset) {
        try {
            const convertedDate = utcDate.setZone(`UTC${configuredZoneLabel.utcOffset}`).toISO({ includeOffset: false })?.toString();
            return convertedDate ?? utcDateString;
        }
        catch (error) {
            console.warn("Error applying user time zone offset:", error);
        }
    }

    // fallback to browser timezone
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return utcDate.setZone(browserZone).toFormat(format);    

}