var http = require('http');

const server = http.createServer((request, response) => {
    const {method, url} = request
    if (url === '/api' && method === "GET"){
        response.statusCode = 200
        response.write(JSON.stringify({message: "Hello!"}))
        response.end()
    }
  });
  

server.listen(8080, (err)=>{
    if (err) console.log(err)
    else console.log("logged using port 8080")
})