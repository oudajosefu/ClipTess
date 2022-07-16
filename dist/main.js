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
const GLOBAL_SHORTCUT = 'CommandOrControl+Option+Shift+C';
let langCode = 'jpn';
app.whenReady().then(() => __awaiter(void 0, void 0, void 0, function* () {
    const tray = new Tray(path.join(app.getAppPath(), 'assets/camera.metering.matrix@3x.png'));
    tray.setIgnoreDoubleClickEvents(true);
    createLangMenu().then((langMenu) => {
        // console.log(langMenu);
        tray.setContextMenu(Menu.buildFromTemplate([
            {
                id: 'screenshot',
                icon: path.join(app.getAppPath(), 'assets/plus.viewfinder@3x.png'),
                label: ' Screenshot -> Clipboard',
                type: 'normal',
                accelerator: GLOBAL_SHORTCUT,
                click: (menuItem, win, event) => {
                    ocrImageToClipboard(langCode);
                }
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
    globalShortcut.register(GLOBAL_SHORTCUT, () => {
        ocrImageToClipboard(langCode);
    });
}));
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
const setLang = (checkedLangCode) => {
    langCode = checkedLangCode;
};
const execShellCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            // console.log(stderr);
            resolve(stdout ? stdout : stderr);
        });
    });
};
const screenCapture = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield execShellCommand('screencapture -isc');
});
const recognizeText = (langId, imageFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    return yield execShellCommand(`/opt/homebrew/bin/tesseract -l ${langId} ${imageFilePath} -`);
});
const ocrImageToClipboard = (langCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield screenCapture();
    }
    catch (err) {
        console.error(`\nScreen capture error: ${err}\n`);
    }
    try {
        yield fs.writeFile(path.join(app.getPath('temp'), 'temp.png'), clipboard.readImage().toPNG(), (err) => {
            if (err)
                throw err;
        });
    }
    catch (err) {
        console.error(`\nFile writing errors:\n${err}\n`);
    }
    try {
        const ocrResult = yield recognizeText(langCode, path.join(app.getPath('temp'), 'temp.png'));
        yield clipboard.writeText(ocrResult);
        yield console.log(ocrResult);
    }
    catch (err) {
        console.error(`\nTesseract recognition error: ${err}\n`);
    }
});
const createLangMenu = () => {
    return new Promise((resolve, reject) => {
        let langMenu = [];
        csv()
            .fromFile(path.join(app.getAppPath(), 'dist/tesseract-ocr.csv'))
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
app.dock.hide();
//# sourceMappingURL=main.js.map