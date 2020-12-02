const hexradix = 16
const bytesperword = 2;
const maxbytesperrx = 256;
const BaudEnum = Object.freeze({"9600":2, "19200":3, "38400":4, "57600":4, "115200":6});
const AckEnum = Object.freeze({"ACK": 0,
                                  "BadHeader": parseInt('51', hexradix),
                                  "BadChecksum": parseInt('52', hexradix),
                                  "ZeroSize": parseInt('53', hexradix),
                                  "Oversize": parseInt('54', hexradix),
                                  "UnknownErr": parseInt('55', hexradix),
                                  "UnknownBaud": parseInt('56', hexradix),
                                  "SizeError": parseInt('57', hexradix)});

//-------------- Credit to chitchcock for this CRC code https://gist.github.com/chitchcock/5112270 ------------///
// Modified from http://automationwiki.com/index.php?title=CRC-16-CCITT
var crcTable = [0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5,
0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b,
0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c,
0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b,
0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738,
0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5,
0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969,
0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96,
0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03,
0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6,
0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb,
0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1,
0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c,
0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2,
0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447,
0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2,
0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827,
0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c,
0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0,
0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d,
0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba,
0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
0x2e93, 0x3eb2, 0x0ed1, 0x1ef0];


function crc16(s) {
    var crc = 0xFFFF;
    var j, i;

    for (i = 0; i < s.length; i++) {
      c = s[i];
      if (c > 255) {
            throw new RangeError();
        }
        j = (c ^ (crc >> 8)) & 0xFF;
        crc = crcTable[j] ^ (crc << 8);
    }

    return ((crc ^ 0) & 0xFFFF);
}
//-------------- END of code from chitchcock ------------------//

function checkHexAndLength(str, length) {
  var hexre = /[0-9A-Fa-f]{1,}/g;

  if (str.length !== length) {
    throw 'Hex byte length is not ' + length.toString() + ' hex characters.';
  }

  if (hexre.test(str) === false)
  {
    throw 'Hex byte does not contain hex characters.';
  }
}

function HexArrToIntArr(hexarray)
{
  intarray = hexarray.map(function (hexstr) {
    checkHexAndLength(hexstr, 2);
    return parseInt(hexstr, hexradix);
  });

  return intarray;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// https://italonascimento.github.io/applying-a-timeout-to-your-promises/
const promiseTimeout = function(ms, promise){
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in '+ ms + 'ms.')
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

class BaseCommand {
  constructor(cmd) {
    this.cmd = parseInt(cmd, hexradix);
    this.header = parseInt('80', hexradix);
  }

  toString() {
    return "<CMD: " + this.bslcorecommand().toString(hexradix) + ">\n";
  }

  bslcorecommand() {
    return [this.cmd];
  }

  bsldatapacket() {
    var bslcorecommand = this.bslcorecommand();
    var length = bslcorecommand.length;
    var ll = length & 255;
    var lh = length >> 8;
    var packet = [this.header, ll, lh];
    packet = packet.concat(bslcorecommand);
    // Calculate checksum
    var checksum = crc16(bslcorecommand);
    var ckl = checksum & 255;
    var ckh = (checksum >> 8) & 255;
    packet = packet.concat([ckl, ckh]);
    return packet;
  }
}

class MemoryCommand extends BaseCommand {
  constructor(cmd, addr) {
    super(cmd);
    this.addr = addr;
    this.al = addr & 255;
    this.am = (addr >> 8) & 255;
    this.ah = (addr >> 16) & 255;
  }

  toString() {
    var str = "<";

    str += "CMD: " + this.bslcorecommand().toString(hexradix) + " ";

    str += "ADDR: " + this.addr + " (0x" + this.ah.toString(hexradix).padStart(2,'0') + this.am.toString(hexradix).padStart(2,'0') + this.al.toString(hexradix).padStart(2,'0') + ")";

    str += ">\n";

    return str;
  }

  bslcorecommand() {
    return [this.cmd, this.al, this.am, this.ah]
  }
}

class RxCommand extends MemoryCommand {
 constructor(addr, data) {
   super('10', addr);

   // Check the command is not empty.
   if (data.length === 0) {
     throw 'Bad Ti-Txt format. This command has no words.';
   }

   // Check the command does not have too many bytes.
   if (data.length > maxbytesperrx) {
     throw 'Bad Ti-Txt format. This command has too many words';
   }

   this.data = data;
 }

 toString() {
    var str = "<";

    str += "CMD: " + this.cmd.toString(hexradix) + " ";

    str += "ADDR: " + this.addr + " (0x" + this.ah.toString(hexradix).padStart(2,'0') + this.am.toString(hexradix).padStart(2,'0') + this.al.toString(hexradix).padStart(2,'0') + ") ";

    str += "DATA: " + this.data.toString(hexradix);

    str += ">\n";

    return str;
  }

  bslcorecommand() {
    return super.bslcorecommand().concat(this.data);
  }
}

class VersionCmd extends BaseCommand {
  constructor() {
    super('19');
  }
}

class ChangeBaudCmd extends BaseCommand {
  constructor(baud) {
    super('52');
    this.baud = baud;
  }

  toString() {
    var str = "<";

    str += "CMD: " + this.bslcorecommand().toString(hexradix) + " ";

    str += "BAUD: " + this.baud.toString();

    str += ">\n";

    return str;
  }

  bslcorecommand() {
    return super.bslcorecommand().concat(this.baud);
  }
}

class RxPasswordCmd extends BaseCommand {
  constructor(password) {
    super('11');

    // Check the password is the correct length.
   if (password.length !== 32) {
     throw 'Password length is wrong.';
   }

   this.password = password;
  }

  toString() {
    var str = "<";

    str += "CMD: " + this.cmd.toString(hexradix) + " ";

    str += "PWD: " + this.password.toString(hexradix);

    str += ">\n";

    return str;
  }

  bslcorecommand() {
    return super.bslcorecommand().concat(this.password);
  }
}

class CRCCheckCmd extends MemoryCommand {
  constructor(startaddr, len) {
   super('16', startaddr);
   this.len = len;
   this.lenlow = len & 255;
   this.lenhigh = (len >> 8) & 255;
 }

 toString() {
    var str = "<";

    str += "CMD: " + this.cmd.toString(hexradix) + " ";

    str += "ADDR: " + this.addr.toString(hexradix) + " ";

    str += "LEN: " + this.len.toString();

    str += ">\n";

    return str;
  }

  bslcorecommand() {
    return super.bslcorecommand().concat([this.lenlow, this.lenhigh]);
  }
}

class Response {
  constructor(bytearray) {
    if (!(Object.values(AckEnum).includes(bytearray[0]))) {
      throw 'Unable to parse ack';
    }
    else {
      this.ack = bytearray[0];
    }

    var lenl = bytearray[2];
    var lenh = bytearray[3];
    this.length = (lenh << 8) + lenl;
    this.cmd = bytearray[4];
    this.data = Array.from(bytearray.slice(5, -2));
  }

  toString() {
    let str = "";

    if (this.ack === AckEnum.ACK) {
      str += "<ACK ";
    }

    try {
      str += "CMD: " + this.cmd.toString(16).toUpperCase() + " ";
    } catch(err) {

    }

    str += "DATA: " + this.data.toString(16);

    str += "> \n"

    return str;
  }
}

class TiTxtBlock {
  constructor(str) {
    str = str.replace("q", ""); // Remove q which marks the end of the file.
    var values = str.trim().split(/\s+/g);
    var addrstr = values.shift();
    this.membytes = [];

    // Extract address
    if (checkHexAndLength(addrstr, 4)) {
      throw 'Bad Ti-Txt format. Address length is not 4 hex characters.';
    }
    this.memaddr = parseInt(addrstr, hexradix);

    // Convert from an array of 2 byte hex strings to an array of integers.
    this.membytes = HexArrToIntArr(values);

    // Calculate checksum of the block
    this.checksum = crc16(this.membytes);

    // Convert the data array into a list of RX commands.
    this.rxcommands = [];

    // Split array into chunks of 256 elements at most.
    var i=0;
    while (i<this.membytes.length) {
      var rxbytecount;
      if (this.membytes.length-i > maxbytesperrx) {
        rxbytecount = maxbytesperrx;
      }
      else {
        rxbytecount = this.membytes.length-i;
      }
      var rxbytes = this.membytes.slice(i,i+rxbytecount);
      var rxcommand = new RxCommand(this.memaddr + i, rxbytes);
      i = i + rxbytecount;
      this.rxcommands.push(rxcommand);
    }
  }
}

class TiTxtModel {
  constructor(str) {
    this.blocks = [];

    var blockstrlist = str.split("@");
    blockstrlist.shift(); // Remove element 0 which is empty.

    this.blocks = blockstrlist.map(function (blockstr) {
      return new TiTxtBlock(blockstr);
    });

  }
}

class BaseSubject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    let index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.slice(index, 1);
    }
  }

  notifyAll() {
    for (let o of this.observers) {
      o.update(this);
      console.log(o.name, "has been notified");
    }
  }
}

class ConfigSubject extends BaseSubject {
  constructor() {
    super();
    this._titxt = null;
    this._writepending = false;
    this._log = "";
    this._responselist = [];
  }

  appendResponse(response) {
    this._responselist.push(response);
    this.notifyAll();
  }

  getResponses() {
    var responsestr = "";

    var i;
    for (i=0; i<this._responselist.length; i++) {
      var response = this._responselist[i];

      responsestr += response.toString() + "\n";
    }

    return responsestr;
  }

  clearResponses() {
    this._responselist = [];
    this.notifyAll();
  }

  set titxt(value) {
    this._titxt = new TiTxtModel(value);
    this.notifyAll();
  }

  get titxt() {
    return this._titxt;
  }

  set log(value) {
    this._log = value;
    this.notifyAll();
  }

  get log() {
    return this._log;
  }

  set writepending(value) {
    this._writepending = value;
    this.notifyAll();
  }

  get writepending() {
    return this._writepending;
  }
}

class Controller {
  constructor(model) {
    this.model = model;
    this.port = null;
    this.inputstream = null;
    this.outputstream = null;
    this.writer = null;
  }

  async connect(port, baudrate) {
    // Connect to a port.
    if (port === null) {
      port = await navigator.serial.requestPort();  // If no port has been provided, request a port.
    }
    this.port = port;

    // - Wait for the port to open
    await this.port.open({ baudRate:baudrate, dataBits:8, stopBits:1, parity:"even", buffersize:1024  });
    await sleep(200);

    // CODELAB: Add code setup the output stream here.
    this.outputstream = this.port.writable;

  }

  async disconnect() {
    // Close the output stream.
    if (this.outputstream) {
      await this.outputstream.getWriter().close();
      this.outputstream = null;
    }

    // Close the port.
    await this.port.close();
    this.port = null;
  }



  async readResponse() {
    var response;
    const reader = this.port.readable.getReader();

    try {
      while (true) {
        await sleep(200);
        const { done, value } = await reader.read();
        response = new Response(value);
        this.model.appendResponse(response);
        this.model.log += value + '\n';
        break;
      }
    } finally {
      reader.releaseLock();
    }

    return response;
  }

  async cmdToStream(cmd) {
    var pkt = cmd.bsldatapacket();
    await this.writeToStream(pkt);
    this.model.appendResponse(cmd);
  }

  async writeToStream(pkt) {
    const writer = this.outputstream.getWriter();
    const arraybuffer = new Uint8Array(pkt).buffer;
    await writer.write(arraybuffer);
    writer.releaseLock();
  }


  async program() {
    this.model.clearResponses();

    if (this.port === null) {
      // Special baud rate for enabling even parity https://www.ti.com/lit/ug/slau647o/slau647o.pdf
      await this.connect(this.port, 9625);
    }
    // Possibly use 9625 as well.

    // Increase speed.
    //var changebaud = new ChangeBaudCmd(BaudEnum["9601"]);
    //await this.writeToStream(changebaud.bsldatapacket());
    //await this.readResponse();

    var ycmd = "<y>";
    var yascii = ycmd.split('').map(function(itm){
      return itm.charCodeAt(0);
    });
    await this.writeToStream(yascii);
    await sleep(1000);
    //await this.readResponse();

    // Send an invalid password to trigger a mass erase.
    var badpassword = Array(32).fill(0);
    var badpasswordcmd = new RxPasswordCmd(badpassword);
    await this.cmdToStream(badpasswordcmd);
    var response = await this.readResponse();
    if (response.ack === AckEnum.ACK) {
      this.model.appendResponse("ACK received");
    }
    // There is no response to a bad password. Wait for 2 seconds whilst a mass erase occurs.
    await sleep(2000);

    // Send the valid password to unlock the bsl.
    var validpassword = Array(32).fill(255);
    var validpasswordcmd = new RxPasswordCmd(validpassword);
    await this.cmdToStream(validpasswordcmd);
    await this.readResponse();

    // Send the version command.
    var vercmd = new VersionCmd();
    await this.cmdToStream(vercmd);
    await this.readResponse();

    var i;
    for (i=0; i<this.model.titxt.blocks.length; i++)
    {
      var block = this.model.titxt.blocks[i];
      var j=0;
      var errcount=0;
      while (j<block.rxcommands.length) {
        try {
         var rxcommand = block.rxcommands[j];
         await this.cmdToStream(rxcommand);
         await this.readResponse();
         j++; 
        } catch(e) {
          errcount++;
          if (errcount > 5) {
           break; 
          }
          console.log("trying again");
        }
        
      }
    }

    await this.disconnect();

    // Special baud rate for disabling even parity https://www.ti.com/lit/ug/slau647o/slau647o.pdf
    //await this.connect(this.port, 9621);

    //await this.disconnect();


  }

  changetxt(event) {
    this.model.titxt = event.target.value;
  }
}

class View {
  constructor(controller, btnprogid, txtboxid, logboxid) {
    this.controller = controller;
    this.btnprog = document.getElementById(btnprogid);
    this.btnprog.addEventListener('click', () => {
      this.controller.program().then();
    }, false);
    
    const urlParams = new URLSearchParams(window.location.search);
    const txturl = urlParams.get('txturl');
    if (txturl !== "") {
      fetch(txturl, {mode: 'cors'})
        .then(response => response.text())
        .then((txtdata) => {
        this.controller.model.titxt = txtdata;
      });
    }

    this.txtbox = document.getElementById(txtboxid);
    this.txtbox.addEventListener('input', (event) => {
      this.controller.changetxt(event);
    }, false);
    var event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    this.txtbox.dispatchEvent(event);
    
    

    this.logbox = document.getElementById(logboxid);
    this.controller.model.subscribe(this);
  }

  update(updatedmodel) {
    this.logbox.value = updatedmodel.getResponses();
    this.txtbox.value = updatedmodel.titxt;
  }




}

var vercmd = new VersionCmd();
var changebaud = new ChangeBaudCmd(BaudEnum["115200"]);
var password = Array(32).fill(255);
var rxpassword = new RxPasswordCmd(password);
var startaddr = parseInt("4400", hexradix);
var crccheckcmd = new CRCCheckCmd(startaddr, 1024);
var addr = parseInt("10000", hexradix);
var datastrarray = ["10", "32", "54", "76"];
var data = HexArrToIntArr(datastrarray);
var rxdatacmd = new RxCommand(addr, data);


var pkt = crccheckcmd.bsldatapacket()

