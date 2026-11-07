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
/** ยอดแฟรนไชส์ ต่อสาขา รายชั่วโมง รายสินค้า · server คิดด้วยสูตรกลางตัวเดียวกับรายงานร้าน (Pack เคาะ 2026-11-07) · ช่วงละไม่เกิน 31 วัน */
export const franchiseBreakdown = post('franchiseBreakdown');

// ── ตัวช่วยรูปคำขอ (pure · เทสได้) ────────────────────────────────────────────

/** สิทธิ์ของเมนูยอดขาย (server `franchise.billList` `franchise.breakdown` รับตัวใดตัวหนึ่ง) */
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

// ── รวมผล franchise.breakdown หลายช่วง (ช่วงเกิน 31 วัน) · ❌ ไม่คิดยอดเอง แค่บวกสตางค์ของแต่ละช่วง (แบบ mergeBreakdown ของเว็บเจ้าของร้าน) ──
const SUM_FIELDS = ['qty', 'count', 'billQty', 'voidQty', 'legacyV1Qty', 'netMissingQty', 'unknownQty'];
const MONEY_FIELDS = ['totalPrice', 'net', 'billDiscountShare', 'netAfterBillDiscount', 'totalSale', 'currentTotal', 'legacyV1Total', 'voidTotal'];
const sat = (v) => Math.round((Number(v) || 0) * 100);
function addRow(into, row) {
  const out = { ...into };
  for (const k of SUM_FIELDS) if (row[k] !== undefined) out[k] = Number(((Number(out[k]) || 0) + Number(row[k])).toPrecision(12)) || 0;
  for (const k of MONEY_FIELDS) if (row[k] !== undefined) out[k] = (sat(out[k]) + sat(row[k])) / 100;
  return out;
}
/** ยอดเฉลี่ยต่อบิล ปัด 2 ตำแหน่ง (สูตรเดียวกับ server · ใช้หลังบวกหลายช่วง) */
const averageOf = (totalSale, billQty) => (billQty > 0 ? Math.sign(sat(totalSale)) * Math.round(Math.abs(sat(totalSale)) / billQty) / 100 : 0);
const mergeBy = (lists, keyOf) => {
  const m = new Map();
  for (const list of lists) for (const r of list || []) { const k = keyOf(r); m.set(k, m.has(k) ? addRow(m.get(k), r) : { ...r }); }
  return [...m.values()];
};
/** parts = คำตอบ franchise.breakdown ทีละช่วง → {totals, shops, hours, items} ช่วงเดียว */
export function mergeFranchiseBreakdown(parts) {
  const list = (parts || []).filter(Boolean);
  if (!list.length) return { totals: { billQty: 0, totalSale: 0, average: 0, voidQty: 0, voidTotal: 0, shopQty: 0, shopWithSale: 0 }, shops: [], hours: [], items: [] };
  if (list.length === 1) return { totals: list[0].totals, shops: list[0].shops, hours: list[0].hours, items: list[0].items };
  let totals = {};
  for (const p of list) totals = addRow(totals, p.totals || {});
  const shops = mergeBy(list.map((p) => p.shops), (r) => r.shopId).map((s) => ({ ...s, average: averageOf(s.totalSale, s.billQty) }))
    .sort((a, b) => b.totalSale - a.totalSale);
  const hours = mergeBy(list.map((p) => p.hours), (r) => r.key).sort((a, b) => (a.key < b.key ? -1 : 1));
  const items = mergeBy(list.map((p) => p.items), (r) => r.key).sort((a, b) => b.netAfterBillDiscount - a.netAfterBillDiscount);
  totals = { ...totals, average: averageOf(totals.totalSale, totals.billQty), shopQty: Math.max(...list.map((p) => (p.totals && p.totals.shopQty) || 0)), shopWithSale: shops.filter((s) => s.billQty > 0).length };
  return { totals, shops, hours, items };
}
