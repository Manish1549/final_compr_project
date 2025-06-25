Here’s your updated, polished, and **rendered `README.md`** version of the **Data Compression Portal** — ready to upload to your GitHub repo:

---

````markdown
# 🗜️ Data Compression Portal

A web-based application that enables users to **compress and decompress files** using widely known algorithms such as **Huffman Coding**, **Run-Length Encoding (RLE)**, and **LZ77**. It supports multiple file types including text, images, and binaries, and offers real-time previews, compression statistics, and a clean, responsive UI.

---

## 🚀 Features

- 📁 Upload files of various formats: text, images, binaries
- 📦 Compress and decompress using:
  - Huffman Coding
  - Run-Length Encoding (RLE)
  - LZ77
- 🔍 Preview uploaded files (text or image)
- 📊 Detailed compression stats:
  - Original vs. compressed size
  - Compression ratio
  - Processing time
- ⚠️ Algorithm suitability warnings for file types
- 📥 Download processed files with correct extensions
- 💡 Smooth, responsive UI with Tailwind CSS

---

## 🧱 Tech Stack

### 🖥️ Frontend
- **React.js** – UI framework
- **Tailwind CSS** – Utility-first styling
- **Axios** – API interaction
- **Google Fonts (Poppins)** – Typography

### ⚙️ Backend
- **Node.js + Express** – Server and API handling
- **Multer** – File upload middleware
- **Custom JS Implementations** of:
  - Huffman Coding
  - Run-Length Encoding
  - LZ77

### 🧰 Tools
- **CORS** – Cross-Origin Resource Sharing

---

## 🛠️ Setup Instructions

### ✅ Prerequisites
- Node.js (v14+)
- npm or yarn

---

### 🔄 Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
````

> 🔧 In `App.js` (inside `client/src`), modify the backend endpoint for local development:

```js
// Change this:
fetch(`https://file-compressor-kzbl.onrender.com/${endpoint}`)

// To this:
fetch(`http://localhost:5000/${endpoint}`)
```

---

### 📦 Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

---

### ▶️ Step 3: Start the Backend Server

```bash
npm start
```

Or directly:

```bash
node index.js
```

Backend will run on [http://localhost:5000](http://localhost:5000)

---

### 💻 Step 4: Install Frontend Dependencies

Open a new terminal:

```bash
cd client
npm install
```

---

### ▶️ Step 5: Start the Frontend React App

```bash
npm start
```

Frontend will run on [http://localhost:3000](http://localhost:3000)

---

### ⚙️ Optional: Environment Variables

Example setup in `.env`:

```env
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

Restart both frontend and backend after making changes.

---

## 🌐 Deployed Demo

* Backend: [https://file-compressor-kzbl.onrender.com](https://file-compressor-kzbl.onrender.com)
* Frontend: [https://file-compressor-m46m.vercel.app](https://file-compressor-m46m.vercel.app)

---

## 👨‍💻 Author

**Manish Saharan**
*B.Tech, Electrical Engineering, IIT Roorkee*
[GitHub](https://github.com/Manish1549) • [LinkedIn](https://linkedin.com/in/manish-saharan)

---

## 📄 License

Licensed under [MIT License](LICENSE)

---

## ✅ Status

🎯 **Ready for production**
💬 Pull requests, feedback, and forks welcome!

```

---

Let me know if you'd like me to:
- Auto-generate a `.gitignore` for this project
- Create a `package.json` template
- Add deployment instructions (Vercel + Render combo)  
- Include badges (CI, License, Demo)

Just say the word.
```
