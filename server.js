var http = require("http");

const fs = require("fs/promises");
const querystring = require('node:querystring'); 
const { error } = require("console");

const server = http.createServer(async (request, response) => {
  const { method, url } = request;
  if (url === "/api" && method === "GET") {
    response.statusCode = 200;
    response.write(JSON.stringify({ message: "Hello!" }));
    response.end();
  }
  if ((url === "/api/books" || url === "/api/books?fiction=true" || url === "/api/books?fiction=false") && method === "GET") {
    const ref = url.split("?")
    const queryParams = querystring.parse(ref[1])
    try {
      const books = await fs.readFile("./data/books.json");
      const booksData = JSON.parse(books.toString());
      if(queryParams.fiction === 'true'){
        const filterFiction = booksData.filter((book)=>{
            return book.isFiction === true
        })
        response.statusCode = 200
        response.write(JSON.stringify({fictionTrue: filterFiction}))
      } else if (queryParams.fiction === 'false'){
        const falseFiction = booksData.filter((book)=>{
            return book.isFiction === false
        })
        response.statusCode = 200
        response.write(JSON.stringify({fictionFalse: falseFiction}))
      }
      
      else {
          response.write(JSON.stringify({ books: booksData }));
          response.statusCode = 200;
      }
      return response.end();
    } catch (e) {
      console.log(e);
      response.statusCode = 500
      response.write(JSON.stringify({error: e}))
      return response.end()
    }
  }
  if (method === "GET" && url === "/api/authors") {
    try {
      const authors = await fs.readFile("./data/authors.json");
      const authorsData = JSON.parse(authors.toString());
      response.statusCode = 200;
      response.write(JSON.stringify({ authors: authorsData }));
      response.end();
    } catch (e) {
      console.log(e);
    }
  }

  const urlParts = url.split("/");
  if (
    method === "GET" &&
    urlParts[1] === "api" &&
    urlParts[2] === "books" &&
    urlParts[3].length &&
    urlParts[4] === "author"
  ) {
    const regex = /[A-Za-z_*]/gi;
    if (regex.test(urlParts[3])) {
      response.statusCode = 400;
      response.write(JSON.stringify({ message: "404 Bad request" }));
      return response.end();
    }
    try {
      const books = await fs.readFile("./data/books.json");
      const parsedBooksData = JSON.parse(books);
      const filterAuthorData = parsedBooksData.filter((book) => {
        return book.authorId === parseInt(urlParts[3]);
      });
      if (!filterAuthorData.length) {
        response.statusCode = 404;
        response.write(
          JSON.stringify({ authorBooks: { message: "404 No author found" } })
        );
      } else {
        response.statusCode = 200;
        response.write(JSON.stringify({ authorBooks: filterAuthorData }));
      }
      return response.end()
    } catch (e) {
        console.log(e)
        response.statusCode = 500;
        response.write(JSON.stringify({ error: e }));
        return response.end()
    }
  }

  let id = request.url.slice(11);
  if (method === "GET" && url === `/api/books/${id}`) {
    const regex = /[A-Za-z_*]/gi;
    if (regex.test(id)) {
      response.statusCode = 400;
      response.write(JSON.stringify({ message: "404 Bad request" }));
      return response.end();
    }
    try {
      const books = await fs.readFile("./data/book.json");
      const booksData = JSON.parse(books.toString());
      const filterData = booksData.filter((book) => {
        return book.bookId === parseInt(id);
      });
      if (!filterData.length) {
        response.statusCode = 404;
        response.write(JSON.stringify({ message: "404 not found" }));
      } else {
        response.statusCode = 200;
        response.write(JSON.stringify({ book: filterData }));
    }
    return response.end();
    } catch (e) {
      response.statusCode = 500;
      response.write(JSON.stringify({ error: e }));
      return response.end()
    }
  }

  if (method === "POST" && url === "/api/books") {
    try {
      let body = "";
      request.on("data", (packet) => {
        body += packet.toString();
      });
      request.on("end", async () => {
        try {
          const books = await fs.readFile("./data/books.json");
          const parsedBooksData = JSON.parse(books);
          const newBooksData = [...parsedBooksData, JSON.parse(body)];
          const newBooksFileData = await fs.writeFile(
            "./data/books.json",
            JSON.stringify(newBooksData, null, 2),
            "utf8"
          );
          response.writeHead(201, { "Content-Type": "application/json" });
          response.write(body);
          response.end();
        } catch (err) {
          response.statusCode = 500;
          console.log(err);
        }
      });
    } catch (e) {
      response.statusCode = 500;
      console.log(e);
    }
  }
});

server.listen(8080, (err) => {
  if (err) console.log(err);
  else console.log("logged using port 8080");
});
