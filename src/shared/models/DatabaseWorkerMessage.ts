import { QueryData } from "./QueryData";
import { FixedTableStructureData } from "./TableStructureData";

export enum DatabaseWorkerMessageStatus {
  INITREADY,
  INITERROR,
  QUERYRESULT,
  QUERYERROR,
  HIDDENRESULT,
  EXPORTDATABASE,
  IMPORTDATABASE,
}

type InitReadyOutput = {
  status: DatabaseWorkerMessageStatus.INITREADY;
  data: number;
};
type InitErrorOutput = {
  status: DatabaseWorkerMessageStatus.INITERROR;
  data: Error;
};
type QueryErrorOutput = {
  status: DatabaseWorkerMessageStatus.QUERYERROR;
  data: Error;
};
type QueryResultOutput = {
  status: DatabaseWorkerMessageStatus.QUERYRESULT;
  data: QueryData;
};
type HiddenResultOutput = {
  status: DatabaseWorkerMessageStatus.HIDDENRESULT;
  data: FixedTableStructureData;
};
type ExportDatabaseOutput = {
  status: DatabaseWorkerMessageStatus.EXPORTDATABASE;
  data: ArrayBuffer;
};
type ImportDatabaseOutput = {
  status: DatabaseWorkerMessageStatus.IMPORTDATABASE;
  data: undefined;
};

export type DatabaseWorkerOutputMessage =
  | InitReadyOutput
  | InitErrorOutput
  | QueryErrorOutput
  | QueryResultOutput
  | HiddenResultOutput
  | ExportDatabaseOutput
  | ImportDatabaseOutput;

type QueryResultInput = {
  mode: DatabaseWorkerMessageStatus.QUERYRESULT;
  query: string;
};

type HiddenResultInput = {
  mode: DatabaseWorkerMessageStatus.HIDDENRESULT;
  query: string;
};

type ExportDatabaseInput = {
  mode: DatabaseWorkerMessageStatus.EXPORTDATABASE;
};

type ImportDataInput = {
  mode: DatabaseWorkerMessageStatus.IMPORTDATABASE;
  payload: ArrayBuffer;
};

export type DatabaseWorkerInputMessage =
  | QueryResultInput
  | HiddenResultInput
  | ExportDatabaseInput
  | ImportDataInput;
