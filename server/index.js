const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const allowedMimeTypes = [
  'text/plain',
  'application/octet-stream',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/tiff',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-msdownload',
];

// ----------- RLE Compression / Decompression (binary-safe) -----------
function rleCompress(buffer) {
  const output = [];
  let count = 1;
  for (let i = 1; i <= buffer.length; i++) {
    if (i < buffer.length && buffer[i] === buffer[i - 1] && count < 255) {
      count++;
    } else {
      output.push(count);
      output.push(buffer[i - 1]);
      count = 1;
    }
  }
  return Buffer.from(output);
}

function rleDecompress(buffer) {
  const output = [];
  for (let i = 0; i < buffer.length; i += 2) {
    const count = buffer[i];
    const byte = buffer[i + 1];
    for (let j = 0; j < count; j++) {
      output.push(byte);
    }
  }
  return Buffer.from(output);
}

// ----------- Huffman Compression / Decompression -----------
class Node {
  constructor(byte, freq, left = null, right = null) {
    this.byte = byte;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

function buildFrequencyMap(buffer) {
  const freq = {};
  for (const byte of buffer) freq[byte] = (freq[byte] || 0) + 1;
  return freq;
}

function buildHuffmanTree(freq) {
  const nodes = Object.entries(freq).map(
    ([byte, count]) => new Node(Number(byte), count)
  );
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push(new Node(null, left.freq + right.freq, left, right));
  }
  return nodes[0];
}

function generateCodes(node, prefix = '', codes = {}) {
  if (!node) return;
  if (node.byte !== null) {
    codes[node.byte] = prefix;
  }
  generateCodes(node.left, prefix + '0', codes);
  generateCodes(node.right, prefix + '1', codes);
  return codes;
}

function compressToBinaryString(buffer, codeMap) {
  let bitString = '';
  for (const byte of buffer) {
    bitString += codeMap[byte];
  }
  return bitString;
}

function binaryStringToBuffer(bitString) {
  const padding = (8 - (bitString.length % 8)) % 8;
  bitString += '0'.repeat(padding);
  const bytes = [padding];
  for (let i = 0; i < bitString.length; i += 8) {
    const byteStr = bitString.slice(i, i + 8);
    bytes.push(parseInt(byteStr, 2));
  }
  return Buffer.from(bytes);
}

function bufferToBinaryString(buffer) {
  let bitString = '';
  for (let i = 1; i < buffer.length; i++) {
    bitString += buffer[i].toString(2).padStart(8, '0');
  }
  const padding = buffer[0];
  return bitString.slice(0, bitString.length - padding);
}

function huffmanCompress(buffer) {
  const freq = buildFrequencyMap(buffer);
  const tree = buildHuffmanTree(freq);
  const codes = generateCodes(tree);
  const bitString = compressToBinaryString(buffer, codes);

  const freqStr = JSON.stringify(freq);
  const freqBuffer = Buffer.from(freqStr, 'utf8');
  const freqLenBuffer = Buffer.alloc(4);
  freqLenBuffer.writeUInt32BE(freqBuffer.length);

  const compressedBuffer = binaryStringToBuffer(bitString);

  return Buffer.concat([freqLenBuffer, freqBuffer, compressedBuffer]);
}

function huffmanDecompress(buffer) {
  const freqLen = buffer.readUInt32BE(0);
  const freqBuffer = buffer.slice(4, 4 + freqLen);
  const freq = JSON.parse(freqBuffer.toString('utf8'));

  const compressedBuffer = buffer.slice(4 + freqLen);
  const bitString = bufferToBinaryString(compressedBuffer);

  const tree = buildHuffmanTree(freq);
  let node = tree;
  const output = [];
  for (const bit of bitString) {
    node = bit === '0' ? node.left : node.right;
    if (node.byte !== null) {
      output.push(node.byte);
      node = tree;
    }
  }
  return Buffer.from(output);
}

// ----------- LZ77 Compression / Decompression -----------
function lz77Compress(buffer, windowSize = 255) {
  let i = 0;
  const output = [];
  while (i < buffer.length) {
    let match = { offset: 0, length: 0, next: buffer[i] };
    const start = Math.max(0, i - windowSize);
    const window = buffer.slice(start, i);
    for (let j = 0; j < window.length; j++) {
      let length = 0;
      while (
        i + length < buffer.length &&
        window[j + length] === buffer[i + length] &&
        j + length < window.length &&
        length < 255
      ) {
        length++;
      }
      if (length > match.length) {
        match = {
          offset: window.length - j,
          length,
          next: buffer[i + length] || 0,
        };
      }
    }
    output.push(match.offset);
    output.push(match.length);
    output.push(match.next);
    i += match.length + 1;
  }
  return Buffer.from(output);
}

function lz77Decompress(buffer) {
  let output = [];
  for (let i = 0; i < buffer.length; i += 3) {
    const offset = buffer[i];
    const length = buffer[i + 1];
    const next = buffer[i + 2];
    const start = output.length - offset;
    for (let j = 0; j < length; j++) {
      output.push(output[start + j]);
    }
    output.push(next);
  }
  return Buffer.from(output);
}

function readUploadedFile(filePath) {
  return fs.readFileSync(filePath);
}

// ----------------- ROUTES -----------------

app.get('/', (req, res) => {
  res.send('🟢 Compression backend is running');
});

app.post('/compress', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const mimeType = file.mimetype || 'application/octet-stream';
  if (!allowedMimeTypes.includes(mimeType)) {
    return res.status(400).json({ error: 'Invalid file format.' });
  }

  const algorithm = req.body.algorithm || 'rle';

  const buffer = readUploadedFile(file.path);
  const originalSizeBytes = buffer.length;
  const originalSizeKB = (originalSizeBytes / 1024).toFixed(2);

  let compressedBuffer;
  const startTime = Date.now();

  try {
    if (algorithm === 'rle') {
      compressedBuffer = rleCompress(buffer);
    } else if (algorithm === 'huffman') {
      compressedBuffer = huffmanCompress(buffer);
    } else if (algorithm === 'lz77') {
      compressedBuffer = lz77Compress(buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported algorithm' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Compression failed', details: err.message });
  }

  const compressedSizeBytes = compressedBuffer.length;
  const compressedSizeKB = (compressedSizeBytes / 1024).toFixed(2);
  const processingTime = Date.now() - startTime;
  const compressionRatio = ((compressedSizeBytes / originalSizeBytes) * 100).toFixed(2);

  res.json({
    fileName: `compressed-${file.originalname}`,
    compressedData: compressedBuffer.toString('base64'),
    originalSize: originalSizeKB,
    compressedSize: compressedSizeKB,
    compressionRatio,
    processingTime,
  });
});

app.post('/decompress', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const mimeType = file.mimetype || 'application/octet-stream';
  if (!allowedMimeTypes.includes(mimeType)) {
    return res.status(400).json({ error: 'Invalid file format.' });
  }

  const algorithm = req.body.algorithm || 'rle';

  const compressedBuffer = readUploadedFile(file.path);

  let decompressedBuffer;
  try {
    if (algorithm === 'rle') {
      decompressedBuffer = rleDecompress(compressedBuffer);
    } else if (algorithm === 'huffman') {
      decompressedBuffer = huffmanDecompress(compressedBuffer);
    } else if (algorithm === 'lz77') {
      decompressedBuffer = lz77Decompress(compressedBuffer);
    } else {
      return res.status(400).json({ error: 'Unsupported algorithm' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Decompression failed', details: err.message });
  }

  const ext = path.extname(file.originalname) || '';
  const outputFileName = `decompressed${ext}`;
  const outputMimeType = file.mimetype || 'application/octet-stream';

  res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
  res.setHeader('Content-Type', outputMimeType);
  res.send(decompressedBuffer);
});

// ----------------- SERVER -----------------

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

