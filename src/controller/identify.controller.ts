import { Request, Response } from "express";
import { processContacts } from "../services/identify.service";

export const identifyUser=async (req:Request,res:Response)=>{

    try {
        const contact= await processContacts(req.body);

        return res.status(200).json({
            data: contact,
            message: "User data processed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error:error,
            message: "Internal server error"
        })
    }
}