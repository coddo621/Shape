import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/login.css";

function Login() {
  return (
    <div className="login-root">

      <div className="login-card-wrapper">
        <div className="login-card shadow-sm">

          <div className="login-header text-center mb-4">
            <h5 className="mb-1 text-break">Shape</h5>
            <p className="text-muted small mb-0">Interactive Form Builder and Manager</p>
          </div>

          <form>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input type="text" className="form-control" autoComplete="username" />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" autoComplete="current-password" />
            </div>

            <button type="button" className="btn btn-link p-0 mb-3">
              Forgot password?
            </button>

            <button type="submit" className="btn btn-primary w-100 py-2">
              Login
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

export default Login;
