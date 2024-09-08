import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "@mui/material/styles";
import { QueryEditor } from "./components/QueryEditor";
import { RenderTables } from "./components/RenderTables";
import { TableStructure } from "./components/TableStructure";
import { useDatabaseWorkerContext } from "./hooks/use-database-worker";

function App() {
  const { palette } = useTheme();
  const { isReady, error, queryData, tableStructure } =
    useDatabaseWorkerContext();

  return (
    <>
      <CssBaseline />
      <Box
        display="grid"
        gridTemplateAreas='"editor tables" "structure tables"'
        gridTemplateColumns="1fr 1fr"
        gridTemplateRows="1fr 1fr"
        height="100vh"
      >
        <Box gridArea="editor" maxHeight="50vh">
          <QueryEditor isReady={isReady} tableStructure={tableStructure} />
        </Box>
        <Box
          p={3}
          overflow="auto"
          gridArea="tables"
          borderLeft="1px solid"
          borderColor={palette.grey[400]}
        >
          {!!error && (
            <Box mb={2}>
              <Alert severity="error">
                <AlertTitle>{error.name}</AlertTitle>
                {error.message}
              </Alert>
            </Box>
          )}
          <RenderTables data={queryData} />
        </Box>
        <Box
          p={3}
          overflow="auto"
          gridArea="structure"
          borderTop="1px solid"
          borderColor={palette.grey[400]}
        >
          <TableStructure data={tableStructure} />
        </Box>
      </Box>
    </>
  );
}

export default App;
