import Logo from "../aspects/FooterLogo.svg";
export default function Footer() {
  return (
    <footer className="bg-[#032541] h-[324.21px] text-white flex justify-center  ">
      <nav className="py-20 w-[880.36px] h-[147.41px] flex ">
        <div className="  relative  bottom-9 mr-10">
          <img
            src={Logo}
            alt=""
            className="w-[130px] h-[94px] relative left-[88.362px] bottom-[53.7px] right-[0px] top-[0px]"
          />
          <a
            href="#"
            className=" h-[47.29px] bg-[#fff] border-[#fff] text-[#01b4e4] border-[1.6px] py-2 px-4 relative top-[50px] font-bold font-sans text-[18.72px] rounded-[5px]"
          >
            {" "}
            JOIN THE COMMUNITY
          </a>
        </div>
        <div className=" h-[147.413px] mr-10">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            THE BASICS
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                {" "}
                About TMBD
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                {" "}
                Contact Us
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                {" "}
                Support Forums
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                API Documentation
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                System Status
              </a>
            </li>
          </ul>
        </div>
        <div className=" h-[147.413px] mr-10">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            GET INVOLVED
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Contribution Bible
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Add New Movie
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Add New TV Show
              </a>
            </li>
          </ul>
        </div>
        <div className=" h-[147.413px] mr-10">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            COMMUNITY
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Guidelines
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Discussions
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Leaderboard
              </a>
            </li>
          </ul>
        </div>

        <div className=" h-[147.413px]">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            LEGAL
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Terms of Use
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                API Terms of Use
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                Privacy Policy
              </a>
            </li>
            <li className="text-[14.4px] leading-[23.04px]">
              <a
                href="#"
                className="text-[1.2em] font-normal leading-[23.04px]"
              >
                DMCA Policy
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </footer>
  );
}
