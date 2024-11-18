import { FixedTableStructureData } from "../shared/models/TableStructureData";

export function TableStructure(props: { data: FixedTableStructureData }) {
  const sortedKeys = Object.keys(props.data).sort();

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
            {sortedKeys.map((key, rowIdx) => (
              <tr key={"data-row" + rowIdx}>
                <td className="align-top p-2 border border-neutral-content">
                  {key}
                </td>
                <td className="align-top p-2 border border-neutral-content">
                  <ol style={{ margin: 0 }}>
                    {props.data[key].map((col, colIdx) => (
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
