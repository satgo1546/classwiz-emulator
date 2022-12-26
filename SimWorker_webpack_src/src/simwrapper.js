import * as IM_CY from "./ESHardInfomationCY.js";								// import old ClassWiz emulator constants
import * as IM_EY from "./ESHardInfomationEY.js";								// import new ClassWiz emulator constants

import * as REG from "./RegisterSymbol.js";

var _verbose = false;

if (_verbose) {
	console.log("SimWrapper: Import simlib.js");	
}

if (CLASSPAD) {
	importScripts("/classpad/js/sim/simlib.js");								// start loading the WebAssembly simulator library	
} else {
	importScripts("simlib.js");													// start loading the WebAssembly simulator library
}

const MODEL_TYPE_CLASSWIZ_OLD = "CY";											// old ClassWiz models
const MODEL_TYPE_CLASSWIZ_NEW = "EY";											// new ClassWiz models

const IM_QRADDRESS_BUFF = 4096;

// key codes (Note: may need to import these based on model)
// On
const IM_KIKO_ON_KI = 0x00;
const IM_KIKO_ON_KO = 0x00;
// AC
const IM_KIKO_AC_KI = 0x04;
const IM_KIKO_AC_KO = 0x10;
// OPTN
const IM_KIKO_OPTN_KI = 0x40;
const IM_KIKO_OPTN_KO = 0x01;

// interrupt table
const _intr_tbl = [
//  [vector_adrs, ie_adrs, ie_bit, irq_adrs, irq_bit, intname]
	[ 0x0008, 0x0000, 0, 0xf014, 0, "WDTINT" 	],
	[ 0x000a, 0xf010, 1, 0xf014, 1, "XI0INT"	],
 	[ 0x000c, 0xf010, 2, 0xf014, 2, "XI1INT"	],
	[ 0x000e, 0xf010, 3, 0xf014, 3, "XI2INT"	],
	[ 0x0010, 0xf010, 4, 0xf014, 4, "XI3INT"	],
	[ 0x0012, 0xf010, 5, 0xf014, 5, "TM0INT"	],
	[ 0x0014, 0xf010, 6, 0xf014, 6, "L256SINT"	],
	[ 0x0016, 0xf010, 7, 0xf014, 7, "L1024SINT" ],
	[ 0x0018, 0xf011, 0, 0xf015, 0, "L4096SINT" ],
	[ 0x001a, 0xf011, 1, 0xf015, 1, "L16384SINT"],
	[ 0x001c, 0xf011, 2, 0xf015, 2, "SIO0INT"	],
	[ 0x001e, 0xf011, 3, 0xf015, 3, "I2C0INT"	],
	[ 0x0020, 0xf011, 4, 0xf015, 4, "I2C1INT"   ],
	[ 0x0022, 0xf011, 5, 0xf015, 5, "BENDINT"   ],
	[ 0x0024, 0xf011, 6, 0xf015, 6, "BLOWINT"   ],
	[ 0x0026, 0xf011, 7, 0xf015, 7, "RTCINT"	],
	[ 0x0028, 0xf012, 0, 0xf016, 0, "AL0INT"	],
	[ 0x002a, 0xf012, 1, 0xf016, 1, "AL1INT"	]
];

const _kikoTable = {
	"11": [0x01,0x01], "12": [0x01,0x02], "13": [0x01,0x04], "14": [0x01,0x08], "15": [0x01,0x10], "16": [0x01,0x20], "17": [0x01,0x40], "18": [0x01,0x80],
	"21": [0x02,0x01], "22": [0x02,0x02], "23": [0x02,0x04], "24": [0x02,0x08], "25": [0x02,0x10], "26": [0x02,0x20], "27": [0x02,0x40], "28": [0x02,0x80],
	"31": [0x04,0x01], "32": [0x04,0x02], "33": [0x04,0x04], "34": [0x04,0x08], "35": [0x04,0x10], "36": [0x04,0x20], "37": [0x04,0x40], "38": [0x04,0x80],
	"41": [0x08,0x01], "42": [0x08,0x02], "43": [0x08,0x04], "44": [0x08,0x08], "45": [0x08,0x10], "46": [0x08,0x20], "47": [0x08,0x40], "48": [0x08,0x80],
	"51": [0x10,0x01], "52": [0x10,0x02], "53": [0x10,0x04], "54": [0x10,0x08], "55": [0x10,0x10], "56": [0x10,0x20], "57": [0x10,0x40], "58": [0x10,0x80],
	"61": [0x20,0x01], "62": [0x20,0x02], "63": [0x20,0x04], "64": [0x20,0x08], "65": [0x20,0x10], "66": [0x20,0x20], "67": [0x20,0x40], "68": [0x20,0x80],
	"71": [0x40,0x01], "72": [0x40,0x02], "73": [0x40,0x04], "74": [0x40,0x08], "75": [0x40,0x10], "76": [0x40,0x20], "77": [0x40,0x40], "78": [0x40,0x80],
	"81": [0x80,0x01], "82": [0x80,0x02], "83": [0x80,0x04], "84": [0x80,0x08], "85": [0x80,0x10], "86": [0x80,0x20], "87": [0x80,0x40], "88": [0x80,0x80]
};

const _sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

var _api = null;																// init the simulator API
var IM;																			// init the emulator constants

Module.onRuntimeInitialized = async _ => {
	if (_verbose) console.log("SimWrapper: Module.onRuntimeInitialized");
	_api = {																	// fill in the API
		Version: Module.cwrap('Version', 'string', []),

		SetCodeMemorySize: Module.cwrap('SetCodeMemorySize', 'number', ['number', 'number']),
		SetDataMemorySize: Module.cwrap('SetDataMemorySize', 'number', ['number', 'number']),
		SetRomWindowSize: Module.cwrap('SetRomWindowSize', 'number', ['number', 'number']),
		SetCodeMemoryDefaultCode: Module.cwrap('SetCodeMemoryDefaultCode', 'number', ['number']),
		SetMemoryModel: Module.cwrap('SetMemoryModel', 'number', ['number']),
		
		SetInterruptTableEntry: Module.cwrap('SetInterruptTableEntry', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'string']),
		SetPeriBCD: Module.cwrap('SetPeriBCD', 'number', ['number']),

		LoadHexFile: Module.cwrap('LoadHexFile', 'number', ['string', 'number', 'number']),

		GetCount: Module.cwrap('GetCount', 'number', []),
		GetSimRun: Module.cwrap('GetSimRun', 'number', []),
		Execute: Module.cwrap('Execute', 'number', []),
		ExecuteMultiple: Module.cwrap('ExecuteMultiple', 'number', ['number']),
		ExecuteWhileRun: Module.cwrap('ExecuteWhileRun', 'number', []),
		CheckInterrupt: Module.cwrap('CheckInterrupt', 'number', []),
		SimReset: Module.cwrap('SimReset', 'number', []),

		ReadCodeMemory: Module.cwrap('ReadCodeMemory', 'number', ['number', 'number', 'number']),
		WriteCodeMemory: Module.cwrap('WriteCodeMemory', 'number', ['number', 'number', 'number']),
		ReadDataMemory: Module.cwrap('ReadDataMemory', 'number', ['number', 'number', 'number']),
		WriteDataMemory: Module.cwrap('WriteDataMemory', 'number', ['number', 'number', 'number']),
		WriteBitDataMemory: Module.cwrap('WriteBitDataMemory', 'number', ['number', 'number', 'number']),

		ReadReg: Module.cwrap('ReadReg', 'number', ['number', 'number']),
		WriteReg: Module.cwrap('WriteReg', 'number', ['number', 'number']),

		LogStart: Module.cwrap('LogStart', 'number', []),
		LogStart2: Module.cwrap('LogStart2', 'number', ['string']),
		LogStop: Module.cwrap('LogStop', 'number', []),
		LogState: Module.cwrap('LogState', 'number', []),

		LoadRAM: Module.cwrap('LoadRAM', 'number', ['string', 'string']),
		SaveRAM: Module.cwrap('SaveRAM', 'string', ['string']),
	};
}

export default class SimWrapper {
	constructor() {
		if (_verbose) console.log('SimWrapper: constructor');
		this._vram = undefined;
		this._lowerBuf = undefined;
		this._upperBuf = undefined;
		this._qr = "";															// init QR code
		this._qrVersion = 0;
		this._simRunning = false;												// init simulator state
		this._cpuCounter = 0;
		this._cpuTime = Date.now();
		this._cpsTotal = 0;
		this._cpsCount = 0;
        this._kikoQueue = [];
		this._acBreak = false;
		this._logKeyToKiKo = {};
		this._keyLogMap = undefined;
		this._keyLogBuffer = [];
		this._keyLogEnabled = false;
		this._simulatorRunning = false;
		this._modelType = "";
	}
	
	// Init(rom: string, token: string) : number
	async Init(rom, token) {
		var result = 1;
		if (_verbose) console.log(`SimWrapper: Init(${rom})`);

		this._modelType = rom.substring(0, 2);                                  // get model type - CY (old ClassWiz) or EY (new ClassWiz)
		IM = this._modelType === MODEL_TYPE_CLASSWIZ_NEW ? IM_EY : IM_CY;		// get emulator constants

		if (this._modelType === MODEL_TYPE_CLASSWIZ_OLD) {						// old ClassWiz
			this._vram = new Uint8Array(IM.ES_DDLEN).fill(0);					// create VRAM buffer
		} else {																// new ClassWiz
			this._vram = new Uint8Array(IM.VRAM_BUF_SIZE).fill(0);				// create combined VRAM buffer
			this._lowerBuf = new Uint8Array(IM.ES_DDLEN).fill(0);				// create lower VRAM buffer
			this._upperBuf = new Uint8Array(IM.ES_DDLEN).fill(0);				// create upper VRAM buffer
		}

		var url;
		var romurl;
		var apiurl;
		var fetchOptions = {};
		if (CLASSPAD) {
			url = `/classpad/files/classwiz/${rom}/`;
			romurl = url + "core.dat";
		} else {
            url = `res/${rom}/`;
			apiurl = API_URL;
			romurl = `${apiurl}/get_rom?rom=${rom}&token=${token}`;
			fetchOptions = {headers: {'x-api-key': API_KEY}};
		}

		if (_verbose) console.log("SimWrapper: fetch ROM")
		var response = await fetch(romurl, fetchOptions);						// load the encrypted ROM (Intel hex format)
		if (_verbose) console.log(`SimWrapper: response.status = ${response.status}`);
		if (response.status == 200) {											// ROM .loaded
			if (_verbose) console.log("SimWrapper: get ROM data")
			let romBuffer = await response.arrayBuffer();                    	// get the ROM data
			let romData = new Uint8Array(romBuffer);							// view as Uint8Array

			if (TEST) {															// test build uses data from log.keys to map [...] to a key code
				const logResponse = await fetch(url + "log.keys");				// get log keys for this model calculator
				if (logResponse.ok) {
					const logText = await logResponse.text();					// get the file text
					const logArray = logText.split("\r\n");						// split into lines
					for (let line of logArray) {								// for log key
						if (line.length > 0) {
							let kikoNumber = line.substr(0, 2);					// get KiKo number
							let logKey = line.substr(3);						// get log key ([xxxxx])
							if (_kikoTable[kikoNumber] !== undefined) {			// found entry in the table
								this._logKeyToKiKo[logKey] = _kikoTable[kikoNumber];// set mapping
								if (_verbose) console.log(`KiKo found for ${logKey}: ${JSON.stringify(this._logKeyToKiKo[logKey])}`);
							} else {
								if (_verbose) console.log(`KiKo not found for ${logKey} (${kikoNumber})`);
							}
						}
					}
				}
			} else { 															// all other builds use keylog.json
				const keyLogResponse = await fetch(url + "keylog.json");		// get key log data for this model calculator
				if (keyLogResponse.ok) {
					this._keyLogMap = await keyLogResponse.json();				// get as JSON
					for (let key in this._keyLogMap) {							// for each entry
						let keyStr = this._keyLogMap[key][2];					// get the [...] string for this ki:ko pair
						let kiko = key.split(',');								// extract ki and ko
						let ki = parseInt(kiko[0]);
						let ko = parseInt(kiko[1]);
						this._logKeyToKiKo[keyStr] = [ki, ko];					// set mapping
					}
				}
			}

			// console.log(this._logKeyToKiKo);

			while(!_api)														// wait until the API is available
				await _sleep(100);

			this._SetMemoryModel(1);											// ƒ�?ƒ‚ƒ�?ƒ‚ƒfƒ‹‚ðÝ’è(0:Small(ML610905) / 1:Large(ML610904)) - Memory model set

			switch (this._modelType) {
				case MODEL_TYPE_CLASSWIZ_OLD:
					// ŽÀÛ‚ÌƒR[ƒhƒ�?ƒ‚ƒ�?‚Í[0x000000~3ffff] - Actual code memory
					this._SetCodeMemorySize(0x000000,0x03ffff);					// ƒR[ƒhƒ�?ƒ‚ƒ�?ƒTƒCƒY‚ÌÝ’è	610904 - Code Memory Size Settings 610904
					this._SetDataMemorySize(0x00d000,0x08ffff);
					this._SetRomWindowSize(0x000000,0x00cfff);					// ‚q‚n‚lƒEƒBƒ“ƒhƒEƒTƒCƒY‚ÌÝ’è - ROM window size setting
					this._SetPeriBCD(0);										// disable BCD support
					break;
				case MODEL_TYPE_CLASSWIZ_NEW:
					this._SetCodeMemorySize(0x000000,0x07ffff);
					this._SetDataMemorySize(0x009000,0x18ffff);
					this._SetRomWindowSize( 0x000000,0x008fff);
					this._SetPeriBCD(1);										// enable BCD support
					break;
				default:
					if (_verbose) console.log(`SimWrapper: unknown model ${rom}`);
					break;
			}	

			this._SetCodeMemoryDefaultCode(0x0000);								// ƒR[ƒhƒ�?ƒ‚ƒ�?‚ÌƒfƒtƒHƒ‹ƒgƒR[ƒh‚ÌÝ’è - Code Memory Default Code Settings

			if (_verbose) console.log("SimWrapper: set interrupts");
			var index = 0;
			for (var intr of _intr_tbl) {
				result = await _api.SetInterruptTableEntry(index, intr[0], intr[1], intr[2], intr[3], intr[4], intr[5]);
				if (_verbose) console.log(`SimWrapper: SetInterruptTableEntry(${index}, 0x${intr[0].toString(16)}, 0x${intr[1].toString(16)}, ${intr[2]}, 0x${intr[3].toString(16)}, ${intr[4]}, ${intr[5]}) => ${result}`);
				++index;
			}

			// ƒVƒ~ƒ…ƒŒ[ƒ^?��?g’£—Ì�?æ‚ðƒ[ƒƒNƒ�?ƒA - Clear the simulator extension area zero
			let pZero = new Uint8Array(IM.ES_U8DUMMYSIZE+4).fill(0);
			this._WriteDataMemory(IM.ES_STOPTYPEADR-1, IM.ES_U8DUMMYSIZE, pZero);

			if (_verbose) console.log("SimWrapper: load ROM data");
            this._LoadHexFile(rom, romData);
            if (_verbose) console.log("SimWrapper: ROM data loaded");

			if (_verbose) {
				let sppc = new Uint8Array(4);
				this._ReadCodeMemory(0, 4, sppc);
				console.log(`SimWrapper: SP-PC ${sppc}`);
			}

			let pad = new Uint8Array(1).fill(0);
			this._WriteDataMemory(IM.REGISTER_MODER, 1, pad);					// Padî•ñ‚Ì‘‚«ž‚�? - Write PAD information

			this.Reset();														// reset the simulator
			this._InitRegisters();												// init simulator registers

			this._simulatorRunning = false;
			this._SimStart();													// start the simulator

			result = 0;															// success
		}

		return result;
	}

	// Version() : string
	Version() {
		var version = "unknown";
		if (_api)
			version = _api.Version();
		return version;
	}

	// RomVersion() : string
	RomVersion() {
		var version = "unknown";

		if (_api) {
			var name = new Uint8Array(IM.ES_NAME_LEN);
			this._ReadCodeMemory(IM.ES_NAME_ADR, IM.ES_NAME_LEN, Comlink.proxy(name));

			var ver = new Uint8Array(IM.ES_VERSION_LEN);
			this._ReadCodeMemory(IM.ES_VERSION_ADR, IM.ES_VERSION_LEN, Comlink.proxy(ver));

			var sum = new Uint8Array(IM.ES_SUM_LEN);
			this._ReadCodeMemory(IM.ES_SUM_ADR, IM.ES_SUM_LEN, Comlink.proxy(sum));

			var decoder = new TextDecoder();
			var nameStr = decoder.decode(name);
			var verStr = decoder.decode(ver);
			var sumStr = sum[0].toString(16) + sum[1].toString(16);

			version = `${nameStr} ${verStr} (${sumStr})`;
		}
		
		return version;
	}

	// Reset() : void
	Reset() {
		if (_verbose) console.log("SimWrapper: Reset");
		if (_api) {
			let uckiucko = new Uint8Array(1).fill(0);
			this._WriteDataMemory(IM.ES_KIADR, 1, uckiucko);					// clear keycode
			this._WriteDataMemory(IM.ES_KOADR, 1, uckiucko);

			this._vram.fill(0);													// clear VRAM buffer

			if (this._modelType === MODEL_TYPE_CLASSWIZ_OLD) {
				this._WriteDataMemory(IM.ES_DDSYMBOLADR, IM.ES_DDLEN, this._vram);	// clear VRAM in the simulator
			} else {
				this._lowerBuf.fill(0);											// clear buffers
				this._upperBuf.fill(0);
				this._WriteDataMemory(IM.ES_DD_LOWER_ADR, IM.ES_DDLEN, this._lowerBuf);	// clear VRAM in the simulator
				this._WriteDataMemory(IM.ES_DD_UPPER_ADR, IM.ES_DDLEN, this._upperBuf);
			}

			_api.SimReset();													// reset simulator
			this._QRClear();													// reset QR code
			this._cpuCounter = 0;
			this._cpuTime = Date.now();
			this._cpsTotal = 0;
			this._cpsCount = 0;
			}
	}

	// SimulatorIsRunning() : boolean
	SimulatorIsRunning() {
		if (_verbose) console.log(`SimWrapper: SimulatorIsRunning = ${this._simulatorRunning}`);
		return this._simulatorRunning;
	}

	// Stop() : void
	Stop() {
		if (_verbose) console.log("SimWrapper: Stop");
		this._SimStop();
	}

	// QR_Reset() : void
	QR_Reset() {
		this.SetKey(IM_KIKO_AC_KI, IM_KIKO_AC_KO);
	}

	// GetVRAM()) : number
	GetVRAM() {
		let result = 1;

		if (this._modelType === MODEL_TYPE_CLASSWIZ_OLD) {
			result = this._ReadDataMemory(IM.ES_DDSYMBOLADR, IM.ES_DDLEN, this._vram);	// copy VRAM from simulator
		} else {
			result = this._ReadDataMemory(IM.ES_DD_LOWER_ADR, IM.ES_DDLEN, this._lowerBuf);	// copy lower VRAM from simulator
			if (result == 0) {
				result = this._ReadDataMemory(IM.ES_DD_UPPER_ADR, IM.ES_DDLEN, this._upperBuf);	// copy upper VRAM from simulator
				if (result == 0) {
					this._vram.fill(0);											// clear VRAM buffer

					const height = IM.VRAMSIZE_HEIGHT + 1;
					const width_dd = IM.VRAMSIZE_WIDTH / 8;
					const skip_vram = IM.VRAMSIZE_WIDTHDUMMY - IM.VRAMSIZE_WIDTH;
					const skip_dd = (IM.VRAMSIZE_WIDTHDUMMY - IM.VRAMSIZE_WIDTH) / 8;

					let bufIndex = 0;
					let vramIndex = 0;
					for (let y = 0; y < height; ++y) {							// for each row
						for (let x = 0; x < width_dd; ++x) {					// for each column
							let lower = this._lowerBuf[bufIndex];				// get lower byte
							let upper = this._upperBuf[bufIndex++];				// get upper byte
							let mask = 0x80;									// init bit mask
							for (let b = 0; b < 8; ++b) {						// for each bit
								if (lower & mask) {								// lower bit is set
									this._vram[vramIndex] |= 0x1;				// set in VRAM
								}
								if (upper & mask) {								// upper bit is set
									this._vram[vramIndex] |= 0x2;				// set in VRAM
								}
								vramIndex++;									// advance VRAM index
								mask >>= 1;										// shift bit mask
							}
						}
						// skip
						bufIndex += skip_dd;									// skip to next line
						vramIndex += skip_vram;
					}				
				}
			}
		}
		return result;
	}

	// ReadVRAM(vram: Comlink.proxy(Uint8Array)) : number
	ReadVRAM(vram) {
		vram.set(this._vram);
		return 0;
	}
	
	// VRAM size values
	VRAMLength() {
		return this._modelType === MODEL_TYPE_CLASSWIZ_OLD ? IM.ES_DDLEN : IM.VRAM_BUF_SIZE;
	}

	VRAMLineLength() {
		return IM.VRAMSIZE_LINE;
	}

	VRAMDotStartOffset() {
		return IM.VRAM_DOTSTART_OFFSET;
	}

	VRAMWidth() {
		return IM.VRAMSIZE_WIDTH;
	}

	VRAMHeight() {
		return IM.VRAMSIZE_HEIGHT;
	}

	VRAMWidthTotal() {
		return IM.VRAMSIZE_WIDTHDUMMY;
	}

    // OnKey() : void
    OnKey() {
        this._OnKey();
    }
		
	// SetKey(ki: number, ko: number) : number
	SetKey(ki, ko) {
		if (_verbose) console.log(`Key push [${ki}, ${ko}]`);
        this._kikoQueue.push([ki, ko, Date.now()]);                             // add key pair to queue
		this._KeyLogPush(ki, ko);												// add to key log if enabled
		return 0;
	}

	// SetLogKey(key: string, kikoOut: Comlink.proxy(Uint8Array)) : number
	SetLogKey(key, kikoOut) {
		let result = 1;
		let kiko = this._logKeyToKiKo[key];										// get key pair for the log key
		if (kiko === undefined) {												// didn't find a key pair
			if (key === '[ON]')													// check for special keys
				kiko = [IM_KIKO_ON_KI, IM_KIKO_ON_KO];
		}

		if (kiko !== undefined) {												// got the key pair
			result = this.SetKey(kiko[0], kiko[1]);								// add key pair to queue
			kikoOut[0] = kiko[0];												// return key pair to caller
			kikoOut[1] = kiko[1];
		} else {
			if (key.length > 0) {
				console.error(`${key} not found`);
			}
		}

		return result;
	}

	// GetKeyQueueLength() : number
	GetKeyQueueLength() {
		return this._kikoQueue.length;
	}

	// GetDisplaySVG() : string
	GetDisplaySVG() {
		let svg = `<svg viewBox="0 0 ${IM.VRAMSIZE_WIDTH} ${IM.VRAMSIZE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

		let result = this.GetVRAM();											// copy VRAM from simulator
		if (result == 0) {
			if (this._modelType === MODEL_TYPE_CLASSWIZ_OLD) {					// old ClassWiz - _vram has 8 pixels per byte
				for (let row = 0; row < IM.VRAMSIZE_HEIGHT; ++row) {			// for each row of the display
					let rowOffset = IM.VRAM_DOTSTART_OFFSET + (row * IM.VRAMSIZE_LINE);	// offset to start of row in VRAM

					for (let col = 0; col < IM.VRAMSIZE_WIDTH / 8; ++col) {		// for each 8 pixel column of the display
						let colValue = this._vram[rowOffset + col];				// get the column pixels
						let colX = col * 8;										// x coord of first column pixel
						for (let pixel = 0; pixel < 8; ++pixel) {				// for each pixel in the column
							if (colValue & (1 << (7 - pixel))) {				// test pixel bit
								let x = colX + pixel;
								let y = row;
								svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`;	// add a <rect> for each ON pixel
							}
						}
					}
				}
			} else {															// new ClassWiz - _vram has 1 pixel per byte
				for (let row = 0; row < IM.VRAMSIZE_HEIGHT; ++row) {			// for each row of the display
					let rowOffset = IM.VRAM_DOTSTART_OFFSET + (row * IM.VRAMSIZE_LINE);	// offset to start of row in VRAM

					for (let col = 0; col < IM.VRAMSIZE_WIDTH; ++col) {			// for each column of the display
						let colValue = this._vram[rowOffset + col];				// get the column 2 bit color value
						const colors = [ undefined, "#AAAAAA", "#555555", "#000000"];
						let fillColor = colors[colValue];						// get the fill color
						if (fillColor) {										// pixel is ON
							svg += `<rect x="${col}" y="${row}" width="1" height="1" fill="${fillColor}"/>`;	// add a <rect> for each ON pixel
						}
					}
				}
			}
		}	

		svg += '</svg>';

		return svg;
	}

	// GetScreenSVG(width: number, height: number, data: Uint8Array) : string
	GetScreenSVG(width, height, data) {
		let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${IM.VRAMSIZE_WIDTH} ${IM.VRAMSIZE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

		for (let row = 0; row < IM.VRAMSIZE_HEIGHT; ++row) {				// for each row of the display
			let rowOffset = row * (IM.VRAMSIZE_WIDTH / 8);					// offset to start of row in data
			for (let col = 0; col < IM.VRAMSIZE_WIDTH / 8; ++col) {			// for each 8 pixel column of the display
				let colValue = data[rowOffset + col];						// get the column pixels
				let colX = col * 8;											// x coord of first column pixel
				for (let pixel = 0; pixel < 8; ++pixel) {					// for each pixel in the column
					if (colValue & (1 << (7 - pixel))) {					// test pixel bit
						let x = colX + pixel;
						let y = row;
						svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`;	// add a <rect> for each ON pixel
					}
				}
			}
		}	

		svg += '</svg>';

		return svg;
	}

	// GetScreenBMP(width: number, height: number, data: Uint8Array, number: bkgColor) : string
	GetScreenBMP(width, height, data, bkgColor) {
		let pixels = [];
		let bkgB = (bkgColor >> 16) & 0x0000ff;
		let bkgG = (bkgColor >> 8) & 0x0000ff;
		let bkgR = bkgColor & 0x0000ff;

		for (let row = IM.VRAMSIZE_HEIGHT - 1; row >= 0; --row) {			// for each row of the display (from bottom up)
			let rowOffset = row * (IM.VRAMSIZE_WIDTH / 8);					// offset to start of row in data
			for (let col = 0; col < IM.VRAMSIZE_WIDTH / 8; ++col) {			// for each 8 pixel column of the display
				let colValue = data[rowOffset + col];						// get the column pixels
				let colX = col * 8;											// x coord of first column pixel
				for (let pixel = 0; pixel < 8; ++pixel) {					// for each pixel in the column
					if (colValue & (1 << (7 - pixel))) {					// test pixel bit
						pixels.push(0x00);									// pixel ON
						pixels.push(0x00);
						pixels.push(0x00);
					} else {
						pixels.push(bkgR);									// pixel OFF
						pixels.push(bkgG);
						pixels.push(bkgB);
					}
				}
			}
		}	

		return this._genBMPUri(width, pixels);
	}

	// GetSymbolState(data: Uint8Array) : string
	GetSymbolState(data) {
		let state = "";

		if (data === undefined) {
			if (this._modelType === MODEL_TYPE_CLASSWIZ_OLD)					// old Classwiz
				data = this._vram;												// get symbol state directly from VRAM
			else																// new Classwiz
				data = this._lowerBuf;											// get symbol state from lower VRAM bank (this._vram contains comdined VRAM)
		}

		// �c�c�̈ʒu�i�h�b�g�ʒu�j - DD position (dot position)
		const VRAM_Table_CY = [
			//		S		A		M		STO		math	D		R		G		FIX
					7,		15,		23,		31,		47,		55,     63,		71,		79,
			//		SCI		E		i		��		��		��		��		��		��		DISP	��
					87,		95,		103,	111,	127,	135,	143,	151,	159,	175,	183	];
		
		// �c�c�̈ʒu�i�h�b�g�ʒu�j
		const VRAM_Table_EY = [
			//		S		STO		D		R		G		FIX
					15,		31,		39,		47,		55,		63,
			//		SCI		E		i		��		��		�Y		��		��		��		��		DISP	��
					71,		87,		95,		103,	111,	119,	135,	143,	151,	159,	175,	183 ];

		let VRAM_Table = this._modelType === MODEL_TYPE_CLASSWIZ_OLD ? VRAM_Table_CY : VRAM_Table_EY;
		
		for (let i in VRAM_Table) {
			let index = Math.floor(VRAM_Table[i] / 8);
			let shift = VRAM_Table[i] % 8;
			let VRAMbyte = data[index];
			VRAMbyte <<= shift;													// �?ã?��?Êƒrƒbƒg‚Éƒtƒ‰ƒO‚ðŽ‚Á‚�?‚­‚é - Bring a flag to the top bit

			if ((VRAMbyte & 0x80) != 0)											// symbol is on
				state += '1';
			else																// symbol is off
				state += '0';
		}								

		return state;
	}

	// GetQRCode() : string
	GetQRCode() {
		return this._qr;
	}

	// LoadRAM(model: string, ram: string) : number
	LoadRAM(model, ram) {
		let result = 1;
		if (_api)
			result = _api.LoadRAM(model, ram);
		this._simulatorRunning = false;
		return result;
	}

	// SaveRAM(model: string) : string
	SaveRAM(model) {
		let ram = '';
		if (_api)
			ram = _api.SaveRAM(model);
		return ram;
	}

	// KeyLogStart() : void
	KeyLogStart() {
		this._keyLogBuffer = [];												// clear the buffer
		this._keyLogEnabled = true;												// enable the key log
	}

	// KeyLogStop() : void
	KeyLogStop() {
		this._keyLogEnabled = false;											// disable the key log
	}

	// KeyLogBuffer() : []
	KeyLogBuffer() {
		return this._keyLogBuffer;
	}

	// ***************************
	// **** internal use only ****
	// ***************************

	_DisplayCPS(count) {
		let current = Date.now();
		let elapsed = current - this._cpuTime;
		let elapsedSeconds = elapsed / 1000;
		let cps = Math.floor(count / elapsedSeconds);
		this._cpsTotal += cps;
		++this._cpsCount;
		let cpsAvg = Math.floor(this._cpsTotal / this._cpsCount);
		this._cpuTime = current;
		console.log(`SimWrapper: Execute [${this._cpuCounter}] ${cps} cps (${cpsAvg} avg)`);
	}

	async _Execute() {
		if (_api && this._simRunning) {
			if (_verbose) console.log("SimWrapper: Execute");

			if (_verbose) console.log("SimWrapper: >>>>");
			let res = _api.ExecuteWhileRun();									// run the simulator until it stops
			if (_verbose) console.log("SimWrapper: <<<<");

			let runflag = _api.GetSimRun();										// get run state
			await this._SimStartCallback(runflag);									// process keys etc.

			let count = _api.GetCount();										// get CPU cycle count
			let deltaCount = count - this._cpuCounter;							// cycles since last time we were here
			this._cpuCounter = count;											// update cpu cycle counter

			if (_verbose) this._DisplayCPS(deltaCount);							// display CPS

			setTimeout(() => { this._Execute() }, 5);								// Rinse and repeat
		}
	}

	// SimStartCallback() : void
	//	Reference: U8Control::SimStartCallback()
	async _SimStartCallback(runflag) {
		if (_verbose) console.log(`SimWrapper: SimStartCallback(${runflag})`);

		if (runflag == 1){
			console.log('SimWrapper: STATUS_HALT');				// HALTƒ‚[ƒh‚É‚È‚Á‚½
		} else if (runflag == 2){
			// console.log('SimWrapper: STATUS_STOP');				// STOPƒ‚[ƒh‚É‚È‚Á‚½
			this._simulatorRunning = true;
			let ucData = new Uint8Array(1);
			this._ReadDataMemory(IM.ES_STOPTYPEADR, 1, ucData);
			if (ucData[0] == IM.ES_STOP_GETKEY)
				await this._KeyProcess();
			else if (ucData[0] == IM.ES_STOP_ACBREAK)
				this._AcBreakCheckProcess();
			else if (ucData[0] == IM.ES_STOP_ACBREAK2)		//<SRC_15270_ACBreakWithDD>
				this._AcBreakCheckProcess2();
			else if (ucData[0] == IM.ES_STOP_DOOFF)
				this._OffProcess();
			else if (ucData[0] == IM.ES_STOP_DDOUT)
				this._DDOutProcess();
			else if (ucData[0] == IM.ES_STOP_QRCODE_IN)		// QR Ver.11 �?JŽniURL‚�?“ü‚Á‚�?‚­‚éj
				this._QRIn(11);
			else if (ucData[0] == IM.ES_STOP_QRCODE_IN3)		// QR Ver.3  �?JŽniURL‚�?“ü‚Á‚�?‚­‚éj
				this._QRIn(3);
			else if (ucData[0] == IM.ES_STOP_QRCODE_OUT)		// QR I—¹
				this._QROut();
			else
				this._WaitProcess();
		} else if (runflag == 3){
			console.log('SimWrapper: STATUS_INSTERR');			// ‘¶Ý‚µ‚È‚¢–½—ß‚ÌŽÀs
		} else if (runflag == 4){
			console.log('SimWrapper: STATUS_PCERR');			// PC”Í�?Í�?O
		}
	}

	// InitRegisters() : void
	_InitRegisters() {
		// Initialize registers R0 to R15 with 0
		for (let i = 0; i < 16; ++i) {
			this._WriteReg(i, 0);
		}
	}

	_GetKey() {
		let kikoEntry = null;
        if (this._kikoQueue.length > 0)                                      	// buffer has keys to process
            kikoEntry = this._kikoQueue.shift();                            	// grab the first one off the queue
		return kikoEntry;
	}

	_KeyBuffClear() {
		this._kikoQueue = [];
	}

	_KeyLogPush(ki, ko) {
		// console.log('SimWrapper: _KeyLogPush');
		if (this._keyLogMap !== undefined && this._keyLogEnabled) {				// key log map is available and key log is enabled
			let key = `${ki},${ko}`;											// create key to the key log map
			let keyLogData = this._keyLogMap[key];								// get the key log data for this key
			if (keyLogData !== undefined) {										// got key log data
				this._keyLogBuffer.push(keyLogData);							// add to the key log buffer
				// console.log(`SimWrapper: _KeyLogPush ${key} => ${keyLogData}`);
			}
		}
	}

	_WaitProcess() {
		if (_verbose) console.log('SimWrapper: WaitProcess');
	
		// ƒL[‚ÌƒNƒ�?ƒAi�?ê‰žj
		let kiko = new Uint8Array([0]);
		this._WriteDataMemory(IM.ES_KIADR, 1, kiko);			// ki‚ð‘‚«ž‚�?
		this._WriteDataMemory(IM.ES_KOADR, 1, kiko);			// ko‚ð‘‚«ž‚�?	

		this._WriteBitDataMemory(0x0f014, IM.STOP_RELEASE_BIT, 1);	// �?„‚èž‚Ý�?—�?(Timer STOP‚©‚ç‚Ì•œ‹A)
	}

	async _KeyProcess() {
		if (_verbose) console.log('SimWrapper: KeyProcess');

		let kiko = new Uint8Array([0]);
		let ki = 0;
		let ko = 0;
		let CurCounter = 0;
		let bit = IM.STOP_RELEASE_BIT;

		while(CurCounter < 36) {
			let kikoEntry = this._GetKey();										// get next key from queue
			if (kikoEntry) {                                       				// got a key
				ki = kikoEntry[0];
				ko = kikoEntry[1];
				CurCounter = 0;
				bit = IM.STOP_KEYRELEASE_BIT;
	
				if (kikoEntry[0] == IM_KIKO_ON_KI && kikoEntry[1] == IM_KIKO_ON_KO)	{	// check for [ON]
					this._OnKey();
					return;
				}

				break;
			}

			await _sleep(15);
			CurCounter++;
		}

		kiko[0] = ki;
		this._WriteDataMemory(IM.ES_KIADR, 1, kiko);							// ki‚ð‘‚«ž‚�?
		kiko[0] = ko;
		this._WriteDataMemory(IM.ES_KOADR, 1, kiko);							// ko‚ð‘‚«ž‚�?		
		this._WriteBitDataMemory(0x0f014, bit, 1);								// �?„‚èž‚Ý�?—�?(Timer STOP‚©‚ç‚Ì•œ‹A)
	}

	_OffProcess() {
		if (_verbose) console.log('SimWrapper: OffProcess');
		this._WriteBitDataMemory(0x0f014, IM.STOP_RELEASE_BIT, 1);	// �?„‚èž‚Ý�?—�?(Timer STOP‚©‚ç‚Ì•œ‹A)
	}
	
	_DDOutProcess() {
		if (_verbose) console.log('SimWrapper: DDOutProcess');
		this.GetVRAM();
		this._WriteBitDataMemory(0x0f014, IM.STOP_RELEASE_BIT, 1);	// �?„‚èž‚Ý�?—�?(Timer STOP‚©‚ç‚Ì•œ‹A)
	}

	_OnKey() {
		this._KeyBuffClear();													// ƒL[ƒoƒbƒtƒ@‚ÌƒNƒ�?ƒA
		this.Reset();
	}

	_AcBreak() {
		let acBreak = false;													// init to no AC break
		let kikoEntry = this._GetKey();											// get next key
		if (kikoEntry) {														// got key
			if (kikoEntry[0] == IM_KIKO_AC_KI && kikoEntry[1] == IM_KIKO_AC_KO)	// check for AC break
				acBreak = true;
		}
		return acBreak;
	}

	_AcBreakChecking(acBreak) {
		this._acBreak = acBreak;
	}

	_AcBreakCheckProcess() {
		if (_verbose) console.log('SimWrapper: AcBreakCheckProcess');
		this._AcBreakCheckProcess_core(true);
	}

	_AcBreakCheckProcess2() {
		if (_verbose) console.log('SimWrapper: AcBreakCheckProcess2');
		this._AcBreakCheckProcess_core(false);
	}

	_AcBreakCheckProcess_core(flag) {
		let ucValue = new Uint8Array([0]);
	
		if(flag) {
			this.GetVRAM();													// copy VRAM from simulator
			this._AcBreakChecking(true);									// AcBreak’�?
		}

		if (this._AcBreak()) {
			this._AcBreakChecking(false);								// AcBreak’�?‰ð�?
			this._KeyBuffClear();										// ƒL[ƒoƒbƒtƒ@ƒNƒ�?ƒA
			ucValue[0] = 1;
		} else {
			ucValue[0] = 0;
		}
			
		this._WriteDataMemory(IM.ES_STOPTYPEADR, 1, ucValue);			// AcBreak‚ð‘‚«ž‚�?
		this._WriteBitDataMemory(0x0f014, IM.STOP_RELEASE_BIT, 1);	// �?„‚èž‚Ý�?—�?(Timer STOP‚©‚ç‚Ì•œ‹A)	
	}

	_QRIn(version) {
		if (_verbose) console.log(`SimWrapper: QRIn(${version})`);

		// •¶Žš—ñ‚Ì’·‚³‚ð“¾‚é
		let qrBuff = new Uint8Array(IM_QRADDRESS_BUFF + 1);
		let qrStr = "";

		let offset = 0;
		while (true)
		{
		 	this._ReadDataMemory(IM.ES_QR_DATATOP_ADR + offset, IM_QRADDRESS_BUFF, qrBuff);	// get the next chunk
			let len = 0;
			for (let c of qrBuff) {												// for each value in the buffer
				if (c === 0) {													// terminating 0
					break;														// done
				} else {
					qrStr += String.fromCharCode(c);							// add to the QR code string
					++len;														// increment length counter
				}
			}
		 	if (len < IM_QRADDRESS_BUFF)										// end of the QR data
		 		break;
			offset += len;
		}

		// ‚p‚q—pƒoƒbƒtƒ@‚Ì€”õ
		if (qrBuff.length > 0)													// valid QR code
		{
			this._qr = qrStr;													// save the QR code string
			this._qrVersion = version;											// save the QR version
		}
	
		this._WriteBitDataMemory(0x0f014, IM.STOP_RELEASE_BIT, 1);	// �?„‚èž‚Ý�?—�?(Timer STOP‚©‚ç‚Ì•œ‹A)

		if (_verbose) console.log(`SimWrapper: QR = ${this._qr}`);
	}

	_QROut() {
		if (_verbose) console.log('SimWrapper: QROut');
		this._QRClear();
		this._WriteBitDataMemory(0x0f014, IM.STOP_RELEASE_BIT, 1);	// �?„‚èž‚Ý�?—�?(Timer STOP‚©‚ç‚Ì•œ‹A)
	}

	// _QRClear() : void
	_QRClear() {
		this._qr = "";															// clear QR code
	}
	
	/**
	 * Generate dataURI raw BMP image
	 * 
	 * https://stackoverflow.com/questions/58163597/generate-image-in-pure-js-without-canvas
	 *
	 * @param width - image width (num of pixels)
	 * @param pixels - 1D array of RGB pixels (pixel = 3 numbers in
	 *                 range 0-255; staring from left bottom corner)
	 * @return dataURI string
	 */
	_genBMPUri(width, pixels) {
		let LE= n=> (n + 2**32).toString(16).match(/\B../g).reverse().join``;
		let wh= LE(width).slice(0,4) + LE(pixels.length/width/3).slice(0,4);
		let size= LE(26+pixels.length);
	
		let head=`424d${size}000000001a0000000C000000${wh}01001800`;
		
		return "data:image/bmp," + [
				...head.match(/../g), 
				...pixels.map(x=> x.toString(16).padStart(2,'0'))
			].map(x=>'%'+x).join``;
	}
  
	// *******************
	// **** SimU8 API ****
	// *******************

	// SetCodeMemorySize(startadrs: number, endadrs: number) : number
	_SetCodeMemorySize(startadrs, endadrs) {
		var result = 1;
		if (_api)
			result = _api.SetCodeMemorySize(startadrs, endadrs);
		return result;
	}

	// SetDataMemorySize(startadrs: number, endadrs: number) : number
	_SetDataMemorySize(startadrs, endadrs) {
		var result = 1;
		if (_api)
			result = _api.SetDataMemorySize(startadrs, endadrs);
		return result;
	}

	// SetRomWindowSize(startadrs: number, endadrs: number) : number
	_SetRomWindowSize(startadrs, endadrs) {
		var result = 1;
		if (_api)
			result = _api.SetRomWindowSize(startadrs, endadrs);
		return result;
	}

	// SetCodeMemoryDefaultCode(val: number) : number
	_SetCodeMemoryDefaultCode(val) {
		var result = 1;
		if (_api)
			result = _api.SetCodeMemoryDefaultCode(val);
		return result;
	}

	// SetMemoryModel(model: number) : number
	_SetMemoryModel(model) {
		var result = 1;
		if (_api)
			result = _api.SetMemoryModel(model);
		return result;
	}

	// SetInterruptTableEntry(index: number, vector_adrs: number, ie_adrs: number, ie_bit: number, irq_adrs: number, irq_bit: number, intname: string) : number
	_SetInterruptTableEntry(index, vector_adrs, ie_adrs, ie_bit, irq_adrs, irq_bit, intname) {
		var result = 1;
		if (_api)
			result = _api.SetInterruptTableEntry(index, vector_adrs, ie_adrs, ie_bit, irq_adrs, irq_bit, intname);
		return result;
	}

	// SetPeriBCD(enable: number) : number
	_SetPeriBCD(enable) {
		var result = 1;
		if (_api)
			result = _api.SetPeriBCD(enable);
		return result;
	}

	// LoadHexFile(model: string, romData: Uint8Array) : number
	_LoadHexFile(model, romData) {
		var result = 1;
		if (_api) {
            let romPtr = Module._malloc(romData.length * romData.BYTES_PER_ELEMENT);	// allocate shared memory
            Module.HEAPU8.set(romData, romPtr);									// load the ROM data into shared memory
			result = _api.LoadHexFile(model, romPtr, romData.length);			// load into the simulator
			Module._free(romPtr);
		}
		return result;
	}

	// SimReset() : void
	_SimReset() {
		this._SimStop();
		if (_api)
			_api.SimReset();
	}

	// SimStart() : void
	_SimStart() {
		this._simRunning = true;

		let sppc = new Uint8Array(4);
		this._ReadCodeMemory(0, 4, sppc);
		
		let sp = sppc[0] + (sppc[1] * 256);										// get initial stack pointer
		let pc = sppc[2] + (sppc[3] * 256);										// get initial program counter

		this._WriteReg(REG.SP, sp);												// set SP
		this._WriteReg(REG.PC, pc);												// set PC

		this._Execute();														// start the execution loop
	}

	// SimStop() : void
	_SimStop() {
		this._simRunning = false;
	}

	// ReadCodeMemory(adrs: number, len: number, valOut: Comlink.proxy(Uint8Array)) : number
	_ReadCodeMemory(adrs, len, valOut) {
		var result = 1;
		if (_api) {
			var valPtr = Module._malloc(len);									// allocate shared heap memory
			result = _api.ReadCodeMemory(adrs, len, valPtr);
			if (result === 0) {
				var valResult = new Uint8Array(Module.HEAPU8.subarray(valPtr, valPtr + len));	// create a new view of the result
				valOut.set(valResult);											// set it in the output array
			}

			Module._free(valPtr);												// free shared heap memory
		}
		return result;
	}

	// WriteCodeMemory(adrs: number, len: number, valIn: Uint8Array) : number
	_WriteCodeMemory(adrs, len, valIn) {
		var result = 1;
		if (_api && valIn.length >= len) {
			var valPtr = Module._malloc(len);									// allocate shared heap memory
			Module.HEAPU8.set(valIn, valPtr);									// set value in heap
			result = _api.WriteCodeMemory(adrs, len, valPtr);					// write the values to code memory
			Module._free(valPtr);												// free shared heap memory
		}
		return result;
	}

	// ReadDataMemory(adrs: number, len: number, valOut: Comlink.proxy(Uint8Array)) : number
	_ReadDataMemory(adrs, len, valOut) {
		var result = 1;
		if (_api) {
			var valPtr = Module._malloc(len);									// allocate shared heap memory
			result = _api.ReadDataMemory(adrs, len, valPtr);
			if (result === 0) {
				var valResult = new Uint8Array(Module.HEAPU8.subarray(valPtr, valPtr + len));	// create a new view of the result
				valOut.set(valResult);											// set it in the output array
			}

			Module._free(valPtr);												// free shared heap memory
		}
		return result;
	}

	// WriteDataMemory(adrs: number, len: number, valIn: Uint8Array) : number
	_WriteDataMemory(adrs, len, valIn) {
		var result = 1;
		if (_api && valIn.length >= len) {
			var valPtr = Module._malloc(len);									// allocate shared heap memory
			Module.HEAPU8.set(valIn, valPtr);									// set value in heap
			result = _api.WriteDataMemory(adrs, len, valPtr);					// write the values to code memory
			Module._free(valPtr);												// free shared heap memory
		}
		return result;
	}

	// WriteBitDataMemory(adrs: number, n: number, valIn: number) : nunber
	_WriteBitDataMemory(adrs, n, valIn) {
		var result = 1;
		if (_api) {
			result = _api.WriteBitDataMemory(adrs, n, valIn);
		}
		return result;
	}

	
	// ReadReg(regtype: number, valOut: Comlink.proxy(Uint16Array)) : number
	_ReadReg(regType, valOut) {
		var result = 1;
		if (_api) {
			var valPtr = Module._malloc(2);										// allocate shared heap memory
			result = _api.ReadReg(regType, valPtr);
			if (result === 0) {
				var val = Module.HEAPU8[valPtr] + (Module.HEAPU8[valPtr + 1] * 256);
				var valResult = new Uint16Array([val]);							// create a new view of the result
				valOut.set(valResult);											// set the output value
			}

			Module._free(valPtr);												// free shared heap memory
		}
		return result;
	}

	// WriteReg(regtype: number, valIn: number) : number
	_WriteReg(regType, valIn) {
		var result = 1;
		if (_api) {
			result = _api.WriteReg(regType, valIn);
		}
		return result;
	}

	
	// LogStart() : number
	_LogStart() {
		var result = 1;
		if (_api) {
			result = _api.LogStart();
		}
		return result;
	}

	// LogStart2(fname: string) : number
	_LogStart2() {
		var result = 1;
		if (_api) {
			result = _api.LogStart2(fname);
		}
		return result;
	}

	// LogStop() : number
	_LogStop() {
		var result = 1;
		if (_api) {
			result = _api.LogStop();
		}
		return result;
	}

	// LogState() : number
	_LogState() {
		var result = 1;
		if (_api) {
			result = _api.LogState();
		}
		return result;
	}
}
