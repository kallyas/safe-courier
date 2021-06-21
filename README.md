# safe-courier
Safe courier is a courier service that helps users deliver parcels to different destinations. <br>
safe courier provides courier quotes based on weight categories

### Requirements
1. Node JS
2. Mongo DB for backend database

### Environment Variables
### `.env` file for server
```.env
PORT= specify port
DB_URL_LOC= specify mongodb url 
SECRET= specify secret key
NODE_ENV=local
ACCESS_TOKEN_SECRET=specify access token secret
REFRESH_TOKEN_SECRET=specify refresh token secret
```
<br>

### `.env` file for client
```.env
REACT_APP_API_URL= specify API URL
```

### How to run
`git clone` the repository or [download the Zip](https://github.com/kallyas/safe-courier/archive/refs/heads/develop.zip) file. 
<br>
use the [develop](https://github.com/kallyas/safe-courier/) branch<br>
run `npm install` to install dependencies<br>
run `concurrently \"cd server && npm install\" \"cd client && npm install\""` to install dependencies in both client and server folders<br>
run `npm run start` to start server and client<br>


### Preview
[API](https://safe-courier-backend-api.herokuapp.com/api/v1/)<br>
[API DOCS](https://safe-courier-backend-api.herokuapp.com/api/v1/api-docs/)<br>
[Front End](https://safe-courier-front-end.netlify.app)<br>
