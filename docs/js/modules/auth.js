import DataService from "./dataService.js";

class AuthModule {
  constructor(dataService) {
    this.dataService = dataService;
    this.loginForm = document.querySelector(".auth__container");
    this.registerForm = document.getElementById("registerForm");
    this.switchToRegister = document.getElementById("switchToRegister");
    this.switchToLogin = document.getElementById("switchToLogin");
  }

  init() {
    this.setupSwitchListeners();
    this.setupFormListeners();
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
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const user = await this.dataService.login(email, password);
        if (user) {
          alert("Đăng nhập thành công");
          localStorage.setItem("user", JSON.stringify(user));
          window.location.href = "./index.html";
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert(error.message);
      }
    });

    const registerFormElement = this.registerForm.querySelector(".auth__form");
    registerFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullname = document.getElementById("fullname").value;
      const email = document.getElementById("emailReg").value;
      const password = document.getElementById("passwordReg").value;

      try {
        const user = await this.dataService.register(fullname, email, password);
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        this.registerForm.classList.add("hidden");
        this.loginForm.classList.remove("hidden");
      } catch (error) {
        console.error("Error registering:", error);
        alert(error.message);
      }
    });
  }
}

const authModuleInstance = new AuthModule(DataService);
export default authModuleInstance;
