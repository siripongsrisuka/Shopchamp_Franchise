// franchiseApi.test.js — คำขอทั้ง 17 เส้นของเว็บแฟรนไชส์ผ่าน schema ตัวจริงของสัญญา (ใบ DEV-0002 · ก้อน 9f)
// รัน: CI=true npx react-scripts test --watchAll=false src/api/franchiseApi.test.js
// schema = `shopchamp-center/packages/schema/dist/index.cjs` (บ้านเดียวกัน · ไม่มีไฟล์ = ข้ามเทสชุด schema)
import fs from 'fs';
import path from 'path';
import * as A from './franchiseApi';
import { postApi } from './posApi';
import { ENDPOINTS } from './endpoints';

jest.mock('./posApi', () => ({ postApi: jest.fn(async () => ({ ok: true })), newRequestId: () => '0b8f3a52-6c1e-4d7a-9a0b-1c2d3e4f5a6b' }));

const SCHEMA = path.resolve(__dirname, '../../../shopchamp-center/packages/schema/dist/index.cjs');
const S = fs.existsSync(SCHEMA) ? require(SCHEMA) : null;
const schemaTest = S ? test : test.skip;

// path → ชื่อ schema (ตามบรรทัด `# route:` ของสัญญา)
const SCHEMA_OF = {
  [ENDPOINTS.franchiseList]: 'FranchiseListRequest',
  [ENDPOINTS.franchiseGet]: 'FranchiseGetRequest',
  [ENDPOINTS.franchiseCreate]: 'FranchiseCreateRequest',
  [ENDPOINTS.franchiseProfileUpdate]: 'FranchiseProfileUpdateRequest',
  [ENDPOINTS.franchiseCategorySave]: 'FranchiseCategorySaveRequest',
  [ENDPOINTS.franchiseWarehouseList]: 'FranchiseWarehouseListRequest',
  [ENDPOINTS.franchiseWarehouseSave]: 'FranchiseWarehouseSaveRequest',
  [ENDPOINTS.franchiseWarehouseDelete]: 'FranchiseWarehouseDeleteRequest',
  [ENDPOINTS.franchiseLinkList]: 'FranchiseLinkListRequest',
  [ENDPOINTS.franchiseLinkSave]: 'FranchiseLinkSaveRequest',
  [ENDPOINTS.franchiseLinkDelete]: 'FranchiseLinkDeleteRequest',
  [ENDPOINTS.franchiseBranchList]: 'FranchiseBranchListRequest',
  [ENDPOINTS.franchiseBranchFind]: 'FranchiseBranchFindRequest',
  [ENDPOINTS.franchiseBranchAttach]: 'FranchiseBranchAttachRequest',
  [ENDPOINTS.franchiseStaffFind]: 'FranchiseStaffFindRequest',
  [ENDPOINTS.franchiseStaffSave]: 'FranchiseStaffSaveRequest',
  [ENDPOINTS.franchiseBillList]: 'FranchiseBillListRequest',
};

const F = 'fr1';
const UUID = '0b8f3a52-6c1e-4d7a-9a0b-1c2d3e4f5a6b';
// ต้นหมวดแบบที่ Modal_CategorySetting สร้าง (มี status ติดมาได้ · ชั้นว่างได้)
const tree = [
  { level: 1, value: [{ id: 'c1', name: ' เครื่องดื่ม ', level: 1, aboveId: [], status: false }] },
  { level: 2, value: [{ id: 'c2', name: 'ชา', level: 2, aboveId: ['c1'] }] },
  { level: 3, value: [] },
];
// สินค้าคลังรูปเดิม: ราคาเป็นสตริงจากช่องกรอก · หมวดเป็น object ตอนแก้ · ช่องอื่นของ initialWarehouseItem ติดมา
const legacyItem = {
  id: 'w1', name: 'ชาเขียว', price: '35', barcode: 885000, sku: '', unit: 'แก้ว', category: ['c1', 'c2'], imageId: '',
  pointStatus: true, stockCountStatus: true, customQtyStatus: false, customPriceStatus: false, priceLevelStatus: false, priceLevel: [],
  cost: '', safetyStock: { status: false, qty: '' }, shopId: '', timestamp: new Date(), no: 1,
};

async function sendAll() {
  postApi.mockClear();
  await A.franchiseList();
  await A.franchiseGet(F);
  await A.franchiseCreate({ franchiseUUID: UUID, name: 'แบรนด์ A' });
  await A.franchiseProfileUpdate({ franchiseId: F, name: 'แบรนด์ B' });
  await A.franchiseProfileUpdate({ franchiseId: F, imageId: 'https://firebasestorage.googleapis.com/x.png' });
  await A.franchiseCategorySave({ franchiseId: F, warehouseCategory: A.categoryTreeOf(tree), seenWarehouseCategory: tree });
  await A.franchiseWarehouseList(F);
  await A.franchiseWarehouseSave(A.warehouseSaveBody({ franchiseId: F, form: { ...legacyItem, id: undefined, price: '0' }, before: null, itemUUID: UUID }));
  await A.franchiseWarehouseSave(A.warehouseSaveBody({
    franchiseId: F,
    form: { ...legacyItem, price: '40', category: [{ id: 'c1', name: 'เครื่องดื่ม', level: 1, aboveId: [] }] },
    before: legacyItem,
  }));
  await A.franchiseWarehouseDelete({ franchiseId: F, itemId: 'w1' });
  await A.franchiseLinkList(F);
  const group = { stockGroupName: 'ชา', stockLink: [{ id: 'w1', name: 'x', unit: 'แก้ว', barcode: '', imageId: '', linkMultiply: 1 }, { id: 'w2', linkMultiply: '12' }] };
  await A.franchiseLinkSave(A.linkSaveBody({ franchiseId: F, current: group, linkUUID: UUID }));
  await A.franchiseLinkSave(A.linkSaveBody({ franchiseId: F, current: { ...group, id: 'L1', timestamp: new Date(), upgrade: true, shopId: '' } }));
  await A.franchiseLinkDelete({ franchiseId: F, linkId: 'L1' });
  await A.franchiseBranchList(F);
  await A.franchiseBranchFind({ franchiseId: F, tel: '0812345678' });
  await A.franchiseBranchAttach({ franchiseId: F, shopId: 's1' });
  await A.franchiseBranchAttach({ franchiseId: F, shopId: 's1', moveFromFranchiseId: 'fr0' });
  await A.franchiseStaffFind({ franchiseId: F, tel: '0812345678' });
  await A.franchiseStaffSave({ franchiseId: F, op: 'add', staffUid: 'u2', rights: A.rightsOf(['100', '128', '128', '128', '128', '723', 'xx']) });
  await A.franchiseStaffSave({ franchiseId: F, op: 'update', staffUid: 'u2', rights: A.rightsOf([]) });
  await A.franchiseStaffSave({ franchiseId: F, op: 'remove', staffUid: 'u2' });
  for (const r of A.dayRanges(new Date(2026, 0, 1), new Date(2026, 2, 5))) await A.franchiseBillList({ franchiseId: F, ...r });
  return postApi.mock.calls.map(([p, body]) => ({ path: p, body }));
}

schemaTest('คำขอทุกตัวผ่าน schema ของสัญญา และครบ 17 เส้น', async () => {
  const calls = await sendAll();
  const seen = new Set();
  for (const { path: p, body } of calls) {
    const name = SCHEMA_OF[p];
    expect(name).toBeTruthy();
    const r = S[name].safeParse(body);
    if (!r.success) throw new Error(`${p} ${JSON.stringify(r.error.issues)} ${JSON.stringify(body)}`);
    seen.add(p);
  }
  expect(seen.size).toBe(17);
  if (process.env.CAPTURE_FILE) fs.writeFileSync(process.env.CAPTURE_FILE, JSON.stringify(calls, null, 1));
});

test('warehouseSaveBody: update ส่งเฉพาะช่องที่เปลี่ยน · หมวดเป็น id · ราคาเป็นตัวเลข · ไม่เปลี่ยน = null', () => {
  const b = A.warehouseSaveBody({ franchiseId: F, form: { ...legacyItem, price: '40', category: [{ id: 'c1' }, { id: 'c2' }] }, before: legacyItem });
  expect(b).toEqual({ franchiseId: F, op: 'update', itemId: 'w1', price: 40 });
  expect(A.warehouseSaveBody({ franchiseId: F, form: { ...legacyItem, category: [{ id: 'c1' }, { id: 'c2' }] }, before: legacyItem })).toBeNull();
  const c = A.warehouseSaveBody({ franchiseId: F, form: { ...legacyItem, price: '0' }, before: null, itemUUID: UUID });
  expect(c.op).toBe('create');
  expect(c.price).toBe(0);
  expect(c.barcode).toBe('885000');
  expect('cost' in c || 'no' in c || 'id' in c || 'timestamp' in c).toBe(false);
});

test('linkSaveBody / linkProblem: ตัวคูณตัวเลข · กติกาเดียวกับ server', () => {
  const b = A.linkSaveBody({ franchiseId: F, current: { id: 'L1', stockGroupName: ' ชา ', stockLink: [{ id: 'a', linkMultiply: '1' }, { id: 'b', linkMultiply: '6' }] } });
  expect(b).toEqual({ franchiseId: F, op: 'update', linkId: 'L1', stockGroupName: 'ชา', members: [{ id: 'a', linkMultiply: 1 }, { id: 'b', linkMultiply: 6 }] });
  expect(A.linkProblem([{ linkMultiply: 1 }, { linkMultiply: 6 }])).toBe('');
  expect(A.linkProblem([{ linkMultiply: 1 }, { linkMultiply: 2.5 }])).toMatch('จำนวนเต็ม');
  expect(A.linkProblem([{ linkMultiply: 1 }, { linkMultiply: 100001 }])).toMatch('จำนวนเต็ม');
  expect(A.linkProblem([{ linkMultiply: 1 }, { linkMultiply: 6 }, { linkMultiply: '6' }])).toMatch('ซ้ำ');
  expect(A.linkProblem([{ linkMultiply: 2 }, { linkMultiply: 6 }])).toMatch('อ้างอิง');
});

test('dayRanges: ก้อนละไม่เกิน 31 วัน ต่อกันไม่มีช่อง · เริ่มหลังจบ = ว่าง', () => {
  const r = A.dayRanges(new Date(2026, 0, 1), new Date(2026, 2, 5));
  expect(r).toEqual([
    { fromDay: '20260101', toDay: '20260131' },
    { fromDay: '20260201', toDay: '20260303' },
    { fromDay: '20260304', toDay: '20260305' },
  ]);
  expect(A.dayRanges(new Date(2026, 0, 2), new Date(2026, 0, 1))).toEqual([]);
  expect(A.dayRanges(new Date(2026, 0, 2, 15), new Date(2026, 0, 2, 9))).toEqual([{ fromDay: '20260102', toDay: '20260102' }]);
});

test('hasRight / rightsOf: ทีมงานครบ · สิทธิ์ซ้ำและรหัสแปลกถูกตัด', () => {
  expect(A.hasRight({ rights: [], byAdmin: true }, '723')).toBe(true);
  expect(A.hasRight({ rights: ['128'] }, '100')).toBe(false);
  expect(A.hasRight(null, '100')).toBe(false);
  expect(A.rightsOf(['128', '128', '723', 'zz', 100])).toEqual(['128', '723', '100']);
});
