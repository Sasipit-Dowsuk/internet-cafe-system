
import { useNavigate } from "react-router-dom";
import {
  Users,
  Monitor,
  PlayCircle,
  ClipboardList,
  History,
  ChartNoAxesColumn,
  ArrowUpRight,
} from "lucide-react";

const dashboardMenus = [
  {
    title: "จัดการข้อมูลผู้ใช้บริการ",
    description: "เพิ่ม แก้ไข และค้นหาข้อมูลผู้ใช้บริการ",
    icon: Users,
    path: "/customers",
    number: "01",
  },
  {
    title: "จัดการเครื่องคอมพิวเตอร์",
    description: "จัดการข้อมูลและตรวจสอบสถานะเครื่อง",
    icon: Monitor,
    path: "/computers",
    number: "02",
  },
  {
    title: "เริ่มต้นและสิ้นสุดการใช้บริการ",
    description: "บันทึกการใช้งานและคำนวณค่าบริการ",
    icon: PlayCircle,
    path: "/usage",
    number: "03",
  },
  {
    title: "ข้อมูลการใช้บริการ",
    description: "ตรวจสอบรายการใช้บริการของลูกค้า",
    icon: ClipboardList,
    path: "/history",
    number: "04",
  },
  {
    title: "ประวัติการใช้บริการ",
    description: "ค้นหาและตรวจสอบประวัติย้อนหลัง",
    icon: History,
    path: "/history",
    number: "05",
  },
  {
    title: "รายงาน",
    description: "ดูสรุปข้อมูลและรายได้จากการให้บริการ",
    icon: ChartNoAxesColumn,
    path: "/reports",
    number: "06",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  return (
    <section className="dashboard-page">
      <div className="page-header dashboard-header">
        <div>
          <h1>หน้าหลัก</h1>
          <p>ระบบจัดการร้านอินเทอร์เน็ต</p>
        </div>
      </div>

      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-welcome-label">INTERNET CAFE MANAGEMENT</span>
          <h2>ยินดีต้อนรับเข้าสู่ระบบ</h2>
          <p>เลือกเมนูที่ต้องการเพื่อเริ่มต้นการทำงาน</p>
        </div>
        <div className="dashboard-welcome-icon">
          <Monitor size={44} strokeWidth={1.5} />
        </div>
      </div>

      <div className="dashboard-section-heading">
        <h2>เมนูการทำงาน</h2>
        <span>เลือกเมนูเพื่อดำเนินการ</span>
      </div>

      <div className="dashboard-menu-grid">
        {dashboardMenus.map((menu) => {
          const Icon = menu.icon;

          return (
            <button
              type="button"
              className="dashboard-menu-card"
              key={menu.number}
              onClick={() => navigate(menu.path)}
            >
              <div className="dashboard-card-top">
                <div className="dashboard-menu-icon">
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <span className="dashboard-card-number">{menu.number}</span>
              </div>

              <div className="dashboard-card-content">
                <h3>{menu.title}</h3>
                <p>{menu.description}</p>
              </div>

              <div className="dashboard-card-bottom">
                <span>เข้าสู่เมนู</span>
                <ArrowUpRight size={17} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default Dashboard;
