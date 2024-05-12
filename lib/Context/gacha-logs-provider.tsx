"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Log } from "@/models/GachaLog";
// Define the type for your object
interface GachaLogType {
  uid: string;
  character: Log[];
  lightCone: Log[];
  standard: Log[];
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
  function sortByKey(list: Log[]) {
    return list.sort((a, b) => b.id.localeCompare(a.id));
  }
  const [logs, setLogs] = useState<GachaLogType>({
    uid: "",
    character: [],
    lightCone: [],
    standard: [],
  });

  const [selectedUid, setSelectedUid] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<string[]>([]);

  function setLogsByUID(uid: string, jsonObj: any) {
    const characterLogs = jsonObj[uid].character as Log[] | undefined;
    const lightconeLogs = jsonObj[uid].lightcone as Log[] | undefined;
    const standardLogs = jsonObj[uid].standard as Log[] | undefined;

    // console.log(characterLogs);
    // console.log(lightconeLogs);
    // console.log(standardLogs);

    initLogs(uid, characterLogs ?? [], lightconeLogs ?? [], standardLogs ?? []);
  }

  useEffect(() => {
    let uid = localStorage.getItem("selectedUid");
    let logs = localStorage.getItem("logs");
    var availableUser: string[] = [];

    if (logs) {
      let jsonObj = JSON.parse(logs);

      Object.keys(jsonObj).forEach((key) => {
        availableUser.push(key);
      });

      setUsers(availableUser);

      if (selectedUid) {
        setLogsByUID(selectedUid, jsonObj);
      }
    }

    if (uid) {
      setSelectedUid(uid);
    } else if (availableUser.length > 0) {
      localStorage.setItem("selectedUid", availableUser[0]);
    }
  }, [selectedUid]);

  const initLogs = (
    uid: string,
    character: Log[],
    lightCone: Log[],
    standard: Log[]
  ) => {
    setLogs((prevObject) => ({
      ...prevObject,
      uid: uid,
      lightCone: sortByKey(lightCone),
      standard: sortByKey(standard),
      character: sortByKey(character),
    }));
  };

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
