export const GetMinutesByInterval = (interval: string): number => {
  switch (interval.toLowerCase()) {
    case "day":
    case "week":
    case "month":
    case "hour":
    case "12 hours":
      return 60;
    case "30 minutes":
      return 30;
    case "15 minutes":
      return 15;
    // case "12 hours":
    //   return 120;
    default:
      return 60;
  }
};
