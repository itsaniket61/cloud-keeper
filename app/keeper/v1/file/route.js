import { APP } from '@/constants/AppConstatnts';
import { NextResponse } from 'next/server';

export const POST = async (request) => {
  const formData = await request.formData();
  const filePath = formData.get("folderName");
  const file = formData.get("file");
  const storageType = process.env.CLOUD_STORAGE_TYPE;
    
  const storageService = APP.STORAGE.TYPE[storageType];
  const { message, status } = await storageService.uploadFile(filePath,file);
  return NextResponse.json({message},{status});
};

export const GET = async (request) => {
  try {
    const queryParams = request.nextUrl.searchParams;
    const folderName = queryParams.get('folderName');
    
    const storageType = process.env.CLOUD_STORAGE_TYPE;

    const storageService = APP.STORAGE.TYPE[storageType];
    const { response, status } = await storageService.listFiles(folderName);
    return NextResponse.json({ response }, { status });
  } catch (error) {
    return NextResponse.json({ response: error.message }, { status: 500 });
  }
};