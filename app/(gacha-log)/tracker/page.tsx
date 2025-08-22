"use client";
import DropFileSectorV2 from "@/components/custom/DropfileSector/dropfile-sector-v2";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import {
  createMapById,
  delay,
  getArrNotDuplicates,
  objectToUrlParams,
  sortById,
} from "@/lib/utils";
import { Log } from "@/models/GachaLog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";

enum GachaType {
  Standard = "1",
  Departure = "2",
  Character = "11",
  LightCone = "12",
  FateCharacter = "21",
  FateLightCone = "22",
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
  const { setLogs } = useGachaLog();
  const [isLoading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const router = useRouter();

  async function handleCallback(authkey: string) {
    let logStorage = localStorage.getItem("logs");
    let jsonObj = JSON.parse(logStorage ?? "{}");
    const bannerId: GachaType[] = [
      GachaType.Standard,
      GachaType.Departure,
      GachaType.Character,
      GachaType.LightCone,
      GachaType.FateCharacter,
      GachaType.FateLightCone,
    ];
    try {
      var uid;
      var arrCharToAdd: Log[] = [];
      var arrStdToAdd: Log[] = [];
      var arrLcToAdd: Log[] = [];
      var arrFateToAdd: Log[] = [];
      var arrDepToAdd: Log[] = [];
      setCount(0);
      for (let id of bannerId) {
        var isEnd = false;
        var endId = undefined;
        do {
          setLoading(true);
          let result = await fetchesGachaLogs(authkey, id, endId);
          let data = result?.data?.list;
          if (data as Log[]) {
            isEnd = data.length === 0;
            endId = data.at(-1)?.id;
            if (!uid) uid = data.at(0)?.uid;
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
                case GachaType.Departure: {
                  // Store departure warp in character array since they are characters
                  // but they will be filtered by gacha_type in the UI
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
                case GachaType.FateCharacter: {
                  arrFateToAdd = arrFateToAdd.concat(
                    isAlreadyHaveUID
                      ? getArrNotDuplicates(
                          data,
                          createMapById((jsonObj[uid]?.fate as Log[]) ?? []),
                          () => {
                            isEnd = true;
                          }
                        )
                      : data
                  );
                  break;
                }
                case GachaType.FateLightCone: {
                  arrFateToAdd = arrFateToAdd.concat(
                    isAlreadyHaveUID
                      ? getArrNotDuplicates(
                          data,
                          createMapById((jsonObj[uid]?.fate as Log[]) ?? []),
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
            arrCharToAdd.length +
              arrStdToAdd.length +
              arrLcToAdd.length +
              arrFateToAdd.length +
              arrDepToAdd.length
          );
          await delay(500);
        } while (!isEnd);
      }
      if (uid) {
        const oldData = jsonObj[uid];
        const newChrArray = arrCharToAdd.concat(oldData?.character ?? []);
        const newLcArray = arrLcToAdd.concat(oldData?.lightcone ?? []);
        const newStdArray = arrStdToAdd.concat(oldData?.standard ?? []);
        const newFateArray = arrFateToAdd.concat(oldData?.fate ?? []);
        jsonObj[uid] = {
          character: newChrArray,
          lightcone: newLcArray,
          standard: newStdArray,
          fate: newFateArray,
        };
        localStorage.setItem("logs", JSON.stringify(jsonObj));
        localStorage.setItem("selectedUid", uid);
        setLogs((prevObject) => ({
          ...prevObject,
          lightCone: sortById(newLcArray),
          standard: sortById(newStdArray),
          character: sortById(newChrArray),
          fate: sortById(newFateArray),
        }));
        router.push("/tracker/character");
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
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertDialog open={isLoading}>
        <AlertDialogContent className="max-w-xs">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Loader className="animate-spin h-12 w-12 mb-4" />
            <h2 className="text-xl font-semibold">Importing Gacha Logs</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we import your data.
              {count > 0 ? ` Found ${count} new items.` : ""}
            </p>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-4">
          Import Your Gacha Logs
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          To get started, please provide your gacha log file. You can find
          instructions on how to get this file in the game&apos;s feedback
          section.
        </p>
        <DropFileSectorV2 onAuthKeyFound={handleCallback} />
      </div>
    </div>
  );
};

export default Tracker;
