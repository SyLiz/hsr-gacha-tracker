"use client";
import DropFileComponent from "@/components/custom/DropfileSector/dropfile-sector";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import {
  createMapById,
  delay,
  getArrNotDuplicates,
  objectToUrlParams,
  sortByKey,
} from "@/lib/utils";
import { Log } from "@/models/GachaLog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

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

enum GachaType {
  Standard = "1",
  Character = "11",
  LightCone = "12",
}

interface MIHOYOObject {
  data: any;
  message: string;
  retcode: number;
}

async function fetchesGachaLogs(
  authkey: string,
  gacha_type: string,
  endId?: string
): Promise<any> {
  var obj = {
    gacha_type: gacha_type,
    end_id: endId ?? "",
    authkey: authkey,
  } as any;
  const response = await fetch(`/api/gacha_record?${objectToUrlParams(obj)}`);
  const json = await response.json();
  const mihoyoJson = json as MIHOYOObject;
  if (mihoyoJson.data === null) {
    throw Error(mihoyoJson.message, { cause: json });
  }
  return json;
}

interface Props {}

const Tracker = (props: Props) => {
  const { toast } = useToast();
  const { logs, setLogs } = useGachaLog();
  const [isLoading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const router = useRouter();

  var arrCharToAdd: Log[] = [];
  var arrStdToAdd: Log[] = [];
  var arrLcToAdd: Log[] = [];

  async function handleCallback(authkey: string) {
    let logStorage = localStorage.getItem("logs");
    let jsonObj = JSON.parse(logStorage ?? "{}");
    const bannerId: GachaType[] = [
      GachaType.Standard,
      GachaType.Character,
      GachaType.LightCone,
    ];
    try {
      var uid;
      arrCharToAdd = [];
      arrStdToAdd = [];
      arrLcToAdd = [];
      setCount(0);
      for (let id of bannerId) {
        var isEnd = false;
        var endId = undefined;
        do {
          setLoading(true);
          let result = await fetchesGachaLogs(authkey, id, endId);
          let data = result?.data?.list;
          if (data as Log[]) {
            endId = data.at(-1)?.id;
            if (!uid) uid = data.at(0)?.uid;
            isEnd = data.length === 0;
            if (uid) {
              let isAlreadyHaveUID = uid in jsonObj;
              switch (id) {
                case GachaType.Character: {
                  arrCharToAdd = arrCharToAdd.concat(
                    isAlreadyHaveUID
                      ? getArrNotDuplicates(
                          data,
                          createMapById(jsonObj[uid].character as Log[]),
                          () => {
                            isEnd = true;
                          }
                        )
                      : data
                  );
                  break;
                }
                case GachaType.Standard: {
                  arrStdToAdd = arrStdToAdd.concat(
                    isAlreadyHaveUID
                      ? getArrNotDuplicates(
                          data,
                          createMapById(jsonObj[uid].standard as Log[]),
                          () => {
                            isEnd = true;
                          }
                        )
                      : data
                  );
                  break;
                }
                case GachaType.LightCone: {
                  arrLcToAdd = arrLcToAdd.concat(
                    isAlreadyHaveUID
                      ? getArrNotDuplicates(
                          data,
                          createMapById(jsonObj[uid].lightcone as Log[]),
                          () => {
                            isEnd = true;
                          }
                        )
                      : data
                  );
                  break;
                }
              }
            }
          }
          setCount(
            arrCharToAdd.length + arrStdToAdd.length + arrLcToAdd.length
          );
          await delay(1000);
        } while (!isEnd);
      }
      if (uid) {
        const oldData = jsonObj[uid];
        const newChrArray = arrCharToAdd.concat(oldData?.character ?? []);
        const newLcArray = arrLcToAdd.concat(oldData?.lightcone ?? []);
        const newStdArray = arrStdToAdd.concat(oldData?.standard ?? []);
        jsonObj[uid] = {
          character: newChrArray,
          lightcone: newLcArray,
          standard: newStdArray,
        };
        localStorage.setItem("logs", JSON.stringify(jsonObj));
        initLogs(uid, newChrArray, newLcArray, newStdArray);
        router.push("/tracker/character");
        console.log(jsonObj);
      }
      setLoading(false);
      setCount(0);
    } catch (e) {
      setLoading(false);
      setCount(0);
      let error = e as Error;
      let mihoyoError = error.cause as MIHOYOObject;
      if (mihoyoError) {
        toast({
          variant: "destructive",
          title: "Error: " + mihoyoError.message,
          description: "Please try again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Unexpected error has occurred",
          description: "Please contact your System Administrator.",
        });
        console.log(e);
      }
    }
  }

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
    <>
      <AlertDialog open={isLoading} onOpenChange={setLoading}>
        <AlertDialogContent className="max-w-[400px]">
          <div className=" flex flex-col justify-center text-center">
            <div className="text-4xl">Please wait</div>
            <div>Importing{count > 0 ? ` ${count} items` : ""}...</div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-screen">
        <DropFileComponent callBackAuthKey={handleCallback} />{" "}
      </div>
    </>
  );
};

export default Tracker;
