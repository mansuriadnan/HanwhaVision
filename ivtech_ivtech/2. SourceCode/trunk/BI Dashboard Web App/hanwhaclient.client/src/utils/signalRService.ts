import * as signalR from "@microsoft/signalr";
import { apiPostServiceForWidgets } from "../utils/apiPostService";
import { apiDeleteService } from "../utils/apiDeleteService";
import { UserGroup } from "../interfaces/UserGroup";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

let connection: signalR.HubConnection | null = null;
export let connectionId: string = "";

export const startSignalRConnection = async () => {
  const token = localStorage.getItem("accessToken");

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}NotificationHub`, {
    // .withUrl("https://localhost:7240/api/NotificationHub", {
      accessTokenFactory: () => token || "",
    })
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    connectionId = connection.connectionId ?? "";
    console.log("✅ SignalR connected. connectionId:", connectionId);
  } catch (err) {
    console.error("❌ SignalR connection failed:", err);
  }

  return connection;
};

export const stopSignalRConnection = async () => {
  if (connection) {
    await connection.stop();
    console.log("🛑 SignalR connection stopped.");
  }
};

export const onReceiveMessage = (
  widgetName: string,
  callback: (data: any) => void
) => {
  if (connection) {
    connection.off(widgetName);
    connection.on(widgetName, callback);
  }
};

// export const offReceiveMessage = (widgetName: string) => {
//   if (connection) {
//     connection.off(widgetName);
//   }
// };

// console.log("connectionId->", connectionId);

export const getLiveData = async (
  widgetName: string,
  floorIds: string[],
  zoneIds: string[]
) => {
  if (!connectionId) {
    console.warn("No SignalR connection ID found.");
    return;
  }

  try {
    const response = await apiPostServiceForWidgets<UserGroup>({
      url: `${API_BASE_URL}Users/UserGroup`,
      // url: "https://localhost:7240/api/Users/UserGroup",
      data: {
        ConnectionId: connectionId,
        // FloorId: ["685bb7287f238baa41561bd5"],
        // zoneId: ["685bb7667f238baa41561c9b"],
        FloorId: floorIds,
        zoneId: zoneIds,
        widgetName,
      },
    });

    // console.log("join group res->", response);

    return response;
  } catch (error) {
    console.error("Failed to fetch live data:", error);
  }
};

export const leftGroup = async () => {
  if (!connectionId) {
    console.warn("No SignalR connection ID found.");
    return;
  }

  try {
    const response = await apiDeleteService({
      url: `${API_BASE_URL}Users/RemoveUserGroup`,
      // url: "https://localhost:7240/api/Users/RemoveUserGroup",
      id: connectionId,
    });

    // console.log("left group res->", response);

    return response;
  } catch (error) {
    console.error("Failed to left group:", error);
  }
};
