import { APP } from "@/constants/AppConstatnts";
import { NextResponse } from "next/server";

export const POST = async (request) =>{
    try {
      const uid = await request.headers.get('uid');
      const { folderName } = await request.json();
      const storageType = process.env.CLOUD_STORAGE_TYPE;

      if (!storageType) {
        throw new Error(`Storage type is not specified'`);
      }

      const storageService = APP.STORAGE.TYPE[storageType];
      const { message, status } = await storageService.createFolder(uid, folderName);
      return NextResponse.json({ message }, { status });
    } catch (error) {
      return NextResponse.json({ response: error.message }, { status: 500 });
    }
}

export const GET = async (request) => {
  try {
    const uid = await request.headers.get('uid');
    const queryParams = request.nextUrl.searchParams;
    const folderName = queryParams.get('folderName');

    const storageType = process.env.CLOUD_STORAGE_TYPE;

    if (!storageType) {
      throw new Error(`Storage type is not specified'`);
    }

    const storageService = APP.STORAGE.TYPE[storageType];
    const { response, status } = await storageService.listFiles(uid, folderName);
    return NextResponse.json({ response }, { status });
  } catch (error) {
    return NextResponse.json({ response: error.message }, { status: 500 });
  }
};

export const DELETE = async (request) => {
    const uid = await request.headers.get('uid');
    const queryParams = request.nextUrl.searchParams;
    const path = queryParams.get('path');
    
    const storageType = process.env.CLOUD_STORAGE_TYPE;
    
    const storageService = APP.STORAGE.TYPE[storageType];
    const { response, status } = await storageService.deleteFolder(uid,path);
    return NextResponse.json({response},{status});
}