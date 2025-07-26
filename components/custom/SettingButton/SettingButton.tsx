"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import { Log } from "@/models/GachaLog";
import { removeItem, sortById } from "@/lib/utils";

export const SettingButton = () => {
  const { setLogs } = useGachaLog();
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | undefined>(undefined);
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (isProfileDialogOpen) {
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
    }
  }, [isProfileDialogOpen]);

  function setLogsByUID(uid: string | undefined, jsonObj: any) {
    const characterLogs = jsonObj[`${uid}`]?.character as Log[] | undefined;
    const lightconeLogs = jsonObj[`${uid}`]?.lightcone as Log[] | undefined;
    const standardLogs = jsonObj[`${uid}`]?.standard as Log[] | undefined;
    const fateLogs = jsonObj[`${uid}`]?.fate as Log[] | undefined;

    setLogs({
      lightCone: sortById(lightconeLogs ?? []),
      standard: sortById(standardLogs ?? []),
      character: sortById(characterLogs ?? []),
      fate: sortById(fateLogs ?? []),
    });
  }

  function onProfileSelect(uid: string) {
    let logs = localStorage.getItem("logs");
    if (logs && uid) {
      let jsonObj = JSON.parse(logs);
      localStorage.setItem("selectedUid", uid);
      setSelectedUid(uid);
      setLogsByUID(uid, jsonObj);
    }
  }

  function onDeleteProfile() {
    let logs = localStorage.getItem("logs");
    var jsonObj = JSON.parse(logs ?? "{}");
    let logByUid = jsonObj[`${selectedUid}`];
    if (logByUid && selectedUid) {
      let newArr = removeItem<string>(users, selectedUid);
      setUsers(newArr);
      let newUIDToSelect = newArr?.at(0);

      delete jsonObj[`${selectedUid}`];
      localStorage.setItem("logs", JSON.stringify(jsonObj));

      if (newUIDToSelect) {
        localStorage.setItem("selectedUid", newUIDToSelect);
        setSelectedUid(newUIDToSelect);
        setLogsByUID(newUIDToSelect, jsonObj);
      } else {
        localStorage.removeItem("selectedUid");
        localStorage.removeItem("logs");
        setSelectedUid(undefined);
        setLogsByUID(undefined, {});
      }
    }
  }

  const handleClearAllData = () => {
    localStorage.removeItem("logs");
    localStorage.removeItem("selectedUid");
    setLogsByUID(undefined, {});
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Dialog open={isProfileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Manage Profiles
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Profiles</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Select
                  value={selectedUid}
                  onValueChange={(uid) => {
                    onProfileSelect(uid);
                  }}
                >
                  <SelectTrigger disabled={users.length === 0}>
                    <SelectValue placeholder="No Data" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    disabled={users.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete profile {selectedUid}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your profile and remove your
                      data from this browser.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteProfile}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600"
              onSelect={(e) => e.preventDefault()}
            >
              Clear All Data
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete ALL
                gacha data for ALL profiles.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllData}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <DropdownMenuSeparator />
        <DropdownMenuItem>About</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
