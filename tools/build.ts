import fs from 'fs';
import path from 'path';
import os from 'os';
import { minify } from 'minify';
import sass from 'sass';

const inputDir = 'static';
const outputDir = 'build';
const tempDir = path.join(os.tmpdir(), "linksharer");

const minifyFile = async (src: string, dest: string) => fs.writeFileSync(dest, await minify(src));

const processScss = async (src: string, dest: string) => {
    const temp = path.join(tempDir, src.replace('.scss', '.css'));

    if (!fs.existsSync(path.dirname(temp))) {
        fs.mkdirSync(path.dirname(temp), { recursive: true });
    }

    fs.writeFileSync(temp, sass.compile(src).css);

    await minifyFile(temp, dest.replace('.scss', '.css'));
}

const processFile = async (src: string, dest: string) => {
    const ext = path.extname(src);

    if (ext == '.scss') {
        return await processScss(src, dest);
    }

    if (ext == '.html' || ext == ".css") {
        return minifyFile(src, dest);
    }

    fs.copyFileSync(src, dest);
}

const getTemplates = (dir: string) => fs.readdirSync(dir, { recursive: true }).map(file => file.toString()).filter(file => path.extname(file) === '.css').map(file => path.basename(file, '.css'));

const processDir = async (src: string, dest: string) => {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    for (const file of fs.readdirSync(src)) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.lstatSync(srcPath).isDirectory()) {
            await processDir(srcPath, destPath);
        } else {
            await processFile(srcPath, destPath);
        }
    }

    fs.writeFileSync(path.join(dest, "templates.json"), JSON.stringify(getTemplates(dest)));
}

const main = () => {
    processDir(inputDir, outputDir);
}

main();