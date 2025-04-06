import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { dummyData, type SensorData, type PercentageDataType } from "../../data/sensor";
import { io } from "socket.io-client";
import "./home.css"

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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

/*
const socket = io("http://localhost:3000", {
    reconnection: true, // Enable automatic reconnection
    reconnectionAttempts: 5, // Number of reconnection attempts
    reconnectionDelay: 1000, // Delay between reconnection attempts
});
*/

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home({}: Route.ComponentProps) {
  const [pieChartData, setPieChartData] = useState<Array<{name: string; value: number}>> ([]);
  const COLORS = ["#8884d8", "#82ca9d", "#ff8042"]; // Define colors for each segment

  /*
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [formattedDataArray, setFormattedDataArray] = useState<
  Array<{ time: string; Current: number; 
    Voltage: number, Power: number, kWh: number}>
  >([]);

  useEffect(() => {
    // Listen for the "read" event from the server
    socket.on("read", (data) => {
      const updatedArray: Array<{ time: string; Current: number; 
                                  Voltage: number, Power: number, kWh: number}> = [];
      data.map((value: SensorData) => {
        updatedArray.push({
          time: value.timestamp || "",
          Current: value.Current,
          Voltage: value.Voltage,
          Power: value.Power,
          kWh: value.kWh
        });
        setSensorData(value); // Optional: Update with the last value
      });
      setFormattedDataArray(updatedArray); // Set formatted data array
    });
  }, []);
    
  */

useEffect(() => {


// Step 1: Calculate the total sum of all values
const totalCurrent = dummyData.reduce((sum, item) => sum + item.Current, 0);
const totalVoltage  = dummyData.reduce((sum, item) => sum + item.Voltage, 0);
const totalPower = dummyData.reduce((sum, item) => sum + item.Power, 0);

// Step 2: Convert each value into a percentage
const percentageData = dummyData.map((item) => ({
  ...item,
  Voltage: ((item.Voltage / totalVoltage) * 100).toFixed(2), 
  Current: ((item.Current / totalCurrent) * 100).toFixed(2), 
  Power: ((item.Power/ totalPower) * 100).toFixed(2)
}));

// Step 3: Construct the pie chart data
const lastPer = percentageData.length;
const pieData =  [
  { name: "Current", value: parseFloat(percentageData[lastPer - 1].Current) },
  { name: "Voltage", value: parseFloat(percentageData[lastPer - 1].Voltage) },
  { name: "Power", value: parseFloat(percentageData[lastPer - 1].Power) },
];
  setPieChartData(pieData);

  }, [dummyData])

  const lastElement = dummyData[dummyData.length - 1];

  return (
    <div className="container">
      {/*
      {sensorData ? (
        <div>
          <p>temperature {sensorData.Current}</p>
          <p>humidity {sensorData.Voltage}</p>
          
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
        */}
        

      {dummyData && (
        <div>
          <div className="meterContain">
              <div className={"Contain"}>
                  <p className={"Label"}>Voltage:</p>
                  <p className={"LabelValue"}>{lastElement?.Voltage}</p>
              </div>

              <div className={"Contain"}>
                <p className={"Label"}>Current:</p>
                <p className={"LabelValue"}>{lastElement?.Current}</p>
              </div>

              
              <div className={"Contain"}>
                <p className={"Label"}>Power:</p>
                <p className={"LabelValue"}>{lastElement?.Power}</p>
              </div>
          </div>
      
      <div className="graphContainer">
        <div className="pieGraph">
          <h1> Percentage Usage of Electrical parameters</h1>
        <ResponsiveContainer width="100%" height={200}>
        <PieChart className="pie">
          <Tooltip/>
          <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="100%" fill="#8884d8" >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
        </ResponsiveContainer>
      </div>
          
        <div className="barGraph">
          
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={500} height={250} data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()} 
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Current" fill="#8884d8" />
            <Bar dataKey="Voltage" fill="#82ca9d" /> 
          </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
      </div>
    
  )}
    </div>
  );
}
