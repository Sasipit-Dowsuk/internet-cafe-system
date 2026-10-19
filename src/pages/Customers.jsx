
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
} from "lucide-react";

import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
} from "firebase/database";

import { database } from "../services/firebase";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // อ่านข้อมูลลูกค้าจาก Firebase แบบเรียลไทม์
  useEffect(() => {
    const customersRef = ref(database, "customers");

    const unsubscribe = onValue(
      customersRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setCustomers([]);
          setLoading(false);
          return;
        }

        const customerList = Object.entries(data).map(
          ([firebaseKey, customer]) => ({
            firebaseKey,
            id: customer.id || firebaseKey,
            name: customer.name || "",
            phone: customer.phone || "",
            email: customer.email || "",
          })
        );

        customerList.sort((a, b) =>
          a.id.localeCompare(b.id)
        );

        setCustomers(customerList);
        setLoading(false);
      },
      (firebaseError) => {
        console.error("อ่านข้อมูลลูกค้าไม่สำเร็จ:", firebaseError);
        setError("ไม่สามารถอ่านข้อมูลจาก Firebase ได้ กรุณาตรวจสอบการตั้งค่าและสิทธิ์ฐานข้อมูล");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ค้นหาลูกค้า
  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) =>
      [
        customer.id,
        customer.name,
        customer.phone,
        customer.email,
      ].some((value) =>
        String(value || "").toLowerCase().includes(keyword)
      )
    );
  }, [customers, search]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingId(customer.firebaseKey);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
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

  // สร้างรหัสลูกค้าจากรหัสที่มีอยู่
  const createCustomerId = () => {
    const maxNumber = customers.reduce((max, customer) => {
      const match = String(customer.id).match(/^CUS(\d+)$/);
      return match
        ? Math.max(max, Number(match[1]))
        : max;
    }, 0);

    return `CUS${String(maxNumber + 1).padStart(3, "0")}`;
  };

  // เพิ่มหรือแก้ไขข้อมูลใน Firebase
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!name || !phone) {
      setError("กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }

    if (!/^[0-9+\-\s]{9,15}$/.test(phone)) {
      setError("กรุณาตรวจสอบรูปแบบเบอร์โทรศัพท์");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("กรุณาตรวจสอบรูปแบบอีเมล");
      return;
    }

    setSaving(true);

    try {
      const customerData = {
        name,
        phone,
        email,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        const existingCustomer = customers.find(
          (customer) => customer.firebaseKey === editingId
        );

        await update(
          ref(database, `customers/${editingId}`),
          customerData
        );
      } else {
        const customersRef = ref(database, "customers");
        const newCustomerRef = push(customersRef);

        await set(newCustomerRef, {
          ...customerData,
          id: createCustomerId(),
          createdAt: new Date().toISOString(),
        });
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setError("");
    } catch (firebaseError) {
      console.error("บันทึกข้อมูลลูกค้าไม่สำเร็จ:", firebaseError);
      setError("บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อและสิทธิ์ Firebase");
    } finally {
      setSaving(false);
    }
  };

  // ลบข้อมูลจาก Firebase
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await remove(
        ref(database, `customers/${deleteTarget.firebaseKey}`)
      );

      setDeleteTarget(null);
      setError("");
    } catch (firebaseError) {
      console.error("ลบข้อมูลลูกค้าไม่สำเร็จ:", firebaseError);
      setError("ลบข้อมูลไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firebase");
      setDeleteTarget(null);
    }
  };

  return (
    <section className="customers-page">
      <div className="page-header">
        <div>
          <h1>จัดการข้อมูลผู้ใช้บริการ</h1>
          <p>เพิ่ม แก้ไข ค้นหา และจัดการข้อมูลผู้ใช้บริการของร้าน</p>
        </div>

        <button
          type="button"
          className="customers-primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>เพิ่มผู้ใช้บริการ</span>
        </button>
      </div>

      <div className="customers-summary">
        <div className="customers-summary-icon">
          <Users size={22} />
        </div>
        <div>
          <p>ผู้ใช้บริการทั้งหมด</p>
          <h2>
            {customers.length.toLocaleString("th-TH")} <span>ราย</span>
          </h2>
        </div>
      </div>

      <div className="content-card customers-card">
        <div className="customers-toolbar">
          <div>
            <h2>รายชื่อผู้ใช้บริการ</h2>
            <p>พบ {filteredCustomers.length} รายการ</p>
          </div>

          <div className="customers-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="ค้นหารหัส ชื่อ หรือเบอร์โทร..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="ค้นหาผู้ใช้บริการ"
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

        {error && !modalOpen && (
          <p className="customers-form-error" role="alert">
            {error}
          </p>
        )}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>รหัสผู้ใช้บริการ</th>
                <th>ชื่อ-นามสกุล</th>
                <th>เบอร์โทรศัพท์</th>
                <th>อีเมล</th>
                <th className="customers-actions-heading">จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    กำลังโหลดข้อมูลจาก Firebase...
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.firebaseKey}>
                    <td>
                      <span className="customers-id">
                        {customer.id}
                      </span>
                    </td>
                    <td className="customers-name">{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || "—"}</td>
                    <td>
                      <div className="customers-row-actions">
                        <button
                          type="button"
                          className="customers-edit-button"
                          onClick={() => openEditModal(customer)}
                          aria-label={`แก้ไข ${customer.name}`}
                          title="แก้ไขข้อมูล"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="customers-delete-button"
                          onClick={() => setDeleteTarget(customer)}
                          aria-label={`ลบ ${customer.name}`}
                          title="ลบข้อมูล"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    {customers.length === 0
                      ? "ยังไม่มีข้อมูลผู้ใช้บริการ กรุณาเพิ่มข้อมูล"
                      : "ไม่พบข้อมูลผู้ใช้บริการที่ตรงกับคำค้นหา"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="customers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="customers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customers-modal-title"
          >
            <div className="customers-modal-header">
              <div>
                <h2 id="customers-modal-title">
                  {editingId
                    ? "แก้ไขข้อมูลผู้ใช้บริการ"
                    : "เพิ่มผู้ใช้บริการ"}
                </h2>
                <p>
                  {editingId
                    ? `รหัสผู้ใช้บริการ ${
                        customers.find(
                          (customer) =>
                            customer.firebaseKey === editingId
                        )?.id || ""
                      }`
                    : "กรอกข้อมูลผู้ใช้บริการที่ต้องการเพิ่ม"}
                </p>
              </div>
              <button
                type="button"
                className="customers-close-button"
                onClick={closeModal}
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </div>

            <form className="customers-form" onSubmit={handleSubmit}>
              <div className="customers-form-field">
                <label htmlFor="customer-name">
                  ชื่อ-นามสกุล <span>*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder="กรอกชื่อและนามสกุล"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  autoFocus
                  required
                />
              </div>

              <div className="customers-form-field">
                <label htmlFor="customer-phone">
                  เบอร์โทรศัพท์ <span>*</span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="กรอกเบอร์โทรศัพท์"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  required
                />
              </div>

              <div className="customers-form-field">
                <label htmlFor="customer-email">อีเมล</label>
                <input
                  id="customer-email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </div>

              {error && (
                <p className="customers-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="customers-modal-actions">
                <button
                  type="button"
                  className="customers-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="customers-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "กำลังบันทึก..."
                    : editingId
                      ? "บันทึกการแก้ไข"
                      : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className="customers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <section
            className="customers-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customers-delete-title"
          >
            <div className="customers-delete-icon">
              <Trash2 size={24} />
            </div>
            <h2 id="customers-delete-title">ยืนยันการลบข้อมูล</h2>
            <p>
              ต้องการลบข้อมูลของ <strong>{deleteTarget.name}</strong> ใช่หรือไม่?
            </p>
            <p className="customers-delete-note">
              ข้อมูลนี้จะถูกลบออกจาก Firebase ด้วย
            </p>
            <div className="customers-modal-actions">
              <button
                type="button"
                className="customers-secondary-button"
                onClick={() => setDeleteTarget(null)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="customers-danger-button"
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

export default Customers;
