import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks whether a file referenced by an absolute public path (e.g. "/images/foo.webp")
 * has actually been placed in the `public/` directory. Runs at build/dev time only.
 */
export function mediaExists(publicPath: string): boolean {
	const cleaned = publicPath.replace(/^\/+/, '');
	return fs.existsSync(path.join(process.cwd(), 'public', cleaned));
}
