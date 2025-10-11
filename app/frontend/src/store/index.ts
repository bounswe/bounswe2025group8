import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authentication/store/authSlice'
import createRequestReducer from '../features/request/store/createRequestSlice'
import allRequestsReducer from '../features/request/store/allRequestsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    createRequest: createRequestReducer,
    allRequests: allRequestsReducer,
  },
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch