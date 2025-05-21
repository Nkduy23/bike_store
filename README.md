npm run dev để code thoải mái, không bị mất class
npm run build khi đẩy lên production

| Gói                           | Mục đích chính                                                     |
| ----------------------------- | ------------------------------------------------------------------ |
| `gulp`                        | Task runner để tự động hóa build (copy file, biên dịch SCSS, v.v.) |
| `gulp-sass`                   | Plugin cho Gulp để biên dịch SCSS thành CSS                        |
| `sass`                        | Bộ biên dịch SCSS gốc (Dart Sass), bắt buộc phải có                |
| `gulp-postcss`                | Dùng để tích hợp PostCSS vào Gulp                                  |
| `postcss`                     | Công cụ xử lý CSS (thêm plugin như autoprefixer, purgecss)         |
| `autoprefixer`                | Tự động thêm prefix vào CSS (như `-webkit-`)                       |
| `@fullhuman/postcss-purgecss` | Xoá CSS không sử dụng để giảm kích thước file                      |
| `del`                         | Dùng để xoá file/thư mục (thay cho `rimraf`) trong Gulp task       |
