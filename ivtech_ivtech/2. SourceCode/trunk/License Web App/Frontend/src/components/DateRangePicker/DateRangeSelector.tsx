import React, { useRef, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main styles
import "react-date-range/dist/theme/default.css"; // Theme styles

interface DateRangeSelectorProps {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ state, setState, setOpen }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        // Ensure the state updates before closing
        setState([...state]);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen, setState, state]);

  return (
    <div
      ref={pickerRef}
      className="absolute z-10 bg-white shadow-md p-2 w-auto mt-2"
      style={{ position: "absolute", top: "15%", left: "22%",opacity:1,zIndex:500 }}
    >
      <DateRangePicker
        onChange={(item) => setState([item.selection])}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={2}
        ranges={state}
        direction="horizontal"
        preventSnapRefocus={true}
        calendarFocus="backwards"
      />
    </div>
  );
};


