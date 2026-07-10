import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useParcels } from "@/api/parcels";
import { useParcelSearch } from "@/api/search";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState } from "@/components/ErrorState";
import { StatusChip } from "@/components/StatusChip";
import {
  PARCEL_STATUSES,
  PARCEL_TYPES,
  formatCurrency,
  formatRelative,
  titleCase,
} from "@/utils/format";
import type { Parcel, ParcelStatus, ParcelType } from "@/types/api";

export default function Parcels() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ParcelStatus | "">("");
  const [parcelType, setParcelType] = useState<ParcelType | "">("");
  const [search, setSearch] = useState("");

  const searching = search.trim().length >= 2;
  const listQuery = useParcels({
    limit: 100,
    status: status || undefined,
    parcelType: parcelType || undefined,
  });
  const searchQuery = useParcelSearch(search);

  const activeQuery = searching ? searchQuery : listQuery;
  const rows = useMemo<Parcel[]>(
    () => activeQuery.data?.data ?? [],
    [activeQuery.data],
  );

  const columns: GridColDef<Parcel>[] = [
    { field: "trackingCode", headerName: "Tracking", flex: 1, minWidth: 130 },
    {
      field: "parcelType",
      headerName: "Type",
      width: 130,
      valueFormatter: (value) => titleCase(String(value)),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => <StatusChip status={params.value} />,
      sortable: false,
    },
    {
      field: "weight",
      headerName: "Weight",
      width: 100,
      valueFormatter: (value) => `${value} kg`,
    },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      valueGetter: (_value, row) =>
        formatCurrency(row.price.amount, row.price.currency),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      valueFormatter: (value) => formatRelative(String(value)),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Parcels"
        subtitle="Browse and manage your deliveries"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/parcels/new")}
          >
            New parcel
          </Button>
        }
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Search"
          placeholder="Tracking, recipient, description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240, flexGrow: 1 }}
          helperText={
            search.length === 1 ? "Type at least 2 characters" : undefined
          }
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ParcelStatus | "")}
          sx={{ minWidth: 160 }}
          disabled={searching}
        >
          <MenuItem value="">All statuses</MenuItem>
          {PARCEL_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {titleCase(s)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Type"
          value={parcelType}
          onChange={(e) => setParcelType(e.target.value as ParcelType | "")}
          sx={{ minWidth: 160 }}
          disabled={searching}
        >
          <MenuItem value="">All types</MenuItem>
          {PARCEL_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {titleCase(t)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {activeQuery.isError ? (
        <ErrorState
          error={activeQuery.error}
          onRetry={() => activeQuery.refetch()}
        />
      ) : (
        <Card>
          <DataGrid<Parcel>
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={activeQuery.isLoading || activeQuery.isFetching}
            onRowClick={(params) => navigate(`/parcels/${params.id}`)}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              "& .MuiDataGrid-row": { cursor: "pointer" },
            }}
          />
        </Card>
      )}
    </Box>
  );
}
