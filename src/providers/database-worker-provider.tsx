import { PropsWithChildren, useEffect, useState } from "react";
import { FixedTableStructureData } from "../shared/models/TableStructureData";
import { DatabaseWorkerContext } from "./database-worker-context";

export const DatabaseWorkerProvider = ({ children }: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();

  const [queryData, setQueryData] = useState<any[]>([]);
  const [tableStructure, setTableStructure] = useState<FixedTableStructureData>(
    {},
  );

  return (
    <DatabaseWorkerContext
      value={{
        isReady,
        setIsReady,
        error,
        setError,
        queryData,
        setQueryData,
        tableStructure,
        setTableStructure,
      }}
    >
      {children}
    </DatabaseWorkerContext>
  );
};
