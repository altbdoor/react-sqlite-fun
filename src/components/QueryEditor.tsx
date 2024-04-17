import { Stack } from "@mui/material";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef } from "react";
import { initQuery } from "../sql-query";
import { QueryEditorBar } from "./QueryEditorBar";

import "../monaco-worker.ts";

export function QueryEditor(props: {
  execSql: (query: string) => void;
  isReady: boolean;
}) {
  const containerRef = useRef(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>();

  // useEffect(() => {
  //   const editor = fromTextArea(containerRef.current!, {
  //     mode: "text/x-sqlite",
  //     lineNumbers: true,
  //     lineWrapping: true,
  //     inputStyle: "contenteditable",
  //     lineSeparator: "\n",
  //     styleActiveLine: { nonEmpty: true },
  //     scrollPastEnd: true,
  //     extraKeys: {
  //       "Ctrl-Space": "autocomplete",
  //       "Ctrl-/": "toggleComment",
  //       "Ctrl-Enter": () => execSql(),
  //     },
  //   });

  //   editorRef.current = editor;
  //   editor.setValue(initQuery);

  //   return () => editor.toTextArea();
  // }, []);

  useEffect(() => {
    const editorInstance = editor.create(containerRef.current!, {
      value: initQuery,
      language: "sql",
      minimap: { enabled: false },
      wordWrap: "on",
      renderWhitespace: "all",
      fontSize: 16,
    });

    editorRef.current = editorInstance;
    return () => editorInstance.dispose();
  }, []);

  const execSql = (query?: string) => {
    if (!editorRef.current) {
      return;
    }

    if (query) {
      editorRef.current.setValue(query);
    }

    props.execSql(editorRef.current.getValue());
  };

  return (
    <Stack height="100%" className="editor">
      <QueryEditorBar isReady={props.isReady} execSql={execSql} />
      <div ref={containerRef} style={{ height: "100%" }}></div>
    </Stack>
  );
}
