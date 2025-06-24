import React from 'react';

function CompressionStats({ stats, type }) {
  if (!stats) return null;

  return (
    <div className="mt-6 p-4 border rounded bg-gray-100">
      <h2 className="text-lg font-bold mb-2">
        {type === 'compress' ? 'Compression Stats' : 'Decompression Stats'}
      </h2>
      {type === 'compress' && (
        <>
          <p><strong>Original Size:</strong> {stats.originalSize} KB</p>
          <p><strong>Compressed Size:</strong> {stats.compressedSize} KB</p>
          <p><strong>Compression Ratio:</strong> {stats.compressionRatio} %</p>
        </>
      )}
      <p><strong>Processing Time:</strong> {stats.processingTime} ms</p>
    </div>
  );
}

export default CompressionStats;
