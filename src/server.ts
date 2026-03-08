import dotenv from "dotenv"
import { app } from "./app"
import { connectDatabase } from "./config/db";

dotenv.config()

const PORT =process.env.PORT || 3000;

connectDatabase();

app.listen(PORT , ()=>{
    console.log(`Server started on Port: ${PORT}`)
})

