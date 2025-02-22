import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Modal, Button } from 'react-bootstrap';
import Swal from "sweetalert2";
import { Table, Dropdown, DropdownButton } from "react-bootstrap";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const localizer = momentLocalizer(moment);

function RoomAdmin() {
  const bgImages = [
    "/bg.jpg",
    "/bg2.jpg",
    "/bg3.jpg",
    "/bg4.jpg"
  ];

  const [currentBg, setCurrentBg] = useState(bgImages[0]);
  const bgIndexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      bgIndexRef.current = (bgIndexRef.current + 1) % bgImages.length;
      setCurrentBg(bgImages[bgIndexRef.current]);
    }, 5000); // เปลี่ยนทุก 5 วินาที

    return () => clearInterval(interval);
  }, []);



  const eventStyleGetter = (event) => {
    let backgroundColor = "#FFFF00"; // ค่าเริ่มต้น (รออนุมัติ - เหลือง)

    if (event.description?.includes("สถานะ: รออนุมัติ")) {
      backgroundColor = "#FFFF00"; // เหลือง
    } else if (event.description?.includes("สถานะ: รอชำระเงิน")) {
      backgroundColor = "#FFA500"; // ส้ม
    } else if (event.description?.includes("สถานะ: อนุมัติ")) {
      backgroundColor = "#00FF00"; // เขียว
    } else if (event.description?.includes("สถานะ: ปฏิเสธ")) {
      backgroundColor = "#FF0000"; // แดง
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "black", // ใช้สีดำเพื่อให้อ่านง่ายขึ้น
        border: "1px solid #ddd",
        display: "block",
      },
    };
  };


  const [selectedCalendarName, setSelectedCalendarName] = useState("");

  // ✨ ปรับฟังก์ชันเปลี่ยนห้องให้เปลี่ยนสีกรอบด้วย
  const handleRoomChange = (roomNumber, calendarName, borderColor) => {
    setCurrentRoom(roomNumber);
    setSelectedCalendarName(calendarName);
    setCalendarBorderColor(borderColor); // ✅ อัปเดตสีกรอบปฏิทิน
  };


  const [eventsRoom1, setEventsRoom1] = useState([]);
  const [eventsRoom2, setEventsRoom2] = useState([]);
  const [eventsRoom3, setEventsRoom3] = useState([]);
  const [eventsRoom4, setEventsRoom4] = useState([]);
  const [eventsRoom5, setEventsRoom5] = useState([]);
  const [eventsRoom6, setEventsRoom6] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const session = useSession();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();

  const [currentRoom, setCurrentRoom] = useState(1);

  const [popularTimesRoom1, setPopularTimesRoom1] = useState([]);
  const [popularTimesRoom2, setPopularTimesRoom2] = useState([]);
  const [popularTimesRoom3, setPopularTimesRoom3] = useState([]);
  const [popularTimesRoom4, setPopularTimesRoom4] = useState([]);
  const [popularTimesRoom5, setPopularTimesRoom5] = useState([]);
  const [popularTimesRoom6, setPopularTimesRoom6] = useState([]);

  const [weekdaySummaryRoom1, setWeekdaySummaryRoom1] = useState([]);
  const [weekdaySummaryRoom2, setWeekdaySummaryRoom2] = useState([]);
  const [weekdaySummaryRoom3, setWeekdaySummaryRoom3] = useState([]);
  const [weekdaySummaryRoom4, setWeekdaySummaryRoom4] = useState([]);
  const [weekdaySummaryRoom5, setWeekdaySummaryRoom5] = useState([]);
  const [weekdaySummaryRoom6, setWeekdaySummaryRoom6] = useState([]);


  const [totalBookingsRoom1, setTotalBookingsRoom1] = useState(0);
  const [totalBookingsRoom2, setTotalBookingsRoom2] = useState(0);
  const [totalBookingsRoom3, setTotalBookingsRoom3] = useState(0);
  const [totalBookingsRoom4, setTotalBookingsRoom4] = useState(0);
  const [totalBookingsRoom5, setTotalBookingsRoom5] = useState(0);
  const [totalBookingsRoom6, setTotalBookingsRoom6] = useState(0);

  // ✅ ฟังก์ชันลบการจอง
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบการจองนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${selectedEvent.calendarId}/events/${selectedEvent.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.provider_token}`,
              },
            }
          );

          if (response.ok) {
            Swal.fire("ลบสำเร็จ!", "การจองถูกลบเรียบร้อยแล้ว", "success");

            // ✅ อัปเดตอีเวนต์ในปฏิทินใหม่
            switch (currentRoom) {
              case 1: getCalendarEventsRoom1().then(setEventsRoom1); break;
              case 2: getCalendarEventsRoom2().then(setEventsRoom2); break;
              case 3: getCalendarEventsRoom3().then(setEventsRoom3); break;
              case 4: getCalendarEventsRoom4().then(setEventsRoom4); break;
              case 5: getCalendarEventsRoom5().then(setEventsRoom5); break;
              case 6: getCalendarEventsRoom6().then(setEventsRoom6); break;
              default: break;
            }

            setShowModal(false);
          } else {
            Swal.fire("ผิดพลาด!", "ไม่สามารถลบการจองได้", "error");
          }
        } catch (error) {
          console.error("Error deleting event:", error);
          Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการลบ", "error");
        }
      }
    });
  };


  // ✨ เพิ่ม state เก็บสีกรอบปฏิทิน
  const [calendarBorderColor, setCalendarBorderColor] = useState("#42a5f5"); // ค่าเริ่มต้นสีของห้อง 1

  useEffect(() => {
    if (session) {
      getCalendarEventsRoom1().then(fetchedEvents => setEventsRoom1(fetchedEvents));
      getCalendarEventsRoom2().then(fetchedEvents => setEventsRoom2(fetchedEvents));
      getCalendarEventsRoom3().then(fetchedEvents => setEventsRoom3(fetchedEvents));
      getCalendarEventsRoom4().then(fetchedEvents => setEventsRoom4(fetchedEvents));
      getCalendarEventsRoom5().then(fetchedEvents => setEventsRoom5(fetchedEvents));
      getCalendarEventsRoom6().then(fetchedEvents => setEventsRoom6(fetchedEvents));
    }
  }, [session]);

  useEffect(() => {
    setTotalBookingsRoom1(eventsRoom1.length);
    setTotalBookingsRoom2(eventsRoom2.length);
    setTotalBookingsRoom3(eventsRoom3.length);
    setTotalBookingsRoom4(eventsRoom4.length);
    setTotalBookingsRoom5(eventsRoom5.length);
    setTotalBookingsRoom6(eventsRoom6.length);
  }, [eventsRoom1, eventsRoom2, eventsRoom3, eventsRoom4, eventsRoom5, eventsRoom6]);

  useEffect(() => {
    setPopularTimesRoom1(findTopPopularTimes(eventsRoom1));
    setPopularTimesRoom2(findTopPopularTimes(eventsRoom2));
    setPopularTimesRoom3(findTopPopularTimes(eventsRoom3));
    setPopularTimesRoom4(findTopPopularTimes(eventsRoom4));
    setPopularTimesRoom5(findTopPopularTimes(eventsRoom5));
    setPopularTimesRoom6(findTopPopularTimes(eventsRoom6));
  }, [eventsRoom1, eventsRoom2, eventsRoom3, eventsRoom4, eventsRoom5, eventsRoom6]);

  useEffect(() => {
    setWeekdaySummaryRoom1(summarizeWeekdays(eventsRoom1));
    setWeekdaySummaryRoom2(summarizeWeekdays(eventsRoom2));
    setWeekdaySummaryRoom3(summarizeWeekdays(eventsRoom3));
    setWeekdaySummaryRoom4(summarizeWeekdays(eventsRoom4));
    setWeekdaySummaryRoom5(summarizeWeekdays(eventsRoom5));
    setWeekdaySummaryRoom6(summarizeWeekdays(eventsRoom6));
  }, [eventsRoom1, eventsRoom2]);

  useEffect(() => {
    console.log("Session: ", session);
  }, [session]);


  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { scopes: 'https://www.googleapis.com/auth/calendar' }
    });

    if (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเข้าสู่ระบบได้", "error");
    }
  }

  async function getCalendarEventsRoom1() {
    return getCalendarEvents("c_4fcb3687bff68bd0cc4b8f394d9ca95edfcbfc6808249100a2ed3ee913d5fa01@group.calendar.google.com");
  }

  async function getCalendarEventsRoom2() {
    return getCalendarEvents("c_6480839702a7d71cb1d46ea3875400d2d3614f59d7a41f176b14565afd2a5a19@group.calendar.google.com");
  }

  async function getCalendarEventsRoom3() {
    return getCalendarEvents("c_0e791d7dc9bdbc53eb3c7c6a3e219f18ad7f559f0908b7a18ab7268650ce4b9c@group.calendar.google.com");
  }

  async function getCalendarEventsRoom4() {
    return getCalendarEvents("c_b78034e303b1aeb8ffde10672ac719fb5eb18d2df788f26d58399812a6e51f5c@group.calendar.google.com");
  }

  async function getCalendarEventsRoom5() {
    return getCalendarEvents("c_b6c44e704bb0a6238f77863629a3dabc0e748ee8af4cd1a3b438a0cbe740da8c@group.calendar.google.com");
  }

  async function getCalendarEventsRoom6() {
    return getCalendarEvents("c_97923f05a9e6c79b7516856b54a834ae0ba29ea558d69a3cff389a6f2ff44252@group.calendar.google.com");
  }



  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถออกจากระบบได้", "error");
    } else {
      window.location.reload(); // รีโหลดหน้าเพื่อล้าง session
    }
  }



  async function getCalendarEvents(calendarId) {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + session.provider_token,
      },
    });

    if (!response.ok) {
      throw new Error('ข้อผิดพลาดในการดึงข้อมูลกิจกรรม');
    }

    const data = await response.json();
    return data.items.map(event => ({
      id: event.id,
      calendarId: calendarId, // ✅ เพิ่ม calendarId เข้าไปใน event
      title: event.summary || "ไม่มีหัวข้อ",
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      description: event.description || "ไม่มีรายละเอียด",
      location: event.location || '',
      attendees: event.attendees || [],
    }));
  }


  async function updateEventStatus(event, status) {
    if (!session) {
      Swal.fire("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนแก้ไขสถานะ", "warning");
      return;
    }

    if (!event.calendarId) {
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถระบุปฏิทินของอีเวนต์ได้", "error");
      return;
    }

    // ✅ ลบสถานะเก่าออก และเพิ่มสถานะใหม่เข้าไป
    const newDescription = event.description.replace(/สถานะ: .*/, `สถานะ: ${status}`);
    const updatedEvent = {
      summary: event.title,
      description: newDescription,
      start: { dateTime: event.start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: event.end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    };

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${event.calendarId}/events/${event.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: 'Bearer ' + session.provider_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEvent),
        }
      );

      if (!response.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");

      Swal.fire("อัปเดตสำเร็จ!", `สถานะถูกเปลี่ยนเป็น "${status}"`, "success");

      // ✅ โหลดข้อมูลใหม่จากปฏิทินที่ถูกต้อง
      switch (event.calendarId) {
        case "c_4fcb3687bff68bd0cc4b8f394d9ca95edfcbfc6808249100a2ed3ee913d5fa01@group.calendar.google.com":
          getCalendarEventsRoom1().then(setEventsRoom1);
          break;
        case "c_6480839702a7d71cb1d46ea3875400d2d3614f59d7a41f176b14565afd2a5a19@group.calendar.google.com":
          getCalendarEventsRoom2().then(setEventsRoom2);
          break;
        case "c_0e791d7dc9bdbc53eb3c7c6a3e219f18ad7f559f0908b7a18ab7268650ce4b9c@group.calendar.google.com":
          getCalendarEventsRoom3().then(setEventsRoom3);
          break;
        case "c_b78034e303b1aeb8ffde10672ac719fb5eb18d2df788f26d58399812a6e51f5c@group.calendar.google.com":
          getCalendarEventsRoom4().then(setEventsRoom4);
          break;
        case "c_b6c44e704bb0a6238f77863629a3dabc0e748ee8af4cd1a3b438a0cbe740da8c@group.calendar.google.com":
          getCalendarEventsRoom5().then(setEventsRoom5);
          break;
        case "c_97923f05a9e6c79b7516856b54a834ae0ba29ea558d69a3cff389a6f2ff44252@group.calendar.google.com":
          getCalendarEventsRoom6().then(setEventsRoom6);
          break;
        default:
          console.warn("ไม่พบปฏิทินที่ตรงกัน");
      }

    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้", "error");
    }
  }



  function findTopPopularTimes(events) {
    const timeSummary = {};

    events.forEach(event => {
      const startHour = event.start.getHours();
      const endHour = event.end.getHours();

      for (let hour = startHour; hour < endHour; hour++) {
        if (!timeSummary[hour]) {
          timeSummary[hour] = 0;
        }
        timeSummary[hour]++;
      }
    });

    return Object.entries(timeSummary)
      .map(([hour, count]) => ({ time: `${hour}:00 - ${parseInt(hour) + 1}:00`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // เอาเฉพาะ 5 อันดับแรก
  }


  function summarizeWeekdays(events) {
    const weekdayCounts = Array(5).fill(0); // จันทร์ - ศุกร์

    events.forEach(event => {
      const day = event.start.getDay();
      if (day >= 1 && day <= 5) { // นับเฉพาะวันจันทร์ - ศุกร์
        weekdayCounts[day - 1]++;
      }
    });

    const weekdays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
    return weekdays.map((name, index) => ({
      day: name,
      count: weekdayCounts[index]
    }));
  }

  const summarizeEquipmentUsage = (events) => {
    const equipmentUsage = { 'ไมโครโฟน': 0, 'โปรเจคเตอร์': 0, 'พอยเตอร์': 0 };

    events.forEach(event => {
      if (event.description) {
        const microphoneMatch = event.description.match(/ไมโครโฟน:\s*(\d+)/);
        const projectorMatch = event.description.match(/โปเจคเตอร์:\s*(\d+)/);
        const pointerMatch = event.description.match(/พอยเตอร์:\s*(\d+)/);

        if (microphoneMatch) {
          equipmentUsage['ไมโครโฟน'] += parseInt(microphoneMatch[1]);
        }
        if (projectorMatch) {
          equipmentUsage['โปรเจคเตอร์'] += parseInt(projectorMatch[1]);
        }
        if (pointerMatch) {
          equipmentUsage['พอยเตอร์'] += parseInt(pointerMatch[1]);
        }
      }
    });

    return equipmentUsage;
  };

  const equipmentChartData = {
    labels: ['ไมโครโฟน', 'โปรเจคเตอร์', 'พอยเตอร์'],
    datasets: [
      {
        label: 'ห้อง 1 (ครั้ง)',
        data: [
          summarizeEquipmentUsage(eventsRoom1)['ไมโครโฟน'],
          summarizeEquipmentUsage(eventsRoom1)['โปรเจคเตอร์'],
          summarizeEquipmentUsage(eventsRoom1)['พอยเตอร์'],
        ],
        backgroundColor: '#42a5f5',
      },
      {
        label: 'ห้อง 2 (ครั้ง)',
        data: [
          summarizeEquipmentUsage(eventsRoom2)['ไมโครโฟน'],
          summarizeEquipmentUsage(eventsRoom2)['โปรเจคเตอร์'],
          summarizeEquipmentUsage(eventsRoom2)['พอยเตอร์'],
        ],
        backgroundColor: '#66bb6a',
      },
      {
        label: 'ห้อง 3 (ครั้ง)',
        data: [
          summarizeEquipmentUsage(eventsRoom3)['ไมโครโฟน'],
          summarizeEquipmentUsage(eventsRoom3)['โปรเจคเตอร์'],
          summarizeEquipmentUsage(eventsRoom3)['พอยเตอร์'],
        ],
        backgroundColor: '#ff8c00',
      },
      {
        label: 'ห้อง 4 (ครั้ง)',
        data: [
          summarizeEquipmentUsage(eventsRoom4)['ไมโครโฟน'],
          summarizeEquipmentUsage(eventsRoom4)['โปรเจคเตอร์'],
          summarizeEquipmentUsage(eventsRoom4)['พอยเตอร์'],
        ],
        backgroundColor: '#ff5733',
      },
      {
        label: 'ห้อง 5 (ครั้ง)',
        data: [
          summarizeEquipmentUsage(eventsRoom5)['ไมโครโฟน'],
          summarizeEquipmentUsage(eventsRoom5)['โปรเจคเตอร์'],
          summarizeEquipmentUsage(eventsRoom5)['พอยเตอร์'],
        ],
        backgroundColor: '#8e44ad',
      },
      {
        label: 'ห้อง 6 (ครั้ง)',
        data: [
          summarizeEquipmentUsage(eventsRoom6)['ไมโครโฟน'],
          summarizeEquipmentUsage(eventsRoom6)['โปรเจคเตอร์'],
          summarizeEquipmentUsage(eventsRoom6)['พอยเตอร์'],
        ],
        backgroundColor: '#FFEB3B',
      },
    ],
  };

  const popularTimesChartData = {
    labels: ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00'],
    datasets: [
      {
        label: 'ห้อง 1 (ครั้ง)',
        data: popularTimesRoom1.map(item => item.count),
        backgroundColor: '#42a5f5',
      },
      {
        label: 'ห้อง 2 (ครั้ง)',
        data: popularTimesRoom2.map(item => item.count),
        backgroundColor: '#66bb6a',
      },
      {
        label: 'ห้อง 3 (ครั้ง)',
        data: popularTimesRoom3.map(item => item.count),
        backgroundColor: '#ff8c00',
      },
      {
        label: 'ห้อง 4 (ครั้ง)',
        data: popularTimesRoom4.map(item => item.count),
        backgroundColor: '#ff5733',
      },
      {
        label: 'ห้อง 5 (ครั้ง)',
        data: popularTimesRoom5.map(item => item.count),
        backgroundColor: '#8e44ad',
      },
      {
        label: 'ห้อง 6 (ครั้ง)',
        data: popularTimesRoom6.map(item => item.count),
        backgroundColor: '#FFEB3B',
      },
    ],
  };

  const weekdayChartData = {
    labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'],
    datasets: [
      {
        label: 'ห้อง 1 (ครั้ง)',
        data: weekdaySummaryRoom1.map(item => item.count),
        backgroundColor: '#42a5f5',
      },
      {
        label: 'ห้อง 2 (ครั้ง)',
        data: weekdaySummaryRoom2.map(item => item.count),
        backgroundColor: '#66bb6a',
      },
      {
        label: 'ห้อง 3 (ครั้ง)',
        data: weekdaySummaryRoom3.map(item => item.count),
        backgroundColor: '#ff8c00',
      },
      {
        label: 'ห้อง 4 (ครั้ง)',
        data: weekdaySummaryRoom4.map(item => item.count),
        backgroundColor: '#ff5733',
      },
      {
        label: 'ห้อง 5 (ครั้ง)',
        data: weekdaySummaryRoom5.map(item => item.count),
        backgroundColor: '#8e44ad',
      },
      {
        label: 'ห้อง 6 (ครั้ง)',
        data: weekdaySummaryRoom6.map(item => item.count),
        backgroundColor: '#FFEB3B',
      },
    ],
  };

  const pieChartData = {
    labels: ['ห้อง 1 (ครั้ง)', 'ห้อง 2 (ครั้ง)', 'ห้อง 3 (ครั้ง)', 'ห้อง 4 (ครั้ง)', 'ห้อง 5 (ครั้ง)', 'ห้อง 6 (ครั้ง)'],
    datasets: [
      {
        data: [totalBookingsRoom1, totalBookingsRoom2, totalBookingsRoom3, totalBookingsRoom4, totalBookingsRoom5, totalBookingsRoom6],
        backgroundColor: ['#42a5f5', '#66bb6a', '#ff8c00', '#ff5733', '#8e44ad', '#FFEB3B'],
        hoverBackgroundColor: ['#42a5f5', '#66bb6a', '#ff8c00', '#ff5733', '#8e44ad', '#FFEB3B'],
      },
    ],
  };

  const handleEventSelect = (event) => {
    if (!event.calendarId) {
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถระบุปฏิทินของอีเวนต์ได้", "error");
      return;
    }
    setSelectedEvent(event);
    setShowModal(true);
  };


  const handleClose = () => setShowModal(false);
  if (isLoading) return <></>;

  // ✅ **หน้าเข้าสู่ระบบ**
  if (!session) {
    return (
      <div style={{
        backgroundImage: `url(${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "background-image 1s ease-in-out"
      }}>
        <div style={{
          display: "flex",
          width: "780px",
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)"
        }}>
          {/* ส่วนข้อความและปุ่มล็อกอิน Google */}
          <div style={{
            width: "50%",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
              กรุณาเข้าสู่ระบบด้วยบัญชี ADMIN เพื่อใช้งานระบบ
            </h2>

            <button
              onClick={googleSignIn}
              style={{
                width: "100%",
                backgroundColor: "#28a745",
                color: "white",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "0.3s",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
            >
              เข้าสู่ระบบด้วย Google
            </button>
          </div>

          {/* ส่วนโลโก้ */}
          <div style={{
            width: "50%",
            backgroundColor: "#6F42C1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px"
          }}>
            <img
              src="/pig2.jpg"
              alt="Logo"
              style={{
                width: "70%",
                height: "auto",
                borderRadius: "50%",
                border: "5px solid white"
              }}
            />
          </div>
        </div>
      </div>
    );
  }


  // ✅ **หน้าหลังเข้าสู่ระบบ**
  return (
    <div className="App">
      <div className="container mt-5">
        <div className="text-center mb-4">
          <div className="d-flex flex-wrap justify-content-center">
            <h2 style={{ border: "3px solid #28A745", padding: "15px 20px", borderRadius: "10px", textAlign: "center", backgroundColor: "#DFF6DD", color: "#155724", boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.1)" }}>
              ยินดีต้อนรับ, {session?.user?.email} เข้าสู่ระบบจัดการจอง
            </h2>

            <a href="#" onClick={() => handleRoomChange(1, "ปฎิทินอาคารนนทบุรียิมเนเซียม", "#42a5f5")} className="btn mx-2 my-1" style={{ backgroundColor: '#42a5f5', color: 'white' }}>ปฎิทินอาคารนนทบุรียิมเนเซียม</a>
            <a href="#" onClick={() => handleRoomChange(2, "ปฎิทินสนามกีฬาหญ้าเทียม", "#66bb6a")} className="btn mx-2 my-1" style={{ backgroundColor: '#66bb6a', color: 'white' }}>ปฎิทินสนามกีฬาหญ้าเทียม</a>
            <a href="#" onClick={() => handleRoomChange(3, "ปฎิทินสระว่ายน้ำนนทบุรี", "#ff8c00")} className="btn mx-2 my-1" style={{ backgroundColor: '#ff8c00', color: 'white' }}>ปฎิทินสระว่ายน้ำนนทบุรี</a>
            <a href="#" onClick={() => handleRoomChange(4, "ปฎิทินสนามฟุตบอลนนทบุรีสเตเดียม", "#ff5733")} className="btn mx-2 my-1" style={{ backgroundColor: '#ff5733', color: 'white' }}>ปฎิทินสนามฟุตบอลนนทบุรีสเตเดียม</a>
          </div>

          {/* ข้อความแสดงชื่อปฏิทินที่เลือก */}
          {selectedCalendarName && (
            <div className="text-center mt-3">
              <h4 style={{ color: "#007BFF" }}>คุณกำลังดู: {selectedCalendarName}</h4>
            </div>
          )}
        </div>

        <div className="calendar-container" style={{
          border: `5px solid ${calendarBorderColor}`, // ✅ อัปเดตสีกรอบปฏิทิน
          padding: "20px",
          borderRadius: "20px"
        }}>
          <Calendar
            localizer={localizer}
            events={currentRoom === 1 ? eventsRoom1 :
              currentRoom === 2 ? eventsRoom2 :
                currentRoom === 3 ? eventsRoom3 :
                  currentRoom === 4 ? eventsRoom4 :
                    currentRoom === 5 ? eventsRoom5 :
                      eventsRoom6}
            startAccessor="start"
            endAccessor="end"
            style={{ height: window.innerWidth < 768 ? "400px" : "450px" }}
            onSelectEvent={handleEventSelect}
            eventPropGetter={eventStyleGetter}
          />
        </div>

        {/* 🔽 ย้ายสถานะการจองมาไว้ใต้ปฏิทิน 🔽 */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "15px",
          marginTop: "15px" // ✅ เพิ่มระยะห่างด้านบน
        }}>
          <div style={{
            backgroundColor: "red",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "15px",
            textAlign: "center",
            width: "160px"
          }}>
            การจองที่โดนปฎิเสธ
          </div>
          <div style={{
            backgroundColor: "yellow",
            color: "black",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "15px",
            textAlign: "center",
            width: "160px"
          }}>
            การจองที่รออนุมัติ
          </div>
          <div style={{
            backgroundColor: "orange",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "15px",
            textAlign: "center",
            width: "160px"
          }}>
            การจองที่รอชำระเงิน
          </div>
          <div style={{
            backgroundColor: "green",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            textAlign: "center",
            width: "160px"
          }}>
            การจองที่ผ่านการอนุมัติ
          </div>
        </div>

        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>รายละเอียดการจอง</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedEvent && (
              <div className="container">
                <div className="row mb-3">
                  <div className="col-sm-4 font-weight-bold text-secondary">ชื่อห้องประชุม:</div>
                  <div className="col-sm-8">{selectedEvent.title}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-4 font-weight-bold text-secondary">รายละเอียด:</div>
                  <div className="col-sm-8">
                    {selectedEvent.description ? (
                      selectedEvent.description.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))
                    ) : (
                      <span className="text-muted">ไม่มี</span>
                    )}
                  </div>
                </div>

                {/* ปุ่มอัปเดตสถานะ */}
                <div className="text-center mt-3">
                  {selectedEvent.description.includes("สถานะ: รออนุมัติ") && (
                    <button className="btn btn-warning mx-2" onClick={() => updateEventStatus(selectedEvent, "รอชำระเงิน")}>
                      ✅ อนุมัติ
                    </button>
                  )}
                  {selectedEvent.description.includes("สถานะ: รอชำระเงิน") && (
                    <button className="btn btn-success mx-2" onClick={() => updateEventStatus(selectedEvent, "อนุมัติ")}>
                      💰 ชำระเงินแล้ว
                    </button>
                  )}
                  <button className="btn btn-danger mx-2" onClick={() => updateEventStatus(selectedEvent, "ปฏิเสธ")}>
                    ❌ ปฏิเสธ
                  </button>
                </div>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button onClick={handleDeleteEvent} style={{ backgroundColor: '#d33', color: 'white', borderRadius: '5px', padding: '8px 16px' }}>
              🗑️ ลบการจอง
            </Button>
            <Button onClick={handleClose} style={{ backgroundColor: '#6c757d', color: 'white', borderRadius: '5px', padding: '8px 16px' }}>
              ปิด
            </Button>
          </Modal.Footer>
        </Modal>


        <div className="text-center mt-3">
          <button
            className="btn mx-2 w-100 my-2"
            style={{ backgroundColor: '#ff8c00', color: 'white' }}
            onClick={() => window.location.href = "https://calendar.google.com/calendar/u/0/r?cid=c_c49091981c3b59d31ba1356e5ebe59a1fad27c7c51815737ee3dff56149dce10@group.calendar.google.com"}
          >
            แก้ไขข้อมูลห้องประชุม
          </button>
        </div>


        <div className="text-center mt-4">
          <button
            className="btn btn-danger btn-lg"
            onClick={signOut}
          >
            ออกจากระบบ
          </button>
        </div>


      </div>
    </div >



  );
}

export default RoomAdmin;
