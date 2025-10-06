import { createContext, useContext, useState, ReactNode } from "react";

type latlng = {
  lat: number;
  lng: number;
};

type MapDataContextType = {
  currentPosition: latlng | undefined;
  zoomLevel: number | undefined;
  setNewCurrentPosition: (data: latlng) => void;
  setNewZoomLevel: (data: number) => void;
};

const MapContext = createContext<MapDataContextType | undefined>(undefined);

export const MapDataProvider = ({ children }: { children: ReactNode }) => {
  const [currentPosition, setCurrentPosition] = useState<latlng>();
  const [zoomLevel, setZoomLevel] = useState<number>();

  const setNewCurrentPosition = (data: latlng) => {
    setCurrentPosition(data);
  };

  const setNewZoomLevel = (data: number) => {
    setZoomLevel(data);
  };

  return (
    <MapContext.Provider
      value={{
        currentPosition,
        zoomLevel,
        setNewCurrentPosition,
        setNewZoomLevel,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapData must be used within a MapDataProvider");
  }
  return context;
};
