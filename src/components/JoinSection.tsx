import React from "react";
import bgImg from "../aspects/Hero4.png";
import { useTranslation } from "../hooks/useTranslation";

export default function JoinSection() {
  const { t } = useTranslation();

  return (
    <section className="relative w-full h-[276px] text-white overflow-hidden flex justify-center">
      <div>
        {/* Background Image */}
        <img
          src={bgImg}
          alt="Join Today Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Purple Overlay */}
        <div className="absolute inset-0 bg-purple-800 bg-opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 w-[1300px] flex justify-start h-full px-10 py-[30px]">
          <div className="w-[1300px] font-sans">
            <h2 className="text-[32px] font-bold mr-5">{t("join.title")}</h2>
            <div className="py-5 mr-10 w-[1230px]">
              <p className="text-base text-[19.2px]">{t("join.desc")}</p>
              <button className="mt-6 mb-[10px] border-[1.6px] border-[#805be7] px-4 py-2 bg-[#805be7] text-[17.28px] items-center text-white font-semibold rounded">
                {t("join.button")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
