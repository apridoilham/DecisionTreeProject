# 🌳 Pohon Keputusan Pintar

[](https://www.python.org/) [](https://flask.palletsprojects.com/) [](https://tailwindcss.com/) [](https://alpinejs.dev/)

Aplikasi web untuk membangun dan memvisualisasikan pohon keputusan (Decision Tree) secara interaktif. Dibuat dengan backend Python/Flask dan frontend dinamis menggunakan Alpine.js & Tailwind CSS.

## 🚀 Fitur Utama

  - **Input Data Interaktif**: Masukkan parameter dan dataset pelatihan langsung melalui antarmuka web.
  - **Visualisasi Real-time**: Hasilkan diagram pohon keputusan (dendrogram) secara instan setelah data dimasukkan.
  - **Kontrol Visualisasi**: Lakukan zoom, geser (pan), dan unduh gambar pohon keputusan dengan mudah.
  - **Data Contoh**: Muat data contoh dengan satu kali klik untuk mencoba fungsionalitas aplikasi dengan cepat.
  - **Log Proses**: Lacak langkah-langkah yang diambil oleh algoritma untuk membangun pohon melalui panel log.
  - **Desain Modern**: Antarmuka yang bersih, responsif, dan modern dengan tema terang.

## 🛠️ Teknologi yang Digunakan

  - **Backend**: Python, Flask
  - **Frontend**: Tailwind CSS, Alpine.js
  - **Visualisasi**: Graphviz (digunakan oleh Python)
  - **Logika Inti**: Pandas, NumPy, Anytree

## ⚙️ Panduan Instalasi & Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda.

### Prasyarat

  - [Python](https://www.python.org/downloads/) (versi 3.11 atau lebih baru)
  - [Node.js](https://nodejs.org/) dan npm (untuk kompilasi Tailwind CSS)
  - [Graphviz](https://graphviz.org/download/) (program ini harus terinstal di sistem Anda agar visualisasi dapat dibuat)

### Langkah-langkah Instalasi

1.  **Clone repositori ini:**

    ```bash
    git clone https://github.com/USERNAME/NAMA_REPOSITORI.git
    cd NAMA_REPOSITORI
    ```

    *(Ganti `USERNAME` dan `NAMA_REPOSITORI` dengan milik Anda)*

2.  **Buat dan aktifkan virtual environment:**

    ```bash
    # Membuat environment
    python3 -m venv .venv

    # Mengaktifkan environment (macOS/Linux)
    source .venv/bin/activate

    # Mengaktifkan environment (Windows)
    # .venv\Scripts\activate
    ```

3.  **Instal dependensi Python:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Instal dependensi Node.js:**

    ```bash
    npm install
    ```

5.  **Kompilasi (build) file CSS Tailwind:**

    ```bash
    # Untuk build sekali pakai (production)
    npm run build

    # Atau, untuk development (otomatis build ulang saat ada perubahan)
    npm run dev
    ```

6.  **Jalankan aplikasi Flask:**

    ```bash
    flask run
    ```

7.  **Buka aplikasi:**
    Buka browser Anda dan kunjungi alamat `http://127.0.0.1:5000`.

### Cara Menggunakan

1.  **Masukkan Parameter**: Pada kolom "Daftar Parameter", masukkan nama-nama atribut dipisahkan koma. Parameter terakhir akan dianggap sebagai kelas target.
2.  **Masukkan Dataset**: Pada area "Dataset Pelatihan", masukkan data Anda. Setiap baris mewakili satu entri data, dan nilai di dalamnya dipisahkan oleh koma.
3.  **Bangun Pohon**: Klik tombol "Bangun Pohon" untuk memproses data dan melihat visualisasinya.
4.  **Gunakan Contoh**: Klik "Muat Contoh" untuk mengisi form dengan data sampel secara otomatis.

## 📁 Struktur Proyek

```
/
├── .venv/
├── node_modules/
├── static/
│   ├── css/
│   │   ├── main.css      # File sumber Tailwind CSS
│   │   └── output.css    # File CSS yang dikompilasi
│   └── js/
│       └── main.js       # Logika frontend Alpine.js
├── templates/
│   └── index.html        # Halaman utama aplikasi
├── .gitignore            # Mengabaikan file yang tidak perlu
├── app.py                # Aplikasi utama Flask
├── package.json          # Dependensi Node.js
├── postcss.config.js
├── README.md
├── requirements.txt      # Dependensi Python
└── tailwind.config.js    # Konfigurasi Tailwind CSS
```

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://www.google.com/search?q=LICENSE).