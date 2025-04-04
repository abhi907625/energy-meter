import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import type { SensorData } from "../../data/sensor";
import { io } from "socket.io-client";
import { 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis,
  BarChart,
  Rectangle,
  Bar,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"


const socket = io("http://localhost:3000", {
    reconnection: true, // Enable automatic reconnection
    reconnectionAttempts: 5, // Number of reconnection attempts
    reconnectionDelay: 1000, // Delay between reconnection attempts
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home({}: Route.ComponentProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [formattedDataArray, setFormattedDataArray] = useState<
    Array<{ time: string; temperature: number }>
  >([]);

  useEffect(() => {
    // Listen for the "read" event from the server
    socket.on("read", (data) => {
      const updatedArray: Array<{ time: string; temperature: number }> = [];
      data.map((value: SensorData) => {
        updatedArray.push({
          time: value.timestamp,
          temperature: value.temperature,
        });
        setSensorData(value); // Optional: Update with the last value
      });
      setFormattedDataArray(updatedArray); // Set formatted data array
    });
  }, []);
    
  console.log(formattedDataArray);

  return (
    <>
      <h1>Dashboard</h1>
      {sensorData ? (
        <div>
          <p>temperature {sensorData.temperature}</p>
          <p>humidity {sensorData.humidity}</p>
          
           <LineChart width={600} height={300} data={formattedDataArray}>
              <Line type="monotone" dataKey="temperature" stroke="#db2a2a" />
              <CartesianGrid stroke="#3e84da" />
              <XAxis dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()} 
              />
              <YAxis dataKey="temperature"/>
            </LineChart>
          

          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              width={500}
              height={300}
              data={formattedDataArray}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid stroke="#3e84da" strokeDasharray="3 3"/>
              <YAxis dataKey="temperature"/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="temperature" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ): (
       <p>Loading...</p> 
      )}
    </>
  );
}
