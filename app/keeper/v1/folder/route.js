import { APP } from "@/constants/AppConstatnts";
import { NextResponse } from "next/server";

export const POST = async (request) =>{
    const {folderName} = await request.json();
    const storageType = process.env.CLOUD_STORAGE_TYPE;

    if (!storageType) {
      throw new Error(`Storage type is not specified'`);
    }
    
    const storageService = APP.STORAGE.TYPE[storageType];
    const { message, status } = await storageService.createFolder(folderName);
    return NextResponse.json({message},{status});
}

export const GET = async (request) => {
  try {
    const queryParams = request.nextUrl.searchParams;
    const folderName = queryParams.get('folderName');

    const storageType = process.env.CLOUD_STORAGE_TYPE;

    if (!storageType) {
      throw new Error(`Storage type is not specified'`);
    }

    const storageService = APP.STORAGE.TYPE[storageType];
    const { response, status } = await storageService.listFiles(folderName);
    return NextResponse.json({ response }, { status });
  } catch (error) {
    return NextResponse.json({ response: error.message }, { status: 500 });
  }
};

export const DELETE = async (request) => {
    const queryParams = request.nextUrl.searchParams;
    const path = queryParams.get('path');
    
    const storageType = process.env.CLOUD_STORAGE_TYPE;
    
    const storageService = APP.STORAGE.TYPE[storageType];
    const { response, status } = await storageService.deleteFolder(path);
    return NextResponse.json({response},{status});
}