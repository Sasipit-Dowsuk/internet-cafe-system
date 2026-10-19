
import { useEffect, useMemo, useState } from "react";
import {
  ref,
  onValue,
} from "firebase/database";
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
} from "lucide-react";
import { database } from "../services/firebase";

function formatDateTime(timestamp) {
  if (!timestamp) return "-";

  return new Date(timestamp).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(minutes) {
  const totalMinutes = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) return `${remainingMinutes} นาที`;
  if (remainingMinutes === 0) return `${hours} ชั่วโมง`;

  return `${hours} ชั่วโมง ${remainingMinutes} นาที`;
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toDateInputValue(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  // อ่านประวัติจาก Firebase แบบเรียลไทม์
  useEffect(() => {
    const sessionsRef = ref(database, "usageSessions");

    const unsubscribe = onValue(
      sessionsRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        const list = Object.entries(data)
          .map(([key, value]) => ({
            ...value,
            firebaseKey: key,
          }))
          // แสดงเฉพาะรายการที่สิ้นสุดบริการแล้ว
          .filter((session) => Boolean(session.endTime))
          .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));

        setSessions(list);
        setFirebaseError("");
        setLoading(false);
      },
      (error) => {
        console.error("โหลดประวัติไม่สำเร็จ:", error);
        setFirebaseError(
          "โหลดประวัติไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อและ Firebase Rules"
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ค้นหาและกรองตามวันที่
  const filteredSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch = [
        session.customerName,
        session.computerName,
        session.computerId,
        session.customerId,
      ].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      );

      const sessionDate = toDateInputValue(session.endTime);

      const matchesStartDate =
        !startDate || sessionDate >= startDate;

      const matchesEndDate =
        !endDate || sessionDate <= endDate;

      return (
        matchesSearch &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [sessions, search, startDate, endDate]);

  const totalMinutes = filteredSessions.reduce(
    (sum, session) => sum + (Number(session.durationMinutes) || 0),
    0
  );

  const totalRevenue = filteredSessions.reduce(
    (sum, session) => sum + (Number(session.fee) || 0),
    0
  );

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  const styles = {
    page: {
      padding: "4px 0 24px",
      color: "#1f2937",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    subtitle: {
      color: "#6b7280",
      marginTop: 6,
      fontSize: 14,
    },
    card: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: 20,
      boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16,
      marginBottom: 24,
    },
    summaryLabel: {
      color: "#6b7280",
      fontSize: 14,
      margin: "0 0 8px",
    },
    summaryValue: {
      fontSize: 25,
      fontWeight: 700,
      margin: 0,
    },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    toolbar: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "end",
      gap: 14,
      marginTop: 18,
      marginBottom: 20,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      flex: "1 1 180px",
      minWidth: 0,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "#374151",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      background: "#fff",
      color: "#111827",
      fontSize: 14,
    },
    secondaryButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      padding: "10px 13px",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      background: "#fff",
      color: "#374151",
      cursor: "pointer",
      fontWeight: 500,
    },
    tableWrap: {
      width: "100%",
      overflowX: "auto",
    },
    table: {
      width: "100%",
      minWidth: 850,
      borderCollapse: "collapse",
      fontSize: 13,
    },
    th: {
      textAlign: "left",
      padding: "13px 12px",
      color: "#6b7280",
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "14px 12px",
      borderBottom: "1px solid #f3f4f6",
      verticalAlign: "middle",
    },
    muted: {
      color: "#6b7280",
      fontSize: 12,
      marginTop: 4,
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      borderRadius: 20,
      padding: "5px 9px",
      background: "#dcfce7",
      color: "#166534",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    detailButton: {
      border: "1px solid #dbeafe",
      background: "#eff6ff",
      color: "#1d4ed8",
      borderRadius: 7,
      padding: "7px 10px",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
    },
  };

  return (
    <section style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>
            ประวัติการใช้บริการ
          </h1>
          <p style={styles.subtitle}>
            ตรวจสอบรายการใช้บริการ ระยะเวลา และค่าบริการย้อนหลัง
          </p>
        </div>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} />
          รีเฟรช
        </button>
      </div>

      {firebaseError && (
        <div
          role="alert"
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#fef2f2",
            color: "#b91c1c",
            marginBottom: 16,
          }}
        >
          <AlertCircle
            size={17}
            style={{ verticalAlign: "middle", marginRight: 8 }}
          />
          {firebaseError}
        </div>
      )}

      <div style={styles.summaryGrid}>
        <div style={styles.card}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                ...styles.iconBox,
                background: "#eff6ff",
                color: "#2563eb",
              }}
            >
              <HistoryIcon size={22} />
            </div>
            <div>
              <p style={styles.summaryLabel}>รายการที่เสร็จสิ้น</p>
              <p style={styles.summaryValue}>
                {filteredSessions.length}{" "}
                <span style={{ fontSize: 14, fontWeight: 500 }}>รายการ</span>
              </p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                ...styles.iconBox,
                background: "#fff7ed",
                color: "#ea580c",
              }}
            >
              <Clock3 size={22} />
            </div>
            <div>
              <p style={styles.summaryLabel}>เวลาใช้งานรวม</p>
              <p style={styles.summaryValue}>
                {Math.floor(totalMinutes / 60)}{" "}
                <span style={{ fontSize: 14, fontWeight: 500 }}>ชม.</span>{" "}
                {totalMinutes % 60}{" "}
                <span style={{ fontSize: 14, fontWeight: 500 }}>นาที</span>
              </p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                ...styles.iconBox,
                background: "#f0fdf4",
                color: "#16a34a",
              }}
            >
              <Wallet size={22} />
            </div>
            <div>
              <p style={styles.summaryLabel}>รายได้รวม</p>
              <p style={styles.summaryValue}>
                {formatMoney(totalRevenue)}{" "}
                <span style={{ fontSize: 14, fontWeight: 500 }}>บาท</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={{ fontSize: 18, margin: 0 }}>
          รายการประวัติการใช้บริการ
        </h2>
        <p style={styles.subtitle}>
          ค้นหาจากชื่อลูกค้า รหัสเครื่อง หรือชื่อเครื่อง และกรองตามวันที่สิ้นสุดบริการ
        </p>

        <div style={styles.toolbar}>
          <div style={{ ...styles.field, flex: "2 1 220px" }}>
            <label htmlFor="history-search" style={styles.label}>
              ค้นหาข้อมูล
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={17}
                style={{
                  position: "absolute",
                  top: 12,
                  left: 11,
                  color: "#9ca3af",
                }}
              />
              <input
                id="history-search"
                type="search"
                placeholder="ชื่อลูกค้า หรือรหัสเครื่อง..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ ...styles.input, paddingLeft: 36 }}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label htmlFor="history-start-date" style={styles.label}>
              ตั้งแต่วันที่
            </label>
            <input
              id="history-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="history-end-date" style={styles.label}>
              ถึงวันที่
            </label>
            <input
              id="history-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              style={styles.input}
            />
          </div>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={clearFilters}
          >
            <X size={16} />
            ล้างตัวกรอง
          </button>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ลูกค้า</th>
                <th style={styles.th}>เครื่องคอมพิวเตอร์</th>
                <th style={styles.th}>เวลาเริ่ม</th>
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
                  <td colSpan={8} style={{ ...styles.td, textAlign: "center", padding: 35 }}>
                    กำลังโหลดประวัติจาก Firebase...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...styles.td, textAlign: "center", padding: 35 }}>
                    <ReceiptText
                      size={34}
                      style={{ color: "#9ca3af", marginBottom: 8 }}
                    />
                    <p style={{ margin: 0, color: "#6b7280" }}>
                      {sessions.length === 0
                        ? "ยังไม่มีประวัติการใช้บริการที่เสร็จสิ้น"
                        : "ไม่พบรายการที่ตรงกับเงื่อนไข"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.firebaseKey}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <UserRound size={17} color="#6b7280" />
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {session.customerName || "ไม่ระบุชื่อ"}
                          </div>
                          <div style={styles.muted}>
                            {session.customerId || "-"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Monitor size={17} color="#6b7280" />
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {session.computerId || "-"}
                          </div>
                          <div style={styles.muted}>
                            {session.computerName || "-"}
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
                      {formatDuration(session.durationMinutes)}
                    </td>

                    <td style={{ ...styles.td, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {formatMoney(session.fee)} บาท
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
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ ...styles.muted, marginTop: 14 }}>
          แสดง {filteredSessions.length} จาก {sessions.length} รายการ
        </p>
      </div>

      {selectedSession && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSession(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1000,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-detail-title"
            style={{
              background: "#fff",
              borderRadius: 14,
              width: "100%",
              maxWidth: 480,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <h2 id="history-detail-title" style={{ margin: 0, fontSize: 20 }}>
                รายละเอียดการใช้บริการ
              </h2>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                aria-label="ปิดรายละเอียด"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <X size={21} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 15 }}>
              <div>
                <p style={styles.summaryLabel}>ลูกค้า</p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selectedSession.customerName || "ไม่ระบุชื่อ"}
                </p>
              </div>

              <div>
                <p style={styles.summaryLabel}>เครื่องคอมพิวเตอร์</p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selectedSession.computerId || "-"} -{" "}
                  {selectedSession.computerName || "-"}
                </p>
              </div>

              <div>
                <p style={styles.summaryLabel}>วันและเวลาเริ่มบริการ</p>
                <p style={{ margin: 0 }}>
                  <CalendarDays
                    size={15}
                    style={{ verticalAlign: "middle", marginRight: 7 }}
                  />
                  {formatDateTime(selectedSession.startTime)}
                </p>
              </div>

              <div>
                <p style={styles.summaryLabel}>วันและเวลาสิ้นสุดบริการ</p>
                <p style={{ margin: 0 }}>
                  <CalendarDays
                    size={15}
                    style={{ verticalAlign: "middle", marginRight: 7 }}
                  />
                  {formatDateTime(selectedSession.endTime)}
                </p>
              </div>

              <div>
                <p style={styles.summaryLabel}>ระยะเวลาใช้งาน</p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {formatDuration(selectedSession.durationMinutes)}
                </p>
              </div>

              <div
                style={{
                  background: "#f0fdf4",
                  padding: 16,
                  borderRadius: 10,
                }}
              >
                <p style={{ ...styles.summaryLabel, color: "#166534" }}>
                  ค่าบริการรวม
                </p>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#166534" }}>
                  {formatMoney(selectedSession.fee)} บาท
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSession(null)}
              style={{
                width: "100%",
                marginTop: 22,
                padding: 11,
                border: "none",
                borderRadius: 8,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ปิดหน้าต่าง
            </button>
          </section>
        </div>
      )}
    </section>
  );
}

export default History;
