# Algorithmic Hub

An interactive algorithm and architecture decision hub with a small Express/MongoDB API.

## Get the project

If you have been added as a collaborator, accept the GitHub invitation first. Then clone the repository:

```bash
git clone https://github.com/harsha312007-netizen/algorithmic-hub.git
cd algorithmic-hub
```

Anyone can view and clone this public repository. Collaborators who have accepted their invitation can also push changes.

## Requirements

- Node.js 20.19 or later and npm
- MongoDB running locally, or a MongoDB connection URI
- A local static web server for the frontend (for example, the VS Code Live Server extension)

## Start the backend

In a terminal, from the repository root:

```bash
cd backend
npm install
npm start
```

The API runs at `http://localhost:5000`. On its first connection to an empty database, it seeds example algorithms and architecture decision records.

By default, the backend connects to MongoDB at `mongodb://127.0.0.1:27017/algorithmic_hub`. To use another MongoDB instance, set `MONGO_URI` in the environment before starting the server. For example, in PowerShell:

```powershell
$env:MONGO_URI = "your-mongodb-connection-uri"
npm start
```

Do not commit database credentials or other secrets to GitHub.

## Start the frontend

Leave the backend running. Open the repository's `frontend` folder in VS Code, right-click `index.html`, and select **Open with Live Server**. The frontend uses the API at `http://localhost:5000/api`.

Alternatively, serve the `frontend` folder with any local static web server and open the URL it provides.

## Contribute

Create a branch for your work, then commit and push it:

```bash
git switch -c my-change
git add .
git commit -m "Describe your change"
git push -u origin my-change
```

Open a pull request on GitHub to propose merging your branch into `main`. You can also use GitHub Desktop or VS Code's Source Control panel.
