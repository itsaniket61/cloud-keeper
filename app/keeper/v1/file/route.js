import { APP } from '@/constants/AppConstatnts';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
  try {
    const uid = await request.headers.get('uid');
    const formData = await request.formData();
    const filePath = formData.get('folderName');
    const file = formData.get('file');
    const storageType = process.env.CLOUD_STORAGE_TYPE;

    if (!storageType) {
      throw new Error(`Storage type is not specified'`);
    }

    const storageService = APP.STORAGE.TYPE[storageType];
    const { message, status } = await storageService.uploadFile(uid, filePath, file);
    return NextResponse.json({ message }, { status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status:500 });
  }
};

export const GET = async (request) => {
  try {
    const uid = await request.headers.get('uid');
    const queryParams = request.nextUrl.searchParams;
    const filePath = queryParams.get('filePath');
    
    const storageType = process.env.CLOUD_STORAGE_TYPE;

    if (!storageType) {
      throw new Error(`Storage type is not specified'`);
    }

    const storageService = APP.STORAGE.TYPE[storageType];
    const { response, status } = await storageService.getDownloadUrl(uid,filePath);
    return NextResponse.json({ response }, { status });
  } catch (error) {
    return NextResponse.json({ response: error.message }, { status: 500 });
  }
};

export const DELETE = async (request) => {
  try {
    const uid = await request.headers.get('uid');
    const queryParams = request.nextUrl.searchParams;
    const path = queryParams.get('path');
    
    const storageType = process.env.CLOUD_STORAGE_TYPE;

    if (!storageType) {
      throw new Error(`Storage type is not specified'`);
    }

    const storageService = APP.STORAGE.TYPE[storageType];
    const { response, status } = await storageService.deleteFile(uid,path);
    return NextResponse.json({ response }, { status });
  } catch (error) {
    return NextResponse.json({ response: error.message }, { status: 500 });
  }
}