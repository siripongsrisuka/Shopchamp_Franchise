// sanitize.js — ตัดรหัสแคชเชียร์ของพนักงานออกจาก doc ร้าน ก่อนเก็บลง state ของเบราว์เซอร์ (ใบ DEV-0002 · FD-B2)
//
// แอปเก็บรหัสพนักงานแบบข้อความตรงใน `shop.humanResource[].password` ⇒ ทุกทางที่อ่าน doc ร้านทั้งก้อนได้รหัสมาด้วย
// เว็บแฟรนไชส์ไม่ใช้รหัสพวกนี้เลย ⇒ ตัดทิ้งทันทีที่อ่านได้ ไม่ให้เข้า redux / localStorage (redux-persist) / console
// ⚠️ ตัดได้แค่ฝั่งเว็บ · Firestore SDK ฝั่งเว็บเลือก field ไม่ได้ ⇒ คำตอบของ Firestore ยังมีรหัสวิ่งผ่าน network จนกว่าจะมีเส้น API ค้นร้าน
export function withoutStaffSecrets(shop) {
  if (!shop || typeof shop !== 'object') return shop;
  if (!Array.isArray(shop.humanResource)) return shop;
  return {
    ...shop,
    humanResource: shop.humanResource.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const { password, ...rest } = row;
      return { ...rest, hasPassword: !!password };
    }),
  };
}
