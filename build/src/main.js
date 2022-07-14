"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');
const { app, Tray, Menu, MenuItem, clipboard, globalShortcut } = require('electron');
const { exec } = require('child_process');
let langCode = 'jpn';
app.whenReady().then(() => {
    const tray = new Tray(path.join(__dirname, '../assets/camera.metering.matrix@3x.png'));
    tray.setIgnoreDoubleClickEvents(true);
    createLangMenu().then((langMenu) => {
        // console.log(langMenu);
        tray.setContextMenu(Menu.buildFromTemplate([
            {
                id: 'screenshot',
                icon: path.join(__dirname, '../assets/plus.viewfinder@3x.png'),
                label: ' Screenshot -> Clipboard',
                type: 'normal',
                accelerator: 'CommandOrControl+Option+Shift+C',
                click: (menuItem, win, event) => __awaiter(void 0, void 0, void 0, function* () {
                    ocrImageToClipboard(langCode);
                })
            },
            {
                type: 'submenu',
                label: 'Change language',
                submenu: Menu.buildFromTemplate(langMenu)
            },
            {
                type: 'separator'
            },
            {
                role: 'quit',
                label: 'Quit',
                accelerator: 'Command+Q'
            }
        ]));
    });
    globalShortcut.register('CommandOrControl+Option+Shift+D', () => __awaiter(void 0, void 0, void 0, function* () {
        ocrImageToClipboard(langCode);
    }));
});
app.setAboutPanelOptions({
    applicationName: 'ClipTess',
    applicationVersion: '1.0.0',
    authors: 'oudajosefu',
    iconPath: path.join(__dirname, '../assets/icon_60pt@3x.png')
});
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
const screenCapture = () => {
    return new Promise((resolve, reject) => {
        exec('screencapture -isc', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
};
const recognizeText = (langId, imageFilePath) => {
    return new Promise((resolve, reject) => {
        exec(`tesseract -l ${langId} ${imageFilePath} -`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
};
const ocrImageToClipboard = (langCode) => {
    screenCapture()
        .then((stdout) => {
        try {
            fs.writeFile(path.join(__dirname, '../src/temp.png'), clipboard.readImage().toPNG(), (err) => {
                if (err)
                    throw err;
            });
        }
        catch (err) {
            console.log(`\nFile writing errors:\n${err}\n`);
        }
        recognizeText(langCode, path.join(__dirname, '../src/temp.png'))
            .then((stdoutText) => {
            clipboard.writeText(stdoutText);
        })
            .catch((err) => {
            console.log(`\nTesseract recognition error: ${err}\n`);
        });
    })
        .catch((err) => {
        console.log(`\nScreen capture error: ${err}\n`);
    });
};
const createLangMenu = () => {
    return new Promise((resolve, reject) => {
        let langMenu = [];
        csv()
            .fromFile(path.join(__dirname, '../src/tesseract-ocr.csv'))
            .then((jsonArray) => {
            jsonArray.forEach((lang) => {
                // console.log(`${lang.langCode}: ${lang.language}`);
                if (lang.langCode === 'jpn')
                    langMenu.push(new MenuItem({
                        type: 'radio',
                        label: `${lang.language}`,
                        checked: true
                    }));
                else
                    langMenu.push(new MenuItem({
                        type: 'radio',
                        label: `${lang.language}`,
                        checked: false,
                        click: () => {
                            setLang(lang.langCode);
                        }
                    }));
            });
            resolve(langMenu);
        })
            .catch((error) => {
            if (error) {
                reject(error);
                return;
            }
        });
    });
};
const setLang = (checkedLangCode) => {
    langCode = checkedLangCode;
};
app.dock.hide();
