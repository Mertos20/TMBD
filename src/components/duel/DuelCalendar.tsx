import { useState, useEffect } from "react";

interface DailyWinner {
  date: string;
  movieId: number;
  title: string;
  poster_path: string;
  points: number;
}

interface DuelCalendarProps {
  show: boolean;
  onClose: () => void;
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const DuelCalendar = ({ show, onClose }: DuelCalendarProps) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [monthlyWinners, setMonthlyWinners] = useState<DailyWinner[]>([]);

  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (show) {
      fetchMonthlyCalendar();
    }
  }, [calendarMonth, calendarYear, show]);

  const fetchMonthlyCalendar = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/duel/monthly-calendar/${calendarYear}/${calendarMonth + 1}`);
      const data = await res.json();
      setMonthlyWinners(data);
    } catch (err) {
      console.error("Failed to fetch monthly calendar", err);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getWinnerForDay = (day: number) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthlyWinners.find(w => w.date === dateStr);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  if (!show) return null;

  return (
    <div className="mb-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-full bg-[#032541] hover:bg-[#0d4f6e] transition-colors flex items-center justify-center text-xl"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-[#1ed5a9]">
          {MONTH_NAMES[calendarMonth]} {calendarYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-full bg-[#032541] hover:bg-[#0d4f6e] transition-colors flex items-center justify-center text-xl"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-xs font-semibold opacity-60 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before the 1st */}
        {Array.from({ length: getFirstDayOfMonth(calendarYear, calendarMonth) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, i) => {
          const day = i + 1;
          const winner = getWinnerForDay(day);
          const isToday = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === today;
          
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg overflow-hidden relative group transition-all hover:scale-105 ${
                isToday ? "ring-2 ring-[#1ed5a9]" : ""
              } ${winner ? "cursor-pointer" : "bg-white/5"}`}
              title={winner ? `${winner.title} - ${winner.points} pts` : `Day ${day}`}
            >
              {winner ? (
                <>
                  <img
                    src={`${IMAGE_BASE}${winner.poster_path}`}
                    alt={winner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
                    <p className="text-[10px] font-bold text-[#1ed5a9]">{winner.points} pts</p>
                  </div>
                  <div className="absolute top-1 left-1 bg-black/60 rounded px-1 text-[10px] font-bold">
                    {day}
                  </div>
                  {/* Hover overlay with title */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                    <p className="text-[10px] text-center font-semibold leading-tight">{winner.title}</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm opacity-50">
                  {day}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DuelCalendar;
