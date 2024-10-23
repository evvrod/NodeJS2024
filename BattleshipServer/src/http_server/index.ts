import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';

export default function startHttpServer(port: number) {
  httpServer.listen(port);
  console.log(`Start static http server on the port: ${port}`);
}

const httpServer = http.createServer(function (req, res) {
  const __dirname = path.resolve(path.dirname(''));
  const file_path =
    __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
  fs.readFile(file_path, function (err, data) {
    if (err) {
      console.log(err);
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    console.log(data);
    res.writeHead(200);
    res.end(data);
  });
});
