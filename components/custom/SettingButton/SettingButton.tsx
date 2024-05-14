import { Button } from "@/components/ui/button";
import * as React from "react";
import { IoSettingsSharp } from "react-icons/io5";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Log } from "@/models/GachaLog";
import { sortById } from "@/lib/utils";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import { useState } from "react";

interface Props {}

export const SettingButton: React.FC<Props> = (props) => {
  const { logs, setLogs } = useGachaLog();
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    let uid = localStorage.getItem("selectedUid");
    let logs = localStorage.getItem("logs");
    var availableUser: string[] = [];

    if (logs) {
      let jsonObj = JSON.parse(logs);
      Object.keys(jsonObj).forEach((key) => {
        availableUser.push(key);
      });
      setUsers(availableUser);
      if (uid) {
        setSelectedUid(uid);
      } else if (availableUser.length > 0) {
        setSelectedUid(availableUser[0]);
      }
    }
  }, []);

  function setLogsByUID(uid: string, jsonObj: any) {
    const characterLogs = jsonObj[uid].character as Log[] | undefined;
    const lightconeLogs = jsonObj[uid].lightcone as Log[] | undefined;
    const standardLogs = jsonObj[uid].standard as Log[] | undefined;

    setLogs((prevObject) => ({
      ...prevObject,
      lightCone: sortById(lightconeLogs ?? []),
      standard: sortById(standardLogs ?? []),
      character: sortById(characterLogs ?? []),
    }));
  }

  function onSave() {
    let logs = localStorage.getItem("logs");
    if (logs) {
      let jsonObj = JSON.parse(logs);
      if (selectedUid) {
        localStorage.setItem("selectedUid", selectedUid);
        setLogsByUID(selectedUid, jsonObj);
      }
    }
  }

  return (
    <div className=" self-center">
      <AlertDialog>
        <AlertDialogTrigger>
          <Button asChild variant={"ghost"} size={"icon"} className="p-2">
            <IoSettingsSharp />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Settings</AlertDialogTitle>
            <div className=" inline-flex ">
              <div className="self-center pr-[10px]">Select profile :</div>
              <Select
                value={selectedUid}
                onValueChange={(uid) => setSelectedUid(uid)}
              >
                <SelectTrigger
                  className="w-[180px]"
                  disabled={users.length === 0}
                >
                  <SelectValue placeholder="No Data" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user, index) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onSave} disabled={users.length === 0}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
