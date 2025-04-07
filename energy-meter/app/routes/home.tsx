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
  const [pieChartData1, setPieChartData1] = useState<Array<{name: string; value: number}>> ([]);
  const [pieChartData2, setPieChartData2] = useState<Array<{name: string; value: number}>> ([]);
  const COLORS = ["#8884d8", "#82ca9d", "#ff8042"]; // Define colors for each segment
  const [load1Data, setLoad1Data] = useState<Array<{ time: string; Current: number; Voltage: number; Power: number; kWh: number }>>([]);
  const [load2Data, setLoad2Data] = useState<Array<{ time: string; Current: number; Voltage: number; Power: number; kWh: number }>>([]);
  const [BarData, setBarData] = useState<Array<{ time: string; Power1: number; Power2: number }>>([]);
  const [lineData, setLineData] = useState<Array<{ time: string; Voltage1: number; Voltage2: number }>>([]);


  const [sensorData1, setSensorData1] = useState<SensorData | null>(null);
  const [sensorData2, setSensorData2] = useState<SensorData | null>(null);

  useEffect(() => {
    // Listen for the "read" event from the server
    socket.on("readData1", (data) => {
      const updatedArray = data.map((value: SensorData) => ({
      time: value.timestamp || "",
      Current: value.Current,
      Voltage: value.Voltage,
      Power: value.Power,
      kWh: value.kWh
      }));
      setLoad1Data(updatedArray); 
      
    });

    socket.on("readData2", (data) => {
      const updatedArray = data.map((value: SensorData) => ({
        time: value.timestamp || "",
        Current: value.Current,
        Voltage: value.Voltage,
        Power: value.Power,
        kWh: value.kWh
        }));
        setLoad2Data(updatedArray); 
      
    });
  }, []);
  
  console.log(load2Data);

// Effect to update BarData when load1Data or load2Data changes
useEffect(() => {
  if (load1Data.length > 0 && load2Data.length > 0) {
     // Combine load1Data and load2Data into barData
     // Combine Power data from load1Data and load2Data irrespective of time
    const combinedData = load1Data.map((load1Item, index) => ({
      time: load1Item.time,
      Power1: load1Item.Power,
      Power2: load2Data[index] ? load2Data[index].Power : 0 // Use 0 if no corresponding load2Data entry
    }));
    setBarData(combinedData);
  }
}, [load1Data, load2Data]); // Run this effect whenever load1Data or load2Data changes

useEffect(() => {
  if (load1Data.length === 0) return; // Exit if there's no data

// Step 1: Calculate the total sum of all values
const totalCurrent = load1Data.reduce((sum, item) => sum + item.Current, 0);
const totalVoltage  = load1Data.reduce((sum, item) => sum + item.Voltage, 0);
const totalPower = load1Data.reduce((sum, item) => sum + item.Power, 0);

// Step 2: Convert each value into a percentage
const percentageData1 = load1Data.map((item) => ({
  ...item,
  Voltage: ((item.Voltage / totalVoltage) * 100).toFixed(2), 
  Current: ((item.Current / totalCurrent) * 100).toFixed(2), 
  Power: ((item.Power/ totalPower) * 100).toFixed(2)
}));

// Step 3: Construct the pie chart data
const lastPer = percentageData1.length;
const pieData =  [
  { name: "Current", value: parseFloat(percentageData1[lastPer - 1].Current) },
  { name: "Voltage", value: parseFloat(percentageData1[lastPer - 1].Voltage) },
  { name: "Power", value: parseFloat(percentageData1[lastPer - 1].Power) },
];
  setPieChartData1(pieData);

  }, [load1Data])

  
  useEffect(() => {
    // Combine Voltage data from load1Data and load2Data
    const combinedData = load1Data.map((load1Item, index) => ({
      time: load1Item.time,
      Voltage1: load1Item.Voltage,
      Voltage2: load2Data[index] ? load2Data[index].Voltage : 0 // Use 0 if no corresponding load2Data entry
    }));

    // If load2Data is longer than load1Data, append the remaining Voltage values
    if (load2Data.length > load1Data.length) {
      const additionalData = load2Data.slice(load1Data.length).map(load2Item => ({
        time: load2Item.time,
        Voltage1: 0, // No corresponding load1Data entry
        Voltage2: load2Item.Voltage
      }));
      setLineData([...combinedData, ...additionalData]);
    } else {
      setLineData(combinedData);
    }
  }, [load1Data, load2Data]); // Run this effect whenever load1Data or load2Data changes


useEffect(() => {
  if (load2Data.length === 0) return; // Exit if there's no data

// Step 1: Calculate the total sum of all values
const totalCurrent = load2Data.reduce((sum, item) => sum + item.Current, 0);
const totalVoltage  = load2Data.reduce((sum, item) => sum + item.Voltage, 0);
const totalPower = load2Data.reduce((sum, item) => sum + item.Power, 0);

// Step 2: Convert each value into a percentage
const percentageData2 = load2Data.map((item) => ({
  ...item,
  Voltage: ((item.Voltage / totalVoltage) * 100).toFixed(2), 
  Current: ((item.Current / totalCurrent) * 100).toFixed(2), 
  Power: ((item.Power/ totalPower) * 100).toFixed(2)
}));

// Step 3: Construct the pie chart data
const lastPer = percentageData2.length;
const pieData =  [
  { name: "Current", value: parseFloat(percentageData2[lastPer - 1].Current) },
  { name: "Voltage", value: parseFloat(percentageData2[lastPer - 1].Voltage) },
  { name: "Power", value: parseFloat(percentageData2[lastPer - 1].Power) },
];
  setPieChartData2(pieData);

  }, [load1Data])



  const lastEleData1 = load1Data[load1Data.length - 1];
  const lastEleData2 = load2Data[load1Data.length - 1];

  return (
    <div className="container">

      {load1Data && (
        <div>
          <div className="meterContain">
              <div className={"Contain"}>
                <h3>Load 1</h3>
                  <p className={"Label"}>Voltage:</p>
                  <p className={"LabelValue"}>{lastEleData1?.Voltage}</p>
              </div>


              <div className={"Contain"}>
                <h3>Load 1</h3>
                <p className={"Label"}>Current:</p>
                <p className={"LabelValue"}>{lastEleData1?.Current}</p>
              </div>

              <div className={"Contain"}>
                <h3>Load 1</h3>
                <p className={"Label"}>Power:</p>
                <p className={"LabelValue"}>{lastEleData1?.Power}</p>
              </div>
              
              
              <div className={"Contain"}>
                <h3>Load 1</h3>
                <p className={"Label"}>kWh:</p>
                <p className={"LabelValue"}>{lastEleData1?.kWh}</p>
              </div>

              <div className={"Contain"}>
                <h3>Load 2</h3>
                  <p className={"Label"}>Voltage:</p>
                  <p className={"LabelValue"}>{lastEleData2?.Voltage}</p>
              </div>
              
              <div className={"Contain"}>
                <h3>Load 2</h3>
                <p className={"Label"}>Current:</p>
                <p className={"LabelValue"}>{lastEleData2?.Current}</p>
              </div>

              <div className={"Contain"}>
                <h3>Load 2</h3>
                <p className={"Label"}>Power:</p>
                <p className={"LabelValue"}>{lastEleData2?.Power}</p>
              </div>
              
              <div className={"Contain"}>
                <h3>Load 2</h3>
                <p className={"Label"}>kWh:</p>
                <p className={"LabelValue"}>{lastEleData2?.kWh}</p>
              </div>
          </div>
      
      <div className="graphContainer">

      
      <div className="pieContainer">
        <div className="pieGraph">
          <h3> Load 1 Data in %</h3>
          <ResponsiveContainer width="100%" height={200}>
          <PieChart className="pie">
          <Legend/>
          <Tooltip/>
          <Pie data={pieChartData1} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="100%" fill="#8884d8" >
            {pieChartData1.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          </PieChart>
          </ResponsiveContainer>

          <h3> Load 2 Data in %</h3>
          <ResponsiveContainer width="100%" height={200}>
          <PieChart>
          <Legend/>
          <Tooltip/>
          <Pie data={pieChartData2} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="100%" fill="#8884d8" >
            {pieChartData2.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          </PieChart>

          </ResponsiveContainer>
      
        </div>
        <div className="barGraph">
          
          <ResponsiveContainer width="100%" height="100%">
          <BarChart width={500} height={500} data={BarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()} 
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Power1" fill="#8884d8" />
            <Bar dataKey="Power2" fill="#82ca9d" /> 
          </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="LineGraph">
      <ResponsiveContainer width="100%" height={300}>
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Voltage1" stroke="#8884d8" />
        <Line type="monotone" dataKey="Voltage2" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>  
      </div>
      </div>
      </div>
    
  )}
    </div>
  );
}
