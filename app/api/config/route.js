import { NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const CONFIG_DIR = join(process.cwd(), 'data');
const CONFIG_FILE = join(CONFIG_DIR, 'llm-configs.json');

// 确保配置目录存在
async function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
}

// 读取配置文件
export async function GET() {
  try {
    await ensureConfigDir();
    
    if (!existsSync(CONFIG_FILE)) {
      return NextResponse.json({ providers: [], currentProviderId: null });
    }
    
    const data = await readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to read config file:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

// 写入配置文件
export async function POST(request) {
  try {
    const configData = await request.json();
    
    await ensureConfigDir();
    await writeFile(CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write config file:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}