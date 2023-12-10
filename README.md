# SiteMgmt

## Install Necessary Packages

In SiteMgmt folder
```
source venv/bin/activate

brew install node
npm install --save axios
```

## In backend folder
```
<install from Docker website> https://docs.docker.com/desktop/install/mac-install/

pip install -r requirements.txt

docker build -t sample-backend .
docker run -p 6060:6060 sample-backend
```

## In frontend folder (not implemented)
```
export NODE_OPTIONS=--openssl-legacy-provider
export REACT_APP_API_URL=http://localhost:8080/api

npm start
```
