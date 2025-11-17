declare module 'react-date-range' {
    import * as React from 'react';
  
    export interface Range {
      startDate: Date;
      endDate: Date;
      key?: string;
    }
  
    export interface DateRangePickerProps {
      onChange: (ranges: { selection: Range }) => void;
      showSelectionPreview?: boolean;
      moveRangeOnFirstSelection?: boolean;
      months?: number;
      ranges: Range[];
      direction?: 'vertical' | 'horizontal';
      locale?: any;
      staticRanges?: any[];
      inputRanges?: any[];
    }
  
    export class DateRangePicker extends React.Component<DateRangePickerProps> {}
  
    export function createStaticRanges(ranges: any[]): any[];
    export const defaultStaticRanges: any[];
  }