import { styled } from "@mui/material";
import { ReactNode, TableHTMLAttributes } from "react";

interface CustomTableProps extends TableHTMLAttributes<HTMLTableElement> {
  customCellPadding: number;
  children: ReactNode;
}

export const CustomTable = styled(
  ({ children, ...props }: CustomTableProps) => (
    <table {...props}>{children}</table>
  ),
)(
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
