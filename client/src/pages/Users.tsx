import { useMemo, useState } from "react";
import { Box, Card, Chip, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { useDeleteUser, useUsers } from "@/api/users";
import { useUserSearch } from "@/api/search";
import { useAuth } from "@/auth/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatRelative, titleCase } from "@/utils/format";
import type { User } from "@/types/api";

export default function Users() {
  const { claims } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<User | null>(null);

  const searching = search.trim().length >= 2;
  const listQuery = useUsers({ limit: 100 });
  const searchQuery = useUserSearch(search);
  const activeQuery = searching ? searchQuery : listQuery;
  const deleteUser = useDeleteUser();

  const rows = useMemo<User[]>(
    () => activeQuery.data?.data ?? [],
    [activeQuery.data],
  );

  const columns: GridColDef<User>[] = [
    { field: "username", headerName: "Username", flex: 1, minWidth: 140 },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      minWidth: 160,
      valueGetter: (_v, row) => `${row.firstName} ${row.lastName}`,
    },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => (
        <Chip
          size="small"
          label={titleCase(params.value)}
          color={params.value === "admin" ? "primary" : "default"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      valueFormatter: (value) => titleCase(String(value)),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 140,
      valueFormatter: (value) => formatRelative(String(value)),
    },
    {
      field: "actions",
      headerName: "",
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row._id === claims?.id ? null : (
          <Tooltip title="Delete user">
            <IconButton
              size="small"
              color="error"
              onClick={() => setToDelete(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Users" subtitle="Manage platform users" />

      <Stack sx={{ mb: 2 }} direction="row" spacing={2}>
        <TextField
          label="Search users"
          placeholder="Name, username, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
        />
      </Stack>

      {activeQuery.isError ? (
        <ErrorState error={activeQuery.error} onRetry={() => activeQuery.refetch()} />
      ) : (
        <Card>
          <DataGrid<User>
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={activeQuery.isLoading || activeQuery.isFetching}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            sx={{ border: "none" }}
          />
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete user?"
        message={`Permanently delete ${toDelete?.username}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteUser.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          deleteUser.mutate(toDelete._id, {
            onSuccess: () => {
              enqueueSnackbar("User deleted", { variant: "success" });
              setToDelete(null);
            },
            onError: (e) =>
              enqueueSnackbar(getApiErrorMessage(e), { variant: "error" }),
          });
        }}
      />
    </Box>
  );
}
