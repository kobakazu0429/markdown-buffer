import { pick } from "lodash-es";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../types";
import { useWriter } from "../contexts/WriterContext";
import * as actions from "../reducers";
import { useAction, useUpdate } from "./helpers";

export function KeyHandler() {
  const writer = useWriter();
  const update = useUpdate();
  const { showPreview, raw, editorMode } = useSelector((s: AppState) =>
    pick(s, ["editorMode", "showPreview", "raw"])
  );
  const updateShowPreview = useAction(actions.updateShowPreview);
  const changeEditorMode = useAction(actions.changeEditorMode);

  useEffect(() => {
    const onWindowKeyDown = async (ev: KeyboardEvent) => {
      const meta = ev.metaKey || ev.ctrlKey;
      if (meta && ev.key.toLocaleLowerCase() === "o") {
        ev.preventDefault();
        try {
          // @ts-ignore
          const readHandler = await window.chooseFileSystemEntries();
          const file = await readHandler.getFile();
          const currentText = await file.text();
          if (currentText != null) {
            update(currentText);
          }
        } catch (err) {
          console.log("aborted", err);
        }
      }

      // cmd + s
      if (meta && ev.key.toLocaleLowerCase() === "s") {
        ev.preventDefault();
        await writer.open();
        await writer.write(raw);
        return;
      }

      // Ctrl+1
      if (ev.ctrlKey && ev.key === "1") {
        ev.preventDefault();
        const nextShowPreview = !showPreview;
        updateShowPreview(nextShowPreview);
        return;
      }
      // Ctrl+Shift+E
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLocaleLowerCase() === "e") {
        ev.preventDefault();
        if (editorMode === "textarea") {
          changeEditorMode("codemirror");
        } else if (editorMode === "codemirror") {
          changeEditorMode("textarea");
        }
        return;
      }
      // Ctrl+Shift+F
      if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "f") {
        ev.preventDefault();
        update(raw);
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  });
  return <></>;
}