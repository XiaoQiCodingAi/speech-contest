#!/bin/bash
cd /root/.openclaw/workspace/projects/speech-contest-backend
pm2 start server.js --name speech-contest-api
