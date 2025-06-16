class AuthModule {
  constructor(authService, authGuard) {
    this.authService = authService;
    this.authGuard = authGuard;
    this.loginForm = document.querySelector(".auth__container");
    this.registerForm = document.getElementById("registerForm");
    this.switchToRegister = document.getElementById("switchToRegister");
    this.switchToLogin = document.getElementById("switchToLogin");
  }

  init() {
    this.setupSwitchListeners();
    this.setupFormListeners();
    this.addErrorElements();
  }

  addErrorElements() {
    const forms = [this.loginForm, this.registerForm];
    forms.forEach((form) => {
      const groups = form.querySelectorAll(".auth__group");
      groups.forEach((group) => {
        const label = group.querySelector("label");
        const errorSpan = document.createElement("span");
        errorSpan.className = "error-message";
        errorSpan.style.color = "red";
        errorSpan.style.display = "block";
        errorSpan.style.fontSize = "0.8em";
        group.appendChild(errorSpan);
      });
    });
  }

  validateForm(formType) {
    let isValid = true;
    const errorMessages = {};

    if (formType === "login") {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) errorMessages.email = "Email không được để trống.";
      else if (!emailRegex.test(email)) errorMessages.email = "Email không hợp lệ.";

      if (!password) errorMessages.password = "Mật khẩu không được để trống.";
      else if (password.length < 6) errorMessages.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    } else if (formType === "register") {
      const fullname = document.getElementById("fullname").value.trim();
      const email = document.getElementById("emailReg").value.trim();
      const password = document.getElementById("passwordReg").value.trim();

      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!fullname) errorMessages.fullname = "Họ và tên không được để trống.";
      else if (!nameRegex.test(fullname)) errorMessages.fullname = "Họ và tên chỉ được chứa chữ cái.";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) errorMessages.email = "Email không được để trống.";
      else if (!emailRegex.test(email)) errorMessages.email = "Email không hợp lệ.";

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
      if (!password) errorMessages.password = "Mật khẩu không được để trống.";
      else if (password.length < 6) errorMessages.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      else if (!passwordRegex.test(password)) errorMessages.password = "Mật khẩu phải chứa ít nhất một chữ và một số.";
    }

    const form = formType === "login" ? this.loginForm : this.registerForm;
    const groups = form.querySelectorAll(".auth__group");
    groups.forEach((group) => {
      const input = group.querySelector("input");
      const errorSpan = group.querySelector(".error-message");
      const fieldName = input.id.replace("Reg", "");
      if (errorMessages[fieldName]) {
        errorSpan.textContent = errorMessages[fieldName];
        isValid = false;
      } else {
        errorSpan.textContent = "";
      }
    });

    return isValid;
  }

  setupSwitchListeners() {
    this.switchToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      this.loginForm.classList.add("hidden");
      this.registerForm.classList.remove("hidden");
    });

    this.switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      this.registerForm.classList.add("hidden");
      this.loginForm.classList.remove("hidden");
    });
  }

  setupFormListeners() {
    const loginFormElement = this.loginForm.querySelector(".auth__form");
    loginFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.validateForm("login")) return;

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const users = await this.authService.get();
        const user = users.find((u) => u.email === email);
        if (!user || !window.bcrypt.compareSync(password, user.password)) {
          throw new Error("Email hoặc mật khẩu không đúng.");
        }
        alert("Đăng nhập thành công");
        localStorage.setItem("user", JSON.stringify(user));
        this.authGuard.loadUser(); // Cập nhật authGuard
        if (user.role === "admin") {
          window.location.href = "./admin.html";
        } else {
          window.location.href = "./index.html";
        }
      } catch (error) {
        console.error("Error logging in:", error);
        const groups = this.loginForm.querySelectorAll(".auth__group");
        groups.forEach((group) => {
          const errorSpan = group.querySelector(".error-message");
          errorSpan.textContent = error.message || "Đăng nhập thất bại.";
        });
      }
    });

    const registerFormElement = this.registerForm.querySelector(".auth__form");
    registerFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.validateForm("register")) return;

      const fullname = document.getElementById("fullname").value.trim();
      const email = document.getElementById("emailReg").value.trim();
      const password = document.getElementById("passwordReg").value.trim();

      try {
        const users = await this.authService.get();
        if (users.find((u) => u.email === email)) {
          throw new Error("Email đã được sử dụng.");
        }
        if (!window.bcrypt) {
          console.error("bcrypt chưa được tải! Kiểm tra thứ tự script trong HTML.");
        }
        const hashedPassword = window.bcrypt.hashSync(password, 10); // Băm mật khẩu
        const newUser = { fullname, email, password: hashedPassword, createdAt: new Date().toISOString(), id: Date.now() };
        const createdUser = await this.authService.register(newUser);
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        this.registerForm.classList.add("hidden");
        this.loginForm.classList.remove("hidden");
      } catch (error) {
        console.error("Error registering:", error);
        const groups = this.registerForm.querySelectorAll(".auth__group");
        groups.forEach((group) => {
          const errorSpan = group.querySelector(".error-message");
          errorSpan.textContent = error.message || "Đăng ký thất bại.";
        });
      }
    });
  }
}

export default function authModule(authService, authGuard) {
  return new AuthModule(authService, authGuard);
}
