const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');

const {
	app,
	Tray,
	Menu,
	MenuItem,
	clipboard,
	globalShortcut
} = require('electron');
const { exec } = require('child_process');

interface langMenuItem {
	type: string;
	label: string;
	checked: boolean;
	click: () => {};
}

const GLOBAL_SHORTCUT: string = 'CommandOrControl+Option+Shift+C';
let langCode: string = 'jpn';

app.whenReady().then(async () => {
	const tray = new Tray(
		path.join(app.getAppPath(), 'assets/camera.metering.matrix@3x.png')
	);
	tray.setIgnoreDoubleClickEvents(true);

	createLangMenu().then((langMenu) => {
		// console.log(langMenu);
		tray.setContextMenu(
			Menu.buildFromTemplate([
				{
					id: 'screenshot',
					icon: path.join(
						app.getAppPath(),
						'assets/plus.viewfinder@3x.png'
					),
					label: ' Screenshot -> Clipboard',
					type: 'normal',
					accelerator: GLOBAL_SHORTCUT,
					click: (menuItem: any, win: any, event: any) => {
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
			])
		);
	});

	globalShortcut.register(GLOBAL_SHORTCUT, () => {
		ocrImageToClipboard(langCode);
	});
});

app.on('will-quit', () => {
	globalShortcut.unregisterAll();
});

const setLang = (checkedLangCode: string) => {
	langCode = checkedLangCode;
};

const execShellCommand = (cmd: string) => {
	return new Promise((resolve, reject) => {
		exec(cmd, (error: string, stdout: string, stderr: string) => {
			if (error) {
				console.error(error);
				reject(error);
			}
			// console.log(stderr);
			resolve(stdout ? stdout : stderr);
		});
	});
};

const screenCapture = async () => {
	return await execShellCommand('screencapture -isc');
};

const recognizeText = async (langId: string, imageFilePath: string) => {
	return await execShellCommand(
		`/opt/homebrew/bin/tesseract -l ${langId} ${imageFilePath} -`
	);
};

const ocrImageToClipboard = async (langCode: string) => {
	try {
		await screenCapture();
	} catch (err) {
		console.error(`\nScreen capture error: ${err}\n`);
	}

	try {
		await fs.writeFile(
			path.join(app.getPath('temp'), 'temp.png'),
			clipboard.readImage().toPNG(),
			(err: string) => {
				if (err) throw err;
			}
		);
	} catch (err) {
		console.error(`\nFile writing errors:\n${err}\n`);
	}

	try {
		const ocrResult = await recognizeText(
			langCode,
			path.join(app.getPath('temp'), 'temp.png')
		);
		await clipboard.writeText(ocrResult);
		await console.log(ocrResult);
	} catch (err) {
		console.error(`\nTesseract recognition error: ${err}\n`);
	}
};

const createLangMenu = () => {
	return new Promise((resolve, reject) => {
		let langMenu: langMenuItem[] = [];

		csv()
			.fromFile(path.join(app.getAppPath(), 'dist/tesseract-ocr.csv'))
			.then((jsonArray: any[]) => {
				jsonArray.forEach((lang) => {
					// console.log(`${lang.langCode}: ${lang.language}`);
					if (lang.langCode === 'jpn')
						langMenu.push(
							new MenuItem({
								type: 'radio',
								label: `${lang.language}`,
								checked: true
							})
						);
					else
						langMenu.push(
							new MenuItem({
								type: 'radio',
								label: `${lang.language}`,
								checked: false,
								click: () => {
									setLang(lang.langCode);
								}
							})
						);
				});
				resolve(langMenu);
			})
			.catch((error: string) => {
				if (error) {
					reject(error);
					return;
				}
			});
	});
};

app.dock.hide();
