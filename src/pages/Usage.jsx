
import { useEffect, useState } from "react";
import {
  Monitor,
  UserRound,
  Play,
  Square,
  Clock3,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "../services/api";

const HOURLY_RATE = 20;

function formatDateTime(timestamp) {
  if (!timestamp) return "-";

  return new Date(timestamp).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toMillis(timestamp) {
  if (!timestamp) return 0;
  if (typeof timestamp === "number") return timestamp;
  const parsed = new Date(timestamp).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDuration(startTime, now = Date.now()) {
  if (!startTime) return "00:00:00";

  const seconds = Math.max(
    0,
    Math.floor((now - toMillis(startTime)) / 1000)
  );

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function calculateUsage(startTime, endTime) {
  const durationMinutes = Math.max(
    1,
    Math.ceil((toMillis(endTime) - toMillis(startTime)) / 60000)
  );

  const fee =
    Math.round((durationMinutes / 60) * HOURLY_RATE * 100) / 100;

  return { durationMinutes, fee };
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Usage() {
  const [customers, setCustomers] = useState([]);
  const [computers, setComputers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedComputer, setSelectedComputer] = useState("");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(Date.now());

  // โหลดข้อมูลผ่าน Node.js Backend API
  const loadData = async () => {
    setLoading(true);
    setFirebaseError("");

    try {
      const [customerData, computerData, sessionData] = await Promise.all([
        apiRequest("/api/customers"),
        apiRequest("/api/computers"),
        apiRequest("/api/usageSessions"),
      ]);

      setCustomers(Array.isArray(customerData) ? customerData : []);
      setComputers(Array.isArray(computerData) ? computerData : []);
      setSessions(
        (Array.isArray(sessionData) ? sessionData : []).sort(
          (a, b) => toMillis(b.startTime) - toMillis(a.startTime)
        )
      );
    } catch (error) {
      console.error("Backend API error:", error);
      setFirebaseError(
        error.message || "โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบว่า Backend ทำงานอยู่"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // โหลดข้อมูลเมื่อเปิดหน้า Usage เท่านั้น
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // อัปเดตตัวจับเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const availableComputers = computers.filter(
    (computer) => computer.status === "available"
  );

  const activeSessions = sessions.filter(
    (session) => !session.endTime
  );

  const completedSessions = sessions.filter(
    (session) => Boolean(session.endTime)
  );

  const filteredActiveSessions = activeSessions.filter((session) => {
    const keyword = search.trim().toLowerCase();

    return (
      String(session.customerName || "").toLowerCase().includes(keyword) ||
      String(session.computerName || "").toLowerCase().includes(keyword) ||
      String(session.computerId || "").toLowerCase().includes(keyword)
    );
  });

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // เริ่มต้นการใช้บริการ
  const handleStart = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!selectedCustomer || !selectedComputer) {
      showMessage("กรุณาเลือกลูกค้าและเครื่องคอมพิวเตอร์", "error");
      return;
    }

    const customer = customers.find(
      (item) => item.firebaseKey === selectedCustomer
    );

    const computer = computers.find(
      (item) => item.firebaseKey === selectedComputer
    );

    if (!customer || !computer) {
      showMessage("ไม่พบข้อมูลลูกค้าหรือเครื่องคอมพิวเตอร์", "error");
      return;
    }

    if (computer.status !== "available") {
      showMessage("เครื่องนี้ไม่ว่าง กรุณาเลือกเครื่องอื่น", "error");
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest("/api/usage/start", {
        method: "POST",
        body: JSON.stringify({
          customerKey: selectedCustomer,
          computerKey: selectedComputer,
        }),
      });

      setSelectedCustomer("");
      setSelectedComputer("");
      await loadData();
      showMessage(result.message || `เริ่มใช้บริการ ${computer.name || computer.id} เรียบร้อยแล้ว`);
    } catch (error) {
      console.error("เริ่มใช้บริการไม่สำเร็จ:", error);
      showMessage(error.message || "เริ่มใช้บริการไม่สำเร็จ กรุณาตรวจสอบ Backend", "error");
    } finally {
      setSaving(false);
    }
  };

  // สิ้นสุดการใช้บริการ
  const handleFinish = async (session) => {
    if (!session.firebaseKey) {
      showMessage("ไม่พบรหัสรายการใช้บริการ", "error");
      return;
    }

    const confirmed = window.confirm(
      `ยืนยันสิ้นสุดการใช้บริการ ${session.computerName} ของ ${session.customerName}?`
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    try {
      const result = await apiRequest(
        `/api/usage/${encodeURIComponent(session.firebaseKey)}/end`,
        { method: "POST" }
      );

      await loadData();
      showMessage(
        `${result.message || "สิ้นสุดบริการแล้ว"} ระยะเวลา ${result.durationMinutes} นาที ค่าบริการ ${formatMoney(result.fee)} บาท`
      );
    } catch (error) {
      console.error("สิ้นสุดการใช้บริการไม่สำเร็จ:", error);
      showMessage(error.message || "บันทึกการสิ้นสุดไม่สำเร็จ กรุณาตรวจสอบ Backend", "error");
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    page: { padding: "4px 0 24px", color: "#1f2937" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    subtitle: { color: "#6b7280", marginTop: 6, fontSize: 14 },
    button: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "11px 16px",
      border: "none",
      borderRadius: 9,
      background: "#2563eb",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: 16,
      marginBottom: 24,
    },
    card: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: 20,
      boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
    },
    statLabel: { color: "#6b7280", fontSize: 14, marginBottom: 8 },
    statNumber: { fontSize: 26, fontWeight: 700, margin: 0 },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
      marginTop: 18,
    },
    label: {
      display: "block",
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 8,
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      padding: "11px 12px",
      background: "#fff",
      color: "#111827",
      fontSize: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 6px" },
    muted: { color: "#6b7280", fontSize: 13 },
    session: {
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginTop: 12,
    },
    sessionInfo: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    deviceIcon: {
      width: 46,
      height: 46,
      borderRadius: 12,
      background: "#eff6ff",
      color: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    finishButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      border: "none",
      borderRadius: 8,
      padding: "10px 13px",
      background: "#dc2626",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    },
    empty: {
      textAlign: "center",
      color: "#6b7280",
      padding: "28px 12px",
    },
  };

  return (
    <section style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>เริ่มต้นและสิ้นสุดการใช้บริการ</h1>
          <p style={styles.subtitle}>
            จัดการการเข้าใช้เครื่อง บันทึกเวลา และคำนวณค่าบริการ
          </p>
        </div>
        <button
          type="button"
          style={{
            ...styles.button,
            background: "#fff",
            color: "#374151",
            border: "1px solid #d1d5db",
          }}
          onClick={loadData}
        >
          <RefreshCw size={17} />
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
          <AlertCircle size={17} style={{ verticalAlign: "middle", marginRight: 8 }} />
          {firebaseError}
        </div>
      )}

      {message && (
        <div
          role="status"
          style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            background: messageType === "error" ? "#fef2f2" : "#f0fdf4",
            color: messageType === "error" ? "#b91c1c" : "#166534",
          }}
        >
          {messageType === "error" ? (
            <AlertCircle size={17} style={{ verticalAlign: "middle", marginRight: 8 }} />
          ) : (
            <CheckCircle2 size={17} style={{ verticalAlign: "middle", marginRight: 8 }} />
          )}
          {message}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...styles.deviceIcon, background: "#eff6ff" }}>
              <Monitor size={22} />
            </div>
            <div>
              <p style={styles.statLabel}>เครื่องว่าง</p>
              <p style={styles.statNumber}>{computers.filter((c) => c.status === "available").length}</p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...styles.deviceIcon, background: "#fff7ed", color: "#ea580c" }}>
              <Clock3 size={22} />
            </div>
            <div>
              <p style={styles.statLabel}>กำลังใช้บริการ</p>
              <p style={styles.statNumber}>{activeSessions.length}</p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...styles.deviceIcon, background: "#f0fdf4", color: "#16a34a" }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p style={styles.statLabel}>ใช้บริการเสร็จแล้ว</p>
              <p style={styles.statNumber}>{completedSessions.length}</p>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...styles.deviceIcon, background: "#f5f3ff", color: "#7c3aed" }}>
              <UserRound size={22} />
            </div>
            <div>
              <p style={styles.statLabel}>อัตราค่าบริการ</p>
              <p style={styles.statNumber}>
                {formatMoney(HOURLY_RATE)} <span style={{ fontSize: 14, fontWeight: 500 }}>บาท/ชั่วโมง</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, marginBottom: 24 }}>
        <h2 style={styles.sectionTitle}>เริ่มต้นการใช้บริการ</h2>
        <p style={styles.muted}>
          เลือกลูกค้าและเครื่องคอมพิวเตอร์ที่ว่างเพื่อเริ่มบันทึกเวลา
        </p>

        {loading ? (
          <p style={styles.empty}>กำลังโหลดข้อมูลจาก Backend...</p>
        ) : (
          <form onSubmit={handleStart}>
            <div style={styles.formGrid}>
              <div>
                <label htmlFor="usage-customer" style={styles.label}>
                  ลูกค้า <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  id="usage-customer"
                  value={selectedCustomer}
                  onChange={(event) => setSelectedCustomer(event.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">-- เลือกลูกค้า --</option>
                  {customers.map((customer) => (
                    <option key={customer.firebaseKey} value={customer.firebaseKey}>
                      {customer.name || customer.fullName || customer.customerName || customer.id || customer.firebaseKey}
                    </option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <p style={{ ...styles.muted, color: "#b45309" }}>
                    ยังไม่มีข้อมูลลูกค้า กรุณาเพิ่มลูกค้าก่อน
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="usage-computer" style={styles.label}>
                  เครื่องคอมพิวเตอร์ <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  id="usage-computer"
                  value={selectedComputer}
                  onChange={(event) => setSelectedComputer(event.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">-- เลือกเครื่องที่ว่าง --</option>
                  {availableComputers.map((computer) => (
                    <option key={computer.firebaseKey} value={computer.firebaseKey}>
                      {computer.id} - {computer.name}
                    </option>
                  ))}
                </select>
                {availableComputers.length === 0 && (
                  <p style={{ ...styles.muted, color: "#b45309" }}>
                    ไม่มีเครื่องว่าง กรุณาเพิ่มเครื่องหรือเปิดใช้งานเครื่องก่อน
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: saving || customers.length === 0 || availableComputers.length === 0 ? 0.6 : 1,
                }}
                disabled={saving || customers.length === 0 || availableComputers.length === 0}
              >
                <Play size={17} />
                {saving ? "กำลังบันทึก..." : "เริ่มใช้บริการ"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div>
            <h2 style={styles.sectionTitle}>รายการที่กำลังใช้บริการ</h2>
            <p style={styles.muted}>ตรวจสอบเวลาและสิ้นสุดการใช้งานของลูกค้า</p>
          </div>
          <div style={{ position: "relative", width: "min(100%, 300px)" }}>
            <Search
              size={17}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: "#9ca3af",
              }}
            />
            <input
              type="search"
              placeholder="ค้นหาลูกค้าหรือเครื่อง..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...styles.input, paddingLeft: 38 }}
              aria-label="ค้นหารายการที่กำลังใช้บริการ"
            />
          </div>
        </div>

        {loading ? (
          <p style={styles.empty}>กำลังโหลดรายการจาก Backend...</p>
        ) : filteredActiveSessions.length === 0 ? (
          <div style={styles.empty}>
            <Monitor size={34} style={{ marginBottom: 8 }} />
            <p style={{ margin: 0 }}>
              {activeSessions.length === 0
                ? "ขณะนี้ไม่มีลูกค้าที่กำลังใช้บริการ"
                : "ไม่พบรายการที่ตรงกับคำค้นหา"}
            </p>
          </div>
        ) : (
          filteredActiveSessions.map((session) => (
            <article key={session.firebaseKey} style={styles.session}>
              <div style={styles.sessionInfo}>
                <div style={styles.deviceIcon}>
                  <Monitor size={23} />
                </div>
                <div>
                  <h3 style={{ margin: "0 0 5px", fontSize: 16 }}>
                    {session.computerId} - {session.computerName}
                  </h3>
                  <p style={{ margin: "0 0 5px", fontSize: 14 }}>
                    <UserRound
                      size={14}
                      style={{ verticalAlign: "middle", marginRight: 5 }}
                    />
                    {session.customerName}
                  </p>
                  <p style={styles.muted}>
                    เริ่มเวลา: {formatDateTime(session.startTime)}
                  </p>
                </div>
              </div>

              <div style={{ minWidth: 145 }}>
                <p style={{ ...styles.muted, marginBottom: 5 }}>เวลาที่ใช้ไป</p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatDuration(session.startTime, now)}
                </p>
              </div>

              <div>
                <p style={{ ...styles.muted, marginBottom: 5 }}>
                  ค่าบริการโดยประมาณ
                </p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  {formatMoney(
                    calculateUsage(session.startTime, now).fee
                  )}{" "}
                  บาท
                </p>
              </div>

              <button
                type="button"
                style={{
                  ...styles.finishButton,
                  opacity: saving ? 0.6 : 1,
                }}
                disabled={saving}
                onClick={() => handleFinish(session)}
              >
                <Square size={15} />
                สิ้นสุดบริการ
              </button>
            </article>
          ))
        )}
      </div>

      <p style={{ ...styles.muted, marginTop: 14 }}>
        * คิดค่าบริการ {formatMoney(HOURLY_RATE)} บาทต่อชั่วโมง ตามสัดส่วนเวลาที่ใช้
        โดยปัดระยะเวลาขึ้นเป็นนาทีเต็มขั้นต่ำ 1 นาที
      </p>
    </section>
  );
}

export default Usage;
