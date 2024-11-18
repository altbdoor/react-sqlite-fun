import sqlite3InitModule, {
  type Database,
  type Sqlite3Static,
} from "@sqlite.org/sqlite-wasm";
import {
  DatabaseWorkerInputMessage,
  DatabaseWorkerMessageStatus,
  DatabaseWorkerOutputMessage,
} from "../shared/models/DatabaseWorkerMessage";
import { FixedTableStructureData } from "../shared/models/TableStructureData";

let isInit = false;
let globDb: Database | undefined = undefined;
let globSqlite: Sqlite3Static | undefined = undefined;

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
  const sendPort = (data: DatabaseWorkerOutputMessage) => {
    port.postMessage(data);
  };

  if (!isInit) {
    try {
      const init = await initCode();
      globDb = init.db;
      globSqlite = init.sqlite;

      isInit = true;

      sendPort({
        status: DatabaseWorkerMessageStatus.INITREADY,
        data: getTableCount(),
      });
    } catch (err) {
      console.error(err);
      sendPort({
        status: DatabaseWorkerMessageStatus.INITERROR,
        data: err as Error,
      });
    }
  } else {
    const tableCount = getTableCount();

    if (tableCount > 0) {
      sendPort({
        status: DatabaseWorkerMessageStatus.INITREADY,
        data: tableCount,
      });
    } else {
      sendPort({
        status: DatabaseWorkerMessageStatus.INITERROR,
        data: new Error("earlier initialization failed"),
      });
    }
  }

  port.onmessage = (portEvt) => {
    if (!globSqlite || !globDb) {
      return;
    }

    const portEvtData: DatabaseWorkerInputMessage = portEvt.data;

    if (portEvtData.mode === DatabaseWorkerMessageStatus.EXPORTDATABASE) {
      // https://sqlite.org/wasm/doc/trunk/cookbook.md#impexp
      const byteArray = globSqlite.capi.sqlite3_js_db_export(globDb);
      sendPort({ status: portEvtData.mode, data: byteArray.buffer });
      return;
    }

    if (portEvtData.mode === DatabaseWorkerMessageStatus.IMPORTDATABASE) {
      const pointer = globSqlite.wasm.allocFromTypedArray(portEvtData.payload);
      const newDb = new globSqlite.oo1.DB({
        filename: "/database.sqlite",
        flags: "cw",
      });

      const rc = globSqlite.capi.sqlite3_deserialize(
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

      sendPort({ status: portEvtData.mode, data: undefined });
      return;
    }

    try {
      const data = globDb.exec({
        sql: portEvtData.query,
        returnValue: "resultRows",
        rowMode: "object",
      });

      if (portEvtData.mode === DatabaseWorkerMessageStatus.QUERYRESULT) {
        sendPort({ status: portEvtData.mode, data });
        return;
      }

      const hiddenTableData = data
        .map((datum) => ({
          table_name: datum.table_name?.toString() || "",
          column_names: datum.column_names?.toString() || "",
        }))
        .filter((datum) => !!datum.table_name)
        .reduce((acc, val) => {
          acc[val.table_name] = val.column_names.split(", ");
          return acc;
        }, {} as FixedTableStructureData);

      sendPort({ status: portEvtData.mode, data: hiddenTableData });
    } catch (err) {
      sendPort({
        status: DatabaseWorkerMessageStatus.QUERYERROR,
        data: err as Error,
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
