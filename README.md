# ClipTess
Copy text from interactive screenshots using Tesseract

A simple Electron-built open-source screenshot app that runs Tesseract on a macOS specific interactive screenshot.

- **App lives only in the menu bar for easier use**
- **Every language supported by Tesseract is supported by ClipTess**
- **Language can be changed in the menu bar settings (Default is Japanese)**

## Global shortcut is: **`⌘⌥⇧C`**

## Prerequisites
- Must have [Tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html#macos) installed on the command line for each language you intend to use ClipTess for. Must be installed through Homebrew as path to command used is `/opt/homebrew/bin/tesseract`
  - How to download Tesseract through [Homebrew](https://brew.sh/):
    ```bash
    brew install tesseract
    ```
  - Afterwards, to install all languages, run:
    ```bash
    brew install tesseract-lang 
    ```
  - Not all languages are needed, but all will still be displayed in the `Change language` dropdown menu
- macOS has the `screencapture` cli tool built-in so no need for macOS users.
  - That being said, this is a macOS-only app despite being built on a cross-platform framework. I just used Electron for the ease of development. I suppose I could always add in the windows equivalent screen capture tool... adding that to my to-do list.

## Inspiration
I've spent years looking for a good, lightweight, and simple-to-use macOS version of [Capture2Text](http://capture2text.sourceforge.net/) to no avail.
Finally, after learning a good amount of the Electron framework and web development in general, I decided to quickly give the creation of this app a go.

Other apps I've found do a great job at what I need, but the only problem is that they don't use Tesseract under the hood, causing a huge deficit in language compatibility.
By using Tesseract through the command line, I've pretty much found a way to make this whole app open-source, thankfully, since I'm assuming other apps are employing their proprietary OCR software under the hood.

## Development
1. Clone repository to a local folder using whichever means you prefer. I personally prefer the Github Desktop app.
2. Make sure to have [Typescript's](https://www.typescriptlang.org/download) `tsc` cli command globally installed in order to compile `main.ts` into Javascript.
3. When you are done making changes, run `yarn make` to generate your app in the `out/` folder.

### To Do:
- [ ] Allow for a method to change the global shortcut
- [ ] Use any Tesseract path installed by user, possibly done through a submenu option or in preferences
- [ ] Add a preferences window
- [ ] Adapt `Change language` dropdown menu to user's locally installed Tesseract languages
- [ ] Make compatible on Windows using its equivalent screen capture tool
- [ ] Add option to wrap lines naturally
- [ ] Imitate other ocr clipboard mac apps as close as possible but with Tesseract used instead
