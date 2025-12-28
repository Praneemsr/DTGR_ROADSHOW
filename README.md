# Microsoft Event Page - Implementation

This project recreates a Microsoft-style event registration page based on the structure analysis document.

## File Structure

```
/project-root
├── index.html          # Main HTML file with event page structure
├── css/
│   └── styles.css      # All styling including layout, typography, and responsive design
├── js/
│   └── scripts.js      # Form handling and submission logic
├── images/
│   └── event-banner.jpg  # Background banner image for event hero section (placeholder needed)
├── database/
│   └── registrations.db  # SQLite database (created automatically)
├── server.js          # Express server with API endpoints
├── init-db.js         # Database initialization script
├── export-csv.js      # CSV export script (runs locally)
├── package.json       # Node.js dependencies and scripts
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Image Assets Required

The page expects the following image in the `images/` directory:

- **event-banner.jpg**: A background banner image for the event hero section. This should be a high-quality image (recommended: 1920x600px or larger) that will be used as the background for the event information and registration form section.

### Adding Your Image

1. Place your banner image in the `images/` folder
2. Name it `event-banner.jpg` (or update the CSS file `css/styles.css` line 3 to match your filename)
3. The image will automatically be used as the background for the event hero section

If you don't have an image yet, the page will still work but the background will not display. You can use any image editing tool or find a suitable stock image for your event.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Form Validation**: Client-side validation for all required fields
- **Modern UI**: Clean, Microsoft-style design with Fluent UI principles
- **Accessibility**: Proper labels, form structure, and keyboard navigation support
- **Database Storage**: SQLite database to store all registrations
- **CSV Export**: Export all registrations to CSV file locally

## Database Setup and Usage

This project uses SQLite (the easiest database solution) to store registrations locally.

### Prerequisites

1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - Install the LTS version
   - Verify installation: Open PowerShell and run `node --version`

### Installation Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database** (optional - database auto-creates on first server start):
   ```bash
   npm run init-db
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`

4. **Open the Event Page**:
   - Open `http://localhost:3000` in your browser
   - The registration form will now save data to the SQLite database

### Exporting Registrations to CSV

To export all registered attendees to a CSV file **locally** (not on the website):

1. **Make sure the server is running** (or has been run at least once to create the database)

2. **Run the export script**:
   ```bash
   npm run export-csv
   ```

3. **Find the CSV file**:
   - The CSV file will be created in the project root directory
   - Filename format: `registrations_YYYY-MM-DDTHH-MM-SS.csv`
   - Example: `registrations_2025-12-28T17-30-45.csv`

4. **Open the CSV**:
   - Open the CSV file in Excel, Google Sheets, or any spreadsheet application
   - The file contains: ID, First Name, Last Name, Email, Phone Country, Phone Number, Full Phone, Job Role, Company, Country, Registration Date

### Database Location

- Database file: `database/registrations.db`
- Created automatically when the server starts
- Stored locally on your computer (not on the website)

### Available NPM Scripts

- `npm start` - Start the server (runs on port 3000)
- `npm run init-db` - Initialize/create the database
- `npm run export-csv` - Export all registrations to CSV file

### API Endpoints

- `POST /api/register` - Register a new attendee
- `GET /api/registrations` - Get all registrations (for testing)
- `GET /api/health` - Health check endpoint

## Customization

### Changing Event Details

Edit `index.html` to update:
- Event title
- Date and time
- Location
- Description
- Timezone information

### Changing Colors

Edit `css/styles.css` to customize:
- Primary button color (currently Microsoft blue #0078D4)
- Background colors
- Text colors
- Border colors

### Connecting to Backend API

The form is already connected to the local backend API. The frontend sends data to `http://localhost:3000/api/register`.

**Note**: Make sure the server is running (`npm start`) before submitting the form, otherwise you'll get a connection error.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Usage

1. Open `index.html` in a web browser
2. Fill out the registration form
3. Submit to test the form validation and submission flow

## Notes

- The form currently shows a success message on submission (demo mode)
- To actually save registrations, you'll need to connect it to a backend API
- All form fields match the expected structure from the analysis document
- The page includes a simplified Microsoft-style header and footer for branding consistency

---

## Hosting on GitHub Pages

This project can be easily hosted on GitHub Pages for free. Follow these step-by-step instructions:

### Prerequisites

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/downloads
   - Follow the installation wizard
   - Verify installation by opening a terminal and running: `git --version`

2. **Create a GitHub Account** (if you don't have one):
   - Sign up at: https://github.com/signup

### Step-by-Step Instructions

#### Step 1: Create a New Repository on GitHub

1. Go to https://github.com/new
2. **Repository name**: Enter a name (e.g., `dtgr-roadshow` or `microsoft-event-page`)
3. **Description**: (Optional) Add a description
4. **Visibility**: Choose **Public** (required for free GitHub Pages) or **Private** (requires GitHub Pro for Pages)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

#### Step 2: Initialize Git in Your Project

Open PowerShell or Command Prompt in your project folder and run:

```bash
# Navigate to your project directory (if not already there)
cd "C:\Users\v-praneethsr\OneDrive - Microsoft\Desktop\DTGR_ROADSHOW"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create your first commit
git commit -m "Initial commit: Microsoft Event Page"
```

#### Step 3: Connect to GitHub Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: You'll be prompted for your GitHub username and password. For password, use a **Personal Access Token** (not your GitHub password). See below for how to create one.

#### Step 4: Create a Personal Access Token (if needed)

If Git asks for authentication:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Give it a name (e.g., "GitHub Pages Deployment")
4. Select scopes: Check **repo** (full control of private repositories)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when Git prompts you

#### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**

#### Step 6: Access Your Live Site

1. GitHub will provide your site URL in the format:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```
2. It may take a few minutes (up to 10 minutes) for the site to be available
3. You'll see a green checkmark when deployment is complete
4. The URL will be displayed in the Pages settings section

### Updating Your Site

Whenever you make changes to your site:

```bash
# Add changed files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

Your site will automatically update within a few minutes!

### Custom Domain (Optional)

If you have a custom domain:

1. In GitHub Pages settings, enter your custom domain
2. Add a `CNAME` file in your repository root with your domain name
3. Configure DNS records with your domain provider

### Troubleshooting

**Issue: Site shows 404 error**
- Wait 5-10 minutes after enabling Pages
- Check that `index.html` is in the root directory
- Verify the branch is set to `main` in Pages settings

**Issue: Styles/CSS not loading**
- Ensure all file paths in `index.html` are relative (e.g., `css/styles.css` not `/css/styles.css`)
- Check that all files are committed and pushed to GitHub

**Issue: Images not displaying**
- Check that image files are in the repository
- Verify image paths in your HTML/CSS are correct

**Issue: Git authentication errors**
- Use Personal Access Token instead of password
- Ensure token has `repo` scope enabled

### Quick Reference Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# View remote URL
git remote -v
```

---

## Support

For GitHub Pages documentation, visit: https://docs.github.com/en/pages

