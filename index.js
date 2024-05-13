import express from "express"
import { DataTypes, Sequelize } from "sequelize"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()
const app = express()
app.use(
    cors({
        origin: "*",
    })
)
const sequelize = new Sequelize(process.env.DATABASE_URI, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
})

sequelize.sync().then(() => console.log("Connected to database"))

const Ship = sequelize.define("Ship", {
    sitename: {
        type: DataTypes.STRING,
    },
    latitude: {
        type: DataTypes.REAL,
    },
    longitude: {
        type: DataTypes.REAL,
    },
    heading: {
        type: DataTypes.REAL,
    },
    timestamp: {
        type: DataTypes.DATE,
    },
})

app.get("/getLatestShips", async (req, res) => {
    const [ships, meta] = await sequelize.query(
        "SELECT t.* FROM ships t JOIN (SELECT sitename, MAX(timestamp) AS max_timestamp FROM ships GROUP BY sitename ) AS max_timestamps ON t.sitename = max_timestamps.sitename AND t.timestamp = max_timestamps.max_timestamp;"
    )
    res.json({ ships: ships })
    console.log("response sent")
})

app.get("/getPorts", async (req, res) => {
    const [ports, meta] = await sequelize.query("SELECT * FROM ports;")
    res.json({ ports: ports })
})

app.listen(4000, () => {
    console.log("Backend started on port 4000")
})
