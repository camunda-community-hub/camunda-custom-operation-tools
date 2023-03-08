import {combineReducers} from '@reduxjs/toolkit';

import authReducer from './features/auth/slice';
import adminOrgReducer from './features/adminOrgs/slice';

const rootReducer = combineReducers({
  auth: authReducer,
  adminOrg: adminOrgReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
