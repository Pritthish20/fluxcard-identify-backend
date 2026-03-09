import { NextFunction, Request, Response } from "express";
import {z} from "zod";

export const validateSchema = <T extends z.ZodTypeAny> (schema:T) => (req:Request,res:Response,next:NextFunction)=>{
    
    const result =schema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({
            message:"Validation Error",
            error: result.error.issues.map((i)=>({
                field: i.path.join("."),
                error: i.message
            }))
        });
    }

    req.body=result.data;
    next();
}
