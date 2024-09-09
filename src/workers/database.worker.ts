import sqlite3InitModule, {
  type Database,
  type Sqlite3Static,
} from "@sqlite.org/sqlite-wasm";
import { DatabaseWorkerMessageStatus } from "../shared/models/DatabaseWorkerMessage";

let isInit = false;
let globDb: Database | undefined = undefined;
let globSqlite: Sqlite3Static | undefined = undefined;

interface QueryData {
  mode:
    | DatabaseWorkerMessageStatus.QUERYRESULT
    | DatabaseWorkerMessageStatus.HIDDENRESULT
    | DatabaseWorkerMessageStatus.EXPORTDATABASE;
  query: string;
}

interface ImportData {
  mode: DatabaseWorkerMessageStatus.IMPORTDATABASE;
  payload: ArrayBuffer;
}

const getTableCount = () => {
  if (!globDb) {
    return -1;
  }

  const count = globDb.exec({
    sql: "SELECT count(*) FROM sqlite_master WHERE type = 'table';",
    returnValue: "resultRows",
  });

  return count[0][0] as number;
};

self.addEventListener("connect", async (evt) => {
  const port = (evt as any).ports[0] as MessagePort;

  if (!isInit) {
    try {
      const init = await initCode();
      globDb = init.db;
      globSqlite = init.sqlite;

      isInit = true;

      port.postMessage({
        status: DatabaseWorkerMessageStatus.INITREADY,
        data: getTableCount(),
      });
    } catch (err) {
      console.error(err);
      port.postMessage({
        status: DatabaseWorkerMessageStatus.INITERROR,
        data: err,
      });
    }
  } else {
    const tableCount = getTableCount();

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
    const portEvtData: QueryData | ImportData = portEvt.data;

    if (portEvtData.mode === DatabaseWorkerMessageStatus.EXPORTDATABASE) {
      // https://sqlite.org/wasm/doc/trunk/cookbook.md#impexp
      const byteArray = globSqlite!.capi.sqlite3_js_db_export(globDb!);
      port.postMessage({ status: portEvtData.mode, data: byteArray.buffer });
      return;
    }

    if (portEvtData.mode === DatabaseWorkerMessageStatus.IMPORTDATABASE) {
      if (!globSqlite) {
        return;
      }

      const pointer = globSqlite.wasm.allocFromTypedArray(portEvtData.payload);
      const newDb = new globSqlite.oo1.DB({
        filename: "/database.sqlite",
        flags: "cw",
      });

      const rc = globSqlite!.capi.sqlite3_deserialize(
        newDb.pointer!,
        "main",
        pointer,
        portEvtData.payload.byteLength,
        portEvtData.payload.byteLength,
        globSqlite.capi.SQLITE_DESERIALIZE_FREEONCLOSE |
          globSqlite.capi.SQLITE_DESERIALIZE_RESIZEABLE,
      );
      newDb.checkRc(rc);
      globDb = newDb;

      port.postMessage({ status: portEvtData.mode });
      return;
    }

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
  const db = new sqlite.oo1.DB({ filename: "/northwind.sqlite", flags: "cw" });

  db.exec("BEGIN TRANSACTION;");
  try {
    // https://en.wikiversity.org/wiki/Database_Examples/Northwind/SQLite
    const northwindSql = await import("../assets/northwind.sql?raw").then(
      (res) => res.default,
    );
    db.exec(northwindSql);
    db.exec("COMMIT;");
  } catch (err) {
    console.error(err);
    db.exec("ROLLBACK;");
  }

  return { db, sqlite };
}
