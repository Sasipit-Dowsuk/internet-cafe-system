
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Monitor,
  PlayCircle,
  ClipboardList,
  History,
  ChartNoAxesColumn,
  Settings,
  Monitor as CafeIcon,
} from "lucide-react";

const menuItems = [
  { path: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
  { path: "/customers", label: "ข้อมูลผู้ใช้บริการ", icon: Users },
  { path: "/computers", label: "จัดการเครื่องคอมพิวเตอร์", icon: Monitor },
  { path: "/usage", label: "เริ่ม/สิ้นสุดการใช้บริการ", icon: PlayCircle },
  { path: "/history", label: "ประวัติการใช้บริการ", icon: History },
  { path: "/reports", label: "รายงาน", icon: ChartNoAxesColumn },
  { path: "/settings", label: "ตั้งค่า", icon: Settings },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <CafeIcon size={25} />
        </div>
        <div className="sidebar-brand-text">
          <h2>Internet Cafe</h2>
          <p>Management System</p>
        </div>
      </div>

      <div className="sidebar-section-label">เมนูหลัก</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status-dot" />
        <span>ระบบพร้อมใช้งาน</span>
      </div>
    </aside>
  );
}

export default Sidebar;
