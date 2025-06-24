import React, { useState, useEffect } from 'react';

function App() {
  // Load Poppins font once on mount
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState('huffman');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState('');
  const [metadata, setMetadata] = useState(null);

  const allowedTypes = [
    'text/plain', 'application/octet-stream', 'image/png', 'image/jpeg',
    'image/jpg', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff',
    'image/svg+xml', 'application/pdf', 'application/zip',
    'application/x-rar-compressed', 'application/x-7z-compressed',
    'application/x-msdownload',
  ];

  const algorithmDescriptions = {
    huffman:
      `Huffman Coding is a lossless compression algorithm that assigns shorter binary codes to more frequent bytes, and longer codes to less frequent ones. ` +
      `It builds a binary tree based on frequencies of data symbols to minimize the overall encoding size. ` +
      `This algorithm is widely used for text and general data compression where efficiency and exact data recovery are important.`,
    rle:
      `Run-Length Encoding (RLE) compresses data by replacing sequences of repeated bytes with a count and a single instance of the byte. ` +
      `It's very effective for data with lots of repeated values like simple graphics or runs of identical characters. ` +
      `However, it may increase size if the input data has little repetition, so it’s best suited for specific data types.`,
    lz77:
      `LZ77 is a dictionary-based compression method that replaces repeated occurrences of data with references (offset and length) to a previous occurrence in a sliding window. ` +
      `It can handle more complex data patterns and is effective for images, binaries, and other files with repeated sequences. ` +
      `LZ77 is a foundation for many popular compression formats like ZIP and PNG.`,
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const fileType = selected.type || 'application/octet-stream';
    if (!allowedTypes.includes(fileType)) {
      setMessage('❌ Invalid file format.');
      setFile(null);
      setPreview('');
      setMetadata(null);
      return;
    }

    setFile(selected);
    setMessage('');
    setStats(null);
    setMetadata({
      name: selected.name,
      sizeKB: (selected.size / 1024).toFixed(2),
    });

    const reader = new FileReader();
    if (fileType.startsWith('text')) {
      reader.readAsText(selected);
      reader.onload = () => setPreview(reader.result.slice(0, 500));
    } else if (fileType.startsWith('image')) {
      reader.readAsDataURL(selected);
      reader.onload = () => setPreview(reader.result);
    } else {
      setPreview('');
    }
  };

  const handleAlgorithmChange = (e) => {
    const newAlgo = e.target.value;
    setAlgorithm(newAlgo);
    if (file && file.type?.startsWith('image') && newAlgo !== 'lz77') {
      setMessage('⚠️ Use LZ77 for images.');
    } else {
      setMessage('');
    }
  };

  const handleSubmit = async (action) => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    // Removed blocking for Huffman/RLE on images to allow operation but keep warning.

    setLoading(true);
    setMessage('');
    setStats(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);
    const endpoint = action === 'compress' ? 'compress' : 'decompress';

    try {
const response = await fetch(`https://file-compressor-kzbl.onrender.com/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(`Error: ${error.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      if (action === 'compress') {
        const json = await response.json();
        const blob = new Blob([Uint8Array.from(atob(json.compressedData), c => c.charCodeAt(0))], {
          type: 'application/octet-stream',
        });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = json.fileName;
        a.click();

        setStats({
          type: 'compression',
          originalSize: json.originalSize,
          compressedSize: json.compressedSize,
          compressionRatio: json.compressionRatio,
          processingTime: json.processingTime,
        });

        setMessage('✅ Compression complete!');
      } else {
        const blob = await response.blob();
        const filename = response.headers
          .get('Content-Disposition')
          ?.match(/filename="?([^"]+)"?/)?.[1] || 'decompressed-output';

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();

        const decompressionTime = Math.round(performance.now());
        setStats({
          type: 'decompression',
          decompressedSize: (blob.size / 1024).toFixed(2),
          processingTime: decompressionTime,
        });

        setMessage('✅ Decompression complete!');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Server error.');
    }

    setLoading(false);
  };

  return (
    <div
      className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow font-poppins"
      style={{
        background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Compression & Decompression Portal</h1>

      {/* Custom file select button */}
      <div className="mb-4 flex justify-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow transition duration-300"
        >
          Select File
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="mb-6 flex justify-center items-center">
        <label className="block mb-2 font-semibold text-gray-700 mr-4">Choose Algorithm:</label>
        <select
          value={algorithm}
          onChange={handleAlgorithmChange}
          className="border p-2 rounded max-w-xs"
        >
          <option value="huffman">Huffman Coding</option>
          <option value="rle">Run-Length Encoding (RLE)</option>
          <option value="lz77">LZ77</option>
        </select>
      </div>

      {preview && (
        <div className="flex flex-row gap-6 items-start justify-center">
          {/* Preview Box */}
          <div className="flex-shrink-0">
            <h2 className="font-semibold mb-2 text-gray-800">🔍 Preview:</h2>
            {file.type.startsWith('image') ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 rounded border mb-4 shadow"
              />
            ) : (
              <pre
                className="bg-gray-200 p-4 rounded max-h-48 overflow-y-auto text-sm whitespace-pre-wrap mb-4 w-80"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                {preview}
              </pre>
            )}

            {/* Buttons below preview, bigger with shadow and smooth hover */}
            <div className="flex space-x-6 mt-2">
              <button
                onClick={() => handleSubmit('compress')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded font-semibold text-lg disabled:opacity-50 shadow transition duration-300"
              >
                {loading ? 'Processing...' : 'Compress'}
              </button>
              <button
                onClick={() => handleSubmit('decompress')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded font-semibold text-lg disabled:opacity-50 shadow transition duration-300"
              >
                {loading ? 'Processing...' : 'Decompress'}
              </button>
            </div>
          </div>

          {/* Metadata to right of preview */}
          <div className="bg-gray-100 p-4 rounded shadow text-gray-800 self-start w-64">
            {metadata && (
              <>
                <p>📄 <strong>Name:</strong> {metadata.name}</p>
                <p>📁 <strong>Size:</strong> {metadata.sizeKB} KB</p>
              </>
            )}
          </div>
        </div>
      )}

      {message && <p className="text-center text-gray-700 font-medium my-6">{message}</p>}

      {stats && (
        <div className="mt-4 p-6 border rounded bg-gray-100 text-gray-900 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            {stats.type === 'compression' ? '📊 Compression Stats' : '📊 Decompression Stats'}
          </h2>
          {stats.originalSize && <p>🗂️ Original Size: <strong>{stats.originalSize} KB</strong></p>}
          {stats.compressedSize && <p>📦 Compressed Size: <strong>{stats.compressedSize} KB</strong></p>}
          {stats.compressionRatio && <p>📉 Compression Ratio: <strong>{stats.compressionRatio} %</strong></p>}
          {stats.decompressedSize && <p>📂 Decompressed Size: <strong>{stats.decompressedSize} KB</strong></p>}
          <p>⏱️ Processing Time: <strong>{stats.processingTime} ms</strong></p>
        </div>
      )}

      <div className="mt-10 p-6 border border-black bg-white text-black rounded max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">Algorithm Explanation:</h3>
        <p>{algorithmDescriptions[algorithm]}</p>
      </div>
    </div>
  );
}

export default App;
