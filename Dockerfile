# Langkah 1: Memulai dari image resmi Python 3.11
FROM python:3.11-slim

# Menetapkan direktori kerja di dalam container
WORKDIR /app

# Menginstal dependensi sistem: graphviz (WAJIB) dan nodejs/npm (untuk Tailwind CSS)
RUN apt-get update && apt-get install -y graphviz nodejs npm

# Menyalin file-file yang dibutuhkan untuk instalasi dependensi
COPY requirements.txt package.json package-lock.json* ./

# Menginstal dependensi Python
RUN pip install --no-cache-dir -r requirements.txt

# Menginstal dependensi Node.js
RUN npm install

# Menyalin seluruh kode proyek ke dalam container
COPY . .

# Menjalankan build Tailwind CSS di dalam container
RUN npm run build

# Memberitahu dunia luar bahwa container akan berjalan di port 10000
EXPOSE 10000

# Perintah untuk menjalankan aplikasi menggunakan Gunicorn saat container dimulai
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]