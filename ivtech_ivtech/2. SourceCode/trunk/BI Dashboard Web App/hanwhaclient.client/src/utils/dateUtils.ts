import moment from "moment";

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "N/A";
  }
  return moment(dateString).format("DD/MM/YYYY hh:mm A");
};

export const formatDateDDMMYY = (dateStr: string | null): string => {
  if (!dateStr || dateStr === "0001-01-01T00:00:00") return "-";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2); // get last 2 digits
  return `${day}/${month}/${year}`;
};

export const formatDateToCustomFormat = (dateString: string | null | undefined,format:string): string => {
  if (!dateString) {
    return "N/A";
  }
  return moment(dateString).format(format);
};
