import { TableStructureData } from "../models/TableStructureData";
import { CustomTable } from "./CustomTable";

export function TableStructure(props: { data: TableStructureData[] }) {
  const fixedData = props.data.map((datum) => {
    return {
      table_name: datum.table_name,
      column_names: datum.column_names.split(", "),
    };
  });

  return (
    <>
      <strong>Table structure</strong>
      <CustomTable customCellPadding={1}>
        <thead>
          <tr>
            <th>Table name</th>
            <th>Column names</th>
          </tr>
        </thead>
        <tbody className="font-monospace">
          {fixedData.map((datum, rowIdx) => (
            <tr key={"data-row" + rowIdx}>
              <td>{datum.table_name}</td>
              <td>
                <ol style={{ margin: 0 }}>
                  {datum.column_names.map((col, colIdx) => (
                    <li key={"data-col" + colIdx}>{col}</li>
                  ))}
                </ol>
              </td>
            </tr>
          ))}
        </tbody>
      </CustomTable>
    </>
  );
}
