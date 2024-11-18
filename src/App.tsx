import { QueryEditor } from "./components/QueryEditor";
import { RenderTables } from "./components/RenderTables";
import { TableStructure } from "./components/TableStructure";
import { useDatabaseWorkerStateContext } from "./hooks/use-database-worker";

function App() {
  const { isReady, error, queryData, tableStructure } =
    useDatabaseWorkerStateContext();

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
    </>
  );
}

export default App;
