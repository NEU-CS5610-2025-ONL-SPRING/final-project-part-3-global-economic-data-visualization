Ziyi Wang, "Felix"
wang.ziyi18@northeastern.edu

# 🌐 Global Economic Data Visualization Dashboard

This is a full-stack SaaS web application built for the CS-5610 Final Project (Spring 2025).  
It allows users to manage and visualize country-level economic indicators using data from the World Bank API.

PLEASE NOTE:
My online deployment was not successful(possible CORS issue makes the frontend unable to fetch backend at render.com, while backend/database deployement was succeeful on render and railway.), this version was hardcoded with local environment.

You can check my deployed website built on another version of commit below, which is more buggy;
 This local hardcoded version is supposed to work better.

https://final-project-part-3-global-economic.onrender.com
https://final-project-part-3-global-economic-data-visualization.vercel.app/

check my video:

https://youtu.be/kL12JjuIme8


## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Prisma
- **Database**: MySQL (tested using Railway-hosted database)
- **External API**: World Bank Open Data API
- **Authentication**: Token-based (HTTP-only cookies)
- **Testing**: React Testing Library

---

## 🧪 Key Features

- User registration and login
- Protected CRUD operations for Indicators and Subscriptions
- External API integration to retrieve World Bank data
- Dynamic indicator visualization (chart-based)
- Accessibility and responsive UI
- Unit testing for critical React components

---

## 🚀 Local Development Setup

### 1. Clone the repository


### 2. Backend setup

cd api

npm install

Create .env file in api/ directory:

DATABASE_URL="mysql://your_user:your_password@localhost:3306/global_economic"

JWT_SECRET="your_super_secret"

Then run:

npx prisma generate

npx prisma db push

npm run dev

### 3. Frontend setup

cd ../client

npm install

Then run:

npm run dev



Frontend runs on http://localhost:5173.


## ✅ Testing
Run unit tests from the client/ directory:

npm run test


This will execute all unit tests using React Testing Library.

## ♿ Accessibility
Accessibility was validated using Google Lighthouse.
Reports for Login Page, Subscription List, and Detail View are included in the accessibility_reports/ folder.
All scores ≥ 80.


## 🙏 Acknowledgements
CS-5610 Final Project, Northeastern University

World Bank Open Data API
