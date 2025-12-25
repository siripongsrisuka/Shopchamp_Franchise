import { combineReducers } from 'redux';
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import thunk from 'redux-thunk';
import logger from 'redux-logger'


import authReducer from './authSlice'
import profileReducer from './profileSlice';
import shopReducer from './shopSlice';
import billReducer from './billSlice';
import deviceReducer from './deviceSlice';

import franchiseReducer from './franchiseSlice';
import warehouseReducer from './warehouseSlice';
import stockLinkReducer from './stockLinkSlice';

  const rootPersistConfig = {
      key: 'root',
      storage,
      whitelist:[]
  }
  const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['currentUser','currentShopId','franchiseDisplay','currentFranchiseId']
  };
  const profilePersistConfig = {
    key: 'profile',
    storage,
    whitelist: ['profile']
  };
  const shopPersistConfig = {
    key: 'shop',
    storage,
    whitelist: ['shop']
  };
  const devicePersistConfig = {
    key: 'device',
    storage,
    whitelist: ['language']
  };

    const franchisePersistConfig = {
    key: 'franchise',
    storage,
    whitelist: ['franchise',]
  };



  const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    profile:persistReducer(profilePersistConfig, profileReducer),
    shop:persistReducer(shopPersistConfig, shopReducer),
    bill:billReducer,
    device:persistReducer(devicePersistConfig, deviceReducer),
    franchise:persistReducer(franchisePersistConfig, franchiseReducer),
    warehouse:warehouseReducer,
    stockLink:stockLinkReducer,

  })
  const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

  export const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk, logger],
  })
export const persistor = persistStore(store)