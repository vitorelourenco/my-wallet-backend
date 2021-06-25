# My Wallet - backend

My Wallet is a log-book web app for earnings and expenditures. Users can sign up and keep track of their finances using a simple interface. This is the repo for the backend side of the app. You can check out the frontend repo [here](https://github.com/vitorelourenco/my-wallet-front)

## Built With
- Node.js , Express.js , PostgreSQL   
- Linux

## Tested With
- Jest , supertest

## Instalation
- Install Node.js, git and PostgreSQL
- $ git clone https://github.com/vitorelourenco/my-wallet-back.git
- $ npm i

## Running the server
- $ npm start 

## Testing the API
- $ npm test

## Things That Can Go Wrong
- The app uses the port 4000 by default. You can change it if you want but if there's a conflict and you don't mind killing whatever is listening to 4000, you can run $ fuser -k 4000/tcp 
- As of right now, it seems Jest has no support for ES Modules out of the box. The dependency "@babel/preset-env" will take care of it and will be installed upon $ npm i . If you want to use your own babel configuration file, please include: "presets": [ "@babel/preset-env" ],
- As of right now, it seems Jest has no support for async/await out of the box. The dependency "@babel/plugin-transform-runtime" will take care of it and it will be installed upon $ npm i but remember to include:   "plugins": [ "@babel/plugin-transform-runtime" ] in your babel configuration file if you feel like using a different one. 

## Dependencies
- All dependencies are listed in the package.json file.

## One final note
- Anyone is welcome to clone this repo and use this code however they like. I maintain this README for others but mostly for myself, hence the odd Things That Can Go Wrong session. I like keeping track of the problems and solutions i've ran across so i don't have to put on my google-fu kimono all the time.  

## Author

👤 **Vitor Emanuel Lourenco**

- GitHub: [@vitorelourenco](https://github.com/vitorelourenco)
- Twitter: [@Vitorel](https://twitter.com/Vitorel)
- LinkedIn: [vitoremanuellourenco](https://www.linkedin.com/in/vitoremanuellourenco/)


## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/vitorelourenco/my-wallet-back/issues).

## Show your support

Give a ⭐️ if you like this project!

## Acknowledgments

- RespondeAi (https://www.respondeai.com.br/)
- The Odin Project (https://www.theodinproject.com/)

