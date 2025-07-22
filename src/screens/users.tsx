import React, { useState } from "react";
import { requestUser } from "@/lib/api/user-api";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, Pen, Trash } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { IUser } from "@/types/user-type";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/lib/pagination";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Badge } from "@/components/ui/badge";
import { useUserStatusDialog } from "@/store/user-status-dialog-store";
import UserStatusAlertDialog from "@/components/user-status-dialong";
import request from "@/lib/api/request";

dayjs.extend(utc);
dayjs.extend(timezone);

const UsersTable = () => {
  const queryClient = useQueryClient();
  const { USERS, UPDATE_USER, DELETE_USER } = requestUser();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { mutate: updateUserStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      UPDATE_USER(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => DELETE_USER(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const { mutate: updateUserData } = useMutation({
    mutationFn: (user: IUser) =>
      request({
        url: `/user/update-user/${user.id}`,
        method: "PUT",
        data: {
          full_name: user.full_name,
          user_name: user.user_name,
          email: user.email,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditOpen(false);
    },
  });

  const handleUpdateUser = (user: IUser) => {
    updateUserData(user);
  };

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const sortField = sorting[0]?.id ?? "created_at";
  const sortOrder =
    sorting.length === 0 ? "DESC" : sorting[0]?.desc ? "DESC" : "ASC";
  const emailFilter = columnFilters.find((f) => f.id === "email")?.value ?? "";

  const { data, isLoading } = useQuery({
    queryKey: [
      "users",
      pagination.pageIndex,
      pagination.pageSize,
      sortField,
      sortOrder,
      emailFilter,
    ],
    queryFn: () =>
      USERS({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortBy: sortField,
        sortOrder,
        email: emailFilter,
      }),
  });

  const columns: ColumnDef<IUser>[] = [
    {
      id: "select",
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
      id: "no",
      header: "No.",
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return <div>{pageIndex * pageSize + row.index + 1}</div>;
      },
    },
    {
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }) => {
        const avatar = row.getValue("avatar") as string;
        const fallback =
          "https://ui-avatars.com/api/?name=User&background=random";
        return (
          <img
            src={avatar || fallback}
            alt="avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        );
      },
    },
    {
      accessorKey: "full_name",
      header: "Fullname",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("full_name")}</div>
      ),
    },
    {
      accessorKey: "user_name",
      header: "Username",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("user_name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "is_active",
      header: () => <div>Status</div>,
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.is_active;
        return (
          <Badge
            variant={isActive ? "default" : "destructive"}
            className="cursor-pointer hover:opacity-80"
            onClick={() =>
              useUserStatusDialog.getState().setDialog(user.id, isActive)
            }
          >
            {isActive ? "Active" : "Blocked"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => <>Created At</>,
      cell: ({ row }) => {
        const rawDate = row.getValue("created_at") as string;
        const fixedTime = dayjs(rawDate)
          .add(7, "hour")
          .format("YYYY-MM-DD hh:mm A");
        return <div className="text-sm text-muted-foreground">{fixedTime}</div>;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex space-x-1.5 items-center">
            <Badge
              className="cursor-pointer"
              onClick={() => {
                setSelectedUser(user);
                setIsEditOpen(true);
              }}
            >
              <Pen className="mr-1 w-4 h-4" /> Edit
            </Badge>
            <Badge
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                if (window.confirm("Are you sure to delete this user?")) {
                  deleteUser(user.id);
                }
              }}
            >
              <Trash className="mr-1 w-4 h-4" /> Delete
            </Badge>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    pageCount: data?.meta ? Math.ceil(data.meta.total / data.meta.limit) : -1,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <UserStatusAlertDialog
        onConfirm={(userId, newStatus) =>
          updateUserStatus({ id: userId, status: newStatus })
        }
        isLoading={false}
      />

      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Edit User</h2>
            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                value={selectedUser.full_name}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    full_name: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Username"
                value={selectedUser.user_name}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    user_name: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateUser(selectedUser)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {data?.meta?.total || 0} row(s) selected.
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-8 w-[70px] rounded border px-3 py-1 text-sm"
              >
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <Pagination
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(page) => table.setPageIndex(page - 1)}
            />
            <div className="text-sm text-muted-foreground">
              Page {data?.meta?.page || 1} of {table.getPageCount()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
