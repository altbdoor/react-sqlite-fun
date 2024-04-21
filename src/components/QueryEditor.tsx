import Stack from "@mui/material/Stack";
import { Editor, EditorFromTextArea, fromTextArea } from "codemirror";
import { useCallback, useEffect, useRef } from "react";
import { FixedTableStructureData } from "../models/TableStructureData";
import { initQuery } from "../sql-query";
import { QueryEditorBar } from "./QueryEditorBar";

import "codemirror/addon/comment/comment";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/scroll/scrollpastend";
import "codemirror/addon/selection/active-line";

export function QueryEditor({
  execSql,
  ...props
}: {
  execSql: (query: string) => void;
  isReady: boolean;
  tableStructure: FixedTableStructureData
}) {
  const containerRef = useRef(null);
  const editorRef = useRef<EditorFromTextArea>();

  const editorExecSql = useCallback(
    (query?: string) => {
      if (query) {
        editorRef.current!.setValue(query);
      }

      execSql(editorRef.current!.getValue());
    },
    [execSql],
  );

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
        "Ctrl-Enter": () => editorExecSql(),
      },
    });

    editorRef.current = editor;
    editor.setValue(initQuery);

    const handleInputRead = (instance: Editor) => {
      if (instance.state.completionActive) {
        return;
      }

      instance.showHint({
        completeSingle: false,
        // tables: { ...tableStructure }
      });
    };
    editor.on("inputRead", handleInputRead);

    return () => {
      editor.off("inputRead", handleInputRead);
      editor.toTextArea();
    };
  }, [editorExecSql]);

  return (
    <Stack height="100%" className="editor">
      <QueryEditorBar isReady={props.isReady} execSql={editorExecSql} />
      <div>{/* odd div needed for codemirror textarea */}</div>
      <textarea ref={containerRef}></textarea>
    </Stack>
  );
}
