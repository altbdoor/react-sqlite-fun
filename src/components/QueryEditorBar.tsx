import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from "@mui/material/styles";
import { useRef, useState } from "react";
import { getAllTables, getTableAndColumns } from "../sql-query";

interface QueryEditorBarProps {
  isReady: boolean;
  execSql: (query?: string) => void;
}

export function QueryEditorBar(props: QueryEditorBarProps) {
  const { palette } = useTheme();
  const extrasAnchorRef = useRef(null);
  const [openExtras, setOpenExtras] = useState(false);

  const buttonActions = [
    { label: "Show all tables", sql: getAllTables },
    { label: "Show table structure", sql: getTableAndColumns },
    {
      label: "SQL cheatsheet",
      href: "https://helpercodes.com/sql-query-cheatsheet-tutorial/",
    },
    {
      label: "About Northwind database",
      href: "https://en.wikiversity.org/wiki/Database_Examples/Northwind",
    },
    {
      label: "GitHub repository",
      href: "https://github.com/altbdoor/react-sqlite-fun",
    },
  ];

  return (
    <Box
      className="editor__actions"
      px={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      borderBottom={`1px solid ${palette.grey[400]}`}
      flexShrink={0}
    >
      <ButtonGroup ref={extrasAnchorRef}>
        <Button type="button" onClick={() => setOpenExtras((prev) => !prev)}>
          🤚 Extras
        </Button>
        <Tooltip title="Ctrl + Enter" arrow>
          <Button type="button" color="success" onClick={() => props.execSql()}>
            ⚡ Run
          </Button>
        </Tooltip>
      </ButtonGroup>
      <Popper
        anchorEl={extrasAnchorRef.current}
        open={openExtras}
        placement="bottom-start"
      >
        <Paper>
          <ClickAwayListener onClickAway={() => setOpenExtras(false)}>
            <MenuList autoFocusItem>
              {buttonActions.map((action) => (
                <MenuItem
                  key={action.label}
                  onClick={() => {
                    if (action.sql) {
                      props.execSql(action.sql);
                    }

                    if (action.href) {
                      window.open(action.href);
                    }

                    setOpenExtras(false);
                  }}
                >
                  {action.label}
                </MenuItem>
              ))}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>

      {props.isReady ? (
        <Chip label="Ready" color="success" />
      ) : (
        <Chip label="Loading..." color="default" />
      )}
    </Box>
  );
}
