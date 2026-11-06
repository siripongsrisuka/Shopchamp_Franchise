// apiTarget.js — ปลายทางของ API ชุดใหม่ (`/pos/*` `/pos_heavy/*`) · เลือกตอน build เท่านั้น (ใบ DEV-0002 · ชุดเดียวกับเว็บเจ้าของร้าน · แบบเดียวกับแอป `src/config/apiTarget.js`)
//
// ❌ ไม่ใช่สวิตช์ตอนรัน: ร้านเปลี่ยนเองไม่ได้ ไม่มีจอ ไม่อ่านจากฐาน (กฎ no-branch ข้อ 2)
// เปลี่ยนตอน build ด้วยตัวแปร `REACT_APP_API_TARGET` (react-scripts ฝังค่าลงไฟล์ตอน build) · ไม่ตั้ง = `prod`
//   prod   API = cloud function ของ shopcham-24b0b (asia-southeast2)
//   local  API = เครื่อง dev `http://127.0.0.1:5055` (server ตัวทดสอบบนเครื่อง · ใช้เทสก่อน route ขึ้น cloud)
// เส้นที่ยังไม่ขึ้น cloud ตอบ 404 ⇒ จอบอก "ยังไม่เปิดใช้งาน" (api/posApi.js › isNotDeployed) · ❌ ไม่ถอยไปเขียน Firestore ตรง
export const TARGETS = {
  prod: { apiBase: 'https://asia-southeast2-shopcham-24b0b.cloudfunctions.net' },
  local: { apiBase: 'http://127.0.0.1:5055' },
};

export const API_TARGET = process.env.REACT_APP_API_TARGET || 'prod';

export const apiTarget = () => TARGETS[API_TARGET] || TARGETS.prod;
