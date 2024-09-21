import fs from 'fs';
import path from 'path';
import { minify } from 'minify';

const inputDir = 'static';
const outputDir = 'build';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const processDirectory = (srcDir: string, destDir: string): void => {
    const files = fs.readdirSync(srcDir);

    files.forEach((file) => {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDir, file);

        if (fs.lstatSync(srcPath).isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            processDirectory(srcPath, destPath);
        } else {
            const ext = path.extname(file);

            if (ext === '.html' || ext === '.css') {
                minify(srcPath)
                    .then((minifiedContent: string) => {
                        fs.writeFileSync(destPath, minifiedContent);
                        console.log(`Minified: ${srcPath} -> ${destPath}`);
                    })
                    .catch((err: Error) => {
                        console.error(`Error minifying ${srcPath}:`, err);
                    });
            } else {
                // If it's not HTML or CSS, just copy the file
                fs.copyFileSync(srcPath, destPath);
            }
        }
    });
};

processDirectory(inputDir, outputDir);
