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
      origin: "http://localhost:3000", // Allow connections from this origin
      methods: ["GET", "POST"], // Allowed HTTP methods
      allowedHeaders: ["my-custom-header"], // Custom headers
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
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const DataSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    timestamp: { type: Date, default: Date.now}
});
const DataModel = mongoose.model("Data", DataSchema);

app.post("/api/sensor", async (req, res) => {
    try {
        const { temperature, humidity } = req.body;
        const data = new DataModel({temperature, humidity});
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

app.get("/api/sensor", async (req, res) => {
    try {
        // Get the latest sensor data
        const latestData = await DataModel.find().sort({ timestamp: -1 }).limit(1); // Get the most recent entry
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
            const latestData = await DataModel.find().sort({ timestamp: -1 }).limit(5);
            
            if (latestData.length > 0) {
                socket.emit("read", latestData); // Send the latest data to the connected client
            } else {
                socket.emit("read", "No data available");
            }
        } catch (error) {
            socket.emit("read", `Error: ${error.message}`);
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
