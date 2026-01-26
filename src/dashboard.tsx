import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/dashboard.css";

function Dashboard() {
  return (
    <div className="app-root">

      <nav className="navbar navbar-light bg-white border-bottom w-100">
        <div className="container-fluid px-3 px-md-4">
          <span className="navbar-brand fw-semibold">Shape</span>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary btn-sm">
              New form
            </button>
            <div className="profile-circle" />
          </div>
        </div>
      </nav>

      <main className="flex-fill w-100">

        <div className="container-fluid px-3 px-md-4 py-4">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Recent forms</h5>
            <button className="btn btn-link text-decoration-none">
              View all
            </button>
          </div>

          <div className="row g-3 g-md-4">

            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="
                  col-6
                  col-sm-4
                  col-md-3
                  col-lg-2
                  col-xl-2
                "
              >
                <div className="card h-100 shadow-sm form-card">

                  <div className="card-thumb" />

                  <div className="card-body">
                    <h6 className="card-title mb-1 text-truncate">
                      Shape Survey {i + 1}
                    </h6>
                    <p className="card-text text-muted small mb-0">
                      Opened 2 days ago
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
