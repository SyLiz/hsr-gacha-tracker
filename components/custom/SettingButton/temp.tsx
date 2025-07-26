import { Button } from "@/components/ui/button";
import * as React from "react";
import { IoSettingsSharp } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
import { removeItem, sortById } from "@/lib/utils";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { Settings } from "lucide-react";

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

  function setLogsByUID(uid: string | undefined, jsonObj: any) {
    const characterLogs = jsonObj[`${uid}`]?.character as Log[] | undefined;
    const lightconeLogs = jsonObj[`${uid}`]?.lightcone as Log[] | undefined;
    const standardLogs = jsonObj[`${uid}`]?.standard as Log[] | undefined;

    setLogs((prevObject) => ({
      ...prevObject,
      lightCone: sortById(lightconeLogs ?? []),
      standard: sortById(standardLogs ?? []),
      character: sortById(characterLogs ?? []),
    }));
  }

  function onSave(uid: string | undefined) {
    let logs = localStorage.getItem("logs");
    if (logs && uid) {
      let jsonObj = JSON.parse(logs);
      if (uid) {
        localStorage.setItem("selectedUid", uid);
        setLogsByUID(uid, jsonObj);
      }
    }
  }

  function onDelete() {
    let logs = localStorage.getItem("logs");
    var jsonObj = JSON.parse(logs ?? "{}");
    let logByUid = jsonObj[`${selectedUid}`];
    if (logByUid && selectedUid) {
      let newArr = removeItem<string>(users, selectedUid);
      setUsers(newArr);
      let newUIDToSelect = newArr?.at(0);
      setSelectedUid(newUIDToSelect);
      setLogsByUID(newUIDToSelect, jsonObj);
      delete jsonObj[`${selectedUid}`];
      localStorage.setItem("logs", JSON.stringify(jsonObj));
      if (newUIDToSelect) {
        localStorage.setItem("selectedUid", newUIDToSelect);
      } else {
        localStorage.removeItem("selectedUid");
        localStorage.removeItem("logs");
      }
    }
  }

  return (
    <div className=" self-center">
      <Dialog>
        <DialogTrigger>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <div className=" inline-flex space-x-4">
              <div className="self-center pr-[10px]">Select profile :</div>
              <Select
                value={selectedUid}
                onValueChange={(uid) => {
                  setSelectedUid(uid);
                  onSave(uid);
                }}
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
              <AlertDialog>
                <AlertDialogTrigger disabled={users.length === 0}>
                  <div className=" place-items-start	">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={users.length === 0}
                    >
                      <FaRegTrashAlt />
                    </Button>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure to delete {`${selectedUid}`}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your profile and remove your
                      data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="size-[24px]"> </div>
          </DialogHeader>
          {/* <div className="flex flex-row justify-end space-x-4">
            <AlertDialog>
              <AlertDialogTrigger disabled={users.length === 0}>
                <div className=" place-items-start	">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={users.length === 0}
                  >
                    <FaRegTrashAlt />
                  </Button>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure to delete {`${selectedUid}`}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your profile and remove your
                    data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="grow "></div>
            <div>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </div>
            <div>
              <DialogClose asChild>
                <Button
                  className=" px-10"
                  onClick={onSave}
                  disabled={users.length === 0}
                >
                  OK
                </Button>
              </DialogClose>
            </div>
          </div> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};
