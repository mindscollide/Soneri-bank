import styles from "./ProfileDropdown.module.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogoutApi } from "../../../../store/actions/authAction";
import { Dropdown } from "react-bootstrap";
import IconElement from "../IconElement/IconElement";
// import { setSettingModal } from "../../../../store/slicers/modalSlicer/modalSlicer";

const ProfileDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleClickLogout = () => {
    dispatch(LogoutApi({ navigate }));
  };
  // const handleOpenSettingModal = () => {
  //   dispatch(setSettingModal(true));
  // };
  return (
    <Dropdown>
      <Dropdown.Toggle className={styles["ProfileDropdown"]}>
        <span className="user-logdin-name fw-bold color-hd max-w-fix-100 text-truncate d-inline-block align-middle">
          {localStorage.getItem("name")}
        </span>
        <IconElement iconClass={"icon-arrow-down"} />
      </Dropdown.Toggle>
      <Dropdown.Menu align="end" className={styles["ProfileDropdown_menu"]}>
        <Dropdown.Item
          onClick={handleClickLogout}
          className="cursor-pointer logoutDropdown"
        >
          <IconElement iconClass={"icon-logout me-1"} />
          <label className="cursor-pointer">Logout</label>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;
