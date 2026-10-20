
import { useEffect, useMemo, useState } from "react";
// ไอคอน
import {
  Search,
  Plus,
  Monitor,
  Pencil,
  Trash2,
  X,
  Power,
  CheckCircle2,
  Clock3,
  Ban,
} from "lucide-react";
import { apiRequest } from "../services/api";

const statusInfo = {
  available: { label: "ว่าง", className: "available" },
  in_use: { label: "กำลังใช้งาน", className: "in-use" },
  unavailable: { label: "ปิดใช้งาน", className: "unavailable" },
};

const emptyForm = {
  id: "",
  name: "",
  status: "available",
};

function Computers() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // โหลดข้อมูลเครื่องผ่าน Backend API
  const loadComputers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/computers");
      const list = Array.isArray(data)
        ? data
        : Object.entries(data || {}).map(([key, value]) => ({
            ...value,
            firebaseKey: value.firebaseKey || value.id || key,
          }));

      setComputers(
        list.map((item) => ({
          ...item,
          firebaseKey: item.firebaseKey || item.id,
        }))
      );
      setApiError("");
    } catch (err) {
      console.error("โหลดข้อมูลเครื่องไม่สำเร็จ:", err);
      setApiError(err.message || "โหลดข้อมูลเครื่องไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComputers();
  }, []);

  // สรุปจำนวนเครื่องตามสถานะ
  const counts = useMemo(
    () => ({
      all: computers.length,
      available: computers.filter(
        (item) => item.status === "available"
      ).length,
      in_use: computers.filter(
        (item) => item.status === "in_use"
      ).length,
      unavailable: computers.filter(
        (item) => item.status === "unavailable"
      ).length,
    }),
    [computers]
  );

  // ค้นหาและกรองสถานะ
  const filteredComputers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return computers.filter((computer) => {
      const matchesSearch =
        String(computer.id || "").toLowerCase().includes(keyword) ||
        String(computer.name || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        computer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [computers, search, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (computer) => {
    setEditingId(computer.firebaseKey);
    setForm({
      id: computer.id || "",
      name: computer.name || "",
      status: computer.status || "available",
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // เพิ่มหรือแก้ไขข้อมูลเครื่อง
  const handleSubmit = async (event) => {
    event.preventDefault();

    const id = form.id.trim().toUpperCase();
    const name = form.name.trim();

    if (!id || !name) {
      setError("กรุณากรอกรหัสเครื่องและชื่อเครื่อง");
      return;
    }

    const duplicate = computers.some(
      (computer) =>
        String(computer.id || "").toUpperCase() === id &&
        String(computer.firebaseKey) !== String(editingId)
    );

    if (duplicate) {
      setError("รหัสเครื่องนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await apiRequest(`/api/computers/${encodeURIComponent(editingId)}`, {
          method: "PUT",
          body: JSON.stringify({ name }),
        });
      } else {
        await apiRequest("/api/computers", {
          method: "POST",
          body: JSON.stringify({ id, name, status: "available" }),
        });
      }
      await loadComputers();

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (apiErr) {
      console.error("บันทึกข้อมูลเครื่องไม่สำเร็จ:", apiErr);
      setError(apiErr.message || "บันทึกข้อมูลเครื่องไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // เปิดหรือปิดใช้งานเครื่อง
  const toggleAvailability = async (computer) => {
    if (computer.status === "in_use") return;

    const nextStatus =
      computer.status === "available"
        ? "unavailable"
        : "available";

    try {
      await apiRequest(`/api/computers/${encodeURIComponent(computer.firebaseKey)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadComputers();
    } catch (apiErr) {
      console.error("เปลี่ยนสถานะเครื่องไม่สำเร็จ:", apiErr);
      alert(apiErr.message || "เปลี่ยนสถานะเครื่องไม่สำเร็จ");
    }
  };

  // ลบข้อมูลเครื่อง
  const confirmDelete = async () => {
    if (
      !deleteTarget ||
      deleteTarget.status === "in_use"
    ) {
      return;
    }

    try {
      await apiRequest(`/api/computers/${encodeURIComponent(deleteTarget.firebaseKey)}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadComputers();
    } catch (apiErr) {
      console.error("ลบข้อมูลเครื่องไม่สำเร็จ:", apiErr);
      alert(apiErr.message || "ลบข้อมูลเครื่องไม่สำเร็จ");
    }
  };

  return (
    <section className="computers-page">
      <div className="page-header">
        <div>
          <h1>จัดการเครื่องคอมพิวเตอร์</h1>
          <p>เพิ่ม แก้ไข ค้นหา และตรวจสอบสถานะเครื่องคอมพิวเตอร์</p>
        </div>

        <button
          type="button"
          className="computers-primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          เพิ่มเครื่องคอมพิวเตอร์
        </button>
      </div>

      {apiError && (
        <div role="alert" style={{ color: "#dc2626", marginBottom: 16 }}>
          {apiError}
        </div>
      )}

      <div className="computers-summary-grid">
        <button
          type="button"
          className={`computers-summary-card ${
            statusFilter === "all" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("all")}
        >
          <div className="computers-summary-icon total">
            <Monitor size={21} />
          </div>
          <div>
            <p>เครื่องทั้งหมด</p>
            <h2>{counts.all}</h2>
          </div>
        </button>

        <button
          type="button"
          className={`computers-summary-card ${
            statusFilter === "available" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("available")}
        >
          <div className="computers-summary-icon available">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <p>เครื่องว่าง</p>
            <h2>{counts.available}</h2>
          </div>
        </button>

        <button
          type="button"
          className={`computers-summary-card ${
            statusFilter === "in_use" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("in_use")}
        >
          <div className="computers-summary-icon in-use">
            <Clock3 size={21} />
          </div>
          <div>
            <p>กำลังใช้งาน</p>
            <h2>{counts.in_use}</h2>
          </div>
        </button>

        <button
          type="button"
          className={`computers-summary-card ${
            statusFilter === "unavailable" ? "selected" : ""
          }`}
          onClick={() => setStatusFilter("unavailable")}
        >
          <div className="computers-summary-icon unavailable">
            <Ban size={21} />
          </div>
          <div>
            <p>ปิดใช้งาน</p>
            <h2>{counts.unavailable}</h2>
          </div>
        </button>
      </div>

      <div className="content-card computers-list-card">
        <div className="computers-toolbar">
          <div>
            <h2>รายการเครื่องคอมพิวเตอร์</h2>
            <p>
              {loading
                ? "กำลังโหลดข้อมูล..."
                : `แสดง ${filteredComputers.length} จาก ${computers.length} เครื่อง`}
            </p>
          </div>

          <div className="computers-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหารหัสหรือชื่อเครื่อง..."
              aria-label="ค้นหาเครื่องคอมพิวเตอร์"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="ล้างคำค้นหา"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="computers-grid">
          {loading ? (
            <div className="computers-empty-state">
              <Monitor size={32} />
              <p>กำลังโหลดข้อมูลเครื่องคอมพิวเตอร์...</p>
            </div>
          ) : filteredComputers.length > 0 ? (
            filteredComputers.map((computer) => {
              const status =
                statusInfo[computer.status] || statusInfo.available;

              return (
                <article
                  className="computer-card"
                  key={computer.firebaseKey}
                >
                  <div className="computer-card-header">
                    <div className="computer-device-icon">
                      <Monitor size={25} strokeWidth={1.7} />
                    </div>
                    <span className={`computer-status ${status.className}`}>
                      <span className="computer-status-dot" />
                      {status.label}
                    </span>
                  </div>

                  <div className="computer-card-info">
                    <h3>{computer.id}</h3>
                    <p>{computer.name}</p>
                  </div>

                  <div className="computer-card-actions">
                    <button
                      type="button"
                      className="computer-action-button"
                      onClick={() => openEditModal(computer)}
                      title="แก้ไขข้อมูลเครื่อง"
                      aria-label={`แก้ไข ${computer.id}`}
                    >
                      <Pencil size={15} />
                      แก้ไข
                    </button>

                    {computer.status !== "in_use" && (
                      <button
                        type="button"
                        className="computer-action-button"
                        onClick={() => toggleAvailability(computer)}
                        title={
                          computer.status === "available"
                            ? "ปิดใช้งานเครื่อง"
                            : "เปิดใช้งานเครื่อง"
                        }
                      >
                        <Power size={15} />
                        {computer.status === "available"
                          ? "ปิดเครื่อง"
                          : "เปิดเครื่อง"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="computer-action-button delete"
                      onClick={() => setDeleteTarget(computer)}
                      disabled={computer.status === "in_use"}
                      title="ลบข้อมูลเครื่อง"
                      aria-label={`ลบ ${computer.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="computers-empty-state">
              <Monitor size={32} />
              <p>
                {computers.length === 0
                  ? "ยังไม่มีข้อมูลเครื่องคอมพิวเตอร์ กรุณาเพิ่มเครื่องแรก"
                  : "ไม่พบเครื่องคอมพิวเตอร์ที่ตรงกับเงื่อนไข"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div
          className="computers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="computers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="computer-modal-title"
          >
            <div className="computers-modal-header">
              <div>
                <h2 id="computer-modal-title">
                  {editingId
                    ? "แก้ไขข้อมูลเครื่อง"
                    : "เพิ่มเครื่องคอมพิวเตอร์"}
                </h2>
                <p>
                  {editingId
                    ? `รหัสเครื่อง ${form.id}`
                    : "กรอกข้อมูลเครื่องคอมพิวเตอร์"}
                </p>
              </div>
              <button
                type="button"
                className="computers-close-button"
                onClick={closeModal}
                aria-label="ปิดหน้าต่าง"
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form className="computers-form" onSubmit={handleSubmit}>
              <div className="computers-form-field">
                <label htmlFor="computer-id">
                  รหัสเครื่อง <span>*</span>
                </label>
                <input
                  id="computer-id"
                  value={form.id}
                  onChange={(event) =>
                    setForm({ ...form, id: event.target.value })
                  }
                  placeholder="เช่น PC-21"
                  disabled={Boolean(editingId) || saving}
                  required
                />
              </div>

              <div className="computers-form-field">
                <label htmlFor="computer-name">
                  ชื่อเครื่อง <span>*</span>
                </label>
                <input
                  id="computer-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="เช่น เครื่อง 21"
                  disabled={saving}
                  required
                />
              </div>

              {error && (
                <p className="computers-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="computers-modal-actions">
                <button
                  type="button"
                  className="computers-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="computers-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "กำลังบันทึก..."
                    : editingId
                      ? "บันทึกการแก้ไข"
                      : "เพิ่มเครื่อง"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className="computers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <section
            className="computers-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-computer-title"
          >
            <div className="computers-delete-icon">
              <Trash2 size={23} />
            </div>
            <h2 id="delete-computer-title">ยืนยันการลบเครื่อง</h2>
            <p>
              ต้องการลบเครื่อง <strong>{deleteTarget.id}</strong> (
              {deleteTarget.name}) ใช่หรือไม่?
            </p>
            <div className="computers-modal-actions">
              <button
                type="button"
                className="computers-secondary-button"
                onClick={() => setDeleteTarget(null)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="computers-danger-button"
                onClick={confirmDelete}
              >
                ยืนยันการลบ
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default Computers;
