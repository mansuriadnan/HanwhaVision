import React, { useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
// import { addDays } from 'date-fns';
import { enUS } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// import { format } from "date-fns";
import {
  addDays,
  subMonths,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  format,
  subDays,
  subYears,
} from "date-fns";
import { createStaticRanges, defaultStaticRanges } from "react-date-range";
import { DateTime } from "luxon";
import { useSignalRContext } from "../../context/SignalRContext";
import { leftGroup } from "../../utils/signalRService";
import { isExportingPDF } from "../../utils/refreshManager";

interface CustomDateTimeRangePickerProps {
  onApply?: (range: { startDate: Date; endDate: Date }) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  rules?: any;
  label?: any;
}

const CustomDateTimeRangePicker: React.FC<CustomDateTimeRangePickerProps> = ({
  onApply,
  initialStartDate,
  initialEndDate,
  rules,
  label,
}) => {
  const [state, setState] = useState({
    startDate: initialStartDate || new Date(),
    endDate: initialEndDate || new Date(),
    key: "selection",
  });

  const [showPicker, setShowPicker] = useState(false);
  //const [startTime, setStartTime] = useState(format(initialStartDate || new Date(), "HH:mm"));
  const [startTime, setStartTime] = useState(() =>
    initialStartDate ? format(initialStartDate, "HH:mm") : "00:00"
  );
  const [endTime, setEndTime] = useState(
    format(initialEndDate || new Date(), "HH:mm")
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  const [tempState, setTempState] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [tempStartTime, setTempStartTime] = useState("");
  const [tempEndTime, setTempEndTime] = useState("");
  const { setIsTodayValue, IsToday, triggerRefresh } = useSignalRContext();

  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setState({
        startDate: initialStartDate,
        endDate: initialEndDate,
        key: "selection",
      });
      setStartTime(format(initialStartDate, "HH:mm"));
      setEndTime(format(initialEndDate, "HH:mm"));
    } else {
      // If no initialStartDate is passed, set start time to 00:00
      setStartTime("00:00");
      setEndTime(format(new Date(), "HH:mm")); // current time
    }
  }, [initialStartDate, initialEndDate]);

  useEffect(() => {
    const diffMs = state.endDate.getTime() - state.startDate.getTime(); // difference in milliseconds
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Check if startDate is today
    const isStartDateToday = (() => {
      const today = new Date();
      return (
        state.startDate.getDate() === today.getDate() &&
        state.startDate.getMonth() === today.getMonth() &&
        state.startDate.getFullYear() === today.getFullYear()
      );
    })();

    let interval: NodeJS.Timeout | null = null;

    if (diffDays === 0 && isStartDateToday) {
      setIsTodayValue(true);
      interval = setInterval(() => {
        // console.log("Re-rendering every 1 minute...");
        if (!isExportingPDF) {
          setEndTime(format(new Date(), "HH:mm"));
          applyDateTime();
          triggerRefresh(true);
        }
      }, 60000);
    } else {
      // leftGroup();
      setIsTodayValue(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const customStaticRanges = createStaticRanges([
    {
      label: "Today",
      range: () => ({
        startDate: startOfDay(new Date()),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: "Yesterday",
      range: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          startDate: startOfDay(yesterday),
          endDate: endOfDay(yesterday),
        };
      },
    },
    {
      label: "Two days ago",
      range: () => {
        const twoDaysAgo = subDays(new Date(), 2);
        return {
          startDate: startOfDay(twoDaysAgo),
          endDate: endOfDay(twoDaysAgo),
        };
      },
    },
    {
      label: "7 Days",
      range: () => ({
        startDate: subDays(new Date(), 6), // includes today = 7 days
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: "1 Month",
      range: () => ({
        startDate: subMonths(new Date(), 1),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: "3 Months",
      range: () => ({
        startDate: subMonths(new Date(), 3),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: "6 Months",
      range: () => ({
        startDate: subMonths(new Date(), 6),
        endDate: endOfDay(new Date()),
      }),
    },
    {
      label: "1 Year",
      range: () => ({
        startDate: subYears(new Date(), 1),
        endDate: endOfDay(new Date()),
      }),
    },
  ]);

  const applyDateTime = () => {
    const [startHours, startMinutes] = startTime.split(":");
    const [endHours, endMinutes] = endTime.split(":");

    const startDate = new Date(state.startDate);
    const endDate = new Date(state.endDate);

    startDate.setHours(parseInt(startHours), parseInt(startMinutes));
    endDate.setHours(parseInt(endHours), parseInt(endMinutes));

    const updatedState = { ...state, startDate, endDate };
    setState(updatedState);
    setShowPicker(false);
    triggerRefresh(false); //display loader on widgets
    if (onApply) {
      onApply({ startDate, endDate });
    }

    if (!IsToday) {
      leftGroup();
    }
    // const startDate = DateTime.fromJSDate(state.startDate).set({
    //     hour: parseInt(startHours),
    //     minute: parseInt(startMinutes)
    // }).toUTC();

    // const endDate = DateTime.fromJSDate(state.endDate).set({
    //     hour: parseInt(endHours),
    //     minute: parseInt(endMinutes)
    // }).toUTC();
    // const updatedState = {
    //     ...state,
    //     startDate: startDate.toJSDate(),
    //     endDate: endDate.toJSDate()
    // };
    // setState(updatedState);
    // setShowPicker(false);

    // if (onApply) {
    //     onApply({ startDate: startDate.toJSDate(), endDate: endDate.toJSDate() });
    // }
  };

  return (
    <div className="relative w-full max-w-md mx-auto" ref={pickerRef}>
      {label && (
        <label style={{ marginBottom: 4, fontWeight: 500, fontSize: "12px" }}>
          {label}
          {(rules as any)?.required && <span style={{ color: "red" }}> *</span>}
        </label>
      )}
      <input
        readOnly
        onClick={() => {
          setTempState(state);
          setTempStartTime(startTime);
          setTempEndTime(endTime);
          setShowPicker(!showPicker);
        }}
        value={`${format(state?.startDate, "dd-MM-yyyy")} ${initialStartDate ? format(state?.startDate, "HH:mm") : startTime
          } - ${format(state?.endDate, "dd-MM-yyyy HH:mm")}`}
        className="w-full px-4 py-2 border rounded shadow-sm cursor-pointer"
        style={{ width: "100%" }}
        placeholder="Select Date & Time"
      />
      {showPicker && (
        <div>
          <DateRangePicker
            // onChange={(item: any) => setState(item.selection)}
            onChange={(item: any) => {
              const newStart = item.selection.startDate;
              const newEnd = item.selection.endDate;

              const todayStr = format(new Date(), "yyyy-MM-dd");
              const startStr = format(newStart, "yyyy-MM-dd");
              const endStr = format(newEnd, "yyyy-MM-dd");

              let startT = "00:00";
              let endT = "23:59";

              if (endStr === todayStr) {
                endT = format(new Date(), "HH:mm");
              }

              // Parse time into date objects
              const [startHours, startMinutes] = startT.split(":").map(Number);
              const [endHours, endMinutes] = endT.split(":").map(Number);

              const adjustedStart = new Date(newStart);
              adjustedStart.setHours(startHours, startMinutes);

              const adjustedEnd = new Date(newEnd);
              adjustedEnd.setHours(endHours, endMinutes);

              // Update state
              setState({
                ...item.selection,
                startDate: adjustedStart,
                endDate: adjustedEnd,
              });

              setStartTime(startT);
              setEndTime(endT);
            }}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={[state]}
            direction="horizontal"
            locale={enUS}
            staticRanges={customStaticRanges}
            inputRanges={[]}
          />

          <div className="time-picker-show">
            <div className="report-date-picker-here">
              <div className="time-picker-show-repeat">
                <p>Start Time</p>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    // setStartTime(value);
                    // const [hours, minutes] = value.split(":");
                    // const updatedDate = new Date(state.startDate);
                    // updatedDate.setHours(parseInt(hours), parseInt(minutes));
                    // setState(prev => ({ ...prev, startDate: updatedDate }));
                    setStartTime(value);
                    if (!value || !value.includes(":")) return;

                    const [hoursStr, minutesStr] = value.split(":");
                    const hours = parseInt(hoursStr, 10);
                    const minutes = parseInt(minutesStr, 10);
                    if (isNaN(hours) || isNaN(minutes)) return;
                    const updatedDate = new Date(state.startDate);
                    updatedDate.setHours(hours, minutes);
                    setState((prev) => ({ ...prev, startDate: updatedDate }));
                  }}
                  className="ml-2 p-1 border rounded"
                />
              </div>
              <div className="time-picker-show-repeat">
                <p>End Time</p>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEndTime(value);
                    // const [hours, minutes] = value.split(":");
                    // const updatedDate = new Date(state.endDate);
                    // updatedDate.setHours(parseInt(hours), parseInt(minutes));
                    // setState(prev => ({ ...prev, endDate: updatedDate }));
                    // Validate input
                    if (!value || !value.includes(":")) return;
                    const [hoursStr, minutesStr] = value.split(":");
                    const hours = parseInt(hoursStr, 10);
                    const minutes = parseInt(minutesStr, 10);
                    if (isNaN(hours) || isNaN(minutes)) return;
                    const updatedDate = new Date(state.endDate);
                    updatedDate.setHours(hours, minutes);
                    setState((prev) => ({ ...prev, endDate: updatedDate }));
                  }}
                  className="ml-2 p-1 border rounded"
                />
              </div>
            </div>

            <div className="date-picker-bottom-bottom">
              <button
                onClick={() => {
                  setState(tempState);
                  setStartTime(tempStartTime);
                  setEndTime(tempEndTime);
                  setShowPicker(false);
                }}
                className="common-btn-design common-btn-design-transparent"
              >
                Cancel
              </button>
              <button onClick={applyDateTime} className="common-btn-design">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export { CustomDateTimeRangePicker };
