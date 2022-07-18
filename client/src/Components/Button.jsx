import React from "react";

const Button = ({ text, color, textClr, onClickHander }) => {
  return (
    <button
      onClick={onClickHander}
      className={`${color} px-10 ${textClr} font-medium font-OpenSans py-2 text-lg rounded-md`}
    >
      {text}
    </button>
  );
};

export default Button;
