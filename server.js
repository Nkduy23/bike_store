import jsonServer from "json-server";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Hàm chuẩn hóa tên thư mục (xóa dấu tiếng Việt, chuyển thành slug)
function normalizeCategoryName(str) {
  console.log("normalizeCategoryName input:", str);
  const result = str
    .normalize("NFD") // Phân tách dấu thành ký tự riêng
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/đ/g, "d") // Thay "đ" bằng "d" một cách rõ ràng
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "") // Loại bỏ ký tự đặc biệt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu gạch ngang
  console.log("normalizeCategoryName output:", result);
  return result;
}

const server = jsonServer.create();
const router = jsonServer.router("./src/data/db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Middleware xử lý query _fields
server.use((req, res, next) => {
  console.log("Query _fields middleware:", req.query);
  if (req.query._fields) {
    const fields = req.query._fields.split(",");
    console.log("Parsed _fields:", fields);
    const originalRender = router.render;
    router.render = (req, res) => {
      console.log("Rendering filtered data:", res.locals.data);
      if (Array.isArray(res.locals.data)) {
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
      } else {
        const filteredItem = {};
        fields.forEach((field) => {
          if (res.locals.data[field] !== undefined) {
            filteredItem[field] = res.locals.data[field];
          }
        });
        res.jsonp(filteredItem);
      }
    };
    res.on("finish", () => {
      console.log("Render finished, restoring original render");
      router.render = originalRender;
    });
  }
  next();
});

// Middleware để chuẩn bị dữ liệu trước khi multer
server.use("/api/upload", (req, res, next) => {
  console.log("Raw req.body before multer:", req.body);
  next();
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Storage destination called, req.body:", req.body);
    const dir = path.join("docs", "img", "temp"); // Lưu tạm vào thư mục temp
    console.log(`Attempting to use directory: ${dir} (temporary)`);
    try {
      if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory created: ${dir}`);
      } else {
        console.log(`Directory exists: ${dir}`);
      }
      cb(null, dir);
    } catch (error) {
      console.error(`Failed to create/access directory ${dir}:`, error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    console.log("Generating filename, file:", file);
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9-_.]/g, "-");
    const filename = `${timestamp}-${originalName}`;
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
}).fields([{ name: "file" }, { name: "category" }, { name: "index" }]); // Xử lý cả file và các trường text

// Upload endpoint
server.post("/api/upload", upload, (req, res) => {
  console.log("Entering upload endpoint, req.body:", req.body, "req.files:", req.files);
  if (!req.files || !req.files.file || req.files.file.length === 0) {
    console.log("No file uploaded or invalid field name");
    return res.status(400).json({ success: false, message: "No file uploaded or invalid field name" });
  }

  const category = req.body.category || "default";
  const normalizedCategory = normalizeCategoryName(category);
  console.log(`Normalized category: ${normalizedCategory} (from ${category})`);

  const file = req.files.file[0]; // Lấy file đầu tiên
  const oldPath = file.path;
  const newDir = path.join("docs", "img", normalizedCategory);
  const newPath = path.join(newDir, file.filename);

  console.log(`Moving file from ${oldPath} to ${newPath}`);

  try {
    if (!fs.existsSync(newDir)) {
      console.log(`Creating directory: ${newDir}`);
      fs.mkdirSync(newDir, { recursive: true });
      console.log(`Directory created: ${newDir}`);
    }
    fs.renameSync(oldPath, newPath);
    console.log("File moved successfully:", newPath);

    const url = `/img/${normalizedCategory}/${file.filename}`;
    res.json({ success: true, url });
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
});

// Xử lý lỗi Multer
server.use((err, req, res, next) => {
  console.log("Error middleware triggered, error:", err);
  if (err instanceof multer.MulterError) {
    console.error("MulterError:", err);
    return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
  }
  next(err);
});

server.use("/img", express.static(path.join("docs", "img")));
server.use(router);

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
