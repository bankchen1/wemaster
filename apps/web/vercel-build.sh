#!/bin/bash
cd ../..
npm install
npm run build
cd apps/web
npm run build
