## WIP

## Welcome to the respository for the War Beasts! web app.

## Architecture

### Frontend

React 19, NextJS, MUI + Styled Components - Themes and styles benchmarked from multiple MUI products, Charts - Apex Charts

I might migrate to Typescript later on, but I'm prioritizing feature development over code cleanliness and refactoring.

### Backend

Firebase for Authorization, File storage and NoSQL DB. DB mostly stores massive collections of seasonal game data for multiple kingdoms.

Redis is used to cache metrics - Invalidation occurs during new data upload

NextJS API Routes handle the APIs for the web app.

