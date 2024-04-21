import Box from "@mui/material/Box";
import { CustomTable } from "./CustomTable";

export function RenderTables(props: { data: any[] }) {
  if (props.data.length === 0) {
    return <></>;
  }

  const headers = Object.keys(props.data[0]).map((header, idx) => (
    <th key={"data-header" + idx}>{header}</th>
  ));

  return (
    <>
      <strong>{props.data.length} result(s)</strong>
      <Box style={{ overflowX: "auto" }}>
        <CustomTable customCellPadding={1} className="font-monospace">
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
        </CustomTable>
      </Box>
    </>
  );
}
