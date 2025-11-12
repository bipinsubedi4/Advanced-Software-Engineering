import type { ReactNode } from "react";
import "./DataTable.css";

export type Column<T> = {
  header: string;
  render: (item: T) => ReactNode;
  minWidth?: string;
};

type DataTableProps<T> = {
  title: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
};

const DataTable = <T,>({ title, columns, data, emptyMessage }: DataTableProps<T>) => {
  return (
    <section className="data-card">
      <header className="data-card__header">
        <p className="data-card__title">{title}</p>
        <p className="data-card__count">{data.length} records</p>
      </header>
      <div className="data-table__wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header} style={{ minWidth: column.minWidth }}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage ?? "No records to display."}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.header}>{column.render(item)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DataTable;
