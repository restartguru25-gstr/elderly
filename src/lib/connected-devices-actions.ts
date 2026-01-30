'use client';

import {
  Firestore,
  collection,
  doc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

export type DeviceType = 'fitbit' | 'apple_health' | 'garmin' | 'blood_pressure' | 'glucose_meter' | 'smart_watch' | 'other';

export type ConnectedDevice = {
  id: string;
  userId: string;
  deviceType: DeviceType;
  deviceName: string;
  manufacturer?: string;
  model?: string;
  isConnected: boolean;
  lastSyncAt?: any;
  createdAt: any;
  updatedAt: any;
};

export async function addConnectedDevice(
  firestore: Firestore,
  userId: string,
  deviceData: {
    deviceType: DeviceType;
    deviceName: string;
    manufacturer?: string;
    model?: string;
  }
) {
  if (!userId) throw new Error('User ID is required.');
  if (!deviceData.deviceName.trim()) throw new Error('Device name is required.');

  const devicesRef = collection(firestore, 'users', userId, 'connectedDevices');

  const data = {
    userId,
    deviceType: deviceData.deviceType,
    deviceName: deviceData.deviceName.trim(),
    manufacturer: deviceData.manufacturer?.trim() || null,
    model: deviceData.model?.trim() || null,
    isConnected: true,
    lastSyncAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDocumentNonBlocking(devicesRef, data);
}

export async function updateDeviceConnection(
  firestore: Firestore,
  userId: string,
  deviceId: string,
  isConnected: boolean
) {
  if (!userId || !deviceId) throw new Error('User ID and Device ID are required.');

  const deviceRef = doc(firestore, 'users', userId, 'connectedDevices', deviceId);

  return updateDocumentNonBlocking(deviceRef, {
    isConnected,
    lastSyncAt: isConnected ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

export async function syncDevice(
  firestore: Firestore,
  userId: string,
  deviceId: string
) {
  if (!userId || !deviceId) throw new Error('User ID and Device ID are required.');

  const deviceRef = doc(firestore, 'users', userId, 'connectedDevices', deviceId);

  return updateDocumentNonBlocking(deviceRef, {
    lastSyncAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeConnectedDevice(
  firestore: Firestore,
  userId: string,
  deviceId: string
) {
  if (!userId || !deviceId) throw new Error('User ID and Device ID are required.');

  const deviceRef = doc(firestore, 'users', userId, 'connectedDevices', deviceId);
  await deleteDoc(deviceRef);
}
