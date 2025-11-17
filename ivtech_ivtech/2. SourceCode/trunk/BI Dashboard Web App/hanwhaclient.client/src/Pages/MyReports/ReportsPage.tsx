import { useEffect, useState } from "react";
import { AddEditReportForm } from "./AddEditReportForm";
import { EmptyReportPage } from "./EmptyReportPage";
import { ReportDetails } from "./ReportDetails";
import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ReportList } from "./ReportList";
import {
  DeleteReportService,
  GetReportList,
} from "../../services/reportServices";
import { IReport } from "../../interfaces/IReport";
import { CommonDialog } from "../../components/Reusable/CommonDialog";

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<IReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [newReportId, setNewReportId] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("loading"); // 'loading' | 'empty' | 'list' | 'add' | 'edit'
  const [openDeleteReportConfirm, setOpenDeleteReportConfirm] = useState(false);
  const [reportToBeDelete, setReportToBeDelete] = useState<string | null>(null);

  const fetchReports = async () => {

    const data: any = await GetReportList();
    if (data.length > 0) {
      setReports(data);
      if (data.length === 0) {
        setView("empty");
      } else {
        if (view !== "add" && view !== "edit") {
          setSelectedReport(null);
        }
        setView("list");
      }
    } else {
      // setView("empty");
      setReports([]); // ensure it's set to empty
      setSelectedReport(null);
      setView("empty"); // NEW view state
    }
  };
  useEffect(() => {
    fetchReports();
  }, []);

  const deleteReport = async (id: any) => {
    setOpenDeleteReportConfirm(false);
    const data: any = await DeleteReportService(id);
    if (data.data) {
      const report: any = await GetReportList();
      setReports(report);
      if (report.length === 0) {
        setSelectedReport(null);
        setView("empty");
      } else {
        setSelectedReport(report[0]);
      }
    } else {
      console.error("Failed to delete report:");
    }
  };
  const handleDeleteReport = (id: any) => {
    setOpenDeleteReportConfirm(true);
    setReportToBeDelete(id);
  };

  const handleCloseConfirm = () => {
    setOpenDeleteReportConfirm(false);
    setReportToBeDelete(null);
  };

  if (view === "loading") {
    return <div></div>;
  }

  if (view === "empty") {
    return <EmptyReportPage onAddReport={() => setView("empty-add")} />;
  }

  if (view === "empty-add") {
  return (
    <>
      <EmptyReportPage onAddReport={() => setView("add")} />
      <Drawer
        anchor={"right"}
        open={true}
        onClose={() => {
          // If closed and no reports exist, go back to "empty"
          setView("empty");
        }}
        className="cmn-pop"
         ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                setView("empty");
              }
            }
          }}
      >
        <Box className="cmn-pop-head">
          <Typography variant="h6">Add Report</Typography>
          <IconButton onClick={() => setView("empty")}>
            <GridCloseIcon />
          </IconButton>
        </Box>

        <AddEditReportForm
          reportData={null}
          onSuccess={async (newReport: any) => {
            const updatedReports: any = await GetReportList();
            setReports(updatedReports);

            if (updatedReports.length > 0) {
              const added = updatedReports.find((r: any) => r.id === newReport);
              if (added) setSelectedReport(added);
              setView("list");
            } else {
              setView("empty");
            }
          }}
          onClose={() => setView("empty")}
        />
      </Drawer>
    </>
  );
  }

  return (
    <div className="floor-plans-zones">
      {/* <ReportViewerWithPrint/> */}
      <ReportList
        reports={reports}
        selectedId={selectedReport?.id ?? ""}
        onSelect={(id: any) =>
          setSelectedReport(reports?.find((r) => r.id === id) ?? null)
        }
        onAdd={() => setView("add")}
      />

      {selectedReport ? (
        <ReportDetails
          report={selectedReport}
          onEdit={() => setView("edit")}
          onDelete={() => handleDeleteReport(selectedReport?.id)}
        />
      ) : (
        <div className="roles-permissions-tab empty-report-tab">
          <InfoOutlinedIcon sx={{ color: "#999",fontSize: 50  }} /><span className="no-report-select">No report selected. Please choose a report from the list to view detailed information.</span>
        </div>
      )}
      {(view === "add" || view === "edit") && (
        <Drawer
          anchor={"right"}
          open={true}
          onClose={() => {
            setView("list");
          }}
          className="cmn-pop"
           ModalProps={{
            onClose: (event, reason) => {
              if (reason !== 'backdropClick') {
                setView("list");
              }
            }
          }}
        >
          <Box className="cmn-pop-head">
            {/* Title on Left */}
            <Typography variant="h6">Add Report</Typography>

            {/* Close Icon on Right */}
            <IconButton onClick={() => setView("list")}>
              <GridCloseIcon />
            </IconButton>
          </Box>

          <AddEditReportForm
            reportData={view === "edit" ? selectedReport : null}
            onSuccess={async (newReport: any) => {
              const data: any = await GetReportList();
              setReports(data);
              if (data.length > 0) {
                if (view === "add") {
                  const addedReport = data.find((r: any) => r.id === newReport); // assuming response = newReportId
                  if (addedReport) {
                    setSelectedReport(addedReport);
                  } else {
                    setSelectedReport(reports[reports.length - 1]);
                  }
                } else if (view === "edit") {
                  const updated = data.find(
                    (r: any) => r.id === selectedReport?.id
                  );
                  if (updated) {
                    setSelectedReport(updated);
                  }
                }

                setView("list");
              }
            }}
            onClose={() => setView("list")}
          />
        </Drawer>
      )}
      <CommonDialog
        open={openDeleteReportConfirm}
        title="Delete Confirmation!"
        customClass="cmn-confirm-delete-icon"
        content="Are you sure you want to Delete this Report?"
        onConfirm={() => reportToBeDelete && deleteReport(selectedReport?.id)}
        onCancel={handleCloseConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        titleClass={true}
      />
    </div>
  );
};
export default ReportsPage;
