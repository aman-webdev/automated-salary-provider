import React from "react";
import { ReactComponent as Logo } from "../assets/logo.svg";

const Header = () => {
  return (
    <div className="bg-[#1f332c] h-1/6 text-[#f5fdfa] py-8 px-8 font-Poppins flex justify-between items-center ">
      <div className="logo flex align-center gap-4 items-center">
        <Logo className="stroke-[#f5fdfa]" />
        <p>Autometa</p>
      </div>
      <button className="connect bg-[#344841] px-6 py-4 text-sm rounded-md">
        Connect Wallet
      </button>
    </div>
  );
};

export default Header;
