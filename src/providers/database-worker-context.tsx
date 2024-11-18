import { createContext, Dispatch, SetStateAction } from "react";
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
