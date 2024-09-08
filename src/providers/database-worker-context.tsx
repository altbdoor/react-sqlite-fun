import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";
import { FixedTableStructureData } from "../shared/models/TableStructureData";

type Dispatcher<T> = Dispatch<SetStateAction<T>>;

interface DatabaseWorkerContextType {
  isReady: boolean;
  setIsReady: Dispatcher<boolean>;
  error: Error | undefined;
  setError: Dispatcher<Error | undefined>;
  queryData: any[];
  setQueryData: Dispatcher<any[]>;
  tableStructure: FixedTableStructureData;
  setTableStructure: Dispatcher<FixedTableStructureData>;
}

export const DatabaseWorkerContext =
  createContext<DatabaseWorkerContextType | null>(null);

export const DatabaseWorkerProvider = ({ children }: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error>();

  const [queryData, setQueryData] = useState<any[]>([]);
  const [tableStructure, setTableStructure] = useState<FixedTableStructureData>(
    {},
  );

  return (
    <DatabaseWorkerContext.Provider
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
    </DatabaseWorkerContext.Provider>
  );
};
