
import { Button, Dropdown } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router";
import { signOut } from "firebase/auth";
import { auth } from "src/firebase-config"; 
import user1 from 'src/assets/images/profile/avatar1.png';



const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth/login"); 
    } catch (error: any) {
      alert("Logout failed: " + error.message);
    }
  };
  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
          <img
            src={auth.currentUser?.photoURL || user1}
            alt="avatar"
            height="35"
            width="35"
            className="rounded-full"
          />
          </span>
        )}
      >

        <Dropdown.Item
          as={Link}
          to="/profile"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:user-circle-outline" height={20} />
          Moj profil
        </Dropdown.Item>
        <div className="p-3 pt-0">
        <Button
          size="sm"
          onClick={handleLogout}
          className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none"
        >
          Odjava
        </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
