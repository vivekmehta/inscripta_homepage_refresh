'use strict';
const fs = require('fs');
const upath = require('upath');
const sh = require('shelljs');

module.exports = function renderCname() {
    const sourcePath = upath.resolve(upath.dirname(__filename), '../src/CNAME');
    const destPath = upath.resolve(upath.dirname(__filename), '../docs/.');

    //const sourcePath2 = upath.resolve(upath.dirname(__filename), '../src/*.*');
    //const destPath2 = upath.resolve(upath.dirname(__filename), '../docs/.');
    
    sh.cp('-R', sourcePath, destPath)
    //sh.cp('-R', sourcePath2, destPath2)
};
