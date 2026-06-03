'use strict';
const fs = require('fs');
const upath = require('upath');
const pug = require('pug');
const sh = require('shelljs');
const prettier = require('prettier');

const BLOG_DATA_PATH = upath.resolve(upath.dirname(__filename), '../src/data/blogs.json');

function loadBlogs() {
    try {
        if (fs.existsSync(BLOG_DATA_PATH)) {
            return JSON.parse(fs.readFileSync(BLOG_DATA_PATH, 'utf-8'));
        }
    } catch (e) {
        console.warn(`### WARN: Failed to read ${BLOG_DATA_PATH}: ${e.message}`);
    }
    return [];
}

module.exports = function renderPug(filePath) {
    const destPath = filePath.replace(/src\/pug\//, 'docs/').replace(/\.pug$/, '.html');
    const srcPath = upath.resolve(upath.dirname(__filename), '../src');

    console.log(`### INFO: Rendering ${filePath} to ${destPath}`);
    const html = pug.renderFile(filePath, {
        doctype: 'html',
        filename: filePath,
        basedir: srcPath,
        blogs: loadBlogs()
    });

    const destPathDirname = upath.dirname(destPath);
    if (!sh.test('-e', destPathDirname)) {
        sh.mkdir('-p', destPathDirname);
    }

    const prettified = prettier.format(html, {
        printWidth: 1000,
        tabWidth: 4,
        singleQuote: true,
        proseWrap: 'preserve',
        endOfLine: 'lf',
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore'
    });

    fs.writeFileSync(destPath, prettified);
};
