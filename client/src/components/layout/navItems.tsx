import type { ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2Outlined";
import AddBoxIcon from "@mui/icons-material/AddBoxOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonIcon from "@mui/icons-material/PersonOutline";

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  adminOnly?: boolean;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
  { label: "Parcels", to: "/parcels", icon: <Inventory2Icon />, end: true },
  { label: "New Parcel", to: "/parcels/new", icon: <AddBoxIcon /> },
  { label: "Track", to: "/track", icon: <TravelExploreIcon /> },
  { label: "Users", to: "/users", icon: <PeopleIcon />, adminOnly: true },
  { label: "Profile", to: "/profile", icon: <PersonIcon /> },
];
