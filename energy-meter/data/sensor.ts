export type SensorData = {
    _id: string,
    Current: number,
    Voltage: number,
    Power: number,
    kWh: number,
    timestamp?: string,
    _v?: number
}

export type responseData = {
    status: number,
    message?: string,
    error?: string
}

export const dummyData: SensorData[] = [
    {
      _id: "1",
      Current: 12.5,
      Voltage: 220,
      Power: 2750,
      kWh: 5.6,
      timestamp: "2025-04-06T14:15:00Z",
      _v: 1,
    },
    {
      _id: "2",
      Current: 10.8,
      Voltage: 230,
      Power: 2484,
      kWh: 3.2,
      timestamp: "2025-04-06T14:20:00Z",
      _v: 1,
    },
    {
      _id: "3",
      Current: 15,
      Voltage: 240,
      Power: 3600,
      kWh: 4.7,
      timestamp: "2025-04-06T14:25:00Z",
      _v: 2,
    },
    {
      _id: "4",
      Current: 9.6,
      Voltage: 215,
      Power: 2064,
      kWh: 2.8,
      timestamp: "2025-04-06T14:30:00Z",
    },
    {
      _id: "5",
      Current: 13.2,
      Voltage: 225,
      Power: 2970,
      kWh: 3.5,
      timestamp: "2025-04-06T14:35:00Z",
      _v: 2,
    },
  ];

  export type PercentageDataType = Array<{
    _id: string;      // Original property from SensorData
    Current: string;  // Current percentage as a string
    Voltage: string;  // Voltage percentage as a string
    Power: string;    // Power percentage as a string
    kWh: number;      // Original property from SensorData
    timestamp?: string; // Original property from SensorData
    _v?: number;      // Original property from SensorData
  }>;
  