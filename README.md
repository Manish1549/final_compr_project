# file-compressor

## Project Description  
Data Compression Portal is a web-based application that allows users to compress and decompress files using popular algorithms such as Huffman Coding, Run-Length Encoding (RLE), and LZ77. The portal supports multiple file types including text, images, and binary files, providing file previews, detailed compression statistics, and an easy-to-use interface.

## Features  
- Upload files of various formats: text, images, and binaries.  
- Compress and decompress files using Huffman Coding, RLE, and LZ77 algorithms.  
- Preview uploaded files before processing (text and image preview supported).  
- Display detailed statistics on compression ratio, original vs compressed size, and processing time.  
- Warn users if certain algorithms may not perform optimally on the selected file type.  
- Download the processed files with preserved file extensions.  
- Responsive and user-friendly interface styled with Tailwind CSS.  
- Backend API with Node.js and Express handling file uploads and compression logic.

## Tech Stack  

**Frontend:**  
- React.js — For building the interactive user interface  
- Tailwind CSS — For styling and responsive design  
- Poppins Google Font — For modern typography  
- Axios — For HTTP requests to backend APIs  

**Backend:**  
- Node.js — JavaScript runtime environment  
- Express.js — Web framework for creating REST APIs  
- Multer — Middleware for handling multipart/form-data (file uploads)  
- Compression algorithms implemented in JavaScript:  
  - Huffman Coding  
  - Run-Length Encoding (RLE)  
  - LZ77 Compression  

**Other Tools:**  
- Cors — To enable cross-origin resource sharing between frontend and backend  

## Setup Instructions to Run the Project Locally

### Prerequisites  
- Make sure you have **Node.js** (v14 or later) installed on your machine.  
- You also need **npm** (comes with Node.js) or **yarn** as your package manager.

---

### Step 1: Clone the Repository  
If you haven’t cloned the project repository yet, do it now:

```
git clone <your-repo-url>
cd <your-project-folder>
```
// Change this in src inside client (app.js):
   // fetch(`https://my-compression-api.onrender.com/${endpoint}`, { ... })

   // To this for local development:
   fetch(`http://localhost:5000/${endpoint}`, { ... })

---

### Step 2: Install Backend Dependencies  
Navigate to the backend folder (or root if backend is in root):

```
cd server
npm install
```

This will install all required packages including Express, Multer, and other dependencies.

---

### Step 3: Start the Backend Server  

Run the backend server:

```
npm start

```
or directly : 

```
node index.js

```

By default, the backend server will run on http://localhost:5000

---

### Step 4: Install Frontend Dependencies  
Open a new terminal window/tab, navigate to the frontend folder :

```
cd client
npm install
```

This installs React, Tailwind CSS, Axios, and other frontend dependencies.

---

### Step 5: Start the Frontend Development Server  

Run the React app:

```
npm start
```

The frontend app will launch in your browser at http://localhost:3000

---

### Step 6: Use the Application  
- Upload files on the frontend interface.  
- Choose compression/decompression algorithms.  
- Process files and download results.

---

### Optional: Environment Variables  
change the port address in the compress section of index.js and app.js 

```
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

Make sure to restart servers after adding environment variables.

---

## Deployed Demo  
https://file-compressor-kzbl.onrender.com
https://file-compressor-m46m.vercel.app/
