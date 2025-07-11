import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { requestCard } from "@/lib/api/card-api";
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
  const { GET_CARDS } = requestCard();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortOrder =
    sorting.length === 0 ? "DESC" : sorting[0]?.desc ? "DESC" : "ASC";

  const { data, isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: () =>
      GET_CARDS({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortOrder,
        is_deleted: false,
      }),
  });
  console.log("Cards Data:", data);

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

// import React, { useState } from "react";
// import { requestCard } from "@/lib/api/card";
// import {
//   type ColumnDef,
//   type ColumnFiltersState,
//   flexRender,
//   getCoreRowModel,
//   type SortingState,
//   useReactTable,
//   type VisibilityState,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { ArrowUpDown, ChevronDown, Eye, Pen, Trash } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import dayjs from "dayjs";

// // Types
// type ISocialLink = {
//   id: string;
//   platform: string;
//   url: string;
// };

// type IUser = {
//   id: string;
//   full_name: string;
//   email: string;
// };

// export type ICard = {
//   id: string;
//   card_type: string;
//   gender: string;
//   dob: string;
//   address: string;
//   nationality: string;
//   phone: string;
//   created_at: string;
//   user: IUser;
//   socialLinks: ISocialLink[];
// };

// type PaginationState = {
//   pageIndex: number;
//   pageSize: number;
// };

// type PaginationProps = {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
// };

// const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   totalPages,
//   onPageChange,
// }) => {
//   if (totalPages === 0) return null;

//   const createPageNumbers = () => {
//     const pages: (number | string)[] = [];

//     if (totalPages <= 7) {
//       // Show all pages if 7 or fewer
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       // Show first 3 pages
//       pages.push(1);
//       pages.push(2);
//       pages.push(3);

//       if (currentPage > 5) {
//         pages.push("...");
//       }

//       // Current page neighbors
//       const start = Math.max(4, currentPage - 1);
//       const end = Math.min(totalPages - 1, currentPage + 1);

//       for (let i = start; i <= end; i++) {
//         if (!pages.includes(i)) {
//           pages.push(i);
//         }
//       }

//       if (currentPage < totalPages - 3) {
//         pages.push("...");
//       }

//       // Last page
//       if (!pages.includes(totalPages)) {
//         pages.push(totalPages);
//       }
//     }

//     // Remove duplicates & sort
//     return pages
//       .filter((v, i, a) => a.indexOf(v) === i)
//       .sort((a, b) => {
//         if (a === "...") return 1;
//         if (b === "...") return -1;
//         return (a as number) - (b as number);
//       });
//   };

//   const pages = createPageNumbers();

//   return (
//     <nav className="inline-flex items-center space-x-1">
//       <button
//         className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//       >
//         Previous
//       </button>

//       {pages.map((page, idx) =>
//         page === "..." ? (
//           <span key={`ellipsis-${idx}`} className="px-2 select-none">
//             ...
//           </span>
//         ) : (
//           <button
//             key={page}
//             className={`px-3 py-1 rounded border ${
//               page === currentPage
//                 ? "bg-blue-600 text-white border-blue-600"
//                 : "border-gray-300 hover:bg-gray-100"
//             }`}
//             onClick={() => onPageChange(page as number)}
//           >
//             {page}
//           </button>
//         )
//       )}

//       <button
//         className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//       >
//         Next
//       </button>
//     </nav>
//   );
// };

// const CardsTable: React.FC = () => {
//   const { GET_CARDS } = requestCard();
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = useState({});
//   const [pagination, setPagination] = useState<PaginationState>({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   const sortField = sorting[0]?.id ?? "created_at";
//   const sortOrder = sorting.length === 0 || sorting[0]?.desc ? "DESC" : "ASC";
//   const nameFilter = (columnFilters.find((f) => f.id === "full_name")?.value ??
//     "") as string;

//   const { data, isLoading } = useQuery({
//     queryKey: [
//       "cards",
//       pagination.pageIndex,
//       pagination.pageSize,
//       sortField,
//       sortOrder,
//       nameFilter,
//     ],
//     queryFn: () =>
//       GET_CARDS({
//         page: pagination.pageIndex + 1,
//         pageSize: pagination.pageSize,
//         sortBy: sortField,
//         sortOrder,
//         is_deleted: false,
//         title: nameFilter || undefined,
//       }),
//   });

//   const columns: ColumnDef<ICard>[] = [
//     {
//       id: "no",
//       header: "No.",
//       cell: ({ row, table }) => {
//         const { pageIndex, pageSize } = table.getState().pagination;
//         return <div>{pageIndex * pageSize + row.index + 1}</div>;
//       },
//       enableSorting: false,
//       enableHiding: false,
//     },
//     {
//       id: "full_name",
//       accessorFn: (row) => row.user.full_name,
//       header: ({ column }) => (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
//         >
//           Name <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       ),
//       cell: ({ getValue }) => (
//         <div className="capitalize">{getValue<string>()}</div>
//       ),
//     },
//     {
//       id: "email",
//       accessorFn: (row) => row.user.email,
//       header: "Email",
//       cell: ({ getValue }) => (
//         <div className="lowercase">{getValue<string>()}</div>
//       ),
//     },
//     {
//       accessorKey: "gender",
//       header: "Gender",
//     },
//     {
//       accessorKey: "dob",
//       header: "DOB",
//       cell: ({ getValue }) =>
//         getValue() ? dayjs(getValue<string>()).format("YYYY-MM-DD") : null,
//     },
//     {
//       accessorKey: "address",
//       header: "Address",
//     },
//     {
//       accessorKey: "nationality",
//       header: "Nationality",
//     },
//     {
//       accessorKey: "card_type",
//       header: "Card Type",
//     },
//     {
//       accessorKey: "phone",
//       header: "Phone",
//     },
//     {
//       id: "actions",
//       header: "Action",
//       enableHiding: false,
//       cell: ({ row }) => {
//         const card = row.original;
//         return (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" className="p-1">
//                 <ChevronDown className="w-5 h-5" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-32">
//               <Button
//                 variant="ghost"
//                 className="w-full justify-start"
//                 onClick={() => console.log("View", card)}
//               >
//                 <Eye className="w-4 h-4 mr-2" /> View
//               </Button>
//               <Button
//                 variant="ghost"
//                 className="w-full justify-start text-yellow-600"
//                 onClick={() => console.log("Edit", card)}
//               >
//                 <Pen className="w-4 h-4 mr-2" /> Edit
//               </Button>
//               <Button
//                 variant="ghost"
//                 className="w-full justify-start text-red-600"
//                 onClick={() => console.log("Delete", card.id)}
//               >
//                 <Trash className="w-4 h-4 mr-2" /> Delete
//               </Button>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         );
//       },
//     },
//   ];

//   const table = useReactTable({
//     data: data?.data ?? [],
//     columns,
//     pageCount: data?.meta ? Math.ceil(data.meta.total / data.meta.limit) : -1,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//       pagination,
//     },
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     onPaginationChange: setPagination,
//     manualPagination: true,
//     manualSorting: true,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   return (
//     <div className="flex-1 space-y-6 p-6 md:p-8">
//       {/* Header with Title */}
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold tracking-tight">Cards Dashboard</h2>
//       </div>

//       {/* Filters & Column Toggle */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
//         <Input
//           placeholder="Filter by name..."
//           value={
//             (table.getColumn("full_name")?.getFilterValue() as string) ?? ""
//           }
//           onChange={(e) =>
//             table.getColumn("full_name")?.setFilterValue(e.target.value)
//           }
//           className="max-w-sm"
//         />

//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline">
//               Columns <ChevronDown className="ml-2 h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             {table
//               .getAllColumns()
//               .filter((col) => col.getCanHide())
//               .map((col) => (
//                 <DropdownMenuCheckboxItem
//                   key={col.id}
//                   checked={col.getIsVisible()}
//                   onCheckedChange={(val) => col.toggleVisibility(!!val)}
//                   className="capitalize"
//                 >
//                   {col.id}
//                 </DropdownMenuCheckboxItem>
//               ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>

//       {/* Table */}
//       <div className="rounded-md border bg-white shadow-sm">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((group) => (
//               <TableRow key={group.id}>
//                 {group.headers.map((header) => (
//                   <TableHead key={header.id}>
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {isLoading ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   Loading...
//                 </TableCell>
//               </TableRow>
//             ) : table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id}>
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Footer - Pagination and Rows per Page */}
//       <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
//         <div className="text-muted-foreground text-sm">
//           {table.getFilteredSelectedRowModel().rows.length} of{" "}
//           {data?.meta?.total || 0} row(s) selected.
//         </div>

//         <div className="flex items-center space-x-6">
//           <div className="flex items-center space-x-2">
//             <p className="text-sm font-medium">Rows per page</p>
//             <select
//               value={table.getState().pagination.pageSize}
//               onChange={(e) => table.setPageSize(Number(e.target.value))}
//               className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm"
//             >
//               {[5, 10, 20, 30, 40, 50].map((pageSize) => (
//                 <option key={pageSize} value={pageSize}>
//                   {pageSize}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <Pagination
//             currentPage={table.getState().pagination.pageIndex + 1}
//             totalPages={table.getPageCount()}
//             onPageChange={(page) => table.setPageIndex(page - 1)}
//           />

//           <div className="text-sm text-muted-foreground">
//             Page {data?.meta?.page || 1} of {table.getPageCount()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CardsTable;
