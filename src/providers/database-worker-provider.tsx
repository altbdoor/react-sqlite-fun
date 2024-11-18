import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { anchorClick } from "../hooks/anchor-click";
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
import { DatabaseWorkerContext } from "./database-worker-context";

export const DatabaseWorkerProvider = ({ children }: PropsWithChildren) => {
  const dbWorkerRef = useRef<SharedWorker>(null);
  const blobRef = useRef<string>("");

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();

  const [queryData, setQueryData] = useState<any[]>([]);
  const [tableStructure, setTableStructure] = useState<FixedTableStructureData>(
    {},
  );

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
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
      }

      if (dbWorkerRef.current) {
        dbWorkerRef.current.port.close();
        dbWorkerRef.current = null;
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

  const importDb = useCallback((file: File) => {
    const fr = new FileReader();
    fr.onload = () => {
      if (fr.result) {
        const frBuffer = fr.result as ArrayBuffer;

        dbWorkerRef.current?.port.postMessage({
          mode: DatabaseWorkerMessageStatus.IMPORTDATABASE,
          frBuffer,
        });
      }
    };
    fr.readAsArrayBuffer(file);
  }, []);

  return (
    <DatabaseWorkerContext
      value={{
        isReady,
        error,
        queryData,
        tableStructure,
        execSql,
        exportDb,
        importDb,
      }}
    >
      {children}
    </DatabaseWorkerContext>
  );
};
