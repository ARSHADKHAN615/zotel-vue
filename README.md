# Zotel - Hotel Booking System

A modern hotel booking system built with Laravel and Vue.js, featuring room management, booking calendar, and dark mode support.

## Features

- User authentication and authorization
- Room management
- Booking system
- Interactive calendar view
- Dark/Light theme toggle
- Responsive design

## Tech Stack

- Laravel 12
- Vue.js 3
- Inertia.js
- Tailwind CSS
- MySQL

## Prerequisites

- PHP >= 8.1
- Composer
- Node.js & npm
- MySQL

## Setup Guide

1. Clone the repository
```bash
git clone <repository-url>
cd zotel-vue
```

2. Install PHP dependencies
```bash
composer install
```

3. Install JavaScript dependencies
```bash
npm install
```

4. Create and configure environment file
```bash
cp .env.example .env
# Configure your database and other settings in .env
```

5. Generate application key
```bash
php artisan key:generate
```

6. Run database migrations and seeders
```bash
php artisan migrate --seed
```

7. Start the development server
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite development server
npm run dev
```

Visit http://localhost:8000 to access the application.
