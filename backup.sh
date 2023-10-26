#!/bin/sh
echo "Backup"

tar --exclude='node_modules' --exclude='dist' --exclude='.git' -czvf ../bkp/sbraf2-$(date +%Y-%m-%d).tar.gz .
echo "backup to Google Drive"
rclone copy ../bkp/sbraf2-$(date +%Y-%m-%d).tar.gz gdrive:/temp/
