// franchiseApi.js — ตัวเรียกเส้นแฟรนไชส์ 17 เส้น (ก้อน 9f · ใบ DEV-0002) · แทนการอ่าน/เขียน Firestore ตรงของจอ
//
// สัญญา: `shopchamp-center/api/franchise.*.yaml` · schema คำขอ `@shopchamp/schema` `requests/franchise.ts` (strict ทุกตัว ⇒ ส่งเฉพาะช่องที่สัญญามี)
// ทุกตัวคืน data ของคำตอบ (`{ok:true,...}`) · error = รูป axios ⇒ จอใช้ `apiErrorMessage` / `serverErrorCode` จาก posApi
// เส้นยังไม่ขึ้น cloud = 404 ⇒ "ยังไม่เปิดใช้งาน" · ❌ ไม่ถอยไปเขียน Firestore
import { postApi, newRequestId } from './posApi';
import { ENDPOINTS } from './endpoints';

const post = (key) => (body) => postApi(ENDPOINTS[key], body);

export const franchiseList = () => postApi(ENDPOINTS.franchiseList, {});
export const franchiseGet = (franchiseId) => postApi(ENDPOINTS.franchiseGet, { franchiseId });
export const franchiseCreate = ({ franchiseUUID = newRequestId(), name }) =>
  postApi(ENDPOINTS.franchiseCreate, { franchiseUUID, name });
export const franchiseProfileUpdate = post('franchiseProfileUpdate');
export const franchiseCategorySave = post('franchiseCategorySave');
export const franchiseWarehouseList = (franchiseId) => postApi(ENDPOINTS.franchiseWarehouseList, { franchiseId });
export const franchiseWarehouseSave = post('franchiseWarehouseSave');
export const franchiseWarehouseDelete = post('franchiseWarehouseDelete');
export const franchiseLinkList = (franchiseId) => postApi(ENDPOINTS.franchiseLinkList, { franchiseId });
export const franchiseLinkSave = post('franchiseLinkSave');
export const franchiseLinkDelete = post('franchiseLinkDelete');
export const franchiseBranchList = (franchiseId) => postApi(ENDPOINTS.franchiseBranchList, { franchiseId });
export const franchiseBranchFind = post('franchiseBranchFind');
export const franchiseBranchAttach = post('franchiseBranchAttach');
export const franchiseStaffFind = post('franchiseStaffFind');
export const franchiseStaffSave = post('franchiseStaffSave');
export const franchiseBillList = post('franchiseBillList');

// ── ตัวช่วยรูปคำขอ (pure · เทสได้) ────────────────────────────────────────────

/** สิทธิ์ของเมนูยอดขาย (server `franchise.billList` รับตัวใดตัวหนึ่ง) */
export const SALES_RIGHTS = ['100', '103', '104'];

/** ผู้เรียกมีสิทธิ์ตัวนี้ไหม (ทีมงาน = ครบ) · access จาก `franchise.get` */
export const hasRight = (access, id) => !!access && (access.byAdmin === true || (Array.isArray(access.rights) && access.rights.includes(id)));

/** ต้นหมวดรูปที่สัญญารับ (strict: node มีแค่ id name level aboveId · ตัดชั้นว่าง) */
export function categoryTreeOf(levels) {
  return (Array.isArray(levels) ? levels : [])
    .filter((lv) => lv && Array.isArray(lv.value) && lv.value.length > 0)
    .map((lv) => ({
      level: Number(lv.level),
      value: lv.value.map((n) => ({
        id: String(n.id),
        name: String(n.name || '').trim(),
        level: Number(n.level),
        aboveId: Array.isArray(n.aboveId) ? n.aboveId.map(String) : [],
      })),
    }));
}

/** หมวดของสินค้า → array ของ id (จอถือ object ตอนแก้ · ST-107 เดิมเก็บ object ลงฐาน) */
export const categoryIdsOf = (category) =>
  (Array.isArray(category) ? category : [])
    .map((c) => (typeof c === 'string' ? c : c && typeof c.id === 'string' ? c.id : null))
    .filter(Boolean);

const WAREHOUSE_FIELDS = ['name', 'price', 'barcode', 'sku', 'unit', 'category', 'imageId', 'pointStatus', 'stockCountStatus', 'customQtyStatus', 'customPriceStatus', 'priceLevelStatus', 'priceLevel'];

/** ค่าฟอร์มคลัง → ช่องที่สัญญารับ (ราคาเป็นตัวเลข · หมวดเป็น id · priceLevel {qty, price}) */
export function warehouseFieldsOf(form) {
  const f = form || {};
  return {
    name: String(f.name || '').trim(),
    price: Number(f.price),
    barcode: f.barcode === undefined || f.barcode === null ? '' : String(f.barcode).trim(),
    sku: f.sku === undefined || f.sku === null ? '' : String(f.sku).trim(),
    unit: typeof f.unit === 'string' && f.unit.trim() ? f.unit.trim() : 'ชิ้น',
    category: categoryIdsOf(f.category),
    imageId: typeof f.imageId === 'string' ? f.imageId : '',
    pointStatus: f.pointStatus !== false,
    stockCountStatus: f.stockCountStatus !== false,
    customQtyStatus: f.customQtyStatus === true,
    customPriceStatus: f.customPriceStatus === true,
    priceLevelStatus: f.priceLevelStatus === true,
    priceLevel: (Array.isArray(f.priceLevel) ? f.priceLevel : []).map((p) => ({ qty: Number(p.qty), price: Number(p.price) })),
  };
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * คำขอ `franchise.warehouseSave`
 *   ไม่มี before (สินค้าใหม่) = op create ทุกช่อง · มี before = op update เฉพาะช่องที่ต่างจากที่โหลดมา (WH-11 · ไม่ทับช่องที่คนอื่นแก้)
 *   ไม่มีช่องไหนเปลี่ยน = null (จอไม่ต้องยิง)
 */
export function warehouseSaveBody({ franchiseId, form, before, itemUUID }) {
  const next = warehouseFieldsOf(form);
  if (!before) return { franchiseId, op: 'create', itemUUID, ...next };
  const prev = warehouseFieldsOf(before);
  const patch = {};
  for (const k of WAREHOUSE_FIELDS) if (!same(next[k], prev[k])) patch[k] = next[k];
  if (!Object.keys(patch).length) return null;
  return { franchiseId, op: 'update', itemId: before.id, ...patch };
}

/** คำขอ `franchise.linkSave` · ตัวคูณเป็นตัวเลข · มี id = update ไม่มี = create (linkUUID) */
export function linkSaveBody({ franchiseId, current, linkUUID }) {
  const { id, stockGroupName = '', stockLink = [] } = current || {};
  const members = stockLink.map((m) => ({ id: m.id, linkMultiply: Number(m.linkMultiply) }));
  const base = { franchiseId, stockGroupName: String(stockGroupName).trim(), members };
  return id ? { ...base, op: 'update', linkId: id } : { ...base, op: 'create', linkUUID };
}

/** ตัวคูณของกลุ่มผูก: จำนวนเต็ม 1 ถึง 100,000 ไม่ซ้ำกัน และตัวคูณ 1 มีตัวเดียว (กติกาเดียวกับ server `link.js`) · คืนข้อความ หรือ '' */
export function linkProblem(stockLink) {
  const xs = (Array.isArray(stockLink) ? stockLink : []).map((m) => Number(m.linkMultiply));
  if (xs.some((x) => !Number.isInteger(x) || x < 1 || x > 100000)) return 'ตัวคูณต้องเป็นจำนวนเต็ม 1 ถึง 100,000';
  if (new Set(xs).size !== xs.length) return 'ตัวคูณซ้ำกันในกลุ่ม';
  const ones = xs.filter((x) => x === 1).length;
  if (ones === 0) return 'กรุณาเลือกสินค้าที่ใช้เป็นอ้างอิง 1 รายการ';
  if (ones > 1) return 'กรุณาเลือกสินค้าที่ใช้เป็นอ้างอิงได้เพียง 1 รายการเท่านั้น';
  return '';
}

/** สิทธิ์ที่ส่ง `franchise.staffSave`: เฉพาะรหัสเมนูที่สัญญารู้จัก · ตัดตัวซ้ำ (เมนูคลัง 4 ตัวใช้รหัส 128 ตัวเดียวกัน) */
const KNOWN_RIGHTS = new Set(['100', '103', '104', '107', '128', '723', '130']);
export const rightsOf = (rights) => [...new Set((Array.isArray(rights) ? rights : []).map(String).filter((r) => KNOWN_RIGHTS.has(r)))];

/** Date → 'YYYYMMDD' (เวลาเครื่อง) */
export const dayKeyOf = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, '0')}${String(x.getDate()).padStart(2, '0')}`;
};

/** แบ่งช่วงวัน start..end (รวม) เป็นก้อนละไม่เกิน 31 วัน (เพดานของ `franchise.billList`) · คืน [{fromDay, toDay}] */
export function dayRanges(start, end, max = 31) {
  const a = new Date(new Date(start).getFullYear(), new Date(start).getMonth(), new Date(start).getDate());
  const b = new Date(new Date(end).getFullYear(), new Date(end).getMonth(), new Date(end).getDate());
  const out = [];
  if (a > b) return out;
  let cur = a;
  while (cur <= b) {
    const stop = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + max - 1);
    const to = stop < b ? stop : b;
    out.push({ fromDay: dayKeyOf(cur), toDay: dayKeyOf(to) });
    cur = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);
  }
  return out;
}
