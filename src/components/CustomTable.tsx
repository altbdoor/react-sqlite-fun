import { styled } from "@mui/material/styles";
import { ReactNode, TableHTMLAttributes } from "react";

interface CustomTableProps extends TableHTMLAttributes<HTMLTableElement> {
  customCellPadding: number;
  children: ReactNode;
}

const TableSettings = styled(
  "table",
  { shouldForwardProp: (propName) => propName !== "customCellPadding" },
  // ({ children, ...props }: CustomTableProps) => (
  //   <table {...props}>{children}</table>
  // ),
);

export const CustomTable = TableSettings<CustomTableProps>(
  ({ theme, customCellPadding }) => `
    & {
      border-collapse: collapse;
    }

    & td, & th {
      border: 1px solid ${theme.palette.grey[400]};
      vertical-align: top;
      padding: ${theme.spacing(customCellPadding)};
    }
`,
);
