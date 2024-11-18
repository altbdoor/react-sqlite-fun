import { createContext } from "react";
import { FixedTableStructureData } from "../shared/models/TableStructureData";

interface DatabaseWorkerContextType {
  isReady: boolean;
  error: Error | undefined;
  queryData: any[];
  tableStructure: FixedTableStructureData;
  execSql: (query: string) => void;
  exportDb: () => void;
  importDb: (file: File) => void;
}

export const DatabaseWorkerContext =
  createContext<DatabaseWorkerContextType | null>(null);
