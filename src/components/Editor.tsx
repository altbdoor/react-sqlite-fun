import { EditorFromTextArea, fromTextArea } from "codemirror";
import { useEffect, useRef } from "react";
import { getAllTables, getTableAndColumns, initQuery } from "../sql-query";

import "codemirror/addon/hint/show-hint";
// import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/scroll/scrollpastend";
import "codemirror/addon/selection/active-line";
// import "codemirror/lib/codemirror.css";

export function Editor(props: {
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
      extraKeys: { "Ctrl-Space": "autocomplete" },
      scrollPastEnd: true,
    });

    editorRef.current = editor;
    editor.setValue(initQuery);

    return () => editor.toTextArea();
  }, []);

  const buttonActions = [
    { label: "Show all tables", sql: getAllTables },
    { label: "Show table structure", sql: getTableAndColumns },
  ];

  const execSql = () => {
    props.execSql(editorRef.current!.getValue());
  };

  return (
    <div className="editor d-flex flex-column vh-50">
      <div className="editor__actions d-flex p-1 align-items-center">
        {buttonActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              editorRef.current!.setValue(action.sql);
              execSql();
            }}
          >
            {action.label}
          </button>
        ))}

        <button
          type="button"
          className="btn btn-outline-success"
          onClick={execSql}
        >
          ⚡ Run
        </button>

        <div className="ms-auto">
          {!props.isReady && (
            <span className="badge text-bg-secondary">Loading...</span>
          )}
          {props.isReady && (
            <span className="badge text-bg-success">Ready</span>
          )}
        </div>
      </div>
      <textarea ref={containerRef}></textarea>
    </div>
  );
}
