import SimWrapper from "./simwrapper"
import PackageJSON from "../package.json"

var _verbose = false;
var _firefox = false;

if (_verbose) {
	console.log("SimWorker: Import comlink.js");
}

if (CLASSPAD) {
	importScripts("/classpad/packages/comlink/comlink.js");
} else {
	importScripts("comlink.js");
}

class SimWorker {
	constructor() {
		if (_verbose) console.log('SimWorker: constructor');
		this._wrapper = new SimWrapper();
	}
	
	// Init(rom: string) : number
	async Init(rom, token) {
		if (_verbose) console.log('SimWorker: Init');
		let result = await this._wrapper.Init(rom, token);
		return result;
	}

	// Close() : void
	Close() {
		if (_verbose) console.log('SimWorker: Close');
		this._wrapper = null;
		close();
		return;
	}

	// Version() : string
	Version() {
		if (_verbose) console.log('SimWorker: Version');
		return 'v' + PackageJSON.version;
	}

	// LibVersion() : string
	LibVersion() {
		if (_verbose) console.log('SimWorker: LibVersion');
		return this._wrapper.Version();
	}

	// RomVersion() : string
	RomVersion() {
		if (_verbose) console.log('SimWorker: RomVersion');
		return this._wrapper.RomVersion();
	}

	// SimulatorIsRunning() : boolean
	SimulatorIsRunning() {
		if (_verbose) console.log('SimWorker: SimulatorIsRunning');
		return this._wrapper.SimulatorIsRunning();
	}

	// QR_Reset() : void
	QR_Reset() {
		if (_verbose) console.log('SimWorker: QR_Reset');
		this._wrapper.QR_Reset();
	}

	// OnKey() : void
	OnKey() {
		if (_verbose) console.log('SimWorker: OnKey');
		this._wrapper.OnKey();
	}

	// SetKey(ki: number, ko: number) : number
	SetKey(ki, ko) {
		if (_verbose) console.log('SimWorker: SetKey');
		return this._wrapper.SetKey(ki, ko);
	}

	// SetHardwareKey(key: string, separator: string) : string
	SetHardwareKey(key, separator) {
		let kikoOut = '';
		if (_verbose) console.log('SimWorker: SetHardwareKey');
		let kiko = new Uint8Array(2);
		if (this._wrapper.SetLogKey(key, kiko) === 0)
			kikoOut = kiko.join(separator);
		return kikoOut;
	}

	// GetDisplaySVG() : string
	GetDisplaySVG() {
		if (_verbose) console.log('SimWorker: DisplaySVG');
		return this._wrapper.GetDisplaySVG();
	}

	// GetSymbolState() : string
	GetSymbolState() {
		if (_verbose) console.log('SimWorker: GetSymbolState');
		return this._wrapper.GetSymbolState();
	}

	// GetQRCode() : string
	GetQRCode() {
		if (_verbose) console.log('SimWorker: GetQRCode');
		return this._wrapper.GetQRCode();
	}

	// LoadRAM(model: string, ram: string) : number
	LoadRAM(model, ram) {
		if (_verbose) console.log('SimWorker: LoadRAM');
		if (TEST)
			return 1;
		else
			return this._wrapper.LoadRAM(model, ram);
	}

	// SaveRAM(model: string) : string
	SaveRAM(model) {
		if (_verbose) console.log('SimWorker: SaveRAM');
		if (TEST)
			return "";
		else
			return this._wrapper.SaveRAM(model);
	}

	// KeyLogStart() : void
	KeyLogStart() {
		if (_verbose) console.log('SimWorker: KeyLogStart');
		this._wrapper.KeyLogStart();
	}

	// KeyLogStop() : void
	KeyLogStop() {
		if (_verbose) console.log('SimWorker: KeyLogStop');
		this._wrapper.KeyLogStop();
	}

	// KeyLogGetHtml() : string
	KeyLogGetHtml() {
		if (_verbose) console.log('SimWorker: KeyLogGetHtml');
		let buffer = this._wrapper.KeyLogBuffer();								// get the current key log buffer

		let html = '<div class="keylog">\n';									// <div>
		for (let entry of buffer)												// for each entry in the key log buffer
			html += `<span class="${entry[0]}">${entry[1]}</span>`;				// <span class="fontname">character</span>
		html += '\n</div>\n'														// </div>
		return html;
	}

	// KeyLogGetText() : string
	KeyLogGetText() {
		if (_verbose) console.log('SimWorker: KeyLogGetText');
		let buffer = this._wrapper.KeyLogBuffer();								// get the current key log buffer

		let text = "";
		for (let entry of buffer)												// for each entry in the key log buffer
			text += `${entry[2]}\n`;											// append text version to the string

		return text;
	}

	// ***********************************
	// **** Regression test functions ****
	//************************************

	// TestReadDataMemory(adrs: number, len: number, valOut: Comlink.proxy(Uint8Array)) : number
	TestReadDataMemory(adrs, len, valOut) {
		if (TEST) {
			if (_verbose) console.log('SimWorker: TestReadDataMemory');
			let result = this._wrapper._ReadDataMemory(adrs, len, valOut);
			if (_firefox) console.log(`SimWorker: TestReadDataMemory ${len} bytes`);
			return result
		} else {
			return 1;
		}
	}

	// TestWriteDataMemory(adrs: number, len: number, valIn: Uint8Array) {
	TestWriteDataMemory(adrs, len, valIn) {
		if (TEST) {
			if (_verbose) console.log('SimWorker: TestWriteDataMemory');
			let result= this._wrapper._WriteDataMemory(adrs, len, valIn);
			if (_firefox) console.log(`SimWorker: TestWriteDataMemory ${len} bytes`);
			return result;
		} else {
			return 1;
		}
	}

	// TestGetScreenSVG(width: number, height: number, data: Uint8Array) : string
	TestGetScreenSVG(width, height, data) {
		if (TEST) {
			if (_verbose) console.log('SimWorker: TestGetScreenSVG');
			return this._wrapper.GetScreenSVG(width, height, data);
		} else {
			return '';
		}
	}

	// TestGetScreenBMP(width: number, height: number, data: Uint8Array, number: bkgColor) : string
	TestGetScreenBMP(width, height, data, bkgColor) {
		if (TEST) {
			if (_verbose) console.log('SimWorker: TestGetScreenBMP');
			return this._wrapper.GetScreenBMP(width, height, data, bkgColor);
		} else {
			return '';
		}
	}

	// TestGetSymbolState(data: Uint8Array) : string
	TestGetSymbolState(data) {
		if (TEST) {
			if (_verbose) console.log('SimWorker: TestGetSymbolState');
			return this._wrapper.GetSymbolState(data);
		} else {
			return '';
		}
	}

	// TestSetFirefox() : void
	TestSetFirefox() {
		if (TEST) {
			_firefox = true;
		}
	}

	// TestSetLogKey(key: string) : number
	TestSetLogKey(key) {
		if (TEST) {
			if (_verbose) console.log('SimWorker: TestSetLogKey');
			let kiko = new Uint8Array(2);
			return this._wrapper.SetLogKey(key, kiko);
		} else {
			return 1;
		}
	}
	
	// TestGetKeyQueueLength() : number
	TestGetKeyQueueLength() {
		if (TEST) {
			return this._wrapper.GetKeyQueueLength();
		} else {
			return -1;
		}
	}
}

Comlink.expose(SimWorker);
