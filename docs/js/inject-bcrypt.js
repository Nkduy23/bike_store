if (typeof dcodeIO !== "undefined" && dcodeIO.bcrypt) {
  window.bcrypt = dcodeIO.bcrypt;
} else {
  console.error("bcryptjs chưa được tải đúng từ CDN");
}
