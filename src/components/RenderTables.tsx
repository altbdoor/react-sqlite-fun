import { QueryData } from "../shared/models/QueryData";

export function RenderTables(props: { data: QueryData }) {
  if (props.data.length === 0) {
    return null;
  }

  const headers = Object.keys(props.data[0]).map((header, idx) => (
    <th
      key={"data-header" + idx}
      className="p-2 border border-neutral-content align-bottom"
    >
      {header}
    </th>
  ));

  return (
    <>
      <strong>{props.data.length} result(s)</strong>
      <div className="overflow-x-auto pt-3">
        <table className="font-mono border-collapse table-zebra">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>
            {props.data.map((datum, rowIdx) => (
              <tr key={"data-row" + rowIdx}>
                {Object.values(datum).map((val, colIdx) => (
                  <td
                    key={"data-col" + colIdx}
                    className="p-2 border border-neutral-content align-top"
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
