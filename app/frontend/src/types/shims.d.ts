// Ambient declarations for JS modules imported by TS files

declare module '../features/category/services/categoryService' {
  export function getCategories(...args: any[]): Promise<any> | any;
}

declare module '../features/request/store/createRequestSlice' {
  const reducer: any;
  export default reducer;
}

declare module '../features/request/store/allRequestsSlice' {
  const reducer: any;
  export default reducer;
}

declare module '../features/profile/store/profileSlice' {
  const reducer: any;
  export default reducer;
}
