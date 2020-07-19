const hexradix = 16
const bytesperword = 2;
const maxbytesperrx = 256;
const BaudEnum = Object.freeze({"9600":2, "19200":3, "38400":4, "57600":4, "115200":6});

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

class BaseCommand {
  constructor(cmd) {
    this.cmd = parseInt(cmd, 16);
    this.header = parseInt('80', 16);
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

  bslcorecommand() {
    return [this.cmd, this.al, this.am, this.ah]
  }
}

class RxCommand extends MemoryCommand {
 constructor(addr, data) {
   super('1B', addr);

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

  bslcorecommand() {
    return super.bslcorecommand().concat(this.password);
  }
}

class CRCCheckCmd extends MemoryCommand {
  constructor(startaddr, lenbytes) {
   super('16', startaddr);
   this.lenlow = lenbytes & 255;
   this.lenhigh = (lenbytes >> 8) & 255;
 }

  bslcorecommand() {
    return super.bslcorecommand().concat([this.lenlow, this.lenhigh]);
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
      i = i + rxbytecount;
      var rxcommand = new RxCommand(this.memaddr, rxbytes);
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
  }

  set writepending(value) {
    this._writepending = value;
    this.notifyAll();
  }

  get writepending() {
    return this._writepending;
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
var titxtstr = "@8000\n" +
  "02 00 E0 01 00 00 00 00 00 00 01 00 01 00 00 00 \n" +
  "02 00 02 00 00 00 03 00 02 00 05 00 02 00 03 00 \n" +
  "00 00 04 00 04 00 00 00 05 00 04 00 03 00 04 00 \n" +
  "04 00 05 00 04 00 05 00 00 00 06 00 05 00 03 00 \n" +
  "0E 00 06 00 00 00 07 00 08 00 00 00 09 00 09 00 \n" +
  "00 00 0A 00 09 00 05 00 09 00 0A 00 00 00 0B 00 \n" +
  "0A 00 03 00 0F 00 0B 00 04 00 0C 00 0B 00 05 00 \n" +
  "0B 00 0C 00 00 00 0D 00 07 00 01 00 08 00 07 00 \n" +
  "02 00 0B 00 0D 00 00 00 07 00 0D 00 05 00 0D 00 \n" +
  "00 00 00 00 01 00 01 00 00 00 06 00 02 00 00 00 \n" +
  "08 00 02 00 01 00 03 00 03 00 00 00 04 00 04 00 \n" +
  "00 00 05 00 04 00 02 00 04 00 05 00 00 00 06 00 \n" +
  "05 00 02 00 05 00 06 00 00 00 07 00 07 00 00 00 \n" +
  "02 00 07 00 02 00 07 00 08 00 00 00 08 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 B0 9C \n" +
  "00 00 D4 AF 00 00 B4 B2 00 00 3C B2 00 00 80 AC \n" +
  "00 00 A4 A7 00 00 80 B1 00 00 3C A8 00 00 8C B2 \n" +
  "00 00 24 B3 00 00 48 AD 00 00 24 B2 00 00 D4 AF \n" +
  "00 00 B4 B2 00 00 B8 A6 00 00 7C B4 00 00 5C AE \n" +
  "00 00 A0 B2 00 00 E4 B0 00 00 B8 B3 00 00 D0 B3 \n" +
  "00 00 C0 A1 00 00 C4 B3 00 00 DC B3 00 00 58 B3 \n" +
  "00 00 98 B4 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 48 54 30 34 5F 46 32 5F 43 31 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "FF FF 00 00 00 00 00 00 9E AA 00 00 E8 99 00 00 \n" +
  "96 AB 00 00 00 00 CC 02 00 00 00 80 00 00 CC 22 \n" +
  "00 00 F4 81 00 00 00 20 00 00 00 20 20 20 20 20 \n" +
  "20 20 20 20 28 28 28 28 28 20 20 20 20 20 20 20 \n" +
  "20 20 20 20 20 20 20 20 20 20 20 88 10 10 10 10 \n" +
  "10 10 10 10 10 10 10 10 10 10 10 44 44 44 44 44 \n" +
  "44 44 44 44 44 10 10 10 10 10 10 10 41 41 41 41 \n" +
  "41 41 01 01 01 01 01 01 01 01 01 01 01 01 01 01 \n" +
  "01 01 01 01 01 01 10 10 10 10 10 10 42 42 42 42 \n" +
  "42 42 02 02 02 02 02 02 02 02 02 02 02 02 02 02 \n" +
  "02 02 02 02 02 02 10 10 10 10 20 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 00 00 00 00 00 00 41 42 43 44 \n" +
  "45 46 47 48 49 4A 4B 4C 4D 4E 4F 50 51 52 53 54 \n" +
  "55 56 57 58 59 5A 61 62 63 64 65 66 67 68 69 6A \n" +
  "6B 6C 6D 6E 6F 70 71 72 73 74 75 76 77 78 79 7A \n" +
  "30 31 32 33 34 35 36 37 38 39 2D 5F 00 00 00 00 \n" +
  "00 02 00 02 20 02 20 02 40 02 40 02 60 02 60 02 \n" +
  "80 02 80 02 FF FF FF FF 20 03 00 00 00 00 00 00 \n" +
  "00 00 00 00 00 00 3C 62 6F 6F 74 3E 00 00 3C 65 \n" +
  "3E 00 00 00 00 00 00 00 00 00 00 00 2F 3F 74 3D \n" +
  "00 00 4D 44 41 77 00 00 26 71 3D 00 26 73 3D 00 \n" +
  "26 78 3D 00 26 76 3D 00 6A 14 31 80 3A 00 81 4E \n" +
  "22 00 81 4F 24 00 81 4D 26 00 81 4C 20 00 CF 0C \n" +
  "1A 4F 08 00 91 4F 0A 00 28 00 CF 0C 14 4F 0C 00 \n" +
  "15 4F 0E 00 16 4F 10 00 17 4F 12 00 18 4F 14 00 \n" +
  "19 4F 16 00 CE 0C 3E 50 5C 00 81 4E 00 00 CE 0C \n" +
  "3E 50 70 00 81 4E 02 00 CE 0C 3E 50 84 00 81 4E \n" +
  "04 00 CE 0C 3E 50 58 00 81 4E 06 00 CE 0C 3E 50 \n" +
  "6C 00 81 4E 08 00 CE 0C 3E 50 80 00 81 4E 0A 00 \n" +
  "CE 0C 3E 50 94 00 81 4E 0C 00 CE 0C 3E 50 68 00 \n" +
  "81 4E 0E 00 CE 0C 3E 50 7C 00 81 4E 10 00 CE 0C \n" +
  "3E 50 90 00 81 4E 12 00 CE 0C 3E 50 64 00 81 4E \n" +
  "14 00 CE 0C 3E 50 78 00 81 4E 16 00 CE 0C 3E 50 \n" +
  "8C 00 81 4E 18 00 CE 0C 3E 50 60 00 81 4E 1A 00 \n" +
  "CE 0C 3E 50 74 00 81 4E 1C 00 CE 0C 3E 50 88 00 \n" +
  "81 4E 1E 00 81 4A 2A 00 91 41 28 00 2C 00 81 44 \n" +
  "2E 00 81 45 30 00 81 46 32 00 81 47 34 00 81 48 \n" +
  "36 00 81 49 38 00 0C 43 B0 13 8C 8E CA 08 CF 09 \n" +
  "0A E6 0F E7 0A F4 0F F5 0A E8 0F E9 0A 5C 0F 6D \n" +
  "1A 51 2A 00 1F 61 2C 00 3A 80 88 5B 3F 70 95 28 \n" +
  "B0 13 BE 8D 1C 43 B0 13 8C 8E C8 06 C9 07 08 E4 \n" +
  "09 E5 08 FA 19 F1 28 00 08 E6 09 E7 08 5C 09 6D \n" +
  "18 51 36 00 19 61 38 00 38 80 AA 48 39 70 38 17 \n" +
  "B0 13 F2 8D 19 61 28 00 2C 43 B0 13 8C 8E C6 04 \n" +
  "C7 05 06 EA 17 E1 28 00 06 F8 07 F9 06 E4 07 E5 \n" +
  "06 5C 07 6D 16 51 32 00 17 61 34 00 36 50 DB 70 \n" +
  "37 60 20 24 CC 06 CD 07 B0 13 14 8E 3C 40 03 00 \n" +
  "B0 13 8C 8E C4 0A 15 41 28 00 04 E8 05 E9 04 F6 \n" +
  "05 F7 04 EA 15 E1 28 00 04 5C 05 6D 14 51 2E 00 \n" +
  "15 61 30 00 34 80 12 31 35 70 42 3E CC 04 CD 05 \n" +
  "B0 13 1E 8E 2C 42 1D 41 20 00 1E 41 26 00 B0 13 \n" +
  "90 8D 1F 61 28 00 3E 80 51 F0 3F 70 83 0A CC 0E \n" +
  "B0 13 08 8E 81 4D 28 00 3C 40 05 00 B0 13 70 8B \n" +
  "C8 0E C9 0F 38 50 2A C6 39 60 87 47 B0 13 F2 8D \n" +
  "09 6B 3C 40 06 00 B0 13 EE 8B 3E 80 ED B9 3F 70 \n" +
  "CF 57 B0 13 CA 8D 3C 40 07 00 B0 13 4E 8B 3E 80 \n" +
  "FF 6A 3F 70 B9 02 B0 13 D4 8D 3C 42 B0 13 92 8B \n" +
  "3A 50 D8 98 3F 60 80 69 B0 13 BE 8D 3C 40 09 00 \n" +
  "B0 13 70 8B 3E 80 51 08 3F 70 BB 74 C8 0E C9 0F \n" +
  "B0 13 28 8E CF 0B 08 5A 09 6F 3C 40 0A 00 B0 13 \n" +
  "EE 8B 3E 80 4F A4 0F 73 B0 13 CA 8D 3C 40 0B 00 \n" +
  "B0 13 4E 8B 3E 80 42 28 3F 70 A3 76 B0 13 D4 8D \n" +
  "3C 40 0C 00 B0 13 92 8B 3A 50 22 11 3F 60 90 6B \n" +
  "81 4F 28 00 B0 13 BE 8D 3C 40 0D 00 B0 13 70 8B \n" +
  "3E 80 6D 8E 3F 70 67 02 CC 0E CD 0F B0 13 CE 8E \n" +
  "08 5A 09 6B 3C 40 0E 00 B0 13 EE 8B 3E 80 72 BC \n" +
  "3F 70 86 59 B0 13 CA 8D 3C 40 0F 00 B0 13 8C 8E \n" +
  "CE 0A 1F 41 28 00 0E E8 0F E9 0E F6 0F F7 0E EA \n" +
  "1B 41 28 00 0F EB 0E 5C 0F 6D 0E 54 0F 65 C4 0E \n" +
  "C5 0F 34 50 21 08 35 60 B4 49 CC 04 CD 05 3E 40 \n" +
  "16 00 B0 13 44 8D 2E 41 B0 13 32 8F 0D 5A 0F 6B \n" +
  "3D 80 9E DA 3F 70 E1 09 B0 13 CA 8B 1F 41 02 00 \n" +
  "B0 13 FC 8E 3D 80 C0 4C 3E 70 BF 3F B0 13 C0 8B \n" +
  "1E 41 04 00 B0 13 68 8E 36 50 51 5A 37 60 5E 26 \n" +
  "B0 13 5E 8C 1F 41 06 00 B0 13 E4 8E 3D 80 56 38 \n" +
  "3E 70 49 16 B0 13 B8 8C 1E 41 08 00 B0 13 80 8E \n" +
  "3D 80 A3 EF 3F 70 D0 29 CA 0D 81 4F 28 00 B0 13 \n" +
  "B0 8B 1F 41 0A 00 B0 13 5E 8E 38 50 53 14 39 60 \n" +
  "44 02 B0 13 A6 8B 1E 41 0C 00 B0 13 12 8F 3D 80 \n" +
  "7F 19 3F 70 5E 27 B0 13 68 8C 1F 41 0E 00 B0 13 \n" +
  "E4 8E 3D 80 38 04 3E 70 2C 18 B0 13 B8 8C 1E 41 \n" +
  "10 00 B0 13 3C 8E 3A 50 E6 CD 3F 60 E1 21 B0 13 \n" +
  "B0 8B 1F 41 12 00 B0 13 FC 8E 3D 80 2A F8 3E 70 \n" +
  "C8 3C C8 0D C9 0E B0 13 A6 8B 1E 41 14 00 B0 13 \n" +
  "12 8F 3D 80 79 F2 3F 70 2A 0B B0 13 68 8C 1F 41 \n" +
  "16 00 B0 13 54 8E 34 50 ED 14 35 60 5A 45 CC 04 \n" +
  "CD 05 B0 13 0E 8D 1E 41 18 00 B0 13 80 8E 3D 80 \n" +
  "FB 16 3F 70 1C 56 B0 13 CA 8B 1F 41 1A 00 B0 13 \n" +
  "FC 8E 3D 80 08 5C 3E 70 10 03 B0 13 C0 8B 1E 41 \n" +
  "1C 00 B0 13 68 8E 36 50 D9 02 37 60 6F 67 B0 13 \n" +
  "5E 8C 1F 41 1E 00 B0 13 E4 8E 3D 80 76 B3 3E 70 \n" +
  "D5 72 C4 0D C5 0E CC 04 CD 05 3E 40 14 00 B0 13 \n" +
  "70 8D 1D 41 08 00 B0 13 72 8E 3C 80 BE C6 3E 70 \n" +
  "05 00 B0 13 2C 8D 1F 41 16 00 B0 13 FC 8E 3D 80 \n" +
  "7F 09 3E 70 8E 78 B0 13 72 8C 1E 41 04 00 B0 13 \n" +
  "4A 8E 36 50 22 61 37 60 9D 6D B0 13 86 8D 1F 41 \n" +
  "12 00 B0 13 E4 8E 3D 80 F4 C7 3E 70 1A 02 B0 13 \n" +
  "CC 8C 2D 41 B0 13 72 8E 3C 80 BC 15 3E 70 41 5B \n" +
  "81 4E 28 00 B0 13 2C 8D 1F 41 0E 00 B0 13 5E 8E \n" +
  "38 50 A9 CF 39 60 DE 4B CC 08 CD 09 B0 13 C4 8E \n" +
  "1F 41 28 00 B0 13 DE 8D 1E 41 1C 00 B0 13 D8 8E \n" +
  "3C 80 A0 B4 3D 70 44 09 B0 13 AC 8D 1F 41 0A 00 \n" +
  "B0 13 E4 8E 3D 80 90 43 3E 70 40 41 B0 13 CC 8C \n" +
  "1D 41 18 00 B0 13 72 8E CA 0C 3A 50 C6 7E 3E 60 \n" +
  "9B 28 CC 0A B0 13 2C 8D 1F 41 06 00 B0 13 FC 8E \n" +
  "3D 80 06 D8 3E 70 5E 15 B0 13 72 8C 1E 41 14 00 \n" +
  "B0 13 D8 8E 3C 80 7B CF 3D 70 10 2B B0 13 AC 8D \n" +
  "1F 41 02 00 B0 13 54 8E 34 50 05 1D 35 60 88 04 \n" +
  "CC 04 CD 05 B0 13 22 8D 1D 41 10 00 B0 13 72 8E \n" +
  "3C 80 C7 2F 3E 70 2B 26 B0 13 2C 8D 1F 41 1E 00 \n" +
  "B0 13 FC 8E 3D 80 1B 66 3E 70 24 19 B0 13 72 8C \n" +
  "1E 41 0C 00 B0 13 4A 8E 36 50 F8 7C 37 60 A2 1F \n" +
  "B0 13 86 8D 1F 41 1A 00 B0 13 E4 8E 3D 80 9B A9 \n" +
  "3E 70 53 3B C4 0D C5 0E CC 04 CD 05 3E 40 17 00 \n" +
  "B0 13 5A 8D 1E 41 06 00 B0 13 80 8E 3D 80 BC DD \n" +
  "3F 70 D6 0B B0 13 D2 8B 1F 41 1C 00 B0 13 5E 8E \n" +
  "38 50 97 FF 39 60 2A 43 B0 13 DA 8B 1F 41 12 00 \n" +
  "B0 13 F0 8E 3D 80 59 DC 3E 70 6B 54 B0 13 54 8C \n" +
  "1E 41 08 00 B0 13 08 8F 3D 80 C7 5F 3F 70 6C 03 \n" +
  "B0 13 C2 8C 1E 41 1E 00 B0 13 3C 8E 3A 50 C3 59 \n" +
  "3F 60 5B 65 B0 13 B8 8B 1F 41 14 00 B0 13 FC 8E \n" +
  "3D 80 6E 33 3E 70 F3 70 C8 0D C9 0E B0 13 DA 8B \n" +
  "1F 41 0A 00 B0 13 F0 8E 3D 80 83 0B 3E 70 10 00 \n" +
  "B0 13 54 8C 2E 41 B0 13 08 8F 3D 80 2F A2 3F 70 \n" +
  "7B 7A B0 13 C2 8C 1E 41 16 00 B0 13 3C 8E 3A 50 \n" +
  "4F 7E 3F 60 A8 6F B0 13 B8 8B 1F 41 0C 00 B0 13 \n" +
  "FC 8E 3D 80 20 19 3E 70 D3 01 B0 13 E4 8B 1F 41 \n" +
  "02 00 B0 13 F0 8E 3D 80 EC BC 3E 70 FE 5C C6 0D \n" +
  "C7 0E B0 13 4A 8C 1E 41 18 00 B0 13 08 8F C4 0D \n" +
  "C5 0F 34 50 A1 11 35 60 08 4E CC 04 CD 05 B0 13 \n" +
  "18 8D 1E 41 0E 00 B0 13 80 8E 3D 80 7E 81 3F 70 \n" +
  "AC 08 B0 13 D2 8B 1F 41 04 00 B0 13 FC 8E 3D 80 \n" +
  "CB 0D 3E 70 C5 42 B0 13 E4 8B 1F 41 1A 00 B0 13 \n" +
  "F0 8E C6 0D C7 0E 36 50 BB D2 37 60 D7 2A B0 13 \n" +
  "4A 8C 1E 41 10 00 B0 13 08 8F 3D 80 6F 2C 3F 70 \n" +
  "79 14 CC 0D CD 0F 3E 40 15 00 B0 13 A8 8E 1A 51 \n" +
  "2A 00 1F 41 2C 00 81 6F 28 00 1E 41 28 00 14 51 \n" +
  "2E 00 15 61 30 00 16 51 32 00 17 61 34 00 18 51 \n" +
  "36 00 19 61 38 00 B1 50 40 00 26 00 B1 80 40 00 \n" +
  "22 00 81 73 24 00 02 24 80 00 84 84 81 93 22 00 \n" +
  "02 24 80 00 84 84 1F 41 20 00 8F 4A 08 00 CF 0E \n" +
  "1E 41 20 00 8E 4F 0A 00 CF 0E 8F 44 0C 00 8F 45 \n" +
  "0E 00 8F 46 10 00 8F 47 12 00 8F 48 14 00 8F 49 \n" +
  "16 00 1C 41 26 00 31 50 3A 00 64 16 10 01 B0 13 \n" +
  "9A 8E CE 0A 1F 41 2C 00 0E E8 0F E9 0E F6 0F F7 \n" +
  "0E EA 1F E1 2C 00 0E 5C 0F 6D 0E 54 0F 65 10 01 \n" +
  "B0 13 9A 8E CE 06 CF 07 0E E4 0F E5 0E FA 1B 41 \n" +
  "2C 00 0F FB 0E E6 0F E7 0E 5C 0F 6D 0E 58 0F 69 \n" +
  "10 01 1D 41 24 00 1E 41 2A 00 B0 13 90 8D 1F 61 \n" +
  "2C 00 CA 0E 10 01 CC 08 CD 09 B0 13 84 8C 10 01 \n" +
  "CC 0A B0 13 0E 8C 10 01 CC 0A B0 13 2C 8C 10 01 \n" +
  "CC 0D CD 0E B0 13 84 8C 10 01 CC 0D B0 13 0E 8C \n" +
  "10 01 CC 0D B0 13 2C 8C 10 01 CC 08 CD 09 B0 13 \n" +
  "9E 8C 10 01 CC 0D CD 0E B0 13 9E 8C 10 01 B0 13 \n" +
  "9A 8E CE 04 CF 05 0E EA 1F E1 2C 00 0E F8 0F F9 \n" +
  "0E E4 0F E5 0E 5C 0F 6D 0E 56 0F 67 10 01 CD 0F \n" +
  "3E 40 05 00 B0 13 32 8E CD 04 CE 05 0D EA 1E E1 \n" +
  "30 00 0D F6 0E F7 0D E4 0E E5 10 01 CD 0F 3E 40 \n" +
  "06 00 B0 13 32 8E CD 06 CE 07 3D E3 3E E3 0D DA \n" +
  "1E D1 30 00 0D E4 0E E5 10 01 CC 06 CD 07 B0 13 \n" +
  "D6 8C 10 01 CC 0D CD 0E B0 13 D6 8C 10 01 CC 06 \n" +
  "CD 07 B0 13 F2 8C 10 01 CC 0D CD 0F B0 13 F2 8C \n" +
  "10 01 CC 0D CD 0E B0 13 C4 8E 1F 41 2C 00 B0 13 \n" +
  "DE 8D 10 01 3E 40 09 00 B0 13 FA 8D CD 0A 0D E8 \n" +
  "0F E9 0D F4 0F F5 0D EA 1F E1 30 00 10 01 3E 40 \n" +
  "0A 00 B0 13 FA 8D CD 04 CE 05 3D E3 3E E3 0D D8 \n" +
  "0E D9 0D EA 0E EF 10 01 CC 0D CD 0E B0 13 0E 8D \n" +
  "10 01 CC 0D CD 0F B0 13 18 8D 10 01 CC 0D CD 0E \n" +
  "B0 13 22 8D 10 01 3E 40 0F 00 B0 13 B6 8E CD 0A \n" +
  "1F 41 30 00 3D E3 3F E3 0D D6 0F D7 0D E8 0F E9 \n" +
  "10 01 3E 40 0E 00 B0 13 B6 8E CD 08 CE 09 0D E6 \n" +
  "0E E7 0D FA 1E F1 30 00 0D E8 0E E9 10 01 3E 40 \n" +
  "14 00 B0 13 44 8D 10 01 3E 40 15 00 B0 13 5A 8D \n" +
  "10 01 3E 40 17 00 B0 13 70 8D 10 01 CD 0E 2E 42 \n" +
  "B0 13 1C 8F 81 4D 2C 00 CD 0A 1E 41 2C 00 0D EB \n" +
  "0E EF 10 01 B0 13 A8 8E CD 06 CF 07 0D E4 0F E5 \n" +
  "0D F8 0F F9 0D E6 0F E7 10 01 B0 13 A8 8E CD 08 \n" +
  "CF 09 3D E3 3F E3 0D D4 0F D5 0D E6 0F E7 10 01 \n" +
  "B0 13 A8 8E CB 06 CF 07 0B E4 0F E5 CC 08 CE 09 \n" +
  "0C EB 0E EF 10 01 CC 06 CD 07 B0 13 AC 8D 10 01 \n" +
  "B0 13 10 AC CE 08 CF 09 0E E6 0F E7 0E F4 0F F5 \n" +
  "0E E8 0F E9 0E 5C 0F 6D 0E 5A 10 01 3E 40 10 00 \n" +
  "B0 13 B6 8E CD 06 CE 07 0D EB 0E EF 10 01 CC 0A \n" +
  "B0 13 08 8E 81 4D 2C 00 10 01 CC 0E CD 0F B0 13 \n" +
  "14 8E 10 01 CC 0E CD 0F B0 13 1E 8E 10 01 08 5A \n" +
  "09 6F CB 0A 0B E8 0F E9 CC 04 CD 05 0C EB 0D EF \n" +
  "10 01 B0 13 28 8E 08 5A 10 01 B0 13 28 8F 1F 41 \n" +
  "34 00 08 5A 09 6F 10 01 CD 0F 3E 40 07 00 B0 13 \n" +
  "1C 8F 10 01 3E 40 11 00 B0 13 B6 8E 10 01 3E 40 \n" +
  "16 00 B0 13 A8 8E 10 01 CC 08 CD 09 B0 13 CE 8E \n" +
  "10 01 B0 13 1C 8F 81 4D 34 00 10 01 B0 13 32 8F \n" +
  "0D 5A 1F 61 2C 00 CA 0D 10 01 B0 13 D8 8E C6 0C \n" +
  "C7 0D 10 01 B0 13 E4 8E C4 0D C5 0E 10 01 B0 13 \n" +
  "FC 8E C8 0D C9 0E 10 01 B0 13 12 8F C6 0D C7 0F \n" +
  "10 01 2C 5D 1E 6D 02 00 0C 5A 1E 61 2C 00 10 01 \n" +
  "B0 13 32 8F 0D 5A 1F 61 2C 00 10 01 1D 41 24 00 \n" +
  "1E 41 2A 00 B0 13 10 AC 10 01 1D 41 28 00 1E 41 \n" +
  "2E 00 B0 13 10 AC 10 01 B0 13 12 B3 C4 0C C5 0D \n" +
  "04 56 05 67 10 01 B0 13 12 B3 C6 0C C7 0D 06 58 \n" +
  "07 69 10 01 3E 40 0B 00 B0 13 28 8F 10 01 3E 40 \n" +
  "0C 00 B0 13 28 8F 10 01 2C 5E 1D 6E 02 00 0C 56 \n" +
  "0D 67 10 01 2D 5F 1E 6F 02 00 0D 54 0E 65 10 01 \n" +
  "2D 5F 1E 6F 02 00 0D 56 0E 67 10 01 2D 5F 1E 6F \n" +
  "02 00 0D 58 0E 69 10 01 B0 13 32 8F 0D 54 0F 65 \n" +
  "10 01 B0 13 32 8F 0D 56 0F 67 10 01 B0 13 12 B3 \n" +
  "CA 0C 0A 54 0D 65 10 01 B0 13 12 B3 C8 0C C9 0D \n" +
  "10 01 2D 5E 1F 6E 02 00 10 01 10 01 6A 14 31 80 \n" +
  "0E 00 C6 0D CA 0C CC 01 0D 43 3E 40 05 00 B0 13 \n" +
  "50 B2 81 43 06 00 37 40 1A 18 CC 07 B0 13 86 B3 \n" +
  "81 4C 0C 00 C8 0C CC 01 3C 52 CD 01 3D 50 0A 00 \n" +
  "CE 01 3E 50 0C 00 B0 13 68 AF 19 41 0A 00 59 0D \n" +
  "B1 B0 0F 00 0A 00 02 24 3C 43 EC 3C 1A B3 04 24 \n" +
  "3C 40 FE FF E7 3C 03 43 3D 40 18 18 CC 01 2E 43 \n" +
  "B0 13 C8 9B CC 01 3C 50 06 00 7D 40 03 00 B0 13 \n" +
  "20 AF CC 01 3C 50 06 00 7D 43 B0 13 20 AF 5A 0E \n" +
  "3F 40 F0 FF 1F F1 0A 00 0A 5F CD 0A 2D 82 8D 10 \n" +
  "4D 4D 4D 4D CC 01 B0 13 76 91 CD 0A 6D 82 CC 01 \n" +
  "B0 13 76 91 3A 80 0B 00 82 93 5E 18 03 24 34 40 \n" +
  "03 00 01 3C 24 42 3A B0 00 80 05 75 35 E3 CC 01 \n" +
  "3C 50 06 00 7D 40 C1 00 B0 13 20 AF CC 01 3C 50 \n" +
  "06 00 5D 43 B0 13 20 AF CD 05 8D 10 4D 4D 4D 4D \n" +
  "CC 01 B0 13 76 91 4D 45 CC 01 B0 13 76 91 CD 0A \n" +
  "8D 10 4D 4D 4D 4D CC 01 B0 13 76 91 4D 4A CC 01 \n" +
  "B0 13 76 91 CC 01 3C 50 06 00 7D 40 55 00 B0 13 \n" +
  "20 AF 4D 44 CC 01 B0 13 76 91 3A 43 05 43 0F 3C \n" +
  "CC 01 3C 50 06 00 CD 07 B0 13 68 A6 08 84 1A 53 \n" +
  "CC 0A 0D 43 B0 13 34 B0 81 43 06 00 07 54 18 93 \n" +
  "0E 38 3E 40 10 00 1E 81 06 00 C4 0E 04 98 E8 3B \n" +
  "CC 01 3C 50 06 00 CD 07 CE 08 B0 13 68 A6 CC 01 \n" +
  "3C 50 06 00 3D 40 8C 83 2E 42 B0 13 68 A6 CC 01 \n" +
  "3C 50 06 00 CD 01 2E 42 B0 13 68 A6 CC 01 3C 50 \n" +
  "06 00 3D 40 9C 83 B0 13 6C 91 CC 01 3C 50 06 00 \n" +
  "3D 40 00 18 3E 42 B0 13 68 A6 CC 01 3C 50 06 00 \n" +
  "3D 40 A4 83 B0 13 6C 91 18 41 08 00 08 93 09 24 \n" +
  "CC 01 3C 50 06 00 7D 40 30 00 B0 13 20 AF 18 83 \n" +
  "F7 23 3D 40 5A 18 CC 01 3C 50 06 00 2E 43 B0 13 \n" +
  "68 A6 CC 01 3C 50 06 00 3D 40 A0 83 B0 13 6C 91 \n" +
  "CC 01 3C 50 06 00 CD 06 3E 42 B0 13 68 A6 CC 01 \n" +
  "3C 50 06 00 3D 40 98 83 B0 13 6C 91 91 93 06 00 \n" +
  "0E 38 03 43 1A 53 CC 0A 15 53 CD 05 1D 83 B0 13 \n" +
  "34 B0 B1 80 10 00 06 00 91 93 06 00 F3 37 B0 13 \n" +
  "F4 B3 CC 09 31 50 0E 00 64 16 10 01 3E 40 03 00 \n" +
  "B0 13 68 A6 10 01 3C 50 06 00 B0 13 20 AF 10 01 \n" +
  "6A 14 31 80 26 00 81 4C 20 00 81 4F 22 00 C6 0E \n" +
  "C8 0D 15 41 4A 00 14 41 48 00 91 41 46 00 24 00 \n" +
  "81 43 14 00 3C 40 74 21 B0 13 60 AA 06 93 14 24 \n" +
  "3C 40 36 00 3D 40 54 22 0E 43 03 43 3E 90 10 00 \n" +
  "05 2C 3F 40 36 00 5F EE 08 18 01 3C 4F 4C B0 13 \n" +
  "6C 93 F4 2B B0 13 4E 93 0A 43 18 93 2A 38 C7 08 \n" +
  "09 43 03 43 19 53 CD 09 1D 83 CC 01 3C 50 10 00 \n" +
  "CE 01 3E 50 14 00 B0 13 00 A4 91 93 14 00 8A 24 \n" +
  "DA 41 10 00 54 22 1A 53 DA 41 11 00 54 22 1A 53 \n" +
  "DA 41 12 00 54 22 1A 53 3A 90 3F 00 08 20 B0 13 \n" +
  "84 93 3E 40 3F 00 0F 43 B0 13 6C 9E 0A 43 17 83 \n" +
  "D9 23 3A 90 37 00 03 28 B0 13 5E 93 0A 43 1F 41 \n" +
  "22 00 B0 13 7A 93 1F 41 22 00 CA 4F 54 22 1A 53 \n" +
  "1F 41 24 00 B0 13 7A 93 1F 41 24 00 CA 4F 54 22 \n" +
  "1A 53 CF 04 B0 13 7A 93 CA 44 54 22 1A 53 CF 05 \n" +
  "8F 10 8F 11 CA 4F 54 22 1A 53 CA 45 54 22 1A 53 \n" +
  "B0 13 5E 93 06 93 2E 24 CC 01 3D 40 74 21 B0 13 \n" +
  "C4 97 3C 40 74 21 B0 13 60 AA 3C 40 5C 00 3D 40 \n" +
  "54 22 0E 43 3E 90 10 00 05 2C 3F 40 5C 00 5F EE \n" +
  "08 18 01 3C 4F 4C B0 13 6C 93 F4 2B B0 13 4E 93 \n" +
  "3D 40 10 00 CE 01 3F 40 54 22 03 43 1F 53 FF 4E \n" +
  "FF FF 1D 83 FB 23 B0 13 84 93 3E 40 10 00 0F 43 \n" +
  "B0 13 6C 9E CC 01 3D 40 74 21 B0 13 C4 97 3D 40 \n" +
  "07 00 CF 01 3F 50 16 00 CE 01 03 43 1F 53 FF 4E \n" +
  "FF FF 1D 83 FB 23 CF 08 8F 10 C1 4F 1D 00 C1 48 \n" +
  "1E 00 0D 3C 3D 40 09 00 3E 40 07 00 CF 01 3F 50 \n" +
  "16 00 03 43 1F 53 CF 4D FF FF 1E 83 FB 23 CD 01 \n" +
  "3D 50 16 00 1F 41 20 00 0F 93 05 24 CC 0F 3E 40 \n" +
  "09 00 B0 13 EE B2 31 50 26 00 64 16 10 01 B0 13 \n" +
  "84 93 3E 40 40 00 0F 43 B0 13 6C 9E 10 01 CE 0A \n" +
  "0F 43 B0 13 84 93 B0 13 6C 9E 10 01 CD 4F 00 00 \n" +
  "1D 53 1E 53 3E 90 40 00 10 01 8F 10 CA 4F 54 22 \n" +
  "1A 53 10 01 3C 40 74 21 3D 40 54 22 10 01 00 00 \n" +
  "2A 14 31 80 1A 00 C8 0D CA 0C F2 90 32 00 5B 18 \n" +
  "01 20 38 43 09 43 1F 42 C8 22 0F 93 65 24 1F 83 \n" +
  "07 24 1F 83 4F 24 1F 83 3D 24 1F 83 27 24 7E 3C \n" +
  "B0 13 DC AA C9 0C CF 09 1F 83 1C 24 1F 83 54 20 \n" +
  "B0 13 64 A4 92 53 98 24 4C 4C 8C 10 82 4C 9C 24 \n" +
  "CC 01 3C 50 06 00 3D 40 98 24 3E 40 06 00 B0 13 \n" +
  "C8 9B 3C 40 20 00 CD 01 3D 50 06 00 B0 13 3C 8F \n" +
  "3B 3C 03 43 92 43 C6 22 37 3C 03 43 CF 0A 5F 0D \n" +
  "C2 4F C0 22 3F 40 F0 00 5F F2 C1 22 7A F0 0F 00 \n" +
  "4A DF C2 4A C1 22 3C 40 BF 22 B0 13 30 AE 1A 43 \n" +
  "45 3C 03 43 3C 40 BF 22 CD 0A CE 08 B0 13 F4 AF \n" +
  "92 53 A8 24 B0 13 D4 AB F2 90 32 00 5B 18 EF 23 \n" +
  "2A 42 34 3C CF 0A 5F 0D C2 4F BD 22 7A F0 0F 00 \n" +
  "3F 40 F0 00 5F F2 BE 22 4A DF C2 4A BE 22 3C 40 \n" +
  "BC 22 B0 13 30 AE 20 3C B0 13 A8 AD 3C 40 BC 22 \n" +
  "CD 0A CE 08 B0 13 F4 AF 3C 40 BF 22 0D 43 0E 43 \n" +
  "B0 13 F4 AF 82 93 C6 22 02 24 3F 43 01 3C 1F 43 \n" +
  "82 5F A8 24 3C 40 BC 22 B0 13 D4 AB F2 90 32 00 \n" +
  "5B 18 02 20 2A 43 02 3C 3A 40 03 00 B0 13 1C B1 \n" +
  "91 42 9A 24 00 00 91 42 9C 24 02 00 81 4C 04 00 \n" +
  "1D 42 A8 24 1E 42 5C 18 CC 01 3C 50 10 00 1F 42 \n" +
  "98 24 B0 13 80 91 3C 40 B4 22 3D 40 BC 22 3E 40 \n" +
  "06 00 B0 13 C8 9B 3C 40 94 22 CD 01 3D 50 10 00 \n" +
  "3E 40 09 00 B0 13 C8 9B C1 43 06 00 C1 43 07 00 \n" +
  "3C 40 A0 22 CD 01 3D 50 06 00 2E 43 B0 13 C8 9B \n" +
  "F2 40 7E 00 A3 22 0C 43 3D 40 B4 22 B0 13 90 B0 \n" +
  "1C 43 3D 40 94 22 B0 13 90 B0 3D 40 9C 22 2C 43 \n" +
  "B0 13 90 B0 B0 13 68 B1 82 4A C8 22 0C 43 09 93 \n" +
  "01 20 1C 43 31 50 1A 00 28 16 10 01 3A 14 31 80 \n" +
  "06 00 CA 0E C7 0D C9 0C CC 01 0D 43 3E 40 05 00 \n" +
  "B0 13 50 B2 B2 40 01 A5 60 01 18 43 79 90 77 00 \n" +
  "02 20 3A 92 6D 24 79 90 73 00 03 20 3A 90 10 00 \n" +
  "5D 24 79 90 76 00 02 20 2A 93 4E 24 79 90 62 00 \n" +
  "03 20 3A 90 40 00 3A 28 79 90 74 00 03 20 3A 90 \n" +
  "05 00 22 28 79 90 68 00 02 20 1A 93 13 24 79 90 \n" +
  "69 00 0E 20 1A 93 0C 20 6F 47 3F 80 30 00 82 4F \n" +
  "5C 18 3F B0 FE FF 4C 20 B2 D0 80 00 A4 24 48 3C \n" +
  "08 43 46 3C 6F 47 3F 80 30 00 82 4F 5E 18 B2 D0 \n" +
  "40 00 A4 24 3D 3C 03 43 CC 01 CD 07 CE 0A B0 13 \n" +
  "02 AE CC 01 B0 13 70 A5 C2 4C 18 18 8C 10 8C 11 \n" +
  "C2 4C 19 18 B2 D2 A4 24 2B 3C 03 43 39 40 1A 18 \n" +
  "CC 09 CD 07 CE 0A B0 13 02 AE 09 5A C9 43 00 00 \n" +
  "B2 D0 20 00 A4 24 1C 3C 3C 40 5A 18 CD 07 2E 43 \n" +
  "B0 13 02 AE A2 D2 A4 24 13 3C 03 43 3C 40 08 18 \n" +
  "CD 07 3E 40 10 00 B0 13 02 AE A2 D3 A4 24 08 3C \n" +
  "3C 40 00 18 CD 07 3E 42 B0 13 02 AE 92 D3 A4 24 \n" +
  "B2 90 EF 00 A4 24 06 20 82 43 62 18 82 43 64 18 \n" +
  "82 43 66 18 B2 40 03 A5 60 01 CC 08 31 50 06 00 \n" +
  "37 16 10 01 1A 14 C9 0E CF 0C 1C 43 B0 13 FE B3 \n" +
  "4C 4C 4A 4C 0F 93 2A 24 1F 83 80 24 1F 83 04 24 \n" +
  "1F 83 72 24 6D 3C 03 43 4C 4C CE 0C 0F 43 1C 42 \n" +
  "9E 24 1D 42 A0 24 B0 13 C2 A4 E2 B3 8E 01 78 24 \n" +
  "E2 C3 8E 01 E2 C3 02 01 E2 B3 8E 01 71 24 59 93 \n" +
  "09 24 B2 B0 20 00 8C 01 05 24 D2 C3 8E 01 B0 13 \n" +
  "30 A1 66 3C 3C 40 00 80 4C 3C 03 43 3B 40 FF 03 \n" +
  "1B F2 84 01 5D 42 86 01 3D F0 07 00 2D 93 02 2C \n" +
  "19 43 06 3C 1D 83 3C 40 20 00 B0 13 FE B3 C9 0C \n" +
  "5F 42 86 01 3F F0 30 00 0F 93 04 24 3F 80 10 00 \n" +
  "1B 24 1D 3C 1E 42 9E 24 1F 42 A0 24 E2 B3 8E 01 \n" +
  "16 24 E2 C3 8E 01 E2 C3 82 01 E2 B3 8E 01 0F 24 \n" +
  "B2 B0 20 00 8C 01 08 24 D2 C3 8E 01 B0 13 30 A1 \n" +
  "CE 0C CF 0D 04 3C 03 43 3E 40 00 80 0F 43 CC 0B \n" +
  "1C 53 0D 43 B0 13 8C AF CE 09 0F 43 B0 13 C2 A4 \n" +
  "CE 0A 3E B0 00 80 0F 7F 3F E3 B0 13 C2 A4 18 3C \n" +
  "0C 43 0D 43 15 3C 03 43 3C 40 10 27 CD 0A B0 13 \n" +
  "D6 AD 3C B0 00 80 0D 7D 3D E3 0A 3C CE 0A 3E B0 \n" +
  "00 80 0F 7F 3F E3 3C 40 00 80 0D 43 B0 13 20 AA \n" +
  "19 16 10 01 2A 14 C9 0D C8 0C 2E 49 1F 49 02 00 \n" +
  "CC 0E 3C F0 3F 00 0F F3 3A 40 18 00 0A 59 3E F0 \n" +
  "3F 00 0E 59 FE 40 80 00 18 00 1C 53 0F 63 3E 40 \n" +
  "40 00 0D 43 0E 8C 0D 7F 0D 20 3E 92 0B 2C 0C 59 \n" +
  "3C 50 18 00 0D 43 B0 13 50 B2 B0 13 D6 98 0C 43 \n" +
  "3E 40 40 00 0C 59 3C 50 18 00 3E 82 0D 43 B0 13 \n" +
  "50 B2 2C 49 1D 49 02 00 B0 13 88 AB 89 4C 00 00 \n" +
  "89 4D 02 00 E9 49 50 00 D9 49 01 00 51 00 D9 49 \n" +
  "02 00 52 00 D9 49 03 00 53 00 D9 49 04 00 54 00 \n" +
  "D9 49 05 00 55 00 D9 49 06 00 56 00 D9 49 07 00 \n" +
  "57 00 B0 13 D6 98 D8 49 08 00 00 00 D8 49 09 00 \n" +
  "01 00 D8 49 0A 00 02 00 D8 49 0B 00 03 00 D8 49 \n" +
  "0C 00 04 00 D8 49 0D 00 05 00 D8 49 0E 00 06 00 \n" +
  "D8 49 0F 00 07 00 D8 49 10 00 08 00 D8 49 11 00 \n" +
  "09 00 D8 49 12 00 0A 00 D8 49 13 00 0B 00 D8 49 \n" +
  "14 00 0C 00 D8 49 15 00 0D 00 D8 49 16 00 0E 00 \n" +
  "D8 49 17 00 0F 00 CC 09 0D 43 3E 40 98 00 B0 13 \n" +
  "50 B2 28 16 10 01 CC 09 CD 0A 3E 40 40 00 0F 43 \n" +
  "B0 13 A8 83 10 01 00 00 3A 14 CA 0F C9 0E C8 0D \n" +
  "C7 0C 03 43 3C 40 C0 05 B0 13 94 B3 3C 90 10 00 \n" +
  "F9 27 C2 49 88 24 C2 93 88 24 0C 24 CF 0A 3D 40 \n" +
  "4C 24 0E 43 1D 53 FD 4F FF FF 1E 53 5C 42 88 24 \n" +
  "0E 9C F8 3B 3C 40 C0 05 B0 13 48 B4 B2 F0 F3 FF \n" +
  "C2 05 92 42 C2 05 C2 05 3C 40 C0 05 CD 07 B0 13 \n" +
  "18 B4 3C 40 C0 05 7D 40 10 00 B0 13 68 B3 3C 40 \n" +
  "C0 05 B0 13 58 B4 3C 40 C0 05 3D 40 2B 00 B0 13 \n" +
  "40 B4 3C 40 C0 05 3D 40 2A 00 B0 13 60 B4 D2 43 \n" +
  "8A 24 C2 43 8C 24 C2 48 89 24 3C 40 C0 05 5D 42 \n" +
  "89 24 3E 40 E8 03 0F 43 B0 13 88 A8 49 4C 03 43 \n" +
  "32 D0 18 00 03 43 0A 43 0D 3C 03 43 C2 43 8B 24 \n" +
  "3C 40 C0 05 5D 42 89 24 B0 13 84 AE 03 43 32 D0 \n" +
  "18 00 03 43 C2 93 8B 24 09 24 1A 53 3A 90 65 00 \n" +
  "ED 3B 04 3C 03 43 32 D0 18 00 03 43 C2 93 8C 24 \n" +
  "F9 27 C2 43 8A 24 3C 40 C0 05 3D 40 2A 00 B0 13 \n" +
  "50 B4 CC 09 37 16 10 01 6A 14 B0 13 C4 9A 67 4B \n" +
  "47 47 06 43 2D 3C C9 0E CA 0F 09 88 0A 73 19 83 \n" +
  "0A 73 C5 09 C8 0A 19 53 0A 63 0F 18 48 58 00 18 \n" +
  "48 D5 65 48 C4 0E C8 0F 1E 53 0F 63 0F 18 48 58 \n" +
  "00 18 48 D4 C8 45 00 00 1B 83 EB 23 0D 3C B0 13 \n" +
  "C4 9A 6A 4B C9 0E CB 0F 1E 53 0F 63 0F 18 4B 5B \n" +
  "00 18 4B D9 CB 4A 00 00 57 03 16 53 36 92 CD 37 \n" +
  "17 B3 ED 23 B0 13 C4 9A 68 4B 48 48 B0 13 C4 9A \n" +
  "6B 4B 4B 4B CA 08 5A 0E C8 0B 58 0F 38 F0 0F 00 \n" +
  "08 DA 3B F0 0F 00 3B 50 03 00 3B 90 12 00 1D 20 \n" +
  "C9 0C CA 0D 1C 53 0D 63 0F 18 4A 5A 00 18 4A D9 \n" +
  "6A 4A 4A 4A 3A B0 80 00 0F 24 C5 0C C9 0D 1C 53 \n" +
  "0D 63 0F 18 49 59 00 18 49 D5 69 49 3A F0 7F 00 \n" +
  "49 49 46 18 09 59 0A D9 0B 5A 38 90 FF 0F 9B 23 \n" +
  "64 16 10 01 CA 0C CB 0D 1C 53 0D 63 0F 18 4B 5B \n" +
  "00 18 4B DA 10 01 00 00 4A 14 21 83 C8 0F C9 0E \n" +
  "C7 0D C6 0C 5F 41 1A 00 C1 43 00 00 7F 93 04 24 \n" +
  "C1 4F 00 00 1A 43 01 3C 0A 43 4A 4A CC 06 CD 07 \n" +
  "CE 0A CF 01 B0 13 E8 98 0C 93 F8 27 3C 40 C0 05 \n" +
  "B0 13 48 B4 B2 F0 F3 FF C2 05 B2 D2 C2 05 4F 49 \n" +
  "82 4F CA 05 C2 49 88 24 3C 40 C0 05 4D 43 B0 13 \n" +
  "68 B3 3C 40 C0 05 B0 13 58 B4 3C 40 C0 05 3D 40 \n" +
  "23 00 B0 13 40 B4 3C 40 C0 05 3D 40 21 00 B0 13 \n" +
  "60 B4 0D 14 3D 40 1E 00 1D 83 FE 23 0D 16 3C 40 \n" +
  "C0 05 B0 13 A0 B3 03 43 32 D0 18 00 03 43 0A 43 \n" +
  "0B 3C 03 43 C2 43 8B 24 3C 40 C0 05 B0 13 A0 B3 \n" +
  "03 43 32 D0 18 00 03 43 C2 93 8B 24 04 24 1A 53 \n" +
  "3A 90 C9 00 EF 3B 3C 40 C0 05 3D 40 21 00 B0 13 \n" +
  "50 B4 C2 93 88 24 0C 24 CF 08 3D 40 4C 24 0E 43 \n" +
  "1F 53 FF 4D FF FF 1E 53 5C 42 88 24 0E 9C F8 3B \n" +
  "21 53 46 16 10 01 00 00 5A 14 C6 0C 0B 43 3E 90 \n" +
  "03 00 36 38 C5 0D 19 43 09 55 2A 43 0A 55 C7 0E \n" +
  "37 80 03 00 1C 53 6F 45 5F 07 B0 13 A8 9C 6F 45 \n" +
  "3F F0 03 00 5F 0E 68 49 58 0F 08 DF 1C 53 DC 48 \n" +
  "0C 83 FF FF 6F 49 3F F0 0F 00 5F 06 68 4A 45 19 \n" +
  "08 10 08 DF 1C 53 DC 48 0C 83 FF FF 1C 53 6F 4A \n" +
  "3F F0 3F 00 B0 13 A8 9C 35 50 03 00 39 50 03 00 \n" +
  "3A 50 03 00 3B 50 03 00 37 80 03 00 07 93 D2 37 \n" +
  "0B 9E 2F 34 0D 5B 1C 53 6F 4D 5F 07 B0 13 A8 9C \n" +
  "0B 8E 3B 93 17 24 6F 4D 3F F0 03 00 5F 0E 5E 4D \n" +
  "01 00 5E 0F 0E DF 1C 53 DC 4E 0C 83 FF FF 1C 53 \n" +
  "5F 4D 01 00 3F F0 0F 00 5F 06 B0 13 A8 9C 3F 40 \n" +
  "2E 00 0C 3C 1C 53 6F 4D 3F F0 03 00 5F 0E B0 13 \n" +
  "A8 9C 3F 40 2E 00 1C 53 CC 4F FF FF 1C 53 CC 4F \n" +
  "FF FF 0C 86 55 16 10 01 DC 4F 0C 83 FF FF 10 01 \n" +
  "B2 40 80 5A CC 01 B0 13 C8 B2 7C 40 10 00 B0 13 \n" +
  "B0 B1 F2 40 3F 00 04 02 F2 40 3F 00 05 02 F2 40 \n" +
  "DF 00 24 02 C2 43 25 02 F2 43 44 02 F2 43 45 02 \n" +
  "F2 43 64 02 F2 43 65 02 C2 43 02 02 C2 43 03 02 \n" +
  "C2 43 22 02 C2 43 23 02 C2 43 42 02 C2 43 43 02 \n" +
  "C2 43 62 02 C2 43 63 02 F2 D0 C0 00 0D 02 92 C3 \n" +
  "30 01 B0 13 5C A9 3C 40 00 80 0D 43 B0 13 E8 B3 \n" +
  "0C 43 3D 40 E8 FD B0 13 A0 A9 4C 93 02 20 B0 13 \n" +
  "30 B4 5C 43 2D 43 0E 43 B0 13 90 9D 7C 42 2D 43 \n" +
  "0E 43 B0 13 90 9D 3C 40 80 3E 3D 40 E7 01 B0 13 \n" +
  "48 AC 4C 93 02 20 B0 13 30 B4 6C 42 0D 43 0E 43 \n" +
  "B0 13 90 9D 6C 43 0D 43 0E 43 B0 13 90 9D B2 40 \n" +
  "2A 5A CC 01 7C 40 03 00 3D 40 20 00 B0 13 FC AE \n" +
  "5C 43 3D 40 40 00 B0 13 FC AE 0C 43 10 01 00 00 \n" +
  "4F 4C 1F 83 2D 24 1F 83 59 24 2F 83 51 24 2F 82 \n" +
  "5C 20 F2 F0 CF 00 86 01 2D 93 01 20 0D 43 5D 0E \n" +
  "C2 DD 86 01 5F 42 86 01 0E 93 4F 24 3E 90 10 00 \n" +
  "11 24 3E 90 0A 00 08 20 CE 0F 7E F0 F8 00 7E D0 \n" +
  "05 00 C2 4E 86 01 10 01 7F F0 F8 00 7E 50 FC 00 \n" +
  "4E DF F7 3F CE 0F 7E F0 F8 00 7E D0 06 00 F1 3F \n" +
  "B2 F0 FF FC 88 01 2D 93 09 24 1D 93 05 24 3D 90 \n" +
  "03 00 05 20 2D 43 03 3C 1D 43 01 3C 0D 43 4D 4D \n" +
  "8D 10 82 DD 88 01 B2 B0 20 00 8C 01 1E 24 1F 42 \n" +
  "8C 01 0E 93 1A 24 3E 80 03 00 4E 4E 8E 10 3F F0 \n" +
  "FF F0 1F D2 8C 01 0E DF 82 4E 8C 01 10 01 03 43 \n" +
  "B0 13 5C 9E 5E 0E 3F F0 CF FF 04 3C B0 13 5C 9E \n" +
  "3F F0 F8 FF 0E DF 82 4E 8A 01 10 01 B2 F0 F8 FF \n" +
  "88 01 82 DD 88 01 1F 42 8A 01 10 01 5A 14 C7 0E \n" +
  "C6 0F C5 0D C8 0C 2C 48 1E 48 02 00 CD 0C 0D 57 \n" +
  "CF 0E 0F 66 3D F3 3F F0 FF 1F 88 4D 00 00 88 4F \n" +
  "02 00 0F 9E 03 28 06 20 0D 9C 04 2C 98 53 04 00 \n" +
  "88 63 06 00 CF 06 4C 19 0F 10 88 5F 04 00 88 63 \n" +
  "06 00 CF 0C 3F F0 3F 00 0E F3 0E 93 02 20 0F 93 \n" +
  "21 24 3A 40 40 00 09 43 0A 8F 09 7E 06 99 30 28 \n" +
  "02 20 07 9A 2D 28 3C F0 3F 00 0C 58 3C 50 18 00 \n" +
  "3E 40 40 00 0E 8F CD 05 B0 13 EE B2 05 5A 07 8A \n" +
  "06 79 3D 40 18 00 0D 58 CC 08 3E 40 40 00 0F 43 \n" +
  "B0 13 A8 83 3A 40 18 00 0A 58 06 93 03 20 37 90 \n" +
  "40 00 0C 28 CE 07 CF 06 3E F0 C0 FF 3F F3 CC 08 \n" +
  "CD 05 B0 13 A8 83 C5 0C 37 F0 3F 00 CC 0A 04 3C \n" +
  "CC 0F 0C 58 3C 50 18 00 CD 05 CE 07 B0 13 EE B2 \n" +
  "55 16 10 01 0E 42 3E F0 40 00 32 D0 40 00 B2 F0 \n" +
  "00 FE 80 01 B2 F0 00 FC 84 01 1D 83 82 4D 84 01 \n" +
  "F2 F0 F1 00 82 01 1F 43 3C 90 E9 03 33 28 3C 90 \n" +
  "D1 07 2C 28 3C 90 A1 0F 25 28 3C 90 41 1F 1E 28 \n" +
  "3C 90 E1 2E 17 28 3C 90 81 3E 10 28 3C 90 21 4E \n" +
  "09 28 3C 90 C1 5D 02 28 0F 43 1F 3C F2 D0 0E 00 \n" +
  "82 01 1B 3C F2 D0 0C 00 82 01 17 3C F2 D0 0A 00 \n" +
  "82 01 13 3C F2 D2 82 01 10 3C 03 43 F2 D0 06 00 \n" +
  "82 01 0B 3C E2 D2 82 01 08 3C 03 43 E2 D3 82 01 \n" +
  "04 3C 03 43 D2 42 82 01 82 01 32 C0 40 00 04 3C \n" +
  "D2 C3 8E 01 E2 C3 02 01 B2 B0 00 03 8E 01 F8 23 \n" +
  "D2 B3 8E 01 F5 23 03 43 02 DE 03 43 CC 0F 10 01 \n" +
  "5A 14 21 83 C1 43 00 00 1C 43 3D 40 A4 22 B0 13 \n" +
  "C8 B0 C2 93 A8 22 3F 24 56 42 A8 22 08 43 39 40 \n" +
  "06 00 0A 43 27 43 03 43 5F 49 A4 22 0A 93 06 20 \n" +
  "3F 90 3C 00 21 20 1A 43 1F 3C 03 43 1A 93 1A 24 \n" +
  "2A 93 12 24 3F 90 3E 00 05 24 C8 4F 54 22 18 53 \n" +
  "13 3C 03 43 4C 45 CE 08 3D 40 54 22 B0 13 5C 95 \n" +
  "0A 43 08 43 09 3C 03 43 3F 90 3A 00 05 20 3A 40 \n" +
  "03 00 02 3C C5 0F 2A 43 39 90 0F 00 03 34 19 53 \n" +
  "08 3C 03 43 CC 07 3D 40 A4 22 B0 13 C8 B0 17 53 \n" +
  "09 43 16 83 C9 23 0C 43 21 53 55 16 10 01 00 00 \n" +
  "1A 14 C9 0C 0A 43 82 93 7A 24 10 20 82 93 7C 24 \n" +
  "09 20 09 93 03 24 0C 43 0C 3C 03 43 3C 40 03 00 \n" +
  "08 3C 03 43 82 43 7C 24 2C 43 03 3C 82 43 7A 24 \n" +
  "1C 43 1F 42 7E 24 5F 06 00 18 5F 4F 24 24 4F 13 \n" +
  "1B 42 7E 24 3D 40 0D 00 3F 40 56 23 3E 40 09 00 \n" +
  "2B 9F 05 20 8F 9C 02 00 02 20 1E 4F 04 00 3F 50 \n" +
  "06 00 1D 83 F5 23 3E 90 09 00 0E 24 82 4E 7E 24 \n" +
  "2C 93 03 20 09 93 01 24 1A 43 B2 92 7E 24 01 20 \n" +
  "2A 43 CC 0A 03 3C 03 43 FF 3F 03 43 19 16 10 01 \n" +
  "5F 42 82 01 3F F0 0E 00 0F 93 3C 24 2F 83 34 24 \n" +
  "2F 83 2C 24 2F 83 24 24 2F 83 1C 24 2F 83 14 24 \n" +
  "2F 83 0C 24 2F 83 04 24 0C 43 0D 43 10 01 03 43 \n" +
  "3C 40 00 36 3D 40 6E 01 10 01 03 43 3C 40 00 2D \n" +
  "3D 40 31 01 10 01 03 43 3C 40 00 24 3D 40 F4 00 \n" +
  "10 01 03 43 3C 40 00 1B 3D 40 B7 00 10 01 03 43 \n" +
  "3C 40 00 12 3D 40 7A 00 10 01 03 43 3C 40 00 09 \n" +
  "3D 40 3D 00 10 01 03 43 3C 40 80 84 3D 40 1E 00 \n" +
  "10 01 03 43 3C 40 40 42 3D 40 0F 00 10 01 00 00 \n" +
  "5C 42 0D 22 1E 42 78 24 7E 80 03 00 92 C3 1A 05 \n" +
  "3C 90 7A 00 27 24 3C 90 79 00 12 24 3C 90 78 00 \n" +
  "09 24 4C 4C 3D 40 0F 22 4E 4E B0 13 5C 95 4C 4C \n" +
  "1C 3C 03 43 3D 40 6C 24 3E 40 0B 00 1C 3C 03 43 \n" +
  "32 C2 03 43 D2 43 00 05 82 43 00 03 82 43 80 03 \n" +
  "82 43 C0 03 B2 40 80 5A CC 01 3F 40 00 10 4F 13 \n" +
  "04 3C 03 43 B2 40 08 A5 20 01 1C 93 08 24 3D 40 \n" +
  "7E 83 3E 40 48 00 3C 40 0C 22 B0 13 02 AE 0C 43 \n" +
  "10 01 00 00 31 80 12 00 CC 01 3D 40 82 83 3E 40 \n" +
  "0A 00 B0 13 EE B2 B1 40 00 01 00 00 B1 40 18 00 \n" +
  "02 00 81 43 04 00 A1 42 06 00 C1 43 08 00 3C 40 \n" +
  "C0 03 CD 01 B0 13 D0 A8 3C 40 C0 03 2D 43 B0 13 \n" +
  "20 B4 A1 43 0A 00 B1 40 10 00 0C 00 81 43 0E 00 \n" +
  "B1 40 52 00 10 00 3C 40 C0 03 CD 01 3D 50 0A 00 \n" +
  "B0 13 78 AD 3C 40 C0 03 3D 40 20 00 B0 13 70 B4 \n" +
  "31 50 12 00 10 01 00 00 0A 14 0A 43 82 93 90 24 \n" +
  "15 20 82 93 92 24 0C 20 82 93 94 24 03 20 82 43 \n" +
  "CA 22 10 3C 82 43 94 24 B2 40 03 00 CA 22 0A 3C \n" +
  "82 43 92 24 A2 43 CA 22 05 3C 03 43 82 43 90 24 \n" +
  "92 43 CA 22 CF 0A 5F 06 00 18 5F 4F E4 23 1C 42 \n" +
  "CA 22 4F 13 CD 0C 3D 90 05 00 04 20 03 43 32 D0 \n" +
  "D8 00 03 43 CC 0A B0 13 B4 AC CA 0C 3A 90 0F 00 \n" +
  "CD 23 0A 16 10 01 00 00 1A 14 31 80 0C 00 C9 0D \n" +
  "CA 0C B0 13 64 A4 82 43 C6 22 82 43 98 24 92 42 \n" +
  "66 18 9A 24 4C 4C 8C 10 4A C3 0C DA 82 4C 9C 24 \n" +
  "CC 01 3D 40 98 24 3E 40 06 00 B0 13 C8 9B 82 43 \n" +
  "A8 24 82 43 C8 22 49 93 03 24 0A 43 03 3C 03 43 \n" +
  "3A 40 20 00 CC 0A CD 01 CE 01 3E 50 0A 00 B0 13 \n" +
  "08 A7 1C 41 0A 00 CD 0A B0 13 AC AE 31 50 0C 00 \n" +
  "19 16 10 01 2A 14 19 42 CC 01 B2 40 80 5A CC 01 \n" +
  "3F 40 E8 81 3F 90 F4 81 21 24 3F 40 FA 81 3F 90 \n" +
  "0A 82 1C 24 3A 40 0A 82 3A 80 FA 81 5A 09 38 40 \n" +
  "FA 81 3C 48 3D 48 CE 0C CF 0D 1C 53 0D 63 0F 18 \n" +
  "4F 5F 00 18 4F DE 6F 4F 4F 4F 5F 06 00 18 5B 4F \n" +
  "E8 81 3E 48 3F 48 4B 13 1A 83 EB 23 79 C2 39 D0 \n" +
  "08 5A 82 49 CC 01 B0 13 3A 8F 28 16 10 01 00 00 \n" +
  "0A 14 21 82 CA 0C 8E 43 00 00 1F 42 A6 24 0F 8D \n" +
  "CD 0F 5D 02 0D 5F 3D 50 00 20 0F 93 13 34 CD 0F \n" +
  "5D 02 0D 5F 3D 50 74 21 3F 50 7C 00 1F 92 A6 24 \n" +
  "09 34 C1 43 00 00 C1 43 01 00 C1 43 02 00 9E 43 \n" +
  "00 00 05 3C CC 01 3E 40 03 00 B0 13 EE B2 CD 01 \n" +
  "0A 93 05 24 CC 0A 3E 40 03 00 B0 13 EE B2 21 52 \n" +
  "0A 16 10 01 A2 C3 00 07 B2 40 10 02 00 07 B2 40 \n" +
  "00 02 02 07 82 43 04 07 92 43 1A 07 B2 40 0D 00 \n" +
  "0A 07 F2 40 A5 00 21 01 92 43 24 01 B2 B0 00 10 \n" +
  "24 01 FC 27 3C 40 00 07 4D 43 B0 13 74 B0 03 43 \n" +
  "32 D0 18 00 03 43 3C 40 00 07 B0 13 08 B4 3C 40 \n" +
  "00 07 5D 43 B0 13 10 B4 B0 13 38 B3 1C 42 A2 24 \n" +
  "10 01 0A 14 09 14 09 43 0A 43 1B 43 0F 93 04 24 \n" +
  "09 4D 0D 4C 0C 43 0D 3C 5C 02 0D 6D 09 69 09 8E \n" +
  "04 28 1C D3 5B 02 F8 2B 03 3C 09 5E 5B 02 F4 2B \n" +
  "1B 43 5C 02 0D 6D 09 69 0A 6A 09 8E 0A 7F 04 28 \n" +
  "1C D3 5B 02 F6 2B 04 3C 09 5E 0A 6F 5B 02 F1 2B \n" +
  "0E 49 0F 4A 09 16 0A 16 10 01 00 00 21 82 81 43 \n" +
  "02 00 B0 13 56 A5 B0 13 D8 9A F2 40 AA 00 5C 24 \n" +
  "F2 40 E1 00 68 24 F2 40 10 00 69 24 F2 40 6D 00 \n" +
  "6A 24 B0 13 60 A5 B0 13 E8 98 B0 13 56 A5 B0 13 \n" +
  "D8 9A 21 52 10 01 F1 43 04 00 B0 13 60 A5 10 01 \n" +
  "7C 40 55 00 4D 43 7E 40 10 00 3F 40 5C 24 10 01 \n" +
  "0A 14 CB 0C 0C 43 0B 3C 3D 40 0A 00 B0 13 98 B1 \n" +
  "0C 5F 3C 80 30 00 1B 53 6F 4B 12 3C 1B 53 6F 4B \n" +
  "4E 4F FE B2 0B 82 FA 23 4F 4F 3F 90 2D 00 05 24 \n" +
  "0A 43 3F 90 2B 00 04 20 01 3C 1A 43 1B 53 6F 4B \n" +
  "EF B2 0B 82 E1 23 0A 93 02 24 3C E3 1C 53 0A 16 \n" +
  "10 01 00 00 31 80 0C 00 6C 42 3D 40 C0 00 5E 43 \n" +
  "B0 13 18 A9 CC 01 3D 40 6A 83 3E 40 0C 00 B0 13 \n" +
  "EE B2 F1 40 80 00 00 00 B0 13 38 B1 81 4C 02 00 \n" +
  "81 4D 04 00 00 1B F1 40 80 1A 06 00 F1 40 10 00 \n" +
  "0A 00 C1 43 0B 00 3C 40 C0 05 CD 01 B0 13 18 A6 \n" +
  "31 50 0C 00 10 01 00 00 0A 14 CF 0D CA 0C 9A 43 \n" +
  "00 00 2E 43 0E 5A BE F0 F3 FF 00 00 5D 4F 0B 00 \n" +
  "8E DD 00 00 5E 4F 0A 00 8A 4E 0A 00 BA D0 00 0F \n" +
  "00 00 6E 4F 1E 53 8A DE 00 00 1C 4F 02 00 1D 4F \n" +
  "04 00 1E 4F 06 00 1F 4F 08 00 B0 13 C2 A4 8A 4C \n" +
  "06 00 0A 16 10 01 00 00 1A 14 CA 0C 2F 4A CB 0F \n" +
  "0B 5E 1B 83 1C 43 09 43 0F 93 03 38 3F 90 40 00 \n" +
  "02 38 09 93 16 24 0B 93 03 38 3B 90 40 00 02 38 \n" +
  "09 93 0F 24 1E 93 09 38 3C 40 A4 23 0C 5F 03 43 \n" +
  "1C 53 FC 4D FF FF 1E 83 FB 23 1B 53 8A 4B 00 00 \n" +
  "0C 43 19 16 10 01 00 00 6C 42 2D 42 B0 13 E0 B1 \n" +
  "C2 43 3B 02 B2 40 80 5A CC 01 F2 40 A5 00 21 01 \n" +
  "F2 F0 BF 00 20 01 F2 D0 10 00 20 01 C2 43 21 01 \n" +
  "82 43 80 03 82 43 C0 03 82 43 00 03 0D 14 3D 40 \n" +
  "02 0D 03 43 1D 83 FE 23 0D 16 03 43 32 D0 F8 00 \n" +
  "03 43 0C 43 10 01 00 00 2A 14 21 83 C9 0E CA 0C \n" +
  "B0 13 3C 8F 0C 93 1C 38 89 4C 00 00 81 43 00 00 \n" +
  "28 42 03 43 CC 01 3D 40 92 83 2E 42 B0 13 68 A6 \n" +
  "18 83 F8 23 1A 93 0A 38 08 43 03 43 2C 49 0C 58 \n" +
  "0D 43 B0 13 34 B0 18 53 1A 83 F8 23 B0 13 F4 B3 \n" +
  "21 53 28 16 10 01 00 00 1A 14 31 82 CA 0D C9 0C \n" +
  "00 18 C1 43 00 00 00 18 C1 43 04 00 7C 40 40 00 \n" +
  "4D 43 CE 01 CF 01 2F 52 B0 13 F0 A7 1C 41 04 00 \n" +
  "1D 41 06 00 B0 13 46 AB 8A 4C 00 00 2C 41 1D 41 \n" +
  "02 00 B0 13 46 AB 89 4C 00 00 0C 43 0D 43 31 52 \n" +
  "19 16 10 01 1A 14 21 83 C1 43 00 00 B0 13 F8 B1 \n" +
  "B0 13 84 B4 C9 0C B0 13 8C B4 CA 0C CC 01 CD 09 \n" +
  "B0 13 54 B0 3A 90 32 00 06 34 B2 40 2A 5A CC 01 \n" +
  "6D 41 B0 13 28 A3 C1 93 00 00 04 24 3C 40 03 00 \n" +
  "04 3C 03 43 B0 13 00 B3 0C 43 21 53 19 16 10 01 \n" +
  "1A 14 31 80 06 00 CA 0F C9 0E F1 43 00 00 6E 42 \n" +
  "CF 01 2F 53 B0 13 D8 9A 5C 41 04 00 5D 41 05 00 \n" +
  "5F 41 03 00 47 18 0F 5F 5E 41 02 00 0E DF 89 4E \n" +
  "00 00 4D 4D 47 18 0D 5D 4C 4C 0D DC 8A 4D 00 00 \n" +
  "0C 43 31 50 06 00 19 16 10 01 00 00 0A 14 82 93 \n" +
  "96 24 11 24 1C 42 96 24 B0 13 E8 AC B0 13 50 B1 \n" +
  "0C 93 03 24 B2 40 08 A5 20 01 6C 42 2D 42 B0 13 \n" +
  "E0 B1 2A 43 01 3C 1A 43 B0 13 48 B3 1C 83 82 9C \n" +
  "96 24 04 28 82 43 96 24 03 3C 03 43 92 53 96 24 \n" +
  "CC 0A 0A 16 10 01 00 00 0A 14 3A 40 2A 00 0A 5C \n" +
  "2B 43 2B FA AA C3 00 00 BC D0 12 00 00 00 03 43 \n" +
  "AC B3 2C 00 07 20 1E 83 0F 73 FA 23 0E 93 F8 23 \n" +
  "0C 3C 03 43 0F 93 02 20 0E 93 07 24 4D 4D 8C 4D \n" +
  "0E 00 8C DB 2A 00 5C 43 01 3C 4C 43 0A 16 10 01 \n" +
  "BC F0 09 E4 00 00 3F 40 20 00 0F 5C BF F0 F8 FF \n" +
  "00 00 3E 40 07 00 1E FD 02 00 8F DE 00 00 1F 4D \n" +
  "06 00 2F 5D 1F 5D 04 00 3E 40 F8 1F 1E FD 02 00 \n" +
  "5E 0A 0E 5F 8C DE 00 00 CD 93 08 00 03 24 BC D0 \n" +
  "20 00 00 00 10 01 00 00 4F 4C 5F 02 1B 4F 4E 83 \n" +
  "5C B3 02 20 4D 4D 8D 10 CF 0D 3F E3 8B FF 04 00 \n" +
  "4E 4E 1E 83 0D 24 1E 83 05 24 1E 83 0D 20 8B DD \n" +
  "0A 00 02 3C 8B FF 0A 00 8B DD 0C 00 10 01 03 43 \n" +
  "8B DD 0A 00 8B FF 0C 00 10 01 00 00 1F 42 5E 01 \n" +
  "0F 93 1C 24 2F 83 18 24 2F 83 18 24 2F 82 10 24 \n" +
  "3F 80 06 00 09 24 3F 82 03 24 B2 D2 AA 24 10 01 \n" +
  "A2 D2 AA 24 10 01 03 43 A2 D3 AA 24 10 01 03 43 \n" +
  "B2 D0 10 00 AA 24 10 01 92 D3 AA 24 10 01 00 00 \n" +
  "CF 0C 92 C3 8C 01 B2 D0 C0 00 8C 01 B2 F0 CF FF \n" +
  "8C 01 03 43 E2 C3 8E 01 E2 C3 02 01 E2 B3 8E 01 \n" +
  "0B 20 0D 93 0B 24 3C 40 3F FF 1C F2 8C 01 0C DF \n" +
  "82 4C 8C 01 5C 43 10 01 1D 83 EC 23 4C 43 10 01 \n" +
  "0A 14 1A 41 08 00 1B 41 0A 00 0F 18 4D 5D 00 18 \n" +
  "4D DC 0F 18 4F 5F 00 18 4F DE 0B 93 02 20 0A 93 \n" +
  "0D 24 0C 43 0E 43 AD 00 01 00 FD 4F FF FF 1C 53 \n" +
  "0E 63 0E 9B F8 2B 02 20 0C 9A F5 2B 0A 16 10 01 \n" +
  "0A 14 0A 43 0F 93 05 34 3E E3 3F E3 1E 53 0F 63 \n" +
  "1A D3 0D 93 05 34 3C E3 3D E3 1C 53 0D 63 3A E3 \n" +
  "B0 13 C2 A4 1A B3 04 24 3C E3 3D E3 1C 53 0D 63 \n" +
  "2A B3 04 24 3E E3 3F E3 1E 53 0F 63 0A 16 10 01 \n" +
  "BC 40 01 23 08 00 BC 40 45 67 0A 00 BC 40 89 AB \n" +
  "0C 00 BC 40 CD EF 0E 00 BC 40 FE DC 10 00 BC 40 \n" +
  "BA 98 12 00 BC 40 76 54 14 00 BC 40 32 10 16 00 \n" +
  "00 18 CC 43 00 00 00 18 CC 43 04 00 10 01 0A 14 \n" +
  "1C 53 0D 63 0F 18 4D 5D 00 18 4D DC 2C 4D 1B 4D \n" +
  "02 00 0B 93 02 20 0C 93 0F 24 CA 0E CD 0F 1E 53 \n" +
  "0F 63 0F 18 4D 5D 00 18 4D DA CD 43 00 00 1C 83 \n" +
  "0B 73 F3 23 0C 93 F1 23 0A 16 10 01 92 92 84 24 \n" +
  "86 24 04 24 92 53 86 24 0C 43 03 3C 82 43 86 24 \n" +
  "2C 43 1F 42 86 24 5F 01 1F 52 82 24 82 4F C2 22 \n" +
  "1F 92 80 24 05 24 1F 53 82 4F C4 22 10 01 03 43 \n" +
  "92 42 82 24 C4 22 1C 43 10 01 5D 01 5C 00 5D 01 \n" +
  "5C 00 5D 01 5C 00 5D 01 5C 00 5D 01 5C 00 5D 01 \n" +
  "5C 00 5D 01 5C 00 5D 01 5C 00 5D 01 5C 00 5D 01 \n" +
  "5C 00 5D 01 5C 00 5D 01 5C 00 5D 01 5C 00 5D 01 \n" +
  "5C 00 5D 01 5C 00 10 01 5C 02 0D 6D 5C 02 0D 6D \n" +
  "5C 02 0D 6D 5C 02 0D 6D 5C 02 0D 6D 5C 02 0D 6D \n" +
  "5C 02 0D 6D 5C 02 0D 6D 5C 02 0D 6D 5C 02 0D 6D \n" +
  "5C 02 0D 6D 5C 02 0D 6D 5C 02 0D 6D 5C 02 0D 6D \n" +
  "5C 02 0D 6D 10 01 0A 14 21 82 CB 0C CA 0D CC 0E \n" +
  "CD 0F CE 0B CF 0A CA 0E CB 0F 1A 53 0B 63 0F 18 \n" +
  "4B 5B 00 18 4B DA 1A 4B 02 00 A1 4B 00 00 81 4A \n" +
  "02 00 3E 50 05 00 0F 63 B0 13 E0 A9 21 52 0A 16 \n" +
  "10 01 00 00 21 82 CD 0C CC 01 3E 40 03 00 B0 13 \n" +
  "EE B2 B2 90 7B 00 A6 24 03 24 92 53 A6 24 02 3C \n" +
  "82 43 A6 24 1C 42 A6 24 CF 0C 5F 02 0C 5F 3C 50 \n" +
  "00 20 CD 01 3E 40 03 00 B0 13 EE B2 21 52 10 01 \n" +
  "0A 14 CB 0D 5C 06 CF 0C 0E 5F 5C 4E 01 00 0D 43 \n" +
  "B0 13 74 AB 6A 4E 0C DA 5A 4E 02 00 0D DA 0C D3 \n" +
  "5E 4E 03 00 8E 10 0C D3 0D DE 0B 5F 8B 4C 58 00 \n" +
  "8B 4D 5A 00 0A 16 10 01 21 83 CF 0D 44 18 0F 5F \n" +
  "81 4F 00 00 B0 13 44 9F 4C 4C 91 83 00 00 0A 3C \n" +
  "0D 14 3D 40 06 00 03 43 1D 83 FE 23 0D 16 00 3C \n" +
  "91 83 00 00 B1 93 00 00 F3 23 21 53 10 01 00 00 \n" +
  "B2 40 2A 5A CC 01 7C 40 03 00 3D 40 20 00 B0 13 \n" +
  "00 B1 4C 4C B0 13 A0 A0 0C 93 04 20 3C 40 03 00 \n" +
  "10 01 03 43 1C 93 04 20 3C 40 05 00 10 01 03 43 \n" +
  "0C 43 10 01 3B 40 17 00 3E 40 CC 22 3F 40 0F 00 \n" +
  "2C 9E 03 20 8E 9D 02 00 05 24 3E 50 06 00 1B 83 \n" +
  "F7 23 02 3C 1F 4E 04 00 3F 90 0F 00 03 24 CC 0F \n" +
  "10 01 03 43 FF 3F 03 43 21 83 C1 4C 00 00 8C 10 \n" +
  "C1 4C 01 00 3C 40 A0 22 CD 01 2E 43 B0 13 C8 9B \n" +
  "F2 40 7E 00 A3 22 3D 40 9C 22 2C 43 B0 13 90 B0 \n" +
  "B0 13 78 B3 21 53 10 01 7C 40 40 00 7D 40 0E 00 \n" +
  "6E 42 B0 13 44 AF 7C 40 40 00 7D 40 07 00 7E 40 \n" +
  "80 00 B0 13 44 AF 7C 40 40 00 7D 40 0F 00 5E 43 \n" +
  "B0 13 44 AF 0C 43 10 01 21 82 F2 C2 3B 02 CC 01 \n" +
  "CD 01 2D 53 B0 13 58 A7 2C 41 1D 41 02 00 B0 13 \n" +
  "90 93 1C 93 02 38 B0 13 00 B3 6C 42 2D 42 B0 13 \n" +
  "E0 B1 0C 43 21 52 10 01 2F 4D 0F 5C BF F0 FF FE \n" +
  "00 00 2F 4D 0F 5C BF F0 0F FF 00 00 2F 4D 0F 5C \n" +
  "1E 4D 04 00 1E 5D 02 00 8F DE 00 00 2C 5D 9C 4D \n" +
  "06 00 10 00 10 01 00 00 82 93 86 24 09 24 92 B3 \n" +
  "86 24 10 20 1C 43 0D 43 B0 13 D4 AE 06 3C 03 43 \n" +
  "1C 42 C2 22 0D 43 B0 13 14 B0 1C 42 C4 22 1D 43 \n" +
  "80 00 14 B0 10 01 0B 43 0D 93 03 34 3D E3 1D 53 \n" +
  "1B D3 0C 93 03 34 3C E3 1C 53 3B E3 B0 13 0E B2 \n" +
  "1B B3 02 24 3C E3 1C 53 2B B3 02 24 3E E3 1E 53 \n" +
  "10 01 0E 93 13 24 CF 0C 6B 4D 1F 53 CF 4B FF FF \n" +
  "0B 93 03 24 1D 53 1E 83 F7 23 CD 0E 1E 83 2D 93 \n" +
  "05 28 1F 53 CF 43 FF FF 1E 83 FB 23 10 01 00 00 \n" +
  "21 82 CD 0C CC 01 3E 40 03 00 B0 13 EE B2 1C 42 \n" +
  "A6 24 CF 0C 5F 02 0C 5F 3C 50 00 20 CD 01 3E 40 \n" +
  "03 00 B0 13 EE B2 21 52 10 01 00 00 D2 43 00 05 \n" +
  "F2 D0 80 00 00 05 F2 40 82 00 06 05 F2 40 06 00 \n" +
  "07 05 A2 42 08 05 D2 C3 00 05 F2 D0 C0 00 0A 02 \n" +
  "0C 43 10 01 3E 40 2A 00 0E 5C 2F 43 2F FE AE C3 \n" +
  "00 00 BC D0 12 00 00 00 AC B3 2C 00 FD 27 4D 4D \n" +
  "8C 4D 0E 00 8C DF 2A 00 10 01 00 00 82 4C 82 24 \n" +
  "CF 0C 0F 5D 1F 83 82 4F 80 24 82 4C C2 22 1C 53 \n" +
  "82 4C C4 22 5D 02 1D 83 82 4D 84 24 82 43 86 24 \n" +
  "10 01 00 00 1F 43 2C 92 0E 2C 2D 92 0C 2C 0F 43 \n" +
  "CE 0F 0E 5C CB 0F 0B 5D DB 4E A4 23 A4 23 1F 53 \n" +
  "2F 92 F6 3B 0F 43 CC 0F 10 01 00 00 4F 4C 5F 02 \n" +
  "1F 4F 4E 83 5C B3 02 20 4D 4D 8D 10 3D E3 8F FD \n" +
  "0A 00 8F FD 0C 00 8F FD 04 00 8F FD 06 00 10 01 \n" +
  "1F 43 0B 43 2E 4C 0E 93 03 38 3E 90 40 00 02 38 \n" +
  "0B 93 06 24 2F 4C CF 4D A4 23 9C 53 00 00 0F 43 \n" +
  "CC 0F 10 01 1A 14 21 83 C1 4E 00 00 CA 0D C9 0C \n" +
  "CC 09 CD 0A 5E 43 CF 01 B0 13 E8 98 0C 93 F8 27 \n" +
  "4C 43 21 53 19 16 10 01 21 83 3F 40 32 00 2F 5E \n" +
  "81 4F 00 00 2F 41 3F E3 1F 53 3F F0 0F 00 8C 4F \n" +
  "00 00 2F 51 8D 4F 00 00 21 53 10 01 02 12 32 C2 \n" +
  "03 43 82 4C D0 04 82 4D D2 04 82 4E E0 04 82 4F \n" +
  "E2 04 1C 42 E4 04 1D 42 E6 04 32 41 03 43 10 01 \n" +
  "4F 4C 5F 02 1E 4F 4E 83 5C B3 02 20 4D 4D 8D 10 \n" +
  "CF 0D 3F E3 8E FF 0A 00 8E FF 0C 00 8E DD 04 00 \n" +
  "10 01 00 00 6C 42 3D 42 B0 13 FC AE 6C 42 2D 42 \n" +
  "B0 13 B0 AF 6C 42 2D 42 B0 13 C8 B1 B0 13 44 A2 \n" +
  "0C 43 10 01 CF 0D 5F 0D CC 4F 00 00 CF 0E 5F 0D \n" +
  "CC 4F 01 00 43 18 4D 5D 7E F0 0F 00 4D DE CC 4D \n" +
  "02 00 10 01 CF 0C 2D 92 03 28 1C 43 10 01 03 43 \n" +
  "1C 43 0C 5F 5D 0E 3D 50 A4 23 B0 13 C8 B0 0C 43 \n" +
  "10 01 00 00 CF 0C 2D 92 03 28 1C 43 10 01 03 43 \n" +
  "1C 43 0C 5F 5D 0E 3D 50 A4 23 B0 13 78 B2 0C 43 \n" +
  "10 01 00 00 4F 43 B2 B0 2F 00 AA 24 01 24 5F 43 \n" +
  "CC 4F 00 00 5D 0D 4D 4D 8D 10 5C 42 AA 24 0C DD \n" +
  "10 01 00 00 AC C3 00 00 2F 43 0F 5C BF F0 F9 FF \n" +
  "00 00 4D 4D 8F DD 00 00 BC D0 03 00 00 00 10 01 \n" +
  "21 83 92 B3 86 24 01 24 1C 53 5C 0A 81 4C 00 00 \n" +
  "CC 01 3E 42 B0 13 68 A6 21 53 10 01 21 82 C1 43 \n" +
  "02 00 C1 4E 00 00 5E 43 CF 01 2F 53 B0 13 D8 9A \n" +
  "5C 41 02 00 21 52 10 01 21 83 CF 0D F1 43 00 00 \n" +
  "4D 4C 7C 40 55 00 7E 40 10 00 B0 13 D8 9A 0C 43 \n" +
  "21 53 10 01 1A 14 C9 0C 1A 43 B0 13 AC B3 4C 93 \n" +
  "04 24 39 90 03 00 01 24 0A 43 CC 0A 19 16 10 01 \n" +
  "4F 4C 5F 02 1F 4F 4E 83 5C B3 02 20 4D 4D 8D 10 \n" +
  "4C 43 2D BF 01 24 5C 43 10 01 00 00 1F 42 C4 22 \n" +
  "1F 82 82 24 5F 0E 1C 43 1C F2 86 24 5C 0A 0C 5F \n" +
  "3C 50 07 00 10 01 00 00 5C 42 88 01 3C F0 07 00 \n" +
  "3D 40 30 00 1D F2 8A 01 5D 0F 6E 42 80 00 94 96 \n" +
  "1C 43 3D 40 A4 22 B0 13 C8 B0 0C 43 F2 90 54 00 \n" +
  "A9 22 01 20 1C 43 10 01 1C 42 C2 22 0D 43 B0 13 \n" +
  "34 B0 1C 42 C4 22 1D 43 B0 13 34 B0 80 00 F4 B3 \n" +
  "B0 13 DC B2 B2 40 7F 07 08 03 B2 40 40 27 00 03 \n" +
  "A2 D3 00 03 0C 43 10 01 02 12 32 C2 03 43 82 4C \n" +
  "C0 04 82 4D C8 04 1C 42 CA 04 32 41 03 43 10 01 \n" +
  "5F 42 A0 01 3F F0 8F FF 4C 4C 0F DC 3F D0 00 A5 \n" +
  "82 4F A0 01 10 01 00 00 4F 4C 5F 02 1F 4F 4E 83 \n" +
  "5C B3 02 20 4D 4D 8D 10 8F DD 02 00 10 01 00 00 \n" +
  "4F 4C 5F 02 1F 4F 4E 83 5C B3 02 20 4D 4D 8D 10 \n" +
  "8F CD 02 00 10 01 00 00 B2 40 01 A5 60 01 92 53 \n" +
  "64 18 92 53 66 18 B2 40 03 A5 60 01 10 01 0E 43 \n" +
  "0F 4C 1C 43 5F 02 0E 6E 0E 9D 01 28 0E 8D 0C 6C \n" +
  "F9 2B 10 01 B2 40 2A 5A CC 01 1C 93 03 20 2C 42 \n" +
  "10 01 03 43 3C 40 05 00 10 01 00 00 B0 13 50 B1 \n" +
  "0C 93 02 24 B0 13 00 A0 B0 13 1C A5 0C 43 10 01 \n" +
  "CF 0C 0E 93 06 24 4D 4D 1F 53 CF 4D FF FF 1E 83 \n" +
  "FB 23 10 01 7C 40 55 00 7D 40 FE 00 7E 40 06 00 \n" +
  "B0 13 AC B0 2C F3 10 01 CF 0D 4D 4C 7C 40 55 00 \n" +
  "7E 40 10 00 B0 13 E8 98 0C 43 10 01 F2 C2 3D 02 \n" +
  "F2 D2 39 02 F2 D2 3B 02 B0 13 18 AD 0C 43 10 01 \n" +
  "3C 40 0C 22 3D 40 76 83 3E 40 48 00 B0 13 02 AE \n" +
  "0C 43 10 01 2C 93 04 24 3C 40 05 00 10 01 03 43 \n" +
  "B0 13 C4 A5 0C 43 10 01 F2 40 A5 00 21 01 F2 F0 \n" +
  "BF 00 20 01 C2 43 21 01 10 01 00 00 F2 40 A5 00 \n" +
  "21 01 F2 D0 40 00 20 01 C2 43 21 01 10 01 0E 93 \n" +
  "06 24 CF 0C 1F 53 FF 4D FF FF 1E 83 FB 23 10 01 \n" +
  "B2 40 01 A5 60 01 82 43 64 18 B2 40 03 A5 60 01 \n" +
  "10 01 3E F0 1F 00 05 24 5C 02 0D 6D 0C 63 1E 83 \n" +
  "FB 23 10 01 3C 90 03 00 03 20 0C 43 10 01 03 43 \n" +
  "3C 40 05 00 10 01 00 00 F2 40 A5 00 21 01 D2 C3 \n" +
  "24 01 C2 43 21 01 10 01 5F 42 19 18 47 18 0F 5F \n" +
  "5C 42 18 18 0C DF 10 01 A2 C3 1A 05 92 C3 1A 05 \n" +
  "D2 43 00 05 0C 43 10 01 BC F0 EF FF 00 00 4D 4D \n" +
  "8C DD 00 00 10 01 00 00 1C 42 C4 22 1D 43 B0 13 \n" +
  "34 B0 80 00 F4 B3 3F 43 1F 53 7E 4C 0E 93 FC 23 \n" +
  "CC 0F 10 01 3F 40 10 00 1F FC 08 00 CC 0F 10 01 \n" +
  "BC F0 EF FF 00 00 AC D3 00 00 10 01 4C 43 82 93 \n" +
  "62 18 01 20 5C 43 10 01 82 43 78 24 92 D3 1A 05 \n" +
  "0C 43 10 01 82 43 78 24 A2 D3 1A 05 0C 43 10 01 \n" +
  "1C 93 02 20 0C 43 10 01 2C 43 10 01 2C 93 02 20 \n" +
  "0C 43 10 01 2C 43 10 01 82 4C 9E 24 82 4D A0 24 \n" +
  "10 01 00 00 B0 13 64 B2 0C 93 FC 23 10 01 1D 83 \n" +
  "02 30 CD 18 0C 5C 10 01 BC F0 EF FF 00 00 10 01 \n" +
  "4D 4D 8C CD 1A 00 10 01 4D 4D 8C 4D 20 00 10 01 \n" +
  "0C 5D 9C C3 00 00 10 01 BC F0 CF FF 00 00 10 01 \n" +
  "B2 D0 20 00 AA 24 10 01 1C 4C 12 00 10 01 00 00 \n" +
  "8C CD 2C 00 10 01 00 00 9C D3 00 00 10 01 00 00 \n" +
  "8C CD 2A 00 10 01 00 00 9C C3 00 00 10 01 00 00 \n" +
  "8C DD 2A 00 10 01 00 00 AC C3 00 00 10 01 00 00 \n" +
  "8C DD 00 00 10 01 03 43 FF 3F 03 43 3C 40 05 00 \n" +
  "10 01 00 00 1C 42 66 18 10 01 00 00 1C 42 64 18 \n" +
  "10 01 1C 43 10 01 00 00 0C 43 10 01 1F 14 1F 42 \n" +
  "1E 05 2F 83 19 24 2F 83 39 20 1E 42 78 24 CF 0E \n" +
  "1F 53 82 4F 78 24 5F 4E 0C 22 82 4F 0E 05 3F 90 \n" +
  "3E 00 04 24 B2 90 47 00 78 24 28 28 A2 C3 1A 05 \n" +
  "92 43 7C 24 20 3C 03 43 1F 42 0C 05 4F 4F 3F 90 \n" +
  "3C 00 08 24 B2 90 47 00 78 24 06 2C 92 53 78 24 \n" +
  "03 3C 03 43 82 43 78 24 1E 42 78 24 CE 4F 0C 22 \n" +
  "3F 90 3E 00 04 24 B2 90 47 00 78 24 07 28 92 C3 \n" +
  "1A 05 92 43 7A 24 B1 C0 D0 00 08 00 1E 16 00 13 \n" +
  "1F 14 1F 42 EE 05 2F 82 2D 24 2F 82 27 24 3F 80 \n" +
  "0E 00 14 24 2F 83 2F 20 D2 92 88 24 8F 24 08 2C \n" +
  "5F 42 8F 24 5F 4F 4C 24 82 4F CE 05 03 3C 03 43 \n" +
  "A2 D2 C0 05 D2 53 8F 24 1E 3C 03 43 1F 42 CC 05 \n" +
  "5E 42 8E 24 CE 4F 4C 24 D2 53 8E 24 5F 42 8E 24 \n" +
  "5F 92 88 24 10 28 C2 43 8E 24 0A 3C D2 43 8C 24 \n" +
  "05 3C 03 43 C2 43 8E 24 D2 43 8B 24 C2 43 8F 24 \n" +
  "B1 C0 10 00 08 00 1E 16 00 13 00 00 4F 14 B2 90 \n" +
  "0C 00 1E 07 09 20 3C 40 00 07 B0 13 38 B4 82 4C \n" +
  "A2 24 B1 C0 10 00 14 00 4B 16 00 13 4F 14 3C 40 \n" +
  "C0 03 B0 13 28 B4 3C 40 C0 03 B0 13 68 B4 92 43 \n" +
  "92 24 B1 C0 D0 00 14 00 4B 16 00 13 31 40 00 30 \n" +
  "B0 13 92 B4 0C 93 02 24 B0 13 94 A3 0C 43 B0 13 \n" +
  "B8 A2 1C 43 B0 13 76 B4 F2 C2 3D 02 F2 B2 21 02 \n" +
  "05 20 92 43 94 24 B1 C0 D0 00 00 00 00 13 00 00 \n" +
  "A2 93 04 03 05 20 92 43 90 24 B1 C0 D0 00 00 00 \n" +
  "00 13 32 D0 10 00 FD 3F 03 43 \n" +
  "@ff80\n" +
  "FF FF FF FF FF FF FF FF FF FF FF FF \n" +
  "@ffa0\n" +
  "FF FF \n" +
  "@ffce\n" +
  "F8 B5 22 B6 22 B6 22 B6 \n" +
  "@ffda\n" +
  "22 B6 9C B5 20 B5 22 B6 22 B6 9C B4 22 B6 10 B6 \n" +
  "22 B6 22 B6 22 B6 22 B6 22 B6 BC B5 22 B6 22 B6 \n" +
  "22 B6 22 B6 DC B5 \n" +
  "q\n"
var titxt = new TiTxtModel(titxtstr);

var pkt = crccheckcmd.bsldatapacket()
alert(pkt);
