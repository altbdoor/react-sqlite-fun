import { FixedTableStructureData } from "../shared/models/TableStructureData";

export function TableStructure(props: { data: FixedTableStructureData }) {
  return (
    <>
      <strong>Table structure</strong>
      <div className="overflow-x-auto pt-3">
        <table className="font-mono border-collapse table-zebra">
          <thead>
            <tr>
              <th className="p-2 border border-neutral-content">Table name</th>
              <th className="p-2 border border-neutral-content">
                Column names
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(props.data).map(([row, columns], rowIdx) => (
              <tr key={"data-row" + rowIdx}>
                <td className="align-top p-2 border border-neutral-content">
                  {row}
                </td>
                <td className="align-top p-2 border border-neutral-content">
                  <ol style={{ margin: 0 }}>
                    {columns.map((col, colIdx) => (
                      <li key={"data-col" + colIdx}>{col}</li>
                    ))}
                  </ol>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
