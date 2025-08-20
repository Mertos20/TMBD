import Logo from "../aspects/FooterLogo.svg";

export default function Footer() {
  return (
    <footer className="bg-[#032541] text-white flex justify-center h-auto md:h-[324.21px]">
      <nav className="py-10 md:py-20 w-full max-w-[880.36px] flex flex-col md:flex-row md:items-start md:justify-start">
       
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0 md:mr-10">
          <img
            src={Logo}
            alt="Logo"
            className="w-[130px] h-[94px] mb-4 md:mb-0 md:relative md:left-[88.362px] md:bottom-[53.7px]"
          />
          <a
            href="#"
            className="bg-white text-[#01b4e4] border border-[#fff] py-2 px-4 font-bold font-sans text-[18.72px] rounded-[5px]"
          >
            JOIN THE COMMUNITY
          </a>
        </div>

       
        <div className="mb-8 md:mb-0 md:mr-10">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            THE BASICS
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            {["About TMBD", "Contact Us", "Support Forums", "API Documentation", "System Status"].map((item) => (
              <li key={item} className="leading-[23.04px]">
                <a href="#" className="text-[1.2em] font-normal">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

       
        <div className="mb-8 md:mb-0 md:mr-10">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            GET INVOLVED
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            {["Contribution Bible", "Add New Movie", "Add New TV Show"].map((item) => (
              <li key={item} className="leading-[23.04px]">
                <a href="#" className="text-[1.2em] font-normal">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        
        <div className="mb-8 md:mb-0 md:mr-10">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            COMMUNITY
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            {["Guidelines", "Discussions", "Leaderboard"].map((item) => (
              <li key={item} className="leading-[23.04px]">
                <a href="#" className="text-[1.2em] font-normal">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

       
        <div className="mb-0">
          <h3 className="font-sans text-[20.16px] font-bold leading-[28.225px]">
            LEGAL
          </h3>
          <ul className="text-[14.4px] leading-[21.6px]">
            {["Terms of Use", "API Terms of Use", "Privacy Policy", "DMCA Policy"].map((item) => (
              <li key={item} className="leading-[23.04px]">
                <a href="#" className="text-[1.2em] font-normal">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </footer>
  );
}
