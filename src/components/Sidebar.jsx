import Link from "next/link";
import React from "react";
import { GrDatabase } from "react-icons/gr";
import { MdOutlineTextSnippet } from "react-icons/md";


const Sidebar = () => {
  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5">
        <Link
          className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer bg-[#F2F3FF] border-r-4 border-primary`}
          href={"/dashboard"}
        >
          <GrDatabase className="text-tertiary"/>
          <p className="text-tertiary">Dashboard</p>
        </Link>

        <Link
          className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer 
             bg-[#F2F3FF] border-r-4 border-primary`}
          href={"/blogs"}
        >
          <MdOutlineTextSnippet className="text-tertiary"/>
          <p className="text-tertiary">Blogs</p>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;
