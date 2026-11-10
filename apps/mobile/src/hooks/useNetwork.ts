import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  setOnline: (v: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({ isOnline: true, setOnline: (isOnline) => set({ isOnline }) }));

/** Subscribes once at the root; feature code reads `useNetworkStore(s => s.isOnline)`. */
export function useNetworkListener(): void {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
      useNetworkStore.getState().setOnline(online);
      onlineManager.setOnline(online);
    });
    return unsubscribe;
  }, []);
}

export function useIsOnline(): boolean {
  return useNetworkStore((s) => s.isOnline);
}
