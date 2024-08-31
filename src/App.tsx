import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { QueryEditor } from "./components/QueryEditor";
import { RenderTables } from "./components/RenderTables";
import { TableStructure } from "./components/TableStructure";
import DbWorker from "./database.worker?sharedworker";
import {
  DatabaseWorkerMessage,
  DatabaseWorkerMessageStatus,
} from "./models/DatabaseWorkerMessage";
import {
  FixedTableStructureData,
  TableStructureData,
} from "./models/TableStructureData";
import { getTableAndColumns } from "./sql-query";
import { anchorClick } from "./hooks/anchor-click";

function App() {
  const { palette } = useTheme();
  const workerRef = useRef<SharedWorker>();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();
  const [queryData, setQueryData] = useState<any[]>([]);
  const [tableStructure, setTableStructure] = useState<FixedTableStructureData>(
    {},
  );

  const blobRef = useRef<string>("");

  const downloadExportedDb = useCallback((buffer: ArrayBuffer) => {
    const blob = new Blob([buffer], { type: "application/x-sqlite3" });

    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
    }

    blobRef.current = URL.createObjectURL(blob);
    anchorClick({
      href: blobRef.current,
      download: "database.sqlite",
    });
  }, []);

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
          setTableStructure(() => {
            return (response.data as TableStructureData[]).reduce(
              (acc, val) => {
                acc[val.table_name] = val.column_names.split(", ");
                return acc;
              },
              {} as FixedTableStructureData,
            );
          });
          break;

        case DatabaseWorkerMessageStatus.EXPORTDATABASE:
          downloadExportedDb(response.data);
          break;

        default:
          break;
      }
    };

    workerRef.current = worker;
    return () => worker.port.close();
  }, [downloadExportedDb]);

  const execSql = useCallback((query: string) => {
    setError(undefined);

    workerRef.current!.port.postMessage({
      mode: DatabaseWorkerMessageStatus.QUERYRESULT,
      query,
    });
  }, []);

  const exportDb = () => {
    workerRef.current!.port.postMessage({
      mode: DatabaseWorkerMessageStatus.EXPORTDATABASE,
    });
  };

  return (
    <>
      <CssBaseline />
      <Box
        display="grid"
        gridTemplateAreas='"editor tables" "structure tables"'
        gridTemplateColumns="1fr 1fr"
        gridTemplateRows="1fr 1fr"
        height="100vh"
      >
        <Box gridArea="editor" maxHeight="50vh">
          <QueryEditor
            execSql={execSql}
            exportDb={exportDb}
            isReady={isReady}
            tableStructure={tableStructure}
          />
        </Box>
        <Box
          p={3}
          overflow="auto"
          gridArea="tables"
          borderLeft="1px solid"
          borderColor={palette.grey[400]}
        >
          {!!error && (
            <Box mb={2}>
              <Alert severity="error">
                <AlertTitle>{error.name}</AlertTitle>
                {error.message}
              </Alert>
            </Box>
          )}
          <RenderTables data={queryData} />
        </Box>
        <Box
          p={3}
          overflow="auto"
          gridArea="structure"
          borderTop="1px solid"
          borderColor={palette.grey[400]}
        >
          <TableStructure data={tableStructure} />
        </Box>
      </Box>
    </>
  );
}

export default App;
