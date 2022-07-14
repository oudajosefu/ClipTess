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

app.whenReady().then(() => {
	const tray = new Tray(
		path.join(__dirname, '../assets/camera.metering.matrix@3x.png')
	);
	tray.setIgnoreDoubleClickEvents(true);

	createLangMenu().then((langMenu) => {
		// console.log(langMenu);
		tray.setContextMenu(
			Menu.buildFromTemplate([
				{
					id: 'screenshot',
					icon: path.join(
						__dirname,
						'../assets/plus.viewfinder@3x.png'
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

const screenCapture = () => {
	return new Promise((resolve, reject) => {
		exec(
			'screencapture -isc',
			(error: any, stdout: unknown, stderr: any) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(stdout);
			}
		);
	});
};

const recognizeText = (langId: string, imageFilePath: any) => {
	return new Promise((resolve, reject) => {
		exec(
			`tesseract -l ${langId} ${imageFilePath} -`,
			(error: any, stdout: unknown, stderr: any) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(stdout);
			}
		);
	});
};

const ocrImageToClipboard = (langCode: string) => {
	screenCapture()
		.then((stdout) => {
			try {
				fs.writeFile(
					path.join(__dirname, '../src/temp.png'),
					clipboard.readImage().toPNG(),
					(err: any) => {
						if (err) throw err;
					}
				);
			} catch (err) {
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
		let langMenu: langMenuItem[] = [];

		csv()
			.fromFile(path.join(__dirname, '../src/tesseract-ocr.csv'))
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
			.catch((error: any) => {
				if (error) {
					reject(error);
					return;
				}
			});
	});
};

const setLang = (checkedLangCode: string) => {
	langCode = checkedLangCode;
};

app.dock.hide();
