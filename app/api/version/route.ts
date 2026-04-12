import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    return Response.json({
      version: packageJson.version,
    });
  } catch (error) {
    return Response.json(
      { error: 'No se pudo obtener la versión' },
      { status: 500 }
    );
  }
}
