export interface TableStructureData {
  table_name: string;
  column_names: string;
}

export type FixedTableStructureData = { [key: string]: string[] };
