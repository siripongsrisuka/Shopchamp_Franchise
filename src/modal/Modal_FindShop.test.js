// Modal_FindShop.test.js — FD-B2: ค้นร้านด้วยเบอร์แล้วรหัสพนักงานต้องไม่อยู่ใน state ที่ส่งต่อ (ใบ DEV-0002)
// ก้อน 9f: ค้นผ่าน `franchise.branchFind` (ไม่อ่าน Firestore) · server คืนแค่ id name tel franchiseId inThisFranchise
// รัน: CI=true npx react-scripts test --watchAll=false src/modal/Modal_FindShop.test.js
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Modal_FindShop from './Modal_FindShop';
import { withoutStaffSecrets } from '../Utility/sanitize';
import { franchiseBranchFind } from '../api/franchiseApi';

const shopDoc = {
  name: 'ร้านทดสอบ',
  tel: '0990000000',
  humanResource: [
    { id: 'u1', name: 'เจ้าของ', status: 'active', password: '1234' },
    { id: 'u2', name: 'แคชเชียร์', status: 'active', password: '' },
  ],
};
jest.mock('../db/firestore', () => ({
  db: { collection: () => { throw new Error('ห้ามอ่าน Firestore ตรง'); } },
}));
jest.mock('../api/franchiseApi', () => ({ franchiseBranchFind: jest.fn() }));
jest.mock('../api/posApi', () => ({ apiErrorMessage: (e, f) => f }));
const store = configureStore({ reducer: { franchise: () => ({ franchise: { id: 'fr1' } }) } });
jest.mock('../components', () => ({
  OneButton: ({ text, submit }) => <button onClick={submit}>{text}</button>,
  FooterButton: ({ submit }) => <button onClick={submit}>ยืนยัน</button>,
}));
jest.mock('./Modal_Loading', () => () => null);

test('withoutStaffSecrets ตัด password เหลือ hasPassword · ไม่แตะช่องอื่น', () => {
  const out = withoutStaffSecrets({ id: 's', name: 'x', humanResource: shopDoc.humanResource });
  expect(JSON.stringify(out)).not.toContain('1234');
  expect(out.humanResource).toEqual([
    { id: 'u1', name: 'เจ้าของ', status: 'active', hasPassword: true },
    { id: 'u2', name: 'แคชเชียร์', status: 'active', hasPassword: false },
  ]);
  expect(withoutStaffSecrets({ id: 'a' })).toEqual({ id: 'a' });
});

test('ค้นเบอร์ → เลือกร้าน → ยืนยัน · ร้านที่ส่งต่อไม่มีรหัสพนักงาน', async () => {
  const submit = jest.fn();
  // คำตอบรูปที่ server ส่ง (branch.js › branchFind) · ไม่มี humanResource
  franchiseBranchFind.mockResolvedValue({ ok: true, shops: [{ id: 'shop1', name: shopDoc.name, tel: shopDoc.tel, franchiseId: '', inThisFranchise: false }], count: 1 });
  function Host() {
    const [current, setCurrent] = useState({ id: '' });
    return <Modal_FindShop show onHide={() => {}} submit={submit} current={current} setCurrent={setCurrent} />;
  }
  render(<Provider store={store}><Host /></Provider>);
  fireEvent.change(screen.getByPlaceholderText('ใส่เบอร์โทร'), { target: { value: '0990000000' } });
  fireEvent.click(screen.getByText('ค้นหา'));
  await waitFor(() => screen.getByText('ร้านทดสอบ'));
  fireEvent.click(screen.getByText('ร้านทดสอบ'));
  fireEvent.click(screen.getByText('ยืนยัน'));
  expect(submit).toHaveBeenCalledTimes(1);
  const sent = submit.mock.calls[0][0];
  expect(sent.id).toBe('shop1');
  expect(JSON.stringify(sent)).not.toContain('1234');
  expect('humanResource' in sent).toBe(false);
  expect(franchiseBranchFind).toHaveBeenCalledWith({ franchiseId: 'fr1', tel: '0990000000' });
});
