const http = require('http');
const path = require('path');
const Koa = require('koa');
const cors = require('kcors');
const serve = require('koa-static');
const qs = require('query-string');
const iconv = require('iconv-lite');

const PORT = 6006;
const staticPath = path.resolve(__dirname, '../build');
console.log(staticPath);
const app = new Koa();
app.use(cors());
app.use(serve(staticPath, { defer: true }));

const get = url => new Promise((resolve, reject) => {
  http.get(url, res => {
    const { statusCode } = res;

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    }
    if (error) {
      reject(error);
      // consume response data to free up memory
      res.resume();
      return;
    }

    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      try {
        resolve(iconv.decode(Buffer.concat(chunks), 'gbk'));
      } catch (e) {
        reject(e);
      }
    });
  });
});

app.use(async (ctx, next) => {
  console.log('requesting', ctx.request.path)
  const { tid } = qs.parse(qs.extract(ctx.request.url));
  if (tid) {
    const start = Date.now();
    const result = await get(`http://bbs.nga.cn/read.php?tid=${tid}&lite=js`);
    await next();
    ctx.response.status = 200;
    ctx.response.body = result;
    const end = Date.now();
    console.log(`[${tid}] - [${end - start}ms]`);
  } else {
    next();
    return;
  }
});

app.listen(PORT);
console.log('listening on', PORT);
