import { useState, type MouseEvent } from "react";
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useAuth } from "@/auth/useAuth";
import { useColorMode } from "@/providers/useColorMode";
import { titleCase } from "@/utils/format";
import { NAV_ITEMS } from "./navItems";

const DRAWER_WIDTH = 220;

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { claims, isAdmin, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const initials = (claims?.username ?? "?").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate("/login");
  };

  const openMenu = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);

  const isActive = (item: (typeof items)[number]) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  const TEAL = "#0d9488";
  const sideBg = mode === "light" ? "#0f172a" : "#0b1120";

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: sideBg,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ px: 2.5, py: 2.5 }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: TEAL,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <LocalShippingIcon sx={{ fontSize: 20 }} />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{ color: "#f1f5f9", fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          Safe Courier
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
        {items.map((item) => {
          const active = isActive(item);
          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                component={RouterLink}
                to={item.to}
                selected={active}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 1.5,
                  py: 0.9,
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    "& .MuiListItemIcon-root": { color: TEAL },
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "rgba(255,255,255,0.12)",
                  },
                  "&:hover:not(.Mui-selected)": {
                    bgcolor: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.8)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: active ? TEAL : "rgba(255,255,255,0.45)",
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.8125rem",
                    fontWeight: active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

      <Box sx={{ px: 2, py: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: TEAL,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, display: "block" }}
              noWrap
            >
              {claims?.username}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.4)", display: "block" }}
              noWrap
            >
              {titleCase(claims?.role ?? "user")}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, bgcolor: sideBg },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              bgcolor: sideBg,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 0.5,
            px: { xs: 2, sm: 3 },
            py: 1.5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: (theme) =>
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.85)"
                : "rgba(15,23,42,0.85)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: "auto", display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton onClick={toggle} size="small">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Account">
            <IconButton onClick={openMenu} size="small" sx={{ ml: 0.25 }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: TEAL,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { sx: { minWidth: 180, mt: 0.5, borderRadius: 2 } } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{claims?.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {titleCase(claims?.role ?? "user")}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={() => setAnchorEl(null)}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}