// Curated icon set for services: admins pick from these by name in the admin
// panel, and the storefront looks the name up here to render the matching
// lucide-react component (icons can't be stored directly in MongoDB).
import {
  Network,
  Headset,
  Cable,
  Zap,
  Server,
  Database,
  ShieldCheck,
  Wifi,
  Camera,
  Phone,
  Cpu,
  Boxes,
  Route,
  BatteryCharging,
  RadioTower,
  Gauge,
  ClipboardList,
  Wrench,
  Building2,
  Layers,
  Lock,
  Globe,
  Settings,
  Truck,
  Cloud,
  MonitorSmartphone,
} from "lucide-react";

export const SERVICE_ICONS = {
  Network,
  Headset,
  Cable,
  Zap,
  Server,
  Database,
  ShieldCheck,
  Wifi,
  Camera,
  Phone,
  Cpu,
  Boxes,
  Route,
  BatteryCharging,
  RadioTower,
  Gauge,
  ClipboardList,
  Wrench,
  Building2,
  Layers,
  Lock,
  Globe,
  Settings,
  Truck,
  Cloud,
  MonitorSmartphone,
};

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);

export function getServiceIcon(name) {
  return SERVICE_ICONS[name] || Wrench;
}
