import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("./src/data/db.json");
// middlewares thêm các tính năng mặc định như: logger, static files, v.v.
const middlewares = jsonServer.defaults();

server.use(middlewares);

const db = router.db.getState();
console.log("Available endpoints:");
Object.keys(db).forEach((resource) => {
  console.log(`- http://localhost:3000/${resource}`);
});

// Middleware tùy chỉnh để xử lý tham số _fields
server.use((req, res, next) => {
  if (req.query._fields) {
    const fields = req.query._fields.split(",");
    const originalRender = router.render;
    router.render = (req, res) => {
      res.jsonp(
        res.locals.data.map((item) => {
          const filteredItem = {};
          fields.forEach((field) => {
            if (item[field] !== undefined) {
              filteredItem[field] = item[field];
            }
          });
          return filteredItem;
        })
      );
    };
    res.on("finish", () => {
      router.render = originalRender;
    });
  }
  next();
});

server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});
