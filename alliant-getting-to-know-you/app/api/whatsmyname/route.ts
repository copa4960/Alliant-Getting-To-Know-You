import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    let scriptOutput = '';
    let scriptError = '';

    // Execute the Python script - using path.resolve to go up one directory
    const pythonProcess = spawn('python', [
      path.resolve(process.cwd(), '..', 'WhatsMyName-Python', 'whatsmyname_api.py'),
      username
    ]);

    // Capture output and errors
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
    });

    // Wait for the script to complete
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Python script failed with code ${code}. Error: ${scriptError}`));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python script: ${err.message}`));
      });
    });

    // The Python script prints the report path to stdout
    const reportPath = scriptOutput.trim();
    
    // Read the generated HTML file using the path from the Python script
    const html = await fs.readFile(reportPath, 'utf-8');

    // Clean up the file
    await fs.unlink(reportPath);

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
} 