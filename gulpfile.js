import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import purgecss from "@fullhuman/postcss-purgecss";
import { deleteAsync } from "del";

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);

// Đường dẫn
const paths = {
  html: "src/pages/**/*.html",
  js: "src/js/**/*.js",
  scss: "src/scss/**/*.scss",
  dist: "docs",
};

// Xoá thư mục public
export function clean() {
  return deleteAsync([
    `${paths.dist}/**`, // xoá tất cả trong public
    `!${paths.dist}/img`, // nhưng giữ lại thư mục img
    `!${paths.dist}/img/**`, // và giữ lại toàn bộ file bên trong img
  ]);
}

// Copy HTML
export function copyHtml() {
  return src(paths.html).pipe(dest(paths.dist));
}

// Copy JS
export function copyJs() {
  return src(paths.js).pipe(dest(`${paths.dist}/js`));
}

// Biên dịch SCSS cho DEV (KHÔNG có purge)
export function buildScssDev() {
  return src(paths.scss)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest(`${paths.dist}/css`));
}

// Biên dịch SCSS cho PROD (CÓ purge)
export function buildScssProd() {
  return src(paths.scss)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss([
        autoprefixer(),
        purgecss({
          content: ["src/pages/**/*.html", "src/pages/partials/**/*.html", "src/js/**/*.js"],
          safelist: ["header", "nav", "footer", /^btn-/, /^nav-/],
          defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        }),
      ])
    )
    .pipe(dest(`${paths.dist}/css`));
}

// Theo dõi file trong DEV
export function watchFiles() {
  watch(paths.html, series(copyHtml, buildScssDev));
  watch(paths.js, copyJs);
  watch(paths.scss, buildScssDev);
}

// Task cho DEV
export default series(copyHtml, copyJs, buildScssDev, watchFiles);

// Task cho PROD
export const build = series(clean, copyHtml, copyJs, buildScssProd);
