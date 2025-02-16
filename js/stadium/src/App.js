import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import Swal from "sweetalert2";

const localizer = momentLocalizer(moment);

function Room1() {
  const [eventDescription, setEventDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(9);
  const [eventName, setEventName] = useState(""); // ชื่อผู้จอง
  const [email, setEmail] = useState(""); // Email ของผู้จอง
  const [organization, setOrganization] = useState(""); // องค์กร/สำนักงาน
  const [purpose, setPurpose] = useState(""); // วัตถุประสงค์ของการใช้

  const [stadiumZone, setStadiumZone] = useState(""); // เลือกโซนสนาม
  const [lighting, setLighting] = useState(false); // ระบบไฟฟ้า
  const [soundSystem, setSoundSystem] = useState(false); // ระบบเสียง
  const [internet, setInternet] = useState(false); // ระบบอินเทอร์เน็ต

  const [athleteRoom, setAthleteRoom] = useState(false); // ห้องพักนักกีฬา
  const [medicalRoom, setMedicalRoom] = useState(false); // ห้องพยาบาล
  const [vipRoom, setVipRoom] = useState(false); // ห้อง VIP
  const [pressRoom, setPressRoom] = useState(false); // ห้องแถลงข่าว

  const [cleaningOption, setCleaningOption] = useState(""); // การทำความสะอาด


  const [additionalItems, setAdditionalItems] = useState({
    projector: 0,
    laserPointer: 0,
    microphone: 0,
  });
  const [phone, setPhone] = useState(""); // สถานะสำหรับเบอร์โทรศัพท์

  const [events, setEvents] = useState([]);

  const session = useSession();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();

  useEffect(() => {
    if (session) {
      getCalendarEvents().then(fetchedEvents => {
        setEvents(fetchedEvents);
      });
    }
  }, [session]);

  if (isLoading) {
    return <></>;
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if (error) {
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function getCalendarEvents() {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/c_b78034e303b1aeb8ffde10672ac719fb5eb18d2df788f26d58399812a6e51f5c@group.calendar.google.com/events", {
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + session.provider_token,
      },
    });

    if (!response.ok) {
      throw new Error('ข้อผิดพลาดในการดึงข้อมูลกิจกรรม');
    }

    const data = await response.json();
    return data.items.map(event => {
      let status = "รอชำระเงิน"; // ✅ ค่าเริ่มต้น (Default)

      // ✅ ตรวจสอบว่า "description" มีค่าหรือไม่ (ป้องกัน Error)
      const desc = event.description?.trim() || ""; // ✅ ใช้ `trim()` เพื่อลบช่องว่าง
      const statusMatch = desc.match(/สถานะ:\s*(อนุมัติ|ปฏิเสธ)/);

      if (statusMatch) {
        status = statusMatch[1]; // ✅ ดึงค่าที่ตรงกับ "อนุมัติ" หรือ "ปฏิเสธ"
      }

      return {
        id: event.id, // ✅ เก็บ ID ของ event เพื่อใช้แก้ไขภายหลัง
        title: event.summary || "ไม่ระบุหัวข้อ", // ✅ ป้องกัน null title
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        description: desc || "ไม่มีรายละเอียด", // ✅ ป้องกัน null description
        status, // ✅ ใส่สถานะของแต่ละ event
      };
    });
  }


  const getDayEvents = (date) => {
    return events.filter(event => {
      const eventDate = moment(event.start).format('YYYY-MM-DD');
      return eventDate === moment(date).format('YYYY-MM-DD');
    });
  };

  const getCalendarStatus = (date) => {
    const dayEvents = getDayEvents(date);
    if (dayEvents.length === 0) {
      return 'green'; // ไม่มีการจอง
    }
    const totalBookedHours = dayEvents.reduce((acc, event) => {
      const startHour = event.start.getHours();
      const endHour = event.end.getHours();
      return acc + (endHour - startHour);
    }, 0);

    if (totalBookedHours >= 11) { // ถ้ามีการจอง 11 ชั่วโมง (8:00 - 19:00)
      return 'red'; // จองทั้งวัน
    }

    return 'green'; // จองบางช่วงเวลา
  };


  const formContainer = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    margin: "auto"
  };

  const headerStyle = {
    textAlign: "center",
    color: "#007BFF",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "10px"
  };

  const formGroup = {
    display: "flex",
    flexDirection: "column"
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#333"
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "#f9f9f9",
    transition: "0.3s"
  };

  const calendarContainer = {
    display: "flex",
    justifyContent: "center",
    padding: "10px",
    backgroundColor: "#F8F9FA",
    borderRadius: "8px",
    border: "1px solid #ddd"
  };

  const timeSelectContainer = {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px"
  };

  const timeSelectGroup = {
    display: "flex",
    flexDirection: "column",
    width: "48%"
  };


  const eventPropGetter = (event) => {
    let backgroundColor = "#42a5f5"; // สีเริ่มต้น (ฟ้า)

    // ✅ กำหนดสีตาม "สถานะ"
    if (event.status === "รอชำระเงิน") {
      backgroundColor = "#FFFF00"; // สีเหลือง
    } else if (event.status === "อนุมัติ") {
      backgroundColor = "#00FF00"; // สีเขียว
    } else if (event.status === "ปฏิเสธ") {
      backgroundColor = "#FF0000"; // สีแดง
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'black', // ใช้สีดำแทนขาวเพื่อให้อ่านง่ายขึ้นในบางสี
        border: '0px',
        display: 'block',
      },
    };
  };


  async function createCalendarEvent() {
    //-----------------------------------//
    if (!eventName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาใส่ชื่อผู้จอง",
        text: "ชื่อผู้จองเป็นข้อมูลที่จำเป็น กรุณากรอกชื่อ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ffc107"
      });
      return;
    }
    //

    if (!phone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาใส่หมายเลขโทรศัพท์",
        text: "หมายเลขโทรศัพท์เป็นข้อมูลที่จำเป็น กรุณากรอกหมายเลขโทรศัพท์ของคุณ",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ffc107"
      });
      return;
    }

    // ✅ ตรวจสอบอีเมล
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailPattern.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "รูปแบบอีเมลไม่ถูกต้อง",
        text: "กรุณากรอกอีเมลที่ถูกต้อง เช่น example@gmail.com",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ffc107"
      });
      return;
    }

    if (!organization.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกชื่อองค์กร",
        text: "กรุณาใส่ชื่อองค์กร/สำนักงานของคุณก่อนทำการจอง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ffc107"
      });
      return;
    }

    if (!stadiumZone) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกโซนสนาม",
        text: "ต้องเลือกโซนสนามก่อนจอง",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ffc107"
      });
      return;
    }

    if (startHour >= endHour) {
      Swal.fire({
        icon: "error",
        title: "เวลาจองไม่ถูกต้อง",
        text: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33"
      });
      return;
    }

    if (!cleaningOption) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกวิธีทำความสะอาด",
        text: "กรุณาเลือกว่าผู้ใช้หรือสถานที่เป็นผู้ทำความสะอาด",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#ffc107"
      });
      return;
    }



    //-----------------------------------//

    const newStart = new Date(selectedDate);
    newStart.setHours(startHour, 0, 0, 0); // ตั้งค่าวินาทีและมิลลิวินาทีให้เป็น 0

    const newEnd = new Date(selectedDate);
    newEnd.setHours(endHour, 0, 0, 0); // ตั้งค่าวินาทีและมิลลิวินาทีให้เป็น 0

    const isConflict = events.some(event => {
      return (
        (newStart >= event.start && newStart < event.end) ||
        (newEnd > event.start && newEnd <= event.end)
      );
    });

    if (isConflict) {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถจองได้",
        text: "มีการจองซ้ำในช่วงเวลานี้ กรุณาเลือกเวลาอื่น",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#d33"
      });
      return;
    }

    const event = {
      summary: "จองสนามฟุตบอลนนทบุรีสเตเดียม",
      description: `📌 **รายละเอียดการจอง**  
  👤 ชื่อผู้จอง: ${eventName}  
  📞 เบอร์โทรศัพท์: ${phone}  
  📧 Email: ${email}  
  🏢 องค์กร: ${organization}  
  🎯 วัตถุประสงค์: ${purpose}  
  
  ⚽ **สนามแข่งขัน:** ${stadiumZone}  
  
  🔌 **ระบบที่ต้องใช้:** ${[
          lighting ? "ไฟฟ้า" : "",
          soundSystem ? "เสียง" : "",
          internet ? "อินเทอร์เน็ต" : ""
        ].filter(Boolean).join(", ")}
  
  🏢 **ห้องที่ใช้:** ${[
          athleteRoom ? "ห้องพักนักกีฬา" : "",
          medicalRoom ? "ห้องพยาบาล" : "",
          vipRoom ? "ห้อง VIP" : "",
          pressRoom ? "ห้องแถลงข่าว" : ""
        ].filter(Boolean).join(", ")}
  
  🧹 **การทำความสะอาด:** ${cleaningOption}  
  
  ✅ **สถานะ: รอชำระเงิน**`,

      start: {
        dateTime: newStart.toISOString(), // ใช้ ISOString เพื่อให้แน่ใจว่าเป็นรูปแบบ UTC
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // ใช้ time zone ของเครื่องผู้ใช้
      },
      end: {
        dateTime: newEnd.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    };

    await fetch("https://www.googleapis.com/calendar/v3/calendars/c_b78034e303b1aeb8ffde10672ac719fb5eb18d2df788f26d58399812a6e51f5c@group.calendar.google.com/events", {
      method: "POST",
      headers: {
        Authorization: 'Bearer ' + session.provider_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);

        Swal.fire({
          icon: "success",
          title: "จองสำเร็จแล้ว!",
          text: "กรุณาตรวจสอบตารางเวลาในปฏิทิน",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#28a745"
        }).then(() => {
          getCalendarEvents().then(fetchedEvents => {
            setEvents(fetchedEvents);
          });

          setEventName("");
          setPhone("");
          setEmail("");
          setOrganization("");
          setPurpose("");
          setEventDescription("");
          setSelectedDate(new Date());
          setStartHour(8);
          setEndHour(9);
          setStadiumZone("");
          setLighting(false);
          setSoundSystem(false);
          setInternet(false);
          setAthleteRoom(false);
          setMedicalRoom(false);
          setVipRoom(false);
          setPressRoom(false);
          setCleaningOption("");
        });
      })

      .catch(error => {
        console.error("ข้อผิดพลาดในการจอง:", error);

        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถทำการจองได้ กรุณาลองใหม่อีกครั้ง",
          confirmButtonText: "ปิด",
          confirmButtonColor: "#d33"
        });
      });
  }

  return (
    <div className="App">
      <div className="container">
        {session ? (
          <>
            <h2 style={{
              border: "3px solid #28A745", // เส้นขอบสีเขียว
              padding: "15px 20px", // เว้นระยะรอบตัวอักษร
              borderRadius: "10px", // ขอบมน
              textAlign: "center", // จัดข้อความตรงกลาง
              backgroundColor: "#DFF6DD", // พื้นหลังสีเขียวอ่อน
              color: "#155724", // สีข้อความให้เข้ากับธีม
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.1)" // เพิ่มเงานุ่ม ๆ
            }}>
              ยินดีต้อนรับ, {session.user.email} เข้าสู่การจองสนามฟุตบอลนนทบุรีสเตเดียม
            </h2>


            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%"
            }}>
              <h2 style={{
                border: "3px solid #007BFF",
                padding: "15px 20px",
                borderRadius: "10px",
                textAlign: "center",
                backgroundColor: "#E3F2FD",
                color: "#004085",
                boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.1)"
              }}>
                ปฏิทินการจองสนามฟุตบอลนนทบุรีสเตเดียม
              </h2>

              {/* ป้ายสถานะการจอง */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
                marginBottom: "15px"
              }}>
                <div style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontSize: "15px",
                  textAlign: "center",
                  width: "150px"
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
                  width: "150px"
                }}>
                  การจองที่รออนุมัติ
                </div>
                <div style={{
                  backgroundColor: "green",
                  color: "white",
                  padding: "5px 13px",
                  borderRadius: "5px",
                  fontSize: "15px",
                  textAlign: "center",
                  width: "150px"
                }}>
                  การจองที่ผ่านการอนุมัติ
                </div>
              </div>

              {/* ปฏิทิน */}
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{
                  height: "70vh",
                  minHeight: "500px",
                  width: "90%",
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)"
                }}
                eventPropGetter={eventPropGetter}
                defaultView="month"
                formats={{
                  dayFormat: 'DD',
                  dayRangeHeaderFormat: ({ start, end }) =>
                    `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`,
                  timeGutterFormat: (date) => moment(date).format('HH:mm'),
                }}
              />
            </div>


            <hr />
            <div style={formContainer}>
              <h3 style={headerStyle}>📅 แบบฟอร์มอาคารนนทบุรียิมเนเซียม</h3>

              <div style={formGroup}>
                <label style={labelStyle}>👤 ชื่อผู้จอง:</label>
                <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} style={inputStyle} />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>📞 เบอร์โทรศัพท์:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setPhone(value);
                    }
                  }}
                  placeholder="กรุณากรอกเบอร์โทรศัพท์"
                  style={inputStyle}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>📧 Email ของผู้จอง:</label>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>🏢 องค์กร/สำนักงาน:</label>
                <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} style={inputStyle} />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>🎯 วัตถุประสงค์ของการใช้:</label>
                <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} style={inputStyle} />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>📅 วันที่จอง:</label>
                <div style={calendarContainer}>
                  <Calendar onChange={setSelectedDate} value={selectedDate} />
                </div>
              </div>

              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
                backgroundColor: "#F9F9F9",
                padding: "15px",
                borderRadius: "10px"
              }}>
                {/* ⏳ เวลาเริ่ม & ⌛ เวลาสิ้นสุด */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  justifyContent: "center"
                }}>
                  <label>⏳ เวลาเริ่ม:</label>
                  <select value={startHour} onChange={e => setStartHour(parseInt(e.target.value))}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                    {[...Array(11)].map((_, index) => (
                      <option key={index} value={index + 8}>{index + 8}:00</option>
                    ))}
                  </select>

                  <label>⌛ เวลาสิ้นสุด:</label>
                  <select value={endHour} onChange={e => setEndHour(parseInt(e.target.value))}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                    {[...Array(11)].map((_, index) => (
                      <option key={index} value={index + 9}>{index + 9}:00</option>
                    ))}
                  </select>
                </div>

                {/* ⚽ สนามแข่งขัน */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "center"
                }}>
                  <label>⚽ สนามแข่งขัน:</label>
                  <select value={stadiumZone} onChange={e => setStadiumZone(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                    <option value="">เลือกโซน</option>
                    <option value="โซน A (ม่วง+VIP)">โซน A ด้านหลังฝั่งประธาน (ม่วง)+VIP</option>
                    <option value="โซน B (เขียว)">โซน B ด้านมีหลังคา (เขียว)</option>
                    <option value="โซน C1,C2 (ส้ม)">โซน C1,C2 ฝั่งประธาน (ส้ม)</option>
                    <option value="โซน C3,C4 (ส้ม)">โซน C3,C4 (ส้ม)</option>
                    <option value="โซน D1 (เหลือง)">โซน D1 ด้านคนพลัง (เหลือง)</option>
                    <option value="โซน D2 (เหลือง)">โซน D2 ด้านสกรอบออร์ต (เหลือง)</option>
                  </select>
                </div>
                {/* กล่องหลัก (แบ่งเป็น 3 คอลัมน์) */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "20px",
                  padding: "20px",
                  backgroundColor: "#F9F9F9",
                  borderRadius: "10px"
                }}>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    justifyContent: "flex-start"
                  }}>

                    {/* 🔧 ระบบที่ต้องใช้ */}
                    <div style={{
                      backgroundColor: "#E3F2FD", // สีฟ้าอ่อน
                      padding: "15px",
                      borderRadius: "8px",
                      minWidth: "280px",
                      textAlign: "left"
                    }}>
                      <label style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        display: "block",
                        marginBottom: "10px"
                      }}>
                        🔧 ระบบที่ต้องใช้:
                      </label>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start", // ✅ ชิดซ้าย
                        gap: "8px"
                      }}>
                        <label style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "10px",
                          whiteSpace: "nowrap" // ✅ ทำให้ข้อความอยู่บรรทัดเดียว
                        }}>
                          <input type="checkbox" checked={lighting} onChange={() => setLighting(!lighting)} />
                          ไฟฟ้าส่องสว่าง
                        </label>
                        <label style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "10px",
                          whiteSpace: "nowrap"
                        }}>
                          <input type="checkbox" checked={soundSystem} onChange={() => setSoundSystem(!soundSystem)} />
                          ระบบเสียง
                        </label>
                        <label style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "10px",
                          whiteSpace: "nowrap"
                        }}>
                          <input type="checkbox" checked={internet} onChange={() => setInternet(!internet)} />
                          อินเทอร์เน็ต
                        </label>
                      </div>
                    </div>

                    {/* 🏢 ห้องกิจกรรมที่ต้องใช้ */}
                    <div style={{
                      backgroundColor: "#E8F5E9", // สีเขียวอ่อน
                      padding: "15px",
                      borderRadius: "8px",
                      minWidth: "280px",
                      textAlign: "left"
                    }}>
                      <label style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        display: "block",
                        marginBottom: "10px"
                      }}>
                        🏢 ห้องที่ต้องใช้:
                      </label>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "8px"
                      }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                          <input type="checkbox" checked={athleteRoom} onChange={() => setAthleteRoom(!athleteRoom)} />
                          ห้องพักนักกีฬา
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                          <input type="checkbox" checked={medicalRoom} onChange={() => setMedicalRoom(!medicalRoom)} />
                          ห้องพยาบาล
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                          <input type="checkbox" checked={vipRoom} onChange={() => setVipRoom(!vipRoom)} />
                          ห้อง VIP
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                          <input type="checkbox" checked={pressRoom} onChange={() => setPressRoom(!pressRoom)} />
                          ห้องแถลงข่าว
                        </label>
                      </div>
                    </div>

                    {/* 🧹 การทำความสะอาด */}
                    <div style={{
                      backgroundColor: "#FFF3E0", // สีส้มอ่อน
                      padding: "15px",
                      borderRadius: "8px",
                      minWidth: "280px",
                      textAlign: "left"
                    }}>
                      <label style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        display: "block",
                        marginBottom: "10px"
                      }}>
                        🧹 การทำความสะอาด:
                      </label>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "8px"
                      }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                          <input type="radio" name="cleaning" value="ผู้ใช้รับผิดชอบ" onChange={() => setCleaningOption("ผู้ใช้รับผิดชอบ")} />
                          ให้ผู้ใช้ทำความสะอาด
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                          <input type="radio" name="cleaning" value="สถานที่เป็นผู้ดำเนินการ" onChange={() => setCleaningOption("สถานที่เป็นผู้ดำเนินการ")} />
                          ให้สถานที่ดำเนินการ
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>





            <hr />
            <div className="button-group">
              <button className="btn create-btn" onClick={createCalendarEvent}>
                ยืนยันการจอง
              </button>

              <button className="btn sign-out-btn" onClick={signOut}>
                ออกจากระบบ
              </button>

              <a href="https://hoomebookingroom.web.app" className="btn back-btn">
                กลับหน้าหลัก
              </a>
            </div>
          </>

        ) : (

          //--------------------------ล็อกอิน-------------------------------//
          <>
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "30vh",
              backgroundColor: "white" // ลบพื้นหลังสีเทาออก
            }}>
              <div style={{
                display: "flex",
                width: "780px",
                backgroundColor: "white",
                borderRadius: "12px", // ลดขอบให้ดูสวยขึ้น
                overflow: "hidden" // ป้องกันขอบเกิน
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
                    เข้าสู่ระบบเพื่อจองสนามฟุตบอลนนทบุรีสเตเดียม
                  </h2>

                  {/* ปุ่มเข้าสู่ระบบด้วย Google */}
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
                    src="/pig2.jpg" // เปลี่ยนเป็น path รูปของคุณ
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




          </>

        )}
      </div>
    </div >
  );
}

export default Room1;
