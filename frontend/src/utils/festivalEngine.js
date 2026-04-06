import axios from "axios";

// Comprehensive list of festivals and special days for marketing
const marketingDays = [
  // January
  { d: 1, m: 1, title: "New Year's Day" },
  { d: 14, m: 1, title: "Makar Sankranti/Pongal" },
  { d: 26, m: 1, title: "Republic Day" },
  
  // February
  { d: 14, m: 2, title: "Valentine's Day" },
  { d: 15, m: 2, title: "Maha Shivaratri" },
  { d: 19, m: 2, title: "Chhatrapati Shivaji Maharaj Jayanti" },
  
  // March
  { d: 8, m: 3, title: "Women's Day" },
  { d: 10, m: 3, title: "Holi" },
  { d: 25, m: 3, title: "Good Friday" },
  { d: 31, m: 3, title: "Easter Sunday" },
  
  // April
  { d: 9, m: 4, title: "Ugadi/Gudi Padwa" },
  { d: 14, m: 4, title: "Ambedkar Jayanti" },
  { d: 22, m: 4, title: "Earth Day" },
  
  // May
  { d: 1, m: 5, title: "Labour Day" },
  { d: 12, m: 5, title: "Mother's Day" },
  { d: 23, m: 5, title: "Buddha Purnima" },
  
  // June
  { d: 16, m: 6, title: "Father's Day" },
  { d: 21, m: 6, title: "International Yoga Day" },
  { d: 17, m: 6, title: "Eid al-Adha (approx)" },
  
  // July
  { d: 7, m: 7, title: "Rath Yatra" },
  { d: 17, m: 7, title: "Muharram" },
  { d: 28, m: 7, title: "Friendship Day" },
  
  // August
  { d: 15, m: 8, title: "Independence Day" },
  { d: 19, m: 8, title: "Raksha Bandhan" },
  { d: 26, m: 8, title: "Janmashtami" },
  
  // September
  { d: 8, m: 9, title: "Ganesh Chaturthi" },
  { d: 17, m: 9, title: "Hindi Diwas" },
  { d: 28, m: 9, title: "World Tourism Day" },
  
  // October
  { d: 2, m: 10, title: "Gandhi Jayanti" },
  { d: 12, m: 10, title: "Durga Puja (Maha Saptami)" },
  { d: 15, m: 10, title: "Dussehra" },
  { d: 24, m: 10, title: "Diwali" },
  { d: 31, m: 10, title: "Halloween" },
  
  // November
  { d: 1, m: 11, title: "Dhanteras" },
  { d: 2, m: 11, title: "Naraka Chaturdashi" },
  { d: 4, m: 11, title: "Bhai Dooj" },
  { d: 8, m: 11, title: "Guru Nanak Jayanti" },
  { d: 14, m: 11, title: "Children's Day" },
  { d: 27, m: 11, title: "Black Friday" },
  
  // December
  { d: 25, m: 12, title: "Christmas" },
  { d: 31, m: 12, title: "New Year's Eve" }
];

// Additional floating festivals (calculated dynamically)
const getFloatingFestivals = (year) => {
  // Calculate festivals that change dates each year
  
  // Eid al-Fitr (approximate calculation)
  const ramadanDate = new Date(year, 2, 23); // Approx March 23
  const eidAlFitr = new Date(ramadanDate);
  eidAlFitr.setDate(eidAlFitr.getDate() + 29);
  
  // Navratri start (usually in October)
  const navratriStart = new Date(year, 9, 7); // Approx October 7
  
  // Karwa Chauth (fourth day after Purnima in Kartik month)
  const karwaChauth = new Date(year, 9, 20); // Approx October 20
  
  return [
    { d: eidAlFitr.getDate(), m: eidAlFitr.getMonth() + 1, title: "Eid al-Fitr" },
    { d: navratriStart.getDate(), m: navratriStart.getMonth() + 1, title: "Navratri Begins" },
    { d: karwaChauth.getDate(), m: karwaChauth.getMonth() + 1, title: "Karwa Chauth" }
  ];
};

// Helper function to create date without time component
const createDate = (year, month, day) => {
  return new Date(year, month - 1, day);
};

// Helper function to calculate days difference
const getDaysDifference = (date1, date2) => {
  // Reset time to midnight for accurate day calculation
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
};

// Function to get appropriate tip based on festival
const getFestivalTip = (festivalTitle, daysLeft) => {
  const festivalTips = {
    "Valentine's Day": "Perfect for couples' offers, gifts, and romantic deals!",
    "Women's Day": "Empowerment-themed offers work great. Discounts on women's products.",
    "New Year's Day": "New Year, new offers! Great for resolution-based promotions.",
    "Diwali": "Biggest shopping festival! Stock up on gifts, electronics, and home decor.",
    "Christmas": "Gift-giving season! Bundle offers and festive discounts work well.",
    "Holi": "Color-themed offers! Great for colors, water games, and festive foods.",
    "Eid al-Fitr": "Perfect for clothing, food, and gift offers for the celebrations.",
    "Dussehra": "Good for electronics, vehicles, and new beginnings promotions.",
    "Navratri Begins": "Nine nights of celebration! Perfect for dancewear, jewelry, and fasting foods.",
    "Ganesh Chaturthi": "Great for decor, sweets, and puja item promotions.",
    "Durga Puja": "Clothing, jewelry, and pandal decor items sell fast.",
    "Raksha Bandhan": "Rakhi gifts, sweets, and brother-sister combo offers.",
    "Independence Day": "Patriotic offers and national pride-themed promotions.",
    "Republic Day": "Tricolor themed offers and patriotic merchandise.",
    "Halloween": "Costumes, decorations, and spooky theme offers.",
    "Black Friday": "Biggest discount day! Plan mega sales and doorbuster deals."
  };

  // Default tips based on days left
  if (daysLeft === 0) {
    return "Today is perfect for special offers! Capitalize on the festive spirit.";
  } else if (daysLeft <= 3) {
    return "Last chance! Create urgent offers and flash sales.";
  } else if (daysLeft <= 7) {
    return "Final preparations! Stock up and launch early-bird offers.";
  } else if (daysLeft <= 14) {
    return "Great time for pre-booking and advance offers.";
  } else if (daysLeft <= 30) {
    return "Start awareness campaigns and teaser offers.";
  }

  return festivalTips[festivalTitle] || "Prepare campaign & stock for upcoming festival.";
};

export const getTodaySpecial = async () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Create today date without time for comparison
  const todayNoTime = new Date(currentYear, today.getMonth(), today.getDate());

  try {
    const res = await axios.get(
      `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/IN`
    );

    // Convert API holidays
    const apiFestivals = res.data.map(h => {
      const dt = new Date(h.date);
      return {
        d: dt.getDate(),
        m: dt.getMonth() + 1,
        title: h.localName
      };
    });

    // Get floating festivals for current year
    const floatingFestivals = getFloatingFestivals(currentYear);
    
    // Merge all festivals
    const allFestivals = [...apiFestivals, ...marketingDays, ...floatingFestivals];
    
    // Remove duplicates based on title and date
    const uniqueFestivals = allFestivals.filter((festival, index, self) =>
      index === self.findIndex(f => 
        f.d === festival.d && 
        f.m === festival.m && 
        f.title === festival.title
      )
    );

    // Sort by date
    uniqueFestivals.sort((a, b) => {
      if (a.m === b.m) return a.d - b.d;
      return a.m - b.m;
    });
    
    // Get festivals for current year
    const currentYearFestivals = uniqueFestivals.map(f => ({
      ...f,
      date: createDate(currentYear, f.m, f.d),
      year: currentYear
    }));

    // Get festivals for next year (for end-of-year rollover)
    const nextYearFestivals = uniqueFestivals.map(f => ({
      ...f,
      date: createDate(currentYear + 1, f.m, f.d),
      year: currentYear + 1
    }));

    // Combine current and next year festivals
    const combinedFestivals = [...currentYearFestivals, ...nextYearFestivals];

    let nearestFestival = null;
    let minDaysDiff = Infinity;
    let isToday = false;

    // Find the nearest festival
    combinedFestivals.forEach(festival => {
      const daysDiff = getDaysDifference(todayNoTime, festival.date);
      
      if (daysDiff >= 0 && daysDiff < minDaysDiff) {
        minDaysDiff = daysDiff;
        nearestFestival = festival;
        isToday = daysDiff === 0;
      }
    });

    // If no festival found in the future (shouldn't happen with next year included)
    if (!nearestFestival) {
      return {
        type: "normal",
        title: "Normal Business Day",
        tip: "Create a flash sale or limited-time offer to boost sales!",
        daysLeft: null,
        festivalData: {
          nextFestivals: getUpcomingFestivalsList(combinedFestivals, todayNoTime, 5)
        }
      };
    }

    // Today is a festival
    if (isToday) {
      return {
        type: "today",
        title: `🎉 ${nearestFestival.title}`,
        tip: getFestivalTip(nearestFestival.title, 0),
        daysLeft: 0,
        festivalData: {
          nextFestivals: getUpcomingFestivalsList(combinedFestivals, todayNoTime, 5)
        }
      };
    }

    // Upcoming festival
    return {
      type: "upcoming",
      title: `Upcoming: ${nearestFestival.title}`,
      tip: getFestivalTip(nearestFestival.title, minDaysDiff),
      daysLeft: minDaysDiff,
      festivalData: {
        nextFestivals: getUpcomingFestivalsList(combinedFestivals, todayNoTime, 5)
      }
    };

  } catch (err) {
    console.error("Error fetching festivals:", err);
    
    // Fallback: Use only marketing days if API fails
    const floatingFestivals = getFloatingFestivals(currentYear);
    const allFestivals = [...marketingDays, ...floatingFestivals];
    
    const currentYearFestivals = allFestivals.map(f => ({
      ...f,
      date: createDate(currentYear, f.m, f.d),
      year: currentYear
    }));

    const nextYearFestivals = allFestivals.map(f => ({
      ...f,
      date: createDate(currentYear + 1, f.m, f.d),
      year: currentYear + 1
    }));

    const combinedFestivals = [...currentYearFestivals, ...nextYearFestivals];

    let nearestFestival = null;
    let minDaysDiff = Infinity;
    
    combinedFestivals.forEach(festival => {
      const daysDiff = getDaysDifference(todayNoTime, festival.date);
      if (daysDiff >= 0 && daysDiff < minDaysDiff) {
        minDaysDiff = daysDiff;
        nearestFestival = festival;
      }
    });

    if (nearestFestival && minDaysDiff === 0) {
      return {
        type: "today",
        title: `🎉 ${nearestFestival.title}`,
        tip: getFestivalTip(nearestFestival.title, 0),
        daysLeft: 0,
        festivalData: {
          nextFestivals: getUpcomingFestivalsList(combinedFestivals, todayNoTime, 5)
        }
      };
    } else if (nearestFestival) {
      return {
        type: "upcoming",
        title: `Upcoming: ${nearestFestival.title}`,
        tip: getFestivalTip(nearestFestival.title, minDaysDiff),
        daysLeft: minDaysDiff,
        festivalData: {
          nextFestivals: getUpcomingFestivalsList(combinedFestivals, todayNoTime, 5)
        }
      };
    }

    return {
      type: "normal",
      title: "Business Opportunity",
      tip: "Create a promotional offer to attract customers and boost sales",
      daysLeft: null,
      festivalData: {
        nextFestivals: []
      }
    };
  }
};

// Helper function to get list of upcoming festivals
const getUpcomingFestivalsList = (festivals, today, count = 5) => {
  const upcoming = festivals
    .map(f => ({
      ...f,
      daysDiff: getDaysDifference(today, f.date)
    }))
    .filter(f => f.daysDiff > 0)
    .sort((a, b) => a.daysDiff - b.daysDiff)
    .slice(0, count);
  
  return upcoming;
};

// Additional function to get all upcoming festivals
export const getAllUpcomingFestivals = async (count = 10) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  try {
    const res = await axios.get(
      `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/IN`
    );

    const apiFestivals = res.data.map(h => {
      const dt = new Date(h.date);
      return {
        d: dt.getDate(),
        m: dt.getMonth() + 1,
        title: h.localName
      };
    });

    const floatingFestivals = getFloatingFestivals(currentYear);
    const allFestivals = [...apiFestivals, ...marketingDays, ...floatingFestivals];
    
    const uniqueFestivals = allFestivals.filter((festival, index, self) =>
      index === self.findIndex(f => 
        f.d === festival.d && 
        f.m === festival.m && 
        f.title === festival.title
      )
    );

    const currentYearFestivals = uniqueFestivals.map(f => ({
      ...f,
      date: createDate(currentYear, f.m, f.d),
      year: currentYear
    }));

    const nextYearFestivals = uniqueFestivals.map(f => ({
      ...f,
      date: createDate(currentYear + 1, f.m, f.d),
      year: currentYear + 1
    }));

    const combinedFestivals = [...currentYearFestivals, ...nextYearFestivals];
    
    return getUpcomingFestivalsList(combinedFestivals, today, count);
    
  } catch (err) {
    console.error("Error fetching upcoming festivals:", err);
    return [];
  }
};