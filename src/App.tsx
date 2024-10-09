import { QueryEditor } from "./components/QueryEditor";
import { RenderTables } from "./components/RenderTables";
import { TableStructure } from "./components/TableStructure";
import { useDatabaseWorkerContext } from "./hooks/use-database-worker";

function App() {
  const { isReady, error, queryData, tableStructure } =
    useDatabaseWorkerContext();

  return (
    <>
      <div className="grid grid-cols-2 grid-rows-2 h-screen">
        <div className="col-span-1 row-span-1 h-[50vh]">
          <QueryEditor isReady={isReady} tableStructure={tableStructure} />
        </div>
        <div className="col-span-1 row-span-2 p-3 overflow-auto border-l border-neutral-content">
          {!!error && (
            <div className="mb-2">
              <div className="alert alert-error">
                <p className="font-bold">{error.name}</p>
                {error.message}
              </div>
            </div>
          )}

          <RenderTables data={queryData} />
        </div>
        <div className="col-span-1 row-span-1 p-3 overflow-auto border-t border-neutral-content">
          <TableStructure data={tableStructure} />
        </div>
      </div>
      {/*
      <Box
        display="grid"
        gridTemplateAreas='"editor tables" "structure tables"'
        gridTemplateColumns="1fr 1fr"
        gridTemplateRows="1fr 1fr"
        height="100vh"
      >
        <Box gridArea="editor" maxHeight="50vh">
          <QueryEditor isReady={isReady} tableStructure={tableStructure} />
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
      </Box> */}
    </>
  );
}

export default App;
