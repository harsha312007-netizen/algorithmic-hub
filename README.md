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

## Deploy a public version

The repository includes a Render Blueprint that serves both the frontend and API from one public URL. A MongoDB Atlas database is required for the hosted app.

1. Create a free MongoDB Atlas cluster and a database user. In Atlas Network Access, allow connections from `0.0.0.0/0` so Render can connect; use a strong database password and never commit it.
2. Copy the Atlas connection string and select the `algorithmic_hub` database, for example:
   `mongodb+srv://<username>:<password>@<cluster-host>/algorithmic_hub?retryWrites=true&w=majority`
   Replace the placeholders with your database credentials and cluster host. URL-encode any special characters in the username or password.
3. Open [Render's Blueprint deployment page](https://render.com/deploy?repo=https://github.com/harsha312007-netizen/algorithmic-hub), connect the GitHub repository, and deploy the `render.yaml` Blueprint. Set `MONGO_URI` to the Atlas connection string when prompted.
4. Once the service is live, open the `.onrender.com` URL shown in the Render dashboard and share that URL with your friends.

The free Render web service may sleep when idle and take a short time to wake on the next visit. Keep the database URI private; do not add it to project files or GitHub.

## Contribute

Create a branch for your work, then commit and push it:

```bash
git switch -c my-change
git add .
git commit -m "Describe your change"
git push -u origin my-change
```

Open a pull request on GitHub to propose merging your branch into `main`. You can also use GitHub Desktop or VS Code's Source Control panel.
