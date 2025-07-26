"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Log } from "@/models/GachaLog";
import { sortById } from "../utils";
// Define the type for your object
interface GachaLogType {
  character: Log[];
  lightCone: Log[];
  standard: Log[];
  fate: Log[];
}

// Define the context type
interface GachaLogContextType {
  logs: GachaLogType;
  setLogs: React.Dispatch<React.SetStateAction<GachaLogType>>;
}

// Create the context
const GachaLogContext = createContext<GachaLogContextType | undefined>(
  undefined
);

// Create a provider component
export const GachaLogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [logs, setLogs] = useState<GachaLogType>({
    character: [],
    lightCone: [],
    standard: [],
    fate: [],
  });

  function setLogsByUID(uid: string, jsonObj: any) {
    const characterLogs = jsonObj[uid]?.character as Log[] | undefined;
    const lightconeLogs = jsonObj[uid]?.lightcone as Log[] | undefined;
    const standardLogs = jsonObj[uid]?.standard as Log[] | undefined;
    const fateLogs = jsonObj[uid]?.fate as Log[] | undefined;

    setLogs((prevObject) => ({
      ...prevObject,
      lightCone: sortById(lightconeLogs ?? []),
      standard: sortById(standardLogs ?? []),
      character: sortById(characterLogs ?? []),
      fate: sortById(fateLogs ?? []),
    }));
  }

  useEffect(() => {
    let uid = localStorage.getItem("selectedUid");
    let logs = localStorage.getItem("logs");
    var availableUser: string[] = [];

    if (logs) {
      try {
        let jsonObj = JSON.parse(logs);
        Object.keys(jsonObj).forEach((key) => {
          availableUser.push(key);
        });
        if (uid) {
          setLogsByUID(uid, jsonObj);
        } else if (availableUser.length > 0) {
          localStorage.setItem("selectedUid", availableUser[0]);
          setLogsByUID(availableUser[0], jsonObj);
        }
      } catch (error) {
        console.error("Failed to parse logs from localStorage:", error);
        // Clear corrupted data
        // localStorage.removeItem("logs");
        // localStorage.removeItem("selectedUid");
        // setLogs({ character: [], lightCone: [], standard: [], fate: [] });
      }
    }
  }, []);

  return (
    <GachaLogContext.Provider value={{ logs, setLogs }}>
      {children}
    </GachaLogContext.Provider>
  );
};

// Custom hook to consume the context
export const useGachaLog = (): GachaLogContextType => {
  const context = useContext(GachaLogContext);
  if (!context) {
    throw new Error("useMyObject must be used within a MyObjectProvider");
  }
  return context;
};
