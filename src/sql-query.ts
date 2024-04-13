export const initQuery = `
-- sample query to get the customer and their orders
SELECT
    Customers.CustomerName,
    Orders.OrderDate,
    Products.ProductName,
    OrderDetails.Quantity
FROM
    Customers
JOIN
    Orders ON Customers.CustomerID = Orders.CustomerID
JOIN
    OrderDetails ON Orders.OrderID = OrderDetails.OrderID
JOIN
    Products ON OrderDetails.ProductID = Products.ProductID
ORDER BY
    Orders.OrderDate;
`.trim();

export const getAllTables = `
SELECT * FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence';
`.trim();

export const getTableAndColumns = `
SELECT
    m.name AS table_name,
    GROUP_CONCAT(i.name, ', ') AS column_names
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
