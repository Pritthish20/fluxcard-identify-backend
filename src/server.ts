import dotenv from "dotenv"
import { app } from "./app"
import { connectDatabase } from "./config/db";

dotenv.config()

const PORT =process.env.PORT || 3000;

const startServer= async()=>{
    try {
        await connectDatabase();
        app.listen(PORT, ()=>{
            console.log(`Server started on Port: ${PORT}`)
        });
    } catch (error) {
        console.error("Server startup failed",error);
        process.exit(1);
    }
};

startServer();
