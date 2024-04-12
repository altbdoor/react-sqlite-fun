export const initQuery = "SELECT * FROM Customers LIMIT 20;";

export const getAllTables = `
SELECT * FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence';
`.trim();

export const getTableAndColumns = `
SELECT
    m.name AS table_name,
    group_concat(i.name, ',') AS column_names
FROM
    sqlite_master AS m
JOIN
    pragma_table_info(m.name) AS i
ON
    m.type = 'table'
WHERE
    m.name != 'sqlite_sequence'
GROUP BY
    m.name;
`.trim();
