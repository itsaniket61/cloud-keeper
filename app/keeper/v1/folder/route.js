import { APP } from "@/constants/AppConstatnts";
import { NextResponse } from "next/server";

export const POST = async (request) =>{
    const {folderName} = await request.json();
    const storageType = process.env.CLOUD_STORAGE_TYPE;
    
    const storageService = APP.STORAGE.TYPE[storageType];
    const { message, status } = await storageService.createFolder(folderName);
    return NextResponse.json({message},{status});
}