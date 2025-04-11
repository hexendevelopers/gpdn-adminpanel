import React from "react";
import logo from "../../public/logo-gpdn.png";
import Image from "next/image";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <div className="flex  items-center">
          <Image className="w-28" src={logo} alt="gpdn logo" />
        </div>
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          Admin
        </p>
      </div>
      <button className="bg-primary text-white text-sm px-10 py-2 rounded-full">
        Logout
      </button>
    </div>
  );
};

export default Navbar;
