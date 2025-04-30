#!/usr/bin/env bash
echo "Running composer"
composer install --no-dev --working-dir=/var/www/html

echo "Node install"
npm ci
npm run build

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations and seeding..."
php artisan migrate:fresh --seed

# echo "Seeding database..."
# php artisan db:seed --force