import express from "express"
import identifyRoute from "./routes/identify.route"

export const app =express();

app.use(express.json());

app.get("/", (req,res)=>{
    res.status(200).json({
        message:"Server is up and running fine"
    })
})

app.use("/identify",identifyRoute)

export default app;
