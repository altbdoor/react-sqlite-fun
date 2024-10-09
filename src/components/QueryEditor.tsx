import { Editor, EditorFromTextArea, fromTextArea } from "codemirror";
import { useCallback, useEffect, useRef } from "react";
import { useDatabaseWorker } from "../hooks/use-database-worker";
import { FixedTableStructureData } from "../shared/models/TableStructureData";
import { initQuery } from "../shared/sql-query";
import { QueryEditorBar } from "./QueryEditorBar";

import "codemirror/addon/comment/comment";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/scroll/scrollpastend";
import "codemirror/addon/selection/active-line";

interface QueryEditorProps {
  isReady: boolean;
  tableStructure: FixedTableStructureData;
}

export function QueryEditor({ tableStructure, ...props }: QueryEditorProps) {
  const containerRef = useRef(null);
  const editorRef = useRef<EditorFromTextArea>();
  const { execSql } = useDatabaseWorker();

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
    });

    editorRef.current = editor;
    editor.setValue(initQuery);

    return () => editor.toTextArea();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      let theme = "default";

      if (mediaQuery.matches) {
        theme = "monokai";
      }

      editorRef.current?.setOption("theme", theme);
    };

    mediaQuery.addEventListener("change", handleThemeChange);
    handleThemeChange();

    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.setOption("extraKeys", {
      "Ctrl-Space": "autocomplete",
      "Ctrl-/": "toggleComment",
      "Ctrl-Enter": () => editorExecSql(),
    });
  }, [editorExecSql]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const handleInputRead = (instance: Editor) => {
      if (instance.state.completionActive) {
        return;
      }

      instance.showHint({
        completeSingle: false,
        tables: { ...tableStructure },
      });
    };

    editorRef.current.on("inputRead", handleInputRead);
    return () => editorRef.current?.off("inputRead", handleInputRead);
  }, [tableStructure]);

  return (
    <div className="h-full editor">
      <QueryEditorBar isReady={props.isReady} execSql={editorExecSql} />
      <div>{/* odd div needed for codemirror textarea */}</div>
      <textarea ref={containerRef}></textarea>
    </div>
  );
}
