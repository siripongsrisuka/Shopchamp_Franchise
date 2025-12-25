import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { formatTime } from '../Utility/function';
import { reverseSort } from '../Utility/sort';
import { db } from '../db/firestore';

const initialState = {
    stockLinks:[],
    currentProducts:[],
    modal_StockLinks:false,
    refProduct:{},

}


export const fetchStockLink = createAsyncThunk(
  'stockLink/fetchStockLink',
  async (franchiseId) => {
    let arrObject = []
    await db.collection('stockLink').where("franchiseId", "==", franchiseId).get().then((qsnapshot)=>{
      if (qsnapshot.docs.length > 0) {
        qsnapshot.forEach(doc=>{
          const { timestamp, stockLink, ...rest  } = doc.data();
          arrObject.push({
            ...rest,
            id:doc.id,
            timestamp:formatTime(timestamp),
            stockLink:reverseSort('linkMultiply',stockLink)
          })
        })
      }else{
        console.log('item-does-not-exist');
      }
    })
    return reverseSort('timestamp',arrObject);
  }
);

export const deleteStockLink = createAsyncThunk(
    'stockLink/deleteStockLink',
    async (token) => {
      await db.collection('stockLink').doc(token).delete()
      return token;
    }
);

// add product
export const addStockLinkToFireBase = createAsyncThunk(
    'stock/addStockLinkToFireBase', 
    async (product) => {
      let newProduct = {}
      await db.collection('stockLink').add(product).then((doc)=>{
          newProduct = {id: doc.id, ...product}
      })
    return newProduct;
});


export const updateFieldLink = createAsyncThunk(
  'shop/updateFieldLink', async ({doc,field}) => {
  await db.collection('stockLink').doc(doc).update(field)
  return field;
});






export const stockLink = createSlice({
  name: 'stockLink',
  initialState,
  reducers: {
    updateNormalLink: (state, action) => {
      let item = state.stockLinks.find(a=>a.id === action.payload.id)
      Object.assign(item,action.payload)
    },
    deleteNormalLink: (state, action) => {
      const index = state.stockLinks.findIndex(a => a.id === action.payload);
      state.stockLinks.splice(index, 1); // Directly remove the item (Immer handles immutability)
    },
    updateStockDisplay: (state, action) => {
      const updatedIds = action.payload;
      state.stocks = state.stocks.map(item =>
        updatedIds.includes(item.id)
          ? { ...item, memo: item.memo + 1 }
          : item
      );
    },
    addProduct: (state, action) => {
        const linkIds = new Set([...state.stockLinks.flatMap(a=>a.stockLink).map(b=>b.id),...state.currentProducts.map(a=>a.id)])
        if(linkIds.has(action.payload.id)){
          alert('ตรวจพบรายการซ้ำ')
        } else {
          state.currentProducts.push(action.payload)
        }
    },
    deleteProduct: (state, action) => {
        state.currentProducts = state.currentProducts.filter(a=>a.id!==action.payload)
    },
    refProduct: (state, action) => {
        state.currentProducts = state.currentProducts.map(a=>{
            return a.id === action.payload
                ?{...a,linkMultiply:1}
                :{...a,linkMultiply:''}
        })
        state.refProduct = state.currentProducts.find(a=>a.linkMultiply===1)
    },
    updateProduct: (state, action) => {
        const { id, qty } = action.payload;
        let item = state.currentProducts.find(a=>a.id === id)
        item.linkMultiply = qty
    },
    addNormalStockLink: (state, action) => {
      state.stockLinks = [...state.stockLinks,action.payload]
      state.currentProducts = []
      state.refProduct = {}
  },
  },
  extraReducers: builder => {
    builder.addCase(fetchStockLink.pending, state => {
      state.modal_StockLinks = true
    })
    builder.addCase(fetchStockLink.fulfilled, (state, action) => {
      state.stockLinks = action.payload;
      state.modal_StockLinks = false
    })
    builder.addCase(fetchStockLink.rejected, state => {
      state.modal_StockLinks = false
    })
    builder.addCase(deleteStockLink.pending, state => {
        state.modal_StockLinks = true
    })
    builder.addCase(deleteStockLink.fulfilled, (state, action) => {
        state.stockLinks = state.stockLinks.filter(a=>a.id!==action.payload)
        state.modal_StockLinks = false
    })
    builder.addCase(deleteStockLink.rejected, state => {
        state.modal_StockLinks = false
    })
    builder.addCase(addStockLinkToFireBase.pending, state => {
        state.modal_StockLinks = true
    })
    builder.addCase(addStockLinkToFireBase.fulfilled, (state, action) => {
        state.stockLinks = [...state.stockLinks,action.payload]
        state.currentProducts = []
        state.refProduct = {}
        state.modal_StockLinks = false
    })
    builder.addCase(addStockLinkToFireBase.rejected, state => {
        state.modal_StockLinks = false
    })
    builder.addCase(updateFieldLink.pending, state => {
      state.modal_StockLinks = true
    })
    builder.addCase(updateFieldLink.fulfilled, (state, action) => {
        state.stockLinks = state.stockLinks.map(a=>{
          return a.id===action.payload.id
              ?action.payload
              :a
        })
        state.modal_StockLinks = false
    })
    builder.addCase(updateFieldLink.rejected, state => {
        state.modal_StockLinks = false
    })
  }
})

export const { updateStockDisplay, addProduct, deleteProduct, refProduct, updateProduct, 
  addNormalStockLink, deleteNormalLink, updateNormalLink } = stockLink.actions

export default stockLink.reducer