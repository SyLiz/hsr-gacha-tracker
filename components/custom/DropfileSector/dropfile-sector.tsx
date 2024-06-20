"use client";
import { useRef } from "react";
import { FileDrop } from "react-file-drop";
import { promises as fs } from "fs";
import { objectToUrlParams } from "@/lib/utils";

interface Props {
  callBackAuthKey: (key: string) => void;
}

function findWordIndex(sentence: string, word: string) {
  const index = sentence.indexOf(word);
  return index !== -1 ? index : null;
}

export default function DropFileComponent(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function fileHandler(
    files: FileList | null,
    event: React.DragEvent<HTMLDivElement> | undefined
  ) {
    console.log(event);

    if (files != null) {
      try {
        let reader = new FileReader();
        reader.onload = (e) => {
          const data = reader.result;
          if (typeof data === "string") {
            const array = data.split(/\r?\n/);
            const filtered = array.filter((word: string) =>
              word.includes("getGachaLog")
            );
            const lastItem = filtered[filtered.length - 1];
            const fIndex = findWordIndex(lastItem, "1/0/");
            const lIndex = findWordIndex(lastItem, "&end_id");
            if (fIndex && lIndex) {
              let result = lastItem.substring(fIndex + 4, lIndex);
              const params = Object.fromEntries(new URLSearchParams(result));
              let authkey = encodeURIComponent(params["authkey"]);
              //let authkey = params["authkey"];
              // if (authkey) {
              //   props.callBackAuthKey(authkey);
              // }
            }
          }
        };
        reader.readAsText(files[0]);
      } catch (e) {
        console.log(e);
      }
    }
  }

  const filePicker = () => {
    if (inputRef.current !== null) {
      inputRef.current.click();
    }
  };

  return (
    <div className="h-full ">
      <div className="p-[32px] ">
        <FileDrop onDrop={fileHandler} onTargetClick={filePicker}>
          <div className="h-[400px] rounded-3xl bg-white flex justify-center border-dashed border-2 border-indigo-600 cursor-pointer	">
            <p className="self-center text-center">
              DRAG FILE HERE <br /> OR <span>BROWSE</span>
            </p>
          </div>
          <input
            value=""
            style={{ visibility: "hidden", opacity: 0 }}
            ref={inputRef}
            multiple={false}
            type="file"
            onChange={(e) => fileHandler(e.target.files, undefined)}
          />
        </FileDrop>
      </div>
    </div>
  );
}
