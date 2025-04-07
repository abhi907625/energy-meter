import express from "express"
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

app.use(express.json());

// Configure Socket.IO
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Allow connections from this origin
      methods: ["GET", "POST"], // Allowed HTTP methods
      credentials: true, // Allow credentials
    },
});  


// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allow specific methods
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers
    next(); // Proceed to the next middleware or route handler
});


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sensordata', {
 
});

const DataSchema = new mongoose.Schema({
    Voltage: Number,
    Current: Number,
    Power: Number,
    kWh: Number,
    timestamp: { type: Date, default: Date.now}
});

const DataModel1 = mongoose.model("Load1", DataSchema);
const DataModel2 = mongoose.model("Load2", DataSchema);

app.post("/api/sensor/1", async (req, res) => {
    try {
        const { Voltage, Current, Power, kWh } = req.body;
        const data = new DataModel1({Voltage, Current, Power, kWh});
        await data.save();
        res.status(201).json({
            message: "sensor data is saved successfully"
        })
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
})


app.post("/api/sensor/2", async (req, res) => {
    try {
        const { Voltage, Current, Power, kWh } = req.body;
        const data = new DataModel2({Voltage, Current, Power, kWh});
        await data.save();
        res.status(201).json({
            message: "sensor data is saved successfully"
        })
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
})

app.get("/api/sensor/1", async (req, res) => {
    try {
        // Get the latest sensor data
        const latestData = await DataModel1.find().sort({ timestamp: -1 }).limit(1); // Get the most recent entry
        if (latestData.length > 0) {
            res.status(200).json(latestData[0]); // Return the latest data
        } else {
            res.status(404).json({ message: "No sensor data found." });
        }
    } catch (e) {
        res.status(500).json({
            error: error.message
        })
    }
})

// Root route to fetch the latest sensor data
app.get("/", async (req, res) => {
    res.status(200).json({
        message: "Get Sensor Data"
    })
});

io.on("connection", async (socket) => {
    
    // Set an interval to send the latest data every 5 seconds
    const intervalId = setInterval(async () => {
        try {
            const latestData1 = await DataModel1.find().sort({ timestamp: -1 }).limit(5);
            
            if (latestData1.length > 0) {
                socket.emit("readData1", latestData1); // Send the latest data to the connected client
            } else {
                socket.emit("readData1", "No data available");
            }

            const latestData2 = await DataModel2.find().sort({ timestamp: -1 }).limit(5);
            
            if (latestData2.length > 0) {
                socket.emit("readData2", latestData2); // Send the latest data to the connected client
            } else {
                socket.emit("readData2", "No data available");
            }

        } catch (error) {
            socket.emit("readData2", `Error: ${error.message}`);
        }
    }, 5000); // Adjust the interval as needed (5000 ms = 5 seconds)

     // Clear the interval when the client disconnects
     socket.on("disconnect", () => {
        
        clearInterval(intervalId);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
