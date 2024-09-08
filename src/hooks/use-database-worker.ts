import { useCallback, useEffect, useRef, useState } from "react";
import {
  DatabaseWorkerMessage,
  DatabaseWorkerMessageStatus,
} from "../shared/models/DatabaseWorkerMessage";
import DbWorker from "../workers/database.worker?sharedworker";
import { getTableAndColumns } from "../shared/sql-query";
import {
  FixedTableStructureData,
  TableStructureData,
} from "../shared/models/TableStructureData";
import { anchorClick } from "./anchor-click";

export function useDatabaseWorker() {
  const dbWorkerRef = useRef<SharedWorker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();

  const [queryData, setQueryData] = useState<any[]>([]);
  const [tableStructure, setTableStructure] = useState<FixedTableStructureData>(
    {},
  );

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

        default:
          break;
      }
    };

    return () => {
      if (dbWorkerRef.current) {
        dbWorkerRef.current.port.onmessage = null;
        // dbWorkerRef.current.port.close();
      }
    };
  }, []);

  const execSql = useCallback((query: string) => {
    setError(undefined);

    dbWorkerRef.current?.port.postMessage({
      mode: DatabaseWorkerMessageStatus.QUERYRESULT,
      query,
    });
  }, []);

  const exportDb = useCallback(() => {
    dbWorkerRef.current?.port.postMessage({
      mode: DatabaseWorkerMessageStatus.EXPORTDATABASE,
    });
  }, []);

  return {
    isReady,
    error,
    queryData,
    tableStructure,
    execSql,
    exportDb,
  };
}
