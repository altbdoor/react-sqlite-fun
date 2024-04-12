export enum DatabaseWorkerMessageStatus {
  INITREADY,
  INITERROR,
  QUERYRESULT,
  QUERYERROR,
  HIDDENRESULT,
}

type InitReady = {
  status: DatabaseWorkerMessageStatus.INITREADY;
  data: number;
};
type InitError = { status: DatabaseWorkerMessageStatus.INITERROR; data: Error };
type QueryError = {
  status: DatabaseWorkerMessageStatus.QUERYERROR;
  data: Error;
};
type QueryResult = {
  status: DatabaseWorkerMessageStatus.QUERYRESULT;
  data: any[];
};
type HiddenResult = {
  status: DatabaseWorkerMessageStatus.HIDDENRESULT;
  data: any[];
};

export type DatabaseWorkerMessage =
  | InitReady
  | InitError
  | QueryError
  | QueryResult
  | HiddenResult;
