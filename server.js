var http = require("http");

const fs = require("fs/promises");

const server = http.createServer(async (request, response) => {
  const { method, url } = request;
  if (url === "/api" && method === "GET") {
    response.statusCode = 200;
    response.write(JSON.stringify({ message: "Hello!" }));
    response.end();
  } else if (url === "/api/books" && method === "GET") {
    try {
      const books = await fs.readFile("./data/books.json");
      const booksData = JSON.parse(books.toString());
      response.write(JSON.stringify(booksData));
      response.statusCode = 200;
      response.end();
    } catch (e) {
      console.log(e);
    }
  } else if(method === "GET" && url === "/api/authors"){
    try {
      const authors = await fs.readFile("./data/authors.json")
      const authorsData = JSON.parse(authors.toString())
      response.write(JSON.stringify(authorsData)) 
      response.end()  
    } catch (e){
        console.log(e)
    }
  }
});

server.listen(8080, (err) => {
  if (err) console.log(err);
  else console.log("logged using port 8080");
});
