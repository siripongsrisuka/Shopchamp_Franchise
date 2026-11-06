// posApi.js — ตัวยิง API ชุดใหม่ของเว็บแฟรนไชส์ (ชุดเดียวกับเว็บเจ้าของร้าน) (ใบ DEV-0002 · ใช้สัญญาของ DEV-0001 `shopchamp-center/api/*.yaml`)
//
// - แนบ Firebase ID token ของคนที่ login อยู่ใน `Authorization: Bearer` ทุกคำขอ · 401 = ขอ token ใหม่แล้วยิงซ้ำ 1 ครั้ง
// - ซองคำตอบของ server: 2xx `{ok:true,...}` · non-2xx `{ok:false, error, message}`
// - ปลายทางเลือกตอน build (`configs/apiTarget.js`) ไม่มีสวิตช์ตอนรัน
// - เส้นที่ยังไม่ขึ้น cloud = 404 ⇒ บอกผู้ใช้ว่า "ยังไม่เปิดใช้งาน" · ❌ ไม่ถอยไปเขียน Firestore ตรง
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { firebaseAuth } from '../db/firestore';
import { apiTarget } from '../configs/apiTarget';

export const API_TIMEOUT_MS = 60000;

// path ตรงกับบรรทัด `# route:` ของสัญญา · function อยู่ใน segment แรก (`pos` / `pos_heavy`)
export const ENDPOINTS = {
  profileManage: '/pos/profile/manage',
};

export const NOT_DEPLOYED_MESSAGE = 'ยังไม่เปิดใช้งาน · ระบบส่วนนี้กำลังปรับปรุง กรุณาลองใหม่ภายหลัง';

const client = axios.create({
  baseURL: apiTarget().apiBase,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken(config.__forceRefresh === true);
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const cfg = error && error.config;
    if (error && error.response && error.response.status === 401 && cfg && !cfg.__retried401) {
      cfg.__retried401 = true;
      cfg.__forceRefresh = true;
      return client.request(cfg);
    }
    throw error;
  },
);

/** POST แล้วคืน `data` ของคำตอบ · error = รูป axios (มี `response` เมื่อ server ตอบ) */
export async function postApi(path, body) {
  const { data } = await client.post(path, body);
  return data;
}

/** รหัสกันกดซ้ำ (uuid v4) ของคำขอ 1 ครั้ง */
export const newRequestId = () => uuidv4();

const envelope = (error) =>
  error && error.response && error.response.data && typeof error.response.data === 'object' ? error.response.data : null;

/**
 * เส้นนี้ยังไม่ขึ้น cloud ไหม
 *   function ยังไม่ deploy = 404 หน้า HTML ของ Google (ไม่มีซอง)
 *   function ขึ้นแล้วแต่รุ่นนั้นยังไม่มีเส้นนี้ = 404 `not_found` (ตัว router) หรือ `wrong_function`
 *   ❌ ไม่นับ 404 ที่ handler ตอบเอง เช่น `member_not_found` (นั่นคือเส้นมีอยู่จริง)
 */
export const isNotDeployed = (error) => {
  if (!error || !error.response || error.response.status !== 404) return false;
  const env = envelope(error);
  if (!env || env.ok !== false || !env.error) return true;
  return env.error === 'not_found' || env.error === 'wrong_function';
};

/** ยิงไม่ถึง server (ไม่มี response) */
export const isNoResponse = (error) => !!error && !error.response;

/** รหัส error จากซอง `{ok:false, error}` · ไม่มี = '' */
export const serverErrorCode = (error) => (envelope(error) && envelope(error).error) || '';

/** ข้อความไทยสำหรับแสดงผู้ใช้ */
export const apiErrorMessage = (error, fallback = 'ทำรายการไม่สำเร็จ') => {
  if (isNotDeployed(error)) return NOT_DEPLOYED_MESSAGE;
  if (isNoResponse(error)) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่';
  const env = envelope(error);
  return (env && env.message) || fallback;
};
