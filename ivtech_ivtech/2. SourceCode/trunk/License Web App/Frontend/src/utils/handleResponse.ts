import { showToast } from "../components/Reusable/Toast";
// Helper function to handle responses
const handleResponse = (data: any) => {
  if (typeof data === "string") {
    console.error("Error occurred:", data);
    showToast(data, "error");
  } else if (data?.isSuccess) {
    showToast(data.message, "success");
  } else {
    console.warn("Unexpected response:", data);
  }
};

export default handleResponse;
