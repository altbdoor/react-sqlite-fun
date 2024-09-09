import { useCallback, useContext, useEffect, useRef } from "react";
import { DatabaseWorkerContext } from "../providers/database-worker-context";
import {
  DatabaseWorkerMessage,
  DatabaseWorkerMessageStatus,
} from "../shared/models/DatabaseWorkerMessage";
import {
  FixedTableStructureData,
  TableStructureData,
} from "../shared/models/TableStructureData";
import { getTableAndColumns } from "../shared/sql-query";
import DbWorker from "../workers/database.worker?sharedworker";
import { anchorClick } from "./anchor-click";

export const useDatabaseWorkerContext = () => {
  const context = useContext(DatabaseWorkerContext);
  if (!context) {
    throw new Error("invalid context");
  }
  return context;
};

export function useDatabaseWorker() {
  const { setIsReady, setError, setQueryData, setTableStructure } =
    useDatabaseWorkerContext();

  const dbWorkerRef = useRef<SharedWorker | null>(null);
  const blobRef = useRef<string>("");

  useEffect(() => {
    if (!dbWorkerRef.current) {
      dbWorkerRef.current = new DbWorker();
    }

    dbWorkerRef.current.port.onmessage = (
      evt: MessageEvent<DatabaseWorkerMessage>,
    ) => {
      switch (evt.data.status) {
        case DatabaseWorkerMessageStatus.INITERROR:
        case DatabaseWorkerMessageStatus.QUERYERROR:
          setError(evt.data.data);
          break;

        case DatabaseWorkerMessageStatus.INITREADY:
          setIsReady(true);
          dbWorkerRef.current?.port.postMessage({
            mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
            query: getTableAndColumns,
          });
          break;

        case DatabaseWorkerMessageStatus.QUERYRESULT:
          setQueryData(evt.data.data);
          dbWorkerRef.current?.port.postMessage({
            mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
            query: getTableAndColumns,
          });
          break;

        case DatabaseWorkerMessageStatus.HIDDENRESULT:
          setTableStructure(() => {
            return (evt.data.data as TableStructureData[]).reduce(
              (acc, val) => {
                acc[val.table_name] = val.column_names.split(", ");
                return acc;
              },
              {} as FixedTableStructureData,
            );
          });
          break;

        case DatabaseWorkerMessageStatus.EXPORTDATABASE:
          (() => {
            const blob = new Blob([evt.data.data], {
              type: "application/x-sqlite3",
            });

            if (blobRef.current) {
              URL.revokeObjectURL(blobRef.current);
            }

            blobRef.current = URL.createObjectURL(blob);
            anchorClick({
              href: blobRef.current,
              download: "database.sqlite",
            });
          })();
          break;

        case DatabaseWorkerMessageStatus.IMPORTDATABASE:
          dbWorkerRef.current?.port.postMessage({
            mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
            query: getTableAndColumns,
          });
          break;

        default:
          break;
      }
    };

    return () => {
      if (dbWorkerRef.current) {
        dbWorkerRef.current.port.close();
        dbWorkerRef.current = null;
      }
    };
  }, [setIsReady, setError, setQueryData, setTableStructure]);

  const execSql = useCallback(
    (query: string) => {
      setError(undefined);

      dbWorkerRef.current?.port.postMessage({
        mode: DatabaseWorkerMessageStatus.QUERYRESULT,
        query,
      });
    },
    [setError],
  );

  const exportDb = useCallback(() => {
    dbWorkerRef.current?.port.postMessage({
      mode: DatabaseWorkerMessageStatus.EXPORTDATABASE,
    });
  }, []);

  const importDb = useCallback((payload: ArrayBuffer) => {
    dbWorkerRef.current?.port.postMessage({
      mode: DatabaseWorkerMessageStatus.IMPORTDATABASE,
      payload,
    });
  }, []);

  return {
    execSql,
    exportDb,
    importDb,
  };
}
