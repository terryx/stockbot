## Project Overview
This bot get data from [iextrading](https://iextrading.com/) and send notifications via telegram every 5 minutes.
There are some business logic such as metric signal and trigger time are not configurable yet.

### Development workflow
```
# Add a config file from sample, replace the content with your own setting
cp config.sample config.prd.js

# Build node dependencies, you'll need to rebuild because serverless OS is on Linux
# while in development mode most likely in Mac. This causes talib not work as binary differ
npm run build

# Verify if everything works
npm test
```

### Deployment worklflow
```
# Create a container to hold dependencies
docker-compose up --build -d

# SSH into container
docker exec -it stockbot /bin/bash

# Rebuild dependencies which suitable for lambda
npm run build

# Exit docker container and deploy
exit
npm run deploy
```