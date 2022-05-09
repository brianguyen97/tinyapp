# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (similar to bit.ly).

## Features

- Shorten URLs
- Edit URLs
- Save all shortened URLS to database per user

## Final Product

localhost:8080/login
!["Login Page"](https://github.com/brianguyen97/tinyapp/blob/main/docs/tinyApp3.jpg)

localhost:8080/urls/new
!["Shorten URL Page"](https://github.com/brianguyen97/tinyapp/blob/main/docs/tinyApp2.jpg)

localhost:8080/urls
!["URL Index Page"](https://github.com/brianguyen97/tinyapp/blob/main/docs/tinyApp0.jpg)

localhost:8080/randomString
!["URL Edit Page"](https://github.com/brianguyen97/tinyapp/blob/main/docs/tinyApp1.jpg)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Dev Dependencies

- Mocha
- Chai
- Nodemon

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Go to localhost:8080/register and create an account
- Then visit localhost:8080/urls/new to shorten a URL
- Then visit localhost:8080/u/randomString to go to your long URL!

## Future Goals

- Add unique visitor count for urls
- Implement a real database instead of an object in memory
- Create own CSS/Navbar, not relying on Bootstrap
- Show errors without taking the user to another page
- Be able to edit the short URL random string
