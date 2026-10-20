
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  History as HistoryIcon,
  CalendarDays,
  Clock3,
  Monitor,
  UserRound,
  Wallet,
  RefreshCw,
  X,
  ReceiptText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { apiRequest } from "../services/api";

const styles = {
  page: {
    padding: "24px",
    color: "#1e293b",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleIcon: {
    background: "#dbeafe",
    color: "#2563eb",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "6px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 6px rgba(15,23,42,0.03)",
  },
  cardIcon: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    flexShrink: 0,
  },
  cardLabel: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "23px",
    fontWeight: "700",
    color: "#0f172a",
  },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  filterHeader: {
    padding: "18px 20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "700",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    padding: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    background: "#fff",
    color: "#334155",
    fontSize: "14px",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    padding: "18px 20px",
    borderBottom: "1px solid #e2e8f0",
  },
  tableTitle: {
    fontSize: "17px",
    fontWeight: "700",
    margin: 0,
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#334155",
    verticalAlign: "middle",
  },
  person: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  smallIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
    flexShrink: 0,
  },
  badge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: "#dcfce7",
    color: "#15803d",
  },
  detailButton: {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "7px",
    padding: "7px 10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  message: {
    padding: "36px 20px",
    textAlign: "center",
    color: "#64748b",
  },
  error: {
    margin: "16px 20px",
    padding: "12px 14px",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  modal: {
    background: "#fff",
    width: "100%",
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "14px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "700",
  },
  closeButton: {
    border: "none",
    background: "#f1f5f9",
    borderRadius: "8px",
    padding: "7px",
    cursor: "pointer",
    display: "flex",
    color: "#475569",
  },
  modalBody: {
    padding: "20px",
    display: "grid",
    gap: "16px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
  },
};

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(minutes) {
  const totalMinutes = Math.max(0, Math.floor(Number(minutes) || 0));
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) return `${remainingMinutes} นาที`;

  return `${hours} ชม. ${remainingMinutes} นาที`;
}

function formatMoney(amount) {
  return `${(Number(amount) || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} บาท`;
}

function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDuration(session) {
  if (session.durationMinutes != null) {
    return Number(session.durationMinutes) || 0;
  }

  if (session.duration != null) {
    return Number(session.duration) || 0;
  }

  if (session.startTime && session.endTime) {
    return Math.max(
      0,
      Math.floor(
        (new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime()) /
          60000
      )
    );
  }

  return 0;
}

function getCustomerName(session) {
  return (
    session.customerName ||
    session.customer?.name ||
    session.customer?.fullName ||
    session.customerId ||
    "ไม่ระบุลูกค้า"
  );
}

function getComputerName(session) {
  return (
    session.computerName ||
    session.computer?.name ||
    session.computer?.computerName ||
    session.computerId ||
    "ไม่ระบุเครื่อง"
  );
}

function getSessionFee(session) {
  return Number(session.fee ?? session.totalFee ?? session.amount ?? 0) || 0;
}

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // โหลดประวัติจาก Backend API
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setApiError("");

      try {
        const data = await apiRequest("/api/usageSessions");

        const list = Array.isArray(data)
          ? data.map((value, index) => ({
              ...value,
              firebaseKey:
                value.firebaseKey || value.id || String(index),
            }))
          : Object.entries(data || {}).map(([key, value]) => ({
              ...value,
              firebaseKey: value.firebaseKey || key,
            }));

        const completedSessions = list
          .filter((session) => Boolean(session.endTime))
          .sort(
            (a, b) =>
              new Date(b.endTime).getTime() -
              new Date(a.endTime).getTime()
          );

        if (!cancelled) {
          setSessions(completedSessions);
        }
      } catch (error) {
        console.error("โหลดประวัติไม่สำเร็จ:", error);

        if (!cancelled) {
          setApiError(
            error.message ||
              "โหลดประวัติไม่สำเร็จ กรุณาตรวจสอบ Backend"
          );
          setSessions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ค้นหาข้อมูลและกรองตามวันที่
  const filteredSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const customerName = getCustomerName(session).toLowerCase();
      const computerName = getComputerName(session).toLowerCase();
      const customerId = String(session.customerId || "").toLowerCase();
      const computerId = String(session.computerId || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        customerName.includes(keyword) ||
        computerName.includes(keyword) ||
        customerId.includes(keyword) ||
        computerId.includes(keyword);

      const sessionDate = toDateInputValue(session.endTime);

      const matchesStartDate =
        !startDate || (sessionDate && sessionDate >= startDate);

      const matchesEndDate =
        !endDate || (sessionDate && sessionDate <= endDate);

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [sessions, search, startDate, endDate]);

  // สรุปเวลาการใช้งานและรายได้ตามผลการค้นหา
  const summary = useMemo(() => {
    return filteredSessions.reduce(
      (result, session) => {
        result.totalMinutes += getDuration(session);
        result.totalRevenue += getSessionFee(session);
        return result;
      },
      { totalMinutes: 0, totalRevenue: 0 }
    );
  }, [filteredSessions]);

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div style={styles.page}>
      {/* ส่วนหัว */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIcon}>
            <HistoryIcon size={27} />
          </div>

          <div>
            <h1 style={styles.title}>ประวัติการใช้บริการ</h1>
            <div style={styles.subtitle}>
              ตรวจสอบรายการใช้งานเครื่องคอมพิวเตอร์ย้อนหลัง
            </div>
          </div>
        </div>

        <button
          type="button"
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
          }}
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
        </button>
      </div>

      {/* การ์ดสรุปข้อมูล */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <div
            style={{
              ...styles.cardIcon,
              background: "#dbeafe",
              color: "#2563eb",
            }}
          >
            <ReceiptText size={24} />
          </div>

          <div>
            <div style={styles.cardLabel}>จำนวนรายการใช้งาน</div>
            <div style={styles.cardValue}>
              {filteredSessions.length.toLocaleString("th-TH")} รายการ
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div
            style={{
              ...styles.cardIcon,
              background: "#fef3c7",
              color: "#d97706",
            }}
          >
            <Clock3 size={24} />
          </div>

          <div>
            <div style={styles.cardLabel}>เวลาการใช้งานรวม</div>
            <div style={styles.cardValue}>
              {formatDuration(summary.totalMinutes)}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div
            style={{
              ...styles.cardIcon,
              background: "#dcfce7",
              color: "#16a34a",
            }}
          >
            <Wallet size={24} />
          </div>

          <div>
            <div style={styles.cardLabel}>รายได้รวม</div>
            <div style={styles.cardValue}>
              {formatMoney(summary.totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนค้นหาและกรองข้อมูล */}
      <div style={styles.panel}>
        <div style={styles.filterHeader}>
          <Search size={19} />
          ค้นหาและกรองข้อมูล
        </div>

        <div style={styles.filters}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>ค้นหาลูกค้าหรือเครื่อง</label>
            <input
              type="text"
              style={styles.input}
              placeholder="ชื่อผู้ใช้, ชื่อเครื่อง หรือรหัส..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>ตั้งแต่วันที่</label>
            <input
              type="date"
              style={styles.input}
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>ถึงวันที่</label>
            <input
              type="date"
              style={styles.input}
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <div style={{ ...styles.fieldGroup, justifyContent: "flex-end" }}>
            <label style={styles.label}>ตัวเลือก</label>
            <button
              type="button"
              style={styles.button}
              onClick={clearFilters}
            >
              <X size={15} />
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* ตารางประวัติ */}
      <div style={styles.panel}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>รายการประวัติการใช้บริการ</h2>
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            พบ {filteredSessions.length.toLocaleString("th-TH")} รายการ
          </span>
        </div>

        {apiError && (
          <div style={styles.error}>
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ลูกค้า</th>
                <th style={styles.th}>เครื่องคอมพิวเตอร์</th>
                <th style={styles.th}>เวลาเริ่มใช้</th>
                <th style={styles.th}>เวลาสิ้นสุด</th>
                <th style={styles.th}>ระยะเวลา</th>
                <th style={styles.th}>ค่าบริการ</th>
                <th style={styles.th}>สถานะ</th>
                <th style={styles.th}>รายละเอียด</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={styles.message}>
                    <RefreshCw
                      size={22}
                      style={{ verticalAlign: "middle", marginRight: 8 }}
                    />
                    กำลังโหลดประวัติการใช้บริการ...
                  </td>
                </tr>
              ) : apiError ? (
                <tr>
                  <td colSpan={8} style={styles.message}>
                    ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ Backend API
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.message}>
                    <HistoryIcon
                      size={30}
                      style={{ marginBottom: 8, opacity: 0.5 }}
                    />
                    <div>ไม่พบประวัติการใช้บริการ</div>
                    <div style={{ fontSize: "12px", marginTop: "6px" }}>
                      ลองเปลี่ยนคำค้นหา หรือตรวจสอบว่ามีรายการที่สิ้นสุดแล้ว
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.firebaseKey}>
                    <td style={styles.td}>
                      <div style={styles.person}>
                        <div style={styles.smallIcon}>
                          <UserRound size={17} />
                        </div>

                        <div>
                          <div style={{ fontWeight: "600" }}>
                            {getCustomerName(session)}
                          </div>
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {session.customerId || "-"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.person}>
                        <div
                          style={{
                            ...styles.smallIcon,
                            background: "#f1f5f9",
                            color: "#475569",
                          }}
                        >
                          <Monitor size={17} />
                        </div>

                        <div>
                          <div style={{ fontWeight: "600" }}>
                            {getComputerName(session)}
                          </div>
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {session.computerId || ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      {formatDateTime(session.startTime)}
                    </td>

                    <td style={styles.td}>
                      {formatDateTime(session.endTime)}
                    </td>

                    <td style={styles.td}>
                      {formatDuration(getDuration(session))}
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        color: "#15803d",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatMoney(getSessionFee(session))}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>เสร็จสิ้น</span>
                    </td>

                    <td style={styles.td}>
                      <button
                        type="button"
                        style={styles.detailButton}
                        onClick={() => setSelectedSession(session)}
                      >
                        <Eye size={14} />
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* หน้าต่างรายละเอียด */}
      {selectedSession && (
        <div
          style={styles.overlay}
          onClick={() => setSelectedSession(null)}
        >
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={styles.titleIcon}>
                  <ReceiptText size={22} />
                </div>

                <div>
                  <h3 style={styles.modalTitle}>รายละเอียดการใช้บริการ</h3>
                  <div style={styles.subtitle}>
                    ข้อมูลรายการใช้งานที่เลือก
                  </div>
                </div>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={() => setSelectedSession(null)}
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {[
                ["รหัสรายการ", selectedSession.firebaseKey],
                ["ชื่อลูกค้า", getCustomerName(selectedSession)],
                ["รหัสลูกค้า", selectedSession.customerId || "-"],
                ["เครื่องคอมพิวเตอร์", getComputerName(selectedSession)],
                ["รหัสเครื่อง", selectedSession.computerId || "-"],
                ["เวลาเริ่มใช้งาน", formatDateTime(selectedSession.startTime)],
                ["เวลาสิ้นสุด", formatDateTime(selectedSession.endTime)],
                [
                  "ระยะเวลาใช้งาน",
                  formatDuration(getDuration(selectedSession)),
                ],
                [
                  "อัตราค่าบริการต่อชั่วโมง",
                  formatMoney(selectedSession.hourlyRate),
                ],
                ["ค่าบริการรวม", formatMoney(getSessionFee(selectedSession))],
                ["สถานะ", "เสร็จสิ้น"],
              ].map(([label, value]) => (
                <div style={styles.detailRow} key={label}>
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span
                    style={{
                      fontWeight: "600",
                      textAlign: "right",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "0 20px 20px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                style={{
                  ...styles.button,
                  background: "#2563eb",
                  borderColor: "#2563eb",
                  color: "#fff",
                }}
                onClick={() => setSelectedSession(null)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
