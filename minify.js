import { execSync } from 'child_process';
import fs from 'fs';
import { renameSync } from 'fs';

const distFolder = './dist/assets';
const files = fs.readdirSync(distFolder);

files.forEach(file => {
    if (file.endsWith('.js') && !file.endsWith('.min.js')) {
        const inputFile = `${distFolder}/${file}`;
        const outputFile = `${distFolder}/${file.replace('.js', '.min.js')}`;
        const command = `terser ${inputFile} --compress sequences=true,dead_code=true,conditionals=true,booleans=true --mangle --toplevel --module -o ${outputFile}`;

        // Execute command with increased buffer size
        execSync(command, { maxBuffer: 1024 * 1024 * 6 });

        // Remove the original file
        fs.unlinkSync(inputFile);

        // Rename the minified file to the original filename
        renameSync(outputFile, inputFile);
    }
});

