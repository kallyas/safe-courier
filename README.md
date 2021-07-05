![safe-courier](https://socialify.git.ci/kallyas/safe-courier/image?description=1&font=Raleway&logo=https%3A%2F%2Fi.imgur.com%2Fo1KgON7.png&owner=1&theme=Light)
# safe-courier

Safe courier is a courier service that helps users deliver parcels to different destinations. <br>
safe courier provides courier quotes based on weight categories

### Requirements

1. Node JS
2. Mongo DB for backend database

### Tech Stack

1. Node JS
2. React JS
3. Mongo DB

### Environment Variables

### `.env` file for server

```bash
PORT= specify port
DB_URL_LOC= specify mongodb url
SECRET= specify secret key
NODE_ENV=local
ACCESS_TOKEN_SECRET=specify access token secret
REFRESH_TOKEN_SECRET=specify refresh token secret
```

<br>

### `.env` file for client

```bash
REACT_APP_API_URL= specify API URL
```

### Usage

`git clone` the repository or [download the zip](https://github.com/kallyas/safe-courier/archive/refs/heads/develop.zip) file.
<br>
use the [develop](https://github.com/kallyas/safe-courier/) branch<br><br>

```bash
# Install Dependencis
npm install

# Install dependencies in both client and server folders
npm run instDep

#Run dev servers
npm run start
```

- visit: http://localhost:5000/api/v1 to test API<br>
- visit: http://localhost:3000 for front end

### Live Preview

- [API](https://safe-courier-backend-api.herokuapp.com/api/v1/)<br>
- [API DOCS](https://safe-courier-backend-api.herokuapp.com/api/v1/api-docs/)<br>
- [Front End](https://safe-courier-front-end.netlify.app)<br>
