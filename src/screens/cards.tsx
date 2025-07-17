"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestCard } from "@/lib/api/cards";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import { Pagination } from "@/lib/pagination";
import { Trash } from "lucide-react";

// Type for each card
interface ICard {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  user: {
    full_name: string;
    user_name: string;
  };
}

const CardsTable = () => {
  const { GET_CARDS, DELETE_CARD } = requestCard();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortOrder =
    sorting.length === 0 ? "DESC" : sorting[0]?.desc ? "DESC" : "ASC";

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cards", pagination.pageIndex, pagination.pageSize, sortOrder],
    queryFn: () =>
      GET_CARDS({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortOrder,
        is_deleted: false,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: DELETE_CARD,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      alert("Failed to delete card.");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this card?")) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<ICard, any>[] = [
    {
      id: "select",
      accessorFn: (row) => row.id,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorFn: (row) => `${row.user.full_name}`,
      id: "full_name",
      header: "FullName",
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue("full_name")}</div>;
      },
    },
    {
      accessorFn: (row) => `${row.user.user_name}`,
      id: "user_name",
      header: "User Name",
      cell: ({ row }) => <div>{row.getValue("user_name")}</div>,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <div>{row.getValue("gender")}</div>,
    },
    {
      accessorKey: "dob",
      header: "Date of Birth",
      cell: ({ row }) => {
        const dob = row.getValue("dob") as string;
        return <div>{dayjs(dob).format("YYYY-MM-DD")}</div>;
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <div>{row.getValue("address")}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <div>{dayjs(date).format("YYYY-MM-DD hh:mm A")}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const cardId = row.original.id;

        return (
          <button
            onClick={() => {
              const name = row.original.user.full_name;
              if (confirm(`Are you sure you want to delete "${name}"?`)) {
                handleDelete(cardId);
              }
            }}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white grid-cols-2 flex items-center justify-center gap-2"
            title="Delete"
          >
            {" "}
            <Trash className="h-4 w-4" /> Delete
          </button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    pageCount: data?.cards?.meta
      ? Math.ceil(data.cards.meta.total / data.cards.meta.limit)
      : -1,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Cards Table</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          Page {data?.cards?.meta?.page || 1} of {table.getPageCount()}
        </div>

        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      </div>
    </div>
  );
};

export default CardsTable;
