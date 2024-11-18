import { use } from "react";
import { DatabaseWorkerContext } from "../providers/database-worker-context";

const useDatabaseWorkerContext = () => {
  const context = use(DatabaseWorkerContext);
  if (!context) {
    throw new Error("invalid context");
  }

  return context;
};

export const useDatabaseWorkerStateContext = () => {
  const { isReady, error, queryData, tableStructure } =
    useDatabaseWorkerContext();
  return { isReady, error, queryData, tableStructure };
};

export const useDatabaseWorkerMethodsContext = () => {
  const { execSql, importDb, exportDb } = useDatabaseWorkerContext();
  return { execSql, importDb, exportDb };
};
