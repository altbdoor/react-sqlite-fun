import { TableStructureData } from "../models/TableStructureData";

export function TableStructure(props: { data: TableStructureData[] }) {
  return (
    <div className="p-3 overflow-y-auto vh-50">
      <h4>Table structure</h4>
      <ol>
        {props.data.map((datum) => (
          <li key={datum.table_name}>
            <span className="font-monospace">{datum.table_name}</span>

            <ul className="mb-3">
              {datum.column_names.split(",").map((col) => (
                <li key={col}>
                  <span className="font-monospace">{col}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
