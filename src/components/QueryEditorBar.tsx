import {
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDatabaseWorkerMethodsContext } from "../hooks/use-database-worker";
import { getAllTables, getTableAndColumns } from "../shared/sql-query";

interface QueryEditorBarProps {
  isReady: boolean;
  execSql: (query?: string) => void;
}

export function QueryEditorBar(props: QueryEditorBarProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [openExtras, setOpenExtras] = useState(false);

  useEffect(() => {
    if (!openExtras) {
      return;
    }

    const docClickHandler = (evt: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(evt.target as HTMLElement)
      ) {
        setOpenExtras(false);
      }
    };

    document.addEventListener("click", docClickHandler);
    return () => document.removeEventListener("click", docClickHandler);
  }, [openExtras]);

  const importFileRef = useRef<HTMLInputElement>(null);
  const { exportDb, importDb } = useDatabaseWorkerMethodsContext();

  const buttonActions = [
    { label: "Show all tables", sql: getAllTables },
    { label: "Show table structure", sql: getTableAndColumns },
    {
      label: "SQL cheatsheet",
      href: "https://www.geeksforgeeks.org/sql-cheat-sheet/",
    },
    {
      label: "About Northwind database",
      href: "https://en.wikiversity.org/wiki/Database_Examples/Northwind",
    },
    {
      label: "GitHub repository",
      href: "https://github.com/altbdoor/react-sqlite-fun",
    },
  ];

  const handleExecSql = (evt: ReactMouseEvent, sql: string) => {
    evt.preventDefault();
    props.execSql(sql);
    setOpenExtras(false);
  };

  const importFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files && evt.target.files[0];
    if (!file) {
      return;
    }

    importDb(file);
  };

  return (
    <>
      <div className="editor__actions px-2 flex items-center justify-between border-b border-neutral-content">
        <div className="flex gap-1">
          <details
            className="dropdown"
            open={openExtras}
            onToggle={(e) => setOpenExtras(e.currentTarget.open)}
            ref={detailsRef}
          >
            <summary className="btn btn-sm">Extras ⏷</summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-60 p-2 border border-neutral-content mt-1">
              {buttonActions.map((action) => (
                <li key={action.label}>
                  {action.href && (
                    <a
                      href={action.href}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      onClick={() => setOpenExtras(false)}
                    >
                      {action.label}
                    </a>
                  )}

                  {action.sql && (
                    <a
                      href="#"
                      onClick={(evt) => handleExecSql(evt, action.sql)}
                    >
                      {action.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </details>

          <button className="btn btn-sm" type="button" onClick={exportDb}>
            Export
          </button>

          <button
            className="btn btn-sm"
            type="button"
            onClick={() => importFileRef.current?.click()}
          >
            <input
              type="file"
              ref={importFileRef}
              className="hidden"
              accept=".sqlite, .sqlite3, .db"
              onChange={importFileChange}
            />
            Import
          </button>

          <div className="tooltip tooltip-bottom" data-tip="Ctrl + Enter">
            <button
              className="btn btn-sm btn-primary"
              type="button"
              onClick={() => props.execSql()}
            >
              ⚡ Run
            </button>
          </div>
        </div>

        {props.isReady ? (
          <div className="badge badge-primary">Ready</div>
        ) : (
          <div className="badge badge-neutral">Loading...</div>
        )}
      </div>
    </>
  );
}
