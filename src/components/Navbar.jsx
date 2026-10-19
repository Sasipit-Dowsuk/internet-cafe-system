
import { useLocation } from "react-router-dom";
import { Bell, UserRound } from "lucide-react";

const pageTitles = {
  "/dashboard": "หน้าหลัก",
  "/customers": "ข้อมูลผู้ใช้บริการ",
  "/computers": "จัดการเครื่องคอมพิวเตอร์",
  "/usage": "เริ่ม/สิ้นสุดการใช้บริการ",
  "/history": "ประวัติการใช้บริการ",
  "/reports": "รายงาน",
  "/settings": "ตั้งค่า",
};

function Navbar() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "ระบบจัดการร้านอินเทอร์เน็ต";

  return (
    <header className="top-navbar">
      <div className="navbar-page-info">
        <span className="navbar-system-name">ระบบจัดการร้านอินเทอร์เน็ต</span>
        <span className="navbar-separator">/</span>
        <span className="navbar-current-page">{pageTitle}</span>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="navbar-icon-button"
          aria-label="การแจ้งเตือน"
          title="การแจ้งเตือน"
        >
          <Bell size={19} />
        </button>

        <div className="navbar-user">
          <div className="navbar-avatar">
            <UserRound size={19} />
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">ผู้ดูแลระบบ</span>
            <span className="navbar-user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
