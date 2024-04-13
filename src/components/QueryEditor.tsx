import { Stack } from "@mui/material";
import { EditorFromTextArea, fromTextArea } from "codemirror";
import { useEffect, useRef } from "react";
import { initQuery } from "../sql-query";
import { QueryEditorBar } from "./QueryEditorBar";

import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/scroll/scrollpastend";
import "codemirror/addon/selection/active-line";
import "codemirror/addon/comment/comment";

export function QueryEditor(props: {
  execSql: (query: string) => void;
  isReady: boolean;
}) {
  const containerRef = useRef(null);
  const editorRef = useRef<EditorFromTextArea>();

  useEffect(() => {
    const editor = fromTextArea(containerRef.current!, {
      mode: "text/x-sqlite",
      lineNumbers: true,
      lineWrapping: true,
      inputStyle: "contenteditable",
      lineSeparator: "\n",
      styleActiveLine: { nonEmpty: true },
      scrollPastEnd: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-/": "toggleComment",
        "Ctrl-Enter": () => execSql(),
      },
    });

    editorRef.current = editor;
    editor.setValue(initQuery);

    return () => editor.toTextArea();
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
      <div>{/* odd div needed for codemirror textarea */}</div>
      <textarea ref={containerRef}></textarea>
    </Stack>
  );
}
