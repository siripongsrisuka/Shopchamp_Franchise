// endpoints.js — path ของเส้น API ชุดใหม่ (ใบ DEV-0002) · แยกจาก posApi.js ให้เทสอ่านได้โดยไม่โหลด axios
// path ตรงกับบรรทัด `# route:` ของสัญญา · function อยู่ใน segment แรก (`pos` / `pos_heavy`)
export const ENDPOINTS = {
  profileManage: '/pos/profile/manage',
  // ก้อน 9f (`shopchamp-center/api/franchise.*.yaml`) · `franchise-report` อยู่ function pos_heavy
  franchiseList: '/pos/franchise/list',
  franchiseGet: '/pos/franchise/get',
  franchiseCreate: '/pos/franchise/create',
  franchiseProfileUpdate: '/pos/franchise/profile-update',
  franchiseCategorySave: '/pos/franchise/category-save',
  franchiseWarehouseList: '/pos/franchise/warehouse-list',
  franchiseWarehouseSave: '/pos/franchise/warehouse-save',
  franchiseWarehouseDelete: '/pos/franchise/warehouse-delete',
  franchiseLinkList: '/pos/franchise/link-list',
  franchiseLinkSave: '/pos/franchise/link-save',
  franchiseLinkDelete: '/pos/franchise/link-delete',
  franchiseBranchList: '/pos/franchise/branch-list',
  franchiseBranchFind: '/pos/franchise/branch-find',
  franchiseBranchAttach: '/pos/franchise/branch-attach',
  franchiseStaffFind: '/pos/franchise/staff-find',
  franchiseStaffSave: '/pos/franchise/staff-save',
  franchiseBillList: '/pos_heavy/franchise-report/bill-list',
  // Pack เคาะ 2026-11-07: ยอดแฟรนไชส์สูตรกลาง (`api/franchise.breakdown.yaml` · คำขอรูปเดียวกับ billList)
  franchiseBreakdown: '/pos_heavy/franchise-report/breakdown',
};
