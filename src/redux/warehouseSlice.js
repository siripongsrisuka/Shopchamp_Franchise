import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { formatTime } from '../Utility/function';
import { reverseSort } from '../Utility/sort';
import { initialWarehouseItem }  from '../configs'
import { franchiseWarehouseList } from '../api/franchiseApi';
import { apiErrorMessage } from '../api/posApi';
import { toastError } from '../Utility/function';

const initialState = {
    warehouse:[], //
    warehouseFranchiseId:'', // แฟรนไชส์ของรายการที่โหลดอยู่ (สลับแฟรนไชส์แล้วโหลดใหม่ DI-04 DI-61)
    modal_Warehouse:false,
};

// DEV-0002 ก้อน 9f: `franchise.warehouseList` (census 290) · หมวดเป็น id เสมอ ราคาเป็นตัวเลข (ST-107)
export const fetchWarehouse = createAsyncThunk(
  'warehouse/fetchWarehouse',
  async (franchiseId, { rejectWithValue }) => {
    try {
      const res = await franchiseWarehouseList(franchiseId);
      const results = (res.items || []).map(({ timestamp, price, ...rest }) => ({
        ...initialWarehouseItem,
        ...rest,
        price: price === null || price === undefined ? '' : price,
        timestamp: formatTime(timestamp),
      }));
      return { items: reverseSort('timestamp', results), franchiseId };
    } catch (error) {
      const message = apiErrorMessage(error, 'โหลดคลังสินค้าไม่สำเร็จ');
      toastError(message);
      return rejectWithValue({ message });
    }
  }
);


export const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    deleteNormalWarehouse: (state, action) => {
        const index = state.warehouse.findIndex(a => a.id === action.payload);
        if (index >= 0) state.warehouse.splice(index, 1);
    },
    updateNormalWarehouse: (state, action) => {
        const { id, updatedField } = action.payload;
        let item = state.warehouse.find(a=>a.id === id);
        if (item) Object.assign(item,updatedField)
    },
    clearWarehouse: state => {
        state.warehouse = []
        state.warehouseFranchiseId = ''
    },
    fetchNormalWarehouse: (state, action) => {
        state.warehouse = action.payload
    },

    addNormalWarehouse: (state, action) => {
        state.warehouse.push(action.payload)
    },

  },
  extraReducers: builder => {
    builder.addCase(fetchWarehouse.pending, state => {
        state.modal_Warehouse = true
    })
    builder.addCase(fetchWarehouse.fulfilled, (state, action) => {
        state.warehouse = action.payload.items
        state.warehouseFranchiseId = action.payload.franchiseId
        state.modal_Warehouse = false
    })
    builder.addCase(fetchWarehouse.rejected, state => {
        state.modal_Warehouse = false
    })
  }
})

export const {
    fetchNormalWarehouse,
    clearWarehouse,
    updateNormalWarehouse,
    addNormalWarehouse,
    deleteNormalWarehouse
} = warehouseSlice.actions

export default warehouseSlice.reducer
