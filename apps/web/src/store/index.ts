import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './slices/userSlice';
import { courseReducer } from './slices/courseSlice';
import { subjectReducer } from './slices/subjectSlice';
import { notificationReducer } from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    course: courseReducer,
    subject: subjectReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
