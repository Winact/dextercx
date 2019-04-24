![alt text][header]
# Intro
A personal website made for myself using Express, Express-Handlebars, MongoDB & many more amazing packages. This website is built for me and a few friends where i am able to manage screenshots in a nice easy way instead of having to ssh into a server to delete them. You are also able to create short urls which is very nice for linking things in chats instead of having a long ugly url.

## Installation
Feel free to set this up for yourself but make sure to credit me :)
- Clone the repo: `git clone https://github.com/exe/dextercx`
- Enter the folder: `cd dextercx`
- Install modules: `npm i`
- Rename the config file in `./src` from `config.json.example` to `config.json`
- Edit the config file in `./src/`
- Run the script: `npm start`

## Configuration
Stuck knowing whats what in the config? Here:
#### Site
`port` - Port for the main site to run on.
`adminDiscordIds` - Discord user id's of the users that are able to use the dashobard.
`shortUrlEndpoint` - The endpoint for the short urls.
`screenshotUrlEndpoint` - The endpoint for the screenshots.
`screenshotDeleteEnpoint` - The endpoint for deleting screenshots.
`websocketUrl` - The url for the websocket.
##### Session
`secret`

#### Database
`db` - Database name.
`url` - Url/ip of the database.
`port` - Port that the database server is ran on.
`username` - Database username for authorization.
`password` - Database passsword for authorization.

#### Websocket
`port` - Port for the websocket to run on.

#### discordPassport
`clientId` - Discord oauth2 app id.
`clientSecret` - Discord oauth2 client secret.
`callbackUrl` - Discord oauth2 callback url.

#### fileUpload
`fileSizeLimit` - Limit of the files allowed to be uploaded by screenshotting.

## Contributing
Feel free to contribute to the project!

[header]: https://dexter.cx/i/u01aJIH.png "Image"
