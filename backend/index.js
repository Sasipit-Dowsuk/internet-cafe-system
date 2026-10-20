
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// เชื่อมต่อ Firebase ด้วยสิทธิ์ฝั่งเซิร์ฟเวอร์
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = getDatabase();

const PORT = process.env.PORT || 5000;
const HOURLY_RATE = 20;

// ตรวจสอบว่า Backend ทำงานอยู่
app.get("/", (req, res) => {
  res.json({ message: "Internet Cafe Backend is running" });
});

// อ่านข้อมูลจาก Firebase
app.get("/api/:collection", async (req, res) => {
  const allowed = ["customers", "computers", "usageSessions"];
  const { collection } = req.params;

  if (!allowed.includes(collection)) {
    return res.status(400).json({ message: "ไม่รองรับข้อมูลนี้" });
  }

  try {
    const snapshot = await db.ref(collection).get();
    const data = snapshot.val() || {};

    const result = Object.entries(data).map(([key, value]) => ({
      ...value,
      firebaseKey: key,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "อ่านข้อมูลไม่สำเร็จ" });
  }
});

// เพิ่มข้อมูลลูกค้า
app.post("/api/customers", async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "กรุณาระบุชื่อลูกค้า",
      });
    }

    const newRef = db.ref("customers").push();

    const customer = {
      name: name.trim(),
      phone: phone || "",
      email: email || "",
      createdAt: new Date().toISOString(),
    };

    await newRef.set(customer);

    res.status(201).json({
      message: "เพิ่มข้อมูลลูกค้าสำเร็จ",
      firebaseKey: newRef.key,
      ...customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เพิ่มข้อมูลไม่สำเร็จ" });
  }
});

// เริ่มใช้บริการ
app.post("/api/usage/start", async (req, res) => {
  try {
    const { customerKey, computerKey } = req.body;

    if (!customerKey || !computerKey) {
      return res.status(400).json({
        message: "กรุณาเลือกลูกค้าและเครื่องคอมพิวเตอร์",
      });
    }

    const customerRef = db.ref(`customers/${customerKey}`);
    const computerRef = db.ref(`computers/${computerKey}`);

    const [customerSnap, computerSnap] = await Promise.all([
      customerRef.get(),
      computerRef.get(),
    ]);

    if (!customerSnap.exists()) {
      return res.status(404).json({ message: "ไม่พบข้อมูลลูกค้า" });
    }

    if (!computerSnap.exists()) {
      return res.status(404).json({ message: "ไม่พบเครื่องคอมพิวเตอร์" });
    }

    const customer = customerSnap.val();
    const computer = computerSnap.val();

    // ตรวจสอบสถานะเครื่อง
    const statusRef = db.ref(`computers/${computerKey}/status`);
    const claim = await statusRef.transaction((status) => {
      if (status !== "available") return;
      return "in_use";
    });

    if (!claim.committed) {
      return res.status(409).json({
        message: "เครื่องนี้ไม่ว่างหรือกำลังใช้งานอยู่",
      });
    }

    const startTime = new Date().toISOString();
    const sessionRef = db.ref("usageSessions").push();

    const session = {
      customerKey,
      customerId: customer.id || customerKey,
      customerName: customer.name || customer.fullName || "ไม่ระบุชื่อ",
      computerKey,
      computerId: computer.id || computerKey,
      computerName: computer.name || computer.id || computerKey,
      startTime,
      hourlyRate: HOURLY_RATE,
      status: "active",
    };

    try {
      await sessionRef.set(session);
    } catch (error) {
      // หากสร้างรายการไม่สำเร็จ ให้คืนสถานะเครื่อง
      await statusRef.transaction((status) =>
        status === "in_use" ? "available" : status
      );
      throw error;
    }

    res.status(201).json({
      message: "เริ่มใช้บริการสำเร็จ",
      firebaseKey: sessionRef.key,
      ...session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เริ่มใช้บริการไม่สำเร็จ" });
  }
});

// สิ้นสุดการใช้บริการและคำนวณค่าบริการ
app.post("/api/usage/:sessionKey/end", async (req, res) => {
  try {
    const { sessionKey } = req.params;
    const sessionRef = db.ref(`usageSessions/${sessionKey}`);
    const snapshot = await sessionRef.get();

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "ไม่พบรายการใช้บริการ" });
    }

    const session = snapshot.val();

    if (session.endTime) {
      return res.status(409).json({
        message: "รายการนี้สิ้นสุดการใช้งานแล้ว",
      });
    }

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const durationMinutes = Math.max(
      1,
      Math.ceil((endTime.getTime() - startTime.getTime()) / 60000)
    );

    const hourlyRate = Number(session.hourlyRate || HOURLY_RATE);
    const fee = Math.round((durationMinutes / 60) * hourlyRate * 100) / 100;

    const updates = {};
    updates[`usageSessions/${sessionKey}/endTime`] =
      endTime.toISOString();
    updates[`usageSessions/${sessionKey}/durationMinutes`] =
      durationMinutes;
    updates[`usageSessions/${sessionKey}/fee`] = fee;
    updates[`usageSessions/${sessionKey}/status`] = "completed";

    await db.ref().update(updates);

    // คืนสถานะเครื่องให้ว่าง เฉพาะเมื่อยังเป็นเครื่องของ session นี้
    const computerStatusRef = db.ref(
      `computers/${session.computerKey}/status`
    );

    const activeSnapshot = await db.ref("usageSessions").get();
    const sessions = activeSnapshot.val() || {};

    const anotherActiveSession = Object.entries(sessions).some(
      ([key, item]) =>
        key !== sessionKey &&
        item.computerKey === session.computerKey &&
        !item.endTime
    );

    if (!anotherActiveSession) {
      await computerStatusRef.transaction((status) =>
        status === "in_use" ? "available" : status
      );
    }

    res.json({
      message: "สิ้นสุดการใช้บริการสำเร็จ",
      durationMinutes,
      fee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "สิ้นสุดการใช้บริการไม่สำเร็จ",
    });
  }
});

// เพิ่มเครื่องคอมพิวเตอร์
app.post("/api/computers", async (req, res) => {
  try {
    const { id, name, status = "available" } = req.body;

    if (!id || !name) {
      return res.status(400).json({
        message: "กรุณากรอกรหัสเครื่องและชื่อเครื่อง",
      });
    }

    const computerRef = db.ref(`computers/${id}`);
    const snapshot = await computerRef.get();

    if (snapshot.exists()) {
      return res.status(409).json({
        message: "รหัสเครื่องนี้มีอยู่แล้ว",
      });
    }

    await computerRef.set({
      id,
      name,
      status,
    });

    res.status(201).json({
      message: "เพิ่มเครื่องสำเร็จ",
      id,
      name,
      status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เพิ่มเครื่องไม่สำเร็จ",
    });
  }
});

// แก้ไขชื่อเครื่อง
app.put("/api/computers/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const computerRef = db.ref(`computers/${req.params.id}`);
    const snapshot = await computerRef.get();

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "ไม่พบเครื่องคอมพิวเตอร์",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "กรุณากรอกชื่อเครื่อง",
      });
    }

    await computerRef.update({ name: name.trim() });

    res.json({ message: "แก้ไขข้อมูลเครื่องสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "แก้ไขข้อมูลไม่สำเร็จ",
    });
  }
});

// เปลี่ยนสถานะเครื่อง
app.patch("/api/computers/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["available", "unavailable"];
    const computerRef = db.ref(`computers/${req.params.id}`);
    const snapshot = await computerRef.get();

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "ไม่พบเครื่องคอมพิวเตอร์",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "สถานะเครื่องไม่ถูกต้อง",
      });
    }

    if (snapshot.val().status === "in_use") {
      return res.status(409).json({
        message: "ไม่สามารถเปลี่ยนสถานะเครื่องที่กำลังใช้งานได้",
      });
    }

    await computerRef.update({ status });

    res.json({ message: "เปลี่ยนสถานะเครื่องสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เปลี่ยนสถานะเครื่องไม่สำเร็จ",
    });
  }
});

// ลบเครื่องคอมพิวเตอร์
app.delete("/api/computers/:id", async (req, res) => {
  try {
    const computerRef = db.ref(`computers/${req.params.id}`);
    const snapshot = await computerRef.get();

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "ไม่พบเครื่องคอมพิวเตอร์",
      });
    }

    if (snapshot.val().status === "in_use") {
      return res.status(409).json({
        message: "ไม่สามารถลบเครื่องที่กำลังใช้งานได้",
      });
    }

    await computerRef.remove();

    res.json({ message: "ลบเครื่องสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "ลบเครื่องไม่สำเร็จ",
    });
  }
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

