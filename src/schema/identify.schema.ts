import {z} from "zod"


export const identifyUserSchema = z.object({
    email: z.string().email().optional().nullable(),
    phoneNumber : z.string().optional().nullable()
}).refine((data)=> data.email || data.phoneNumber, {
    message: "Either email or phoneNumber must be provided"
});

export type idetifyUserInput =z.infer<typeof identifyUserSchema> 