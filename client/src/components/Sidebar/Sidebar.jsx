function Sidebar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload()
  };
  return (
    <div className="page-sidebar">
      <div className="logo-box">
        <span>Safe Courier</span>
        <i
          className="icon-radio_button_unchecked"
          id="fixed-sidebar-toggle-button"
        ></i>
        <i className="icon-close" id="sidebar-toggle-button-close"></i>
      </div>
      <div className="page-sidebar-inner">
        <div className="page-sidebar-menu">
          <ul className="accordion-menu">
            <li className="active-page">
              <a href="/home">
                <i className="menu-icon icon-home4"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li className="menu-divider"></li>
            <li>
              <button
                style={{ marginLeft: "30px" }}
                onClick={logout}
                className="btn btn-primary"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
