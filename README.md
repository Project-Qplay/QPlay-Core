# Quantum Quest (QPlay-Core)

Quantum Quest is a fun quantum-themed game. This project has two parts:
- **Frontend**: The game you see and play (React)
- **Backend**: The server that saves your progress and scores (Python Flask)

---

## How to Run the App

### 1. Get Ready
- Make sure you have **Node.js** (for the frontend) and **Python 3** (for the backend) installed.

### 2. Install Everything
- Open a terminal in the main project folder.
- Run this to install the frontend:
  ```sh
  npm install
  ```
- Then go to the backend folder and install the backend:
  ```sh
  cd backend
  pip install -r requirements.txt
  ```

### 3. Set Up the Backend
- In the `backend` folder, make a file called `.env` and add your Supabase info:
  ```
  SUPABASE_URL=your-supabase-url
  SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_KEY=your-service-key
  ```

### 4. Start the Backend
- In the `backend` folder, run:
  ```sh
  python production_server.py
  ```

### 5. Start the Frontend
- In the main folder, run:
  ```sh
  npm run dev
  ```
- Open the link it shows (usually http://localhost:5173) in your browser.

---

## How the Project is Organized

- `backend/` — Python server code
- `src/` — All the game code (React)
- `index.html` — Main HTML file
- `.env` — Your secret keys (not shared)

---

## Credits

- Cat 3D model used in the game: [LowPoly Cat Rig + Run Animation](https://sketchfab.com/3d-models/lowpoly-cat-rig-run-animation-c36df576c9ae4ed28e89069b1a2f427a) by Omabuarts Studio on Sketchfab

---