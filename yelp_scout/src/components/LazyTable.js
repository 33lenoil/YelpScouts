import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

export default function LazyTable({ route, args, columns, defaultPageSize, rowsPerPageOptions, search }) {
  const [data, setData] = useState([]);

  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  useEffect(() => {
    console.log("rerender");
    const getData = async () => {
      try {
        const response = await route(...args, page, pageSize);
        console.log(response);
        if (response.status !== 200) {
          throw new Error('Failed to fetch data in lazy table');
        } else {
          setData(response.data.businesses);
        }
      } catch (error) {
        console.error('Failed to fetch data in lazy table:', error);
      }
    };

    getData();
  }, [route, page, pageSize, search]);

  const handleChangePage = (e, newPage) => {
    if (newPage < page || data.length === pageSize) {
      setPage(newPage + 1);
    }
  }

  const handleChangePageSize = (e) => {
    const newPageSize = e.target.value;

    setPageSize(newPageSize);
    setPage(1);
  }

  const defaultRenderCell = (col, row) => {
    return <div>{row[col.field]}</div>;
  }

  console.log(data);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(col => <TableCell key={col.headerName}>{col.headerName}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) =>
          (<TableRow key={idx}>
            {
              columns.map(col => (
                < TableCell key={col.headerName} >
                  {col.renderCell ? col.renderCell(row) : defaultRenderCell(col, row)}
                </TableCell>
              ))
            }
          </TableRow>)
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
          count={-1}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangePageSize}
        />
      </Table>
    </TableContainer >
  )
}