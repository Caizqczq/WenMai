import React from 'react';
import { Stack } from 'expo-router';
import MapScreen from './screens/MapScreen';

export default function MapPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MapScreen />
    </>
  );
} 