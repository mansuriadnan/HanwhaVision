import moment from "moment";

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "N/A";
  }
  return moment(dateString).format("DD/MM/YYYY HH:MMA");
};