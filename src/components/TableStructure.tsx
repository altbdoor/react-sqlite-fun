import { FixedTableStructureData } from "../models/TableStructureData";
import { CustomTable } from "./CustomTable";

export function TableStructure(props: { data: FixedTableStructureData }) {
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
          {Object.entries(props.data).map(([row, columns], rowIdx) => (
            <tr key={"data-row" + rowIdx}>
              <td>{row}</td>
              <td>
                <ol style={{ margin: 0 }}>
                  {columns.map((col, colIdx) => (
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
