"use client";

import { useEffect, useRef, useState } from "react";
import {
  LocationClient,
  ListDevicePositionsCommand,
  GetDevicePositionHistoryCommand,
} from "@aws-sdk/client-location";
import { withIdentityPoolId } from "@aws/amazon-location-utilities-auth-helper";

const REGION = "us-east-1";
const TRACKER = "isync-tracker";
const IDENTITY_POOL_ID = "us-east-1:ad30c23e-3557-4675-9089-6b628cf1a684";

type Device = {
  id: string;
  position: [number, number];
  speed?: number;
  history: [number, number][];
};

export function useTrackerDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const clientRef = useRef<LocationClient | null>(null);

  async function getClient() {
    if (!clientRef.current) {
      const authHelper = await withIdentityPoolId(IDENTITY_POOL_ID);

      clientRef.current = new LocationClient({
        region: REGION,
        ...authHelper.getLocationClientConfig(),
      });
    }

    return clientRef.current;
  }

  async function fetchDevices() {
    try {
      const client = await getClient();

      const res = await client.send(
        new ListDevicePositionsCommand({
          TrackerName: TRACKER,
        })
      );

      const list = res.Entries || [];

      const updatedDevices: Device[] = [];

      for (const d of list) {
        if (!d.DeviceId || !d.Position) continue;

        const historyRes = await client.send(
          new GetDevicePositionHistoryCommand({
            TrackerName: TRACKER,
            DeviceId: d.DeviceId,
            MaxResults: 50,
          })
        );

        const history =
          historyRes.DevicePositions?.map((p) => p.Position as [number, number]) || [];

        updatedDevices.push({
          id: d.DeviceId,
          position: d.Position as [number, number],
          speed: d.SampleTime ? undefined : undefined,
          history,
        });
      }

      setDevices(updatedDevices);
    } catch (err) {
      console.error("AWS error", err);
    }
  }

  useEffect(() => {
    fetchDevices();

    const interval = setInterval(fetchDevices, 5000);

    return () => clearInterval(interval);
  }, []);

  return devices;
}