#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import fs from 'fs';

let exit = false;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
    const welcome = "Find and Replace App";

    const figletPromise = new Promise((resolve, reject) => {
        figlet(welcome, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log(gradient('green', 'blue', 'purple').multiline(data));
                resolve();
            }
        });
    });

    await figletPromise;
}

async function askFile() {
    console.log();

    const inputFile = await inquirer.prompt({
        name: 'inputFile',
        type: 'input',
        message: 'Enter the path to the input file (or type "exit" to quit):',
        default() {
            return 'input.txt';
        },
    });

    if (inputFile.inputFile === 'exit') {
        exit = true;
        let goodbye = chalkAnimation.rainbow('\nGoodbye!');
        await sleep(1000);
        goodbye.stop();
        return;
    }

    await handleAnswer(inputFile.inputFile);
}

async function handleAnswer(inputFile) {
    console.log();
    const spinner = createSpinner(`Looking for: ${inputFile}...`).start();
    await sleep();

    if (fs.existsSync(inputFile)) {
        spinner.success({ text: `File found: ${inputFile}` });
    } else {
        spinner.error({ text: `File not found: ${inputFile}` });
        await askFile();
    }

    await askFind(inputFile);
}

async function askFind(inputFile) {
    console.log();

    const find = await inquirer.prompt({
        name: 'find',
        type: 'input',
        message: 'Enter the text to find:',
        default() {
            return 'the';
        }
    });

    const fileContent = fs.readFileSync(inputFile, 'utf8');
    if (!fileContent.includes(find.find)) {
        console.log(chalk.red(`\nText not found: ${find.find}`));
        await askFile();
    }

    await askReplace(inputFile, find.find);
}

async function askReplace(inputFile, find) {
    console.log();

    const replace = await inquirer.prompt({
        name: 'replace',
        type: 'input',
        message: 'Enter the text to replace:',
        default() {
            return 'a';
        }
    });

    const fileContent = fs.readFileSync(inputFile, 'utf8');
    const regex = new RegExp(find, 'g');
    const matchCount = (fileContent.match(regex) || []).length;
    const newContent = fileContent.replace(regex, replace.replace);
    fs.writeFileSync('output.txt', newContent);

    console.log(chalk.green(`\nReplaced ${matchCount} occurrences of "${find}" with "${replace.replace}".`));
    await askFile();
}

await welcome();
while (!exit) {
    await askFile();
}