import React from "react";

import Button from "../Components/Button";
import { ReactComponent as HeroIllustration } from "../assets/hero.svg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#1f332c] text-[#f5fdfa] w-full py-4 h-5/6 pb-10">
      <div className="mx-auto w-5/6 flex items-center justify-between flex-col-reverse md:flex-row">
        <div className="md:w-3/5 w-full">
          <h1 className=" text-5xl font-OpenSans  text-white leading-[45px] font-semibold">
            Automate paying <br />
            <span className="text-[#9ef182]">employees</span>
          </h1>
          <p className="font-OpenSans mt-6 text-lg w-5/6">
            People{" "}
            <span className="underline font-medium underline-offset-4 decoration-[#9ef182]">
              fund
            </span>{" "}
            the contract of an organisation
            <span className="text-accent">,</span> it's employees are paid{" "}
            <span className="underline font-medium underline-offset-4   decoration-[#9ef182]">
              automatically
            </span>{" "}
            with their respective salaries.
          </p>
          <p className="mt-12 text-xl">Get started as</p>
          <div className="btn-container mt-6 flex gap-4">
            <Button
              onClickHander={() => navigate("/owner")}
              text={"Owner"}
              color="bg-accent"
              textClr="text-dark-800"
            />
            <Button text={"Funder"} color="bg-dark-500" textClr="white" />
          </div>
        </div>
        <div className="md:w-1/2 w-3/4 ">
          <HeroIllustration className="w-full " />
        </div>
      </div>
    </div>
  );
};

export default Hero;
