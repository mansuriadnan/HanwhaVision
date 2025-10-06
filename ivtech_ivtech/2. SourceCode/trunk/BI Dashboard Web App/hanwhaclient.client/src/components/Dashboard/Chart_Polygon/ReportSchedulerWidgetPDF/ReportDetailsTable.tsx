export const ReportDetailsTable = () => {
    // if (!settingsData) return null;

    // const formattedWidgets = widgets.join(", ");
    // const formattedFloors = (settingsData.floorNames || []).join(", ");
    // const formattedZones = (settingsData.zoneNames || []).join(", ");
    // const generatedDate = dayjs().format("DD-MM-YYYY HH:mm:ss");

    // const rows = [
    //     { label: "Selected Floors", value: formattedFloors },
    //     { label: "Selected Zones", value: formattedZones },
    //     { label: "Selected Widgets", value: formattedWidgets },
    //     { label: "Frequency", value: settingsData.sendInterval },
    //     { label: "Generated On", value: generatedDate },
    // ];
    const rows = [
    {
      label: "Selected Floors",
      value:
        "Spec Third Floor, dubai office road people 60083, dubai vehicle cam 60097",
    },
    {
      label: "Selected Zones",
      value:
        "Outside view, Inside view, dubai office zone, vehicle zone, inside2",
    },
    {
      label: "Selected Widgets",
      value:
        "TotalCameraCount, CameraCountByModel, CameraCountByFeatures, PeopleCapacityUtilization, VehicleCapacityUtilization, VehicleCameraCapacityUtilizationAnalysisByZones, PeopleCameraCapacityUtilizationAnalysisByZones, SlipFallAnalysis, AveragePeopleCountChart",
    },
    { label: "Frequency", value: "DAILY" },
    { label: "Generated On", value: "18-07-2025 18:51:47" },
  ];

    return (
        <div style={{ marginBottom: "20px" }}>
            <h4>Report Details:</h4>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th
                            style={{
                                padding: "8px",
                                textAlign: "left",
                                border: "1px solid #ccc",
                                width: "20%",
                            }}
                        >
                            Parameter
                        </th>
                        <th
                            style={{
                                padding: "8px",
                                textAlign: "left",
                                border: "1px solid #ccc",
                            }}
                        >
                            Value
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td
                                style={{
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    verticalAlign: "top",
                                }}
                            >
                                {row.label}
                            </td>
                            <td
                                style={{
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {row.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
