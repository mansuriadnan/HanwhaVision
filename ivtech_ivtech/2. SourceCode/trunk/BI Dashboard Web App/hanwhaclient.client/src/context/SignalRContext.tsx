import { createContext, useContext, useState, ReactNode } from "react";

type SignalRContextType = {
  IsToday: boolean;
  setIsTodayValue: (data: boolean) => void;
  IsDisplayLoader: boolean;
  triggerRefresh: (state: boolean) => void;
};

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider = ({ children }: { children: ReactNode }) => {
  const [IsToday, setIsToday] = useState<boolean>(false);
  const [IsDisplayLoader, setIsDisplayLoader] = useState<boolean>(false);

  const setIsTodayValue = (data: boolean) => {
    setIsToday(data);
  };

   const triggerRefresh = (state:boolean) => {
    setIsDisplayLoader(state);
  };


  return (
    <SignalRContext.Provider
      value={{
        IsToday,
        setIsTodayValue,
        IsDisplayLoader,
        triggerRefresh,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalRContext = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalRContext must be used within a SignalRProvider");
  }
  return context;
};
