export function RenderTables(props: { data: any[] }) {
  if (props.data.length === 0) {
    return <></>;
  }

  const headers = Object.keys(props.data[0]).map((header, idx) => (
    <th key={header + idx}>{header}</th>
  ));

  return (
    <>
      <h4>{props.data.length} result(s)</h4>
      <div className="table-responsive">
        <table className="table mb-0 table-sm table-bordered table-striped table-hover font-monospace">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>
            {props.data.map((datum, rowIdx) => (
              <tr key={"data-row" + rowIdx}>
                {Object.values(datum).map((val, colIdx) => (
                  <td key={"data-col" + colIdx}>{val as any}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
