import { useEffect, useRef, useState } from "react";
import { Editor } from "./components/Editor";
import DbWorker from "./database-worker?sharedworker";
import {
  DatabaseWorkerMessage,
  DatabaseWorkerMessageStatus,
} from "./models/DatabaseWorkerMessage";
import { ErrorBox } from "./components/ErrorBox";
import { RenderTables } from "./components/RenderTables";
import { TableStructure } from "./components/TableStructure";
import { getTableAndColumns } from "./sql-query";
import { TableStructureData } from "./models/TableStructureData";

function App() {
  const workerRef = useRef<SharedWorker>();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();
  const [queryData, setQueryData] = useState<any[]>([]);
  const [tableStructure, setTableStructure] = useState<TableStructureData[]>(
    [],
  );

  useEffect(() => {
    const worker = new DbWorker();
    worker.port.onmessage = (evt) => {
      const response: DatabaseWorkerMessage = evt.data;

      switch (response.status) {
        case DatabaseWorkerMessageStatus.INITERROR:
        case DatabaseWorkerMessageStatus.QUERYERROR:
          setError(response.data);
          break;

        case DatabaseWorkerMessageStatus.INITREADY:
          setIsReady(true);
          worker.port.postMessage({
            mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
            query: getTableAndColumns,
          });
          break;

        case DatabaseWorkerMessageStatus.QUERYRESULT:
          setQueryData(response.data);
          worker.port.postMessage({
            mode: DatabaseWorkerMessageStatus.HIDDENRESULT,
            query: getTableAndColumns,
          });
          break;

        case DatabaseWorkerMessageStatus.HIDDENRESULT:
          setTableStructure(response.data);
          break;

        default:
          break;
      }
    };

    workerRef.current = worker;
    return () => worker.port.close();
  }, []);

  const execSql = (query: string) => {
    setError(undefined);

    workerRef.current!.port.postMessage({
      mode: DatabaseWorkerMessageStatus.QUERYRESULT,
      query,
    });
  };

  return (
    <div className="d-flex vh-100">
      <div className="w-50 h-100 border-end border-secondary-subtle">
        <div className="h-100 d-flex flex-column">
          <Editor execSql={execSql} isReady={isReady} />
          <TableStructure data={tableStructure} />
        </div>
      </div>
      <div className="w-50 h-100 p-3 overflow-y-auto">
        {!!error && <ErrorBox error={error} />}
        <RenderTables data={queryData} />
      </div>
    </div>
  );
}

export default App;
