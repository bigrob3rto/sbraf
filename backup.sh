#!/bin/sh
echo "Backup"

tar --exclude='node_modules' --exclude='dist' --exclude='.git' -czvf ../bkp/sbraf2-$(date +%Y-%m-%d).tar.gz .
