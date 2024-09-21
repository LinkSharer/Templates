import fs from 'fs';
import path from 'path';
import os from 'os';
import { minify } from 'minify';
import sass from 'sass';

const inputDir = 'static';
const outputDir = 'build';
const tempDir = path.join(os.tmpdir(), "linksharer");

const minifyFile = (src: string, dest: string) => {
    minify(src).then((res) => {
        fs.writeFileSync(dest, res);
    });
}

const processScss = (src: string, dest: string) => {
    const temp = path.join(tempDir, src.replace('.scss', '.css'));

    if (!fs.existsSync(path.dirname(temp))) {
        fs.mkdirSync(path.dirname(temp), { recursive: true });
    }

    fs.writeFileSync(temp, sass.compile(src).css);

    minifyFile(temp, dest.replace('.scss', '.css'));
}

const processFile = async (src: string, dest: string) => {
    const ext = path.extname(src);

    if (ext == '.scss') {
        return processScss(src, dest);
    }

    minifyFile(src, dest);
}

const processDir = (src: string, dest: string) => {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    fs.readdirSync(src).forEach((file) => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        fs.lstatSync(srcPath).isDirectory() ? processDir(srcPath, destPath) : processFile(srcPath, destPath);
    });
}

const main = () => {
    processDir(inputDir, outputDir);
}

main();