import sqlite3InitModule, { Database } from "@sqlite.org/sqlite-wasm";
import { DatabaseWorkerMessageStatus } from "./models/DatabaseWorkerMessage";

let isInit = false;
let globDb: Database | undefined = undefined;
let tableCount = 0;

interface QueryData {
  mode:
    | DatabaseWorkerMessageStatus.QUERYRESULT
    | DatabaseWorkerMessageStatus.HIDDENRESULT;
  query: string;
}

self.addEventListener("connect", async (evt) => {
  const port = (evt as any).ports[0] as MessagePort;

  if (!isInit) {
    try {
      globDb = await initCode();
      isInit = true;

      const count = globDb.exec({
        sql: "SELECT count(*) FROM sqlite_master WHERE type = 'table';",
        returnValue: "resultRows",
      });
      tableCount = count[0][0] as number;

      port.postMessage({
        status: DatabaseWorkerMessageStatus.INITREADY,
        data: tableCount,
      });
    } catch (err) {
      console.error(err);
      port.postMessage({
        status: DatabaseWorkerMessageStatus.INITERROR,
        data: err,
      });
    }
  } else {
    if (tableCount > 0) {
      port.postMessage({
        status: DatabaseWorkerMessageStatus.INITREADY,
        data: tableCount,
      });
    } else {
      port.postMessage({ status: DatabaseWorkerMessageStatus.INITERROR });
    }
  }

  port.onmessage = async (portEvt) => {
    const portEvtData: QueryData = portEvt.data;

    try {
      const data = globDb!.exec({
        sql: portEvtData.query,
        returnValue: "resultRows",
        rowMode: "object",
      });

      port.postMessage({ status: portEvtData.mode, data });
    } catch (err) {
      port.postMessage({
        status: DatabaseWorkerMessageStatus.QUERYERROR,
        data: err,
      });
      console.error(err);
    }
  };
});

async function initCode() {
  const sqlite = await sqlite3InitModule();
  const db = new sqlite.oo1.DB("/northwind.sqlite", "c");

  db.exec("BEGIN TRANSACTION;");
  try {
    // https://en.wikiversity.org/wiki/Database_Examples/Northwind/SQLite
    const northwindSql = await import("./assets/northwind.sql?raw").then(
      (res) => res.default,
    );
    db.exec(northwindSql);
    db.exec("COMMIT;");
  } catch (err) {
    console.error(err);
    db.exec("ROLLBACK;");
  }

  return db;
}
