import * as SecureStore from 'expo-secure-store';
const base=process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1';
export type Session={accessToken:string;refreshToken:string;user:{id:string;email:string;fullName:string}};
export async function request<T>(path:string, init:RequestInit={}) : Promise<T>{const token=await SecureStore.getItemAsync('accessToken');const r=await fetch(`${base}${path}`,{...init,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...init.headers}});if(!r.ok){const e=await r.json().catch(()=>({message:'Something went wrong'}));throw new Error(Array.isArray(e.message)?e.message[0]:e.message)}return r.json() as Promise<T>}
export async function saveSession(s:Session){await SecureStore.setItemAsync('accessToken',s.accessToken);await SecureStore.setItemAsync('refreshToken',s.refreshToken)}
export async function clearSession(){await SecureStore.deleteItemAsync('accessToken');await SecureStore.deleteItemAsync('refreshToken')}
