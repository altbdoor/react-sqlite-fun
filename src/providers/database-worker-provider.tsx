import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { anchorClick } from "../hooks/anchor-click";
import {
  DatabaseWorkerInputMessage,
  DatabaseWorkerMessageStatus,
  DatabaseWorkerOutputMessage,
} from "../shared/models/DatabaseWorkerMessage";
import { FixedTableStructureData } from "../shared/models/TableStructureData";
import { getTableAndColumns } from "../shared/sql-query";
import DbWorker from "../workers/database.worker?sharedworker";
import { DatabaseWorkerContext } from "./database-worker-context";
import { QueryData } from "../shared/models/QueryData";

export const DatabaseWorkerProvider = ({ children }: PropsWithChildren) => {
  const dbWorkerRef = useRef<SharedWorker>(null);
  const blobRef = useRef<string>("");

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();

  const [queryData, setQueryData] = useState<QueryData>([]);
  const [tableStructure, setTableStructure] = useState<FixedTableStructureData>(
    {},
  );

  const sendPortWrapper =
    (port?: MessagePort) => (data: DatabaseWorkerInputMessage) => {
      if (!port) {
        return;
      }

      port.postMessage(data);
    };

  useEffect(() => {
    if (!dbWorkerRef.current) {
      dbWorkerRef.current = new DbWorker();
    }

    dbWorkerRef.current.port.onmessage = (
      evt: MessageEvent<DatabaseWorkerOutputMessage>,
    ) => {
      const sendPort = sendPortWrapper(dbWorkerRef.current?.port);

      if (
        evt.data.status === DatabaseWorkerMessageStatus.INITERROR ||
        evt.data.status === DatabaseWorkerMessageStatus.QUERYERROR
      ) {
        setError(evt.data.data);
        return;
      }

      if (evt.data.status === DatabaseWorkerMessageStatus.INITREADY) {
        setIsReady(true);
        sendPort({
          mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
          query: getTableAndColumns,
        });
        return;
      }

      if (evt.data.status === DatabaseWorkerMessageStatus.QUERYRESULT) {
        setQueryData(evt.data.data);
        sendPort({
          mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
          query: getTableAndColumns,
        });
        return;
      }

      if (evt.data.status === DatabaseWorkerMessageStatus.HIDDENRESULT) {
        setTableStructure(evt.data.data);
        return;
      }

      if (evt.data.status === DatabaseWorkerMessageStatus.EXPORTDATABASE) {
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
        return;
      }

      if (evt.data.status === DatabaseWorkerMessageStatus.IMPORTDATABASE) {
        sendPort({
          mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
          query: getTableAndColumns,
        });
        return;
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

    sendPortWrapper(dbWorkerRef.current?.port)({
      mode: DatabaseWorkerMessageStatus.QUERYRESULT,
      query,
    });
  }, []);

  const exportDb = useCallback(() => {
    sendPortWrapper(dbWorkerRef.current?.port)({
      mode: DatabaseWorkerMessageStatus.EXPORTDATABASE,
    });
  }, []);

  const importDb = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        sendPortWrapper(dbWorkerRef.current?.port)({
          mode: DatabaseWorkerMessageStatus.IMPORTDATABASE,
          payload: reader.result as ArrayBuffer,
        });
      }
    };
    reader.readAsArrayBuffer(file);
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
