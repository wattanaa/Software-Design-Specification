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


  // ✅ แก้ไขข้อผิดพลาด React Hook "useState" is called conditionally
  const [stadiumZone, setStadiumZone] = useState([]);
  const [totalSeats, setTotalSeats] = useState('');


  const [systems, setSystems] = useState({
    ระบบไฟฟ้าส่องสว่าง: { เปิดใช้งาน: false, เวลาเริ่ม: '', เวลาสิ้นสุด: '', ระยะเวลา: '' },
    ระบบเสียง: { เปิดใช้งาน: false, เวลาเริ่ม: '', เวลาสิ้นสุด: '', ระยะเวลา: '' },
    ระบบจอภาพ5x10เมตร: { เปิดใช้งาน: false, เวลาเริ่ม: '', เวลาสิ้นสุด: '', ระยะเวลา: '' },
    ระบบจอภาพ3x3เมตร: { เปิดใช้งาน: false, เวลาเริ่ม: '', เวลาสิ้นสุด: '', ระยะเวลา: '' },
    ระบบเครื่องปรับอากาศ: { เปิดใช้งาน: false, เวลาเริ่ม: '', เวลาสิ้นสุด: '', ระยะเวลา: '' },
    ลานอเนกประสงค์: { เปิดใช้งาน: false, เวลาเริ่ม: '', เวลาสิ้นสุด: '', ระยะเวลา: '' }
  });

  const [rooms, setRooms] = useState({
    ห้องนักกีฬา1: '', ห้องนักกีฬา2: '', ห้องนักกีฬา3: '', ห้องนักกีฬา4: '',
    ห้องกรรมการ: '', ห้องพยาบาล: '', ห้องรับรองVIP: '', ห้องควบคุมเสียง: '', ห้องขายบัตร: ''
  });

  // ✅ แก้ไข: คำนวณค่าหลังจากที่ useState ถูกกำหนดค่าแล้ว
  const selectedSystems = Object.keys(systems)
    .filter(key => systems[key]?.เปิดใช้งาน || systems[key]?.active) // ตรวจสอบทั้งสองเงื่อนไข
    .map(key => key);


  const selectedRooms = Object.keys(rooms)
    .filter(key => rooms[key]);


  // ✅ แยกฟังก์ชันจัดการการเปลี่ยนค่าออกจากเงื่อนไข
  const toggleZone = (zone) => {
    setStadiumZone(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]);
  };

  const toggleSystem = (key) => {
    setSystems(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  // ฟังก์ชันอัปเดตเวลาระบบ
  const updateSystemTime = (key, field, value) => {
    setSystems(prev => {
      const updatedSystem = { ...prev[key], [field]: value };

      return { ...prev, [key]: updatedSystem };
    });
  };

  // ใช้ useEffect เพื่อคำนวณเวลาทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    setSystems(prev => {
      const updatedSystems = { ...prev };

      Object.keys(updatedSystems).forEach(key => {
        const system = updatedSystems[key];

        if (system.เวลาเริ่ม && system.เวลาสิ้นสุด) {
          const [startHour, startMinute] = system.เวลาเริ่ม.split(":").map(Number);
          const [endHour, endMinute] = system.เวลาสิ้นสุด.split(":").map(Number);

          let totalHours = endHour - startHour;
          let totalMinutes = endMinute - startMinute;

          if (totalMinutes < 0) {
            totalHours -= 1;
            totalMinutes += 60;
          }

          updatedSystems[key].ระยะเวลา = `${totalHours} ชั่วโมง ${totalMinutes} นาที`;
        }
      });

      return updatedSystems;
    });
  }, [systems]); // ทำงานทุกครั้งที่ค่า systems เปลี่ยนแปลง


  const updateRoomTime = (room, value) => {
    setRooms(prev => ({ ...prev, [room]: value }));
  };

  const styles = {
    card: {
      backgroundColor: "#E3F2FD",
      padding: "15px",
      borderRadius: "10px",
      textAlign: "left", // ✅ ทำให้ข้อความชิดซ้าย
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)"
    },
    cardTitle: {
      fontWeight: "bold",
      fontSize: "16px",
      display: "block",
      marginBottom: "10px"
    },
    cardContent: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      alignItems: "flex-start" // ✅ ทำให้ checkbox/radio อยู่ชิดซ้าย
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      whiteSpace: "nowrap",
      justifyContent: "flex-start", // ✅ ทำให้ checkbox อยู่ชิดซ้าย
      textAlign: "left"
    },
    radioLabel: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      whiteSpace: "nowrap",
      justifyContent: "flex-start", // ✅ ทำให้ radio อยู่ชิดซ้าย
      textAlign: "left"
    }
  };


  const [eventDescription, setEventDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(9);
  const [eventName, setEventName] = useState(""); // ชื่อผู้จอง
  const [email, setEmail] = useState(""); // Email ของผู้จอง
  const [organization, setOrganization] = useState(""); // องค์กร/สำนักงาน
  const [purpose, setPurpose] = useState(""); // วัตถุประสงค์ของการใช้

  // ⬇️ เปลี่ยนจาก state เดิมที่เป็น String ให้เป็น Array ⬇️
  const [stadiumZones, setStadiumZones] = useState([]); // เลือกโซนสนาม

  // ⬇️ ฟังก์ชันอัปเดตค่าเมื่อเลือก Checkbox ⬇️
  const toggleStadiumZone = (zone) => {
    setStadiumZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

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
    console.log("ค่า systems อัปเดตล่าสุด: ", systems);
  }, [systems]);

  console.log("ค่าที่ส่งไปบันทึก:", {
    stadiumZone,
    selectedSystems,
    selectedRooms
  });


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
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/c_4fcb3687bff68bd0cc4b8f394d9ca95edfcbfc6808249100a2ed3ee913d5fa01@group.calendar.google.com/events", {
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
      let status = "รออนุมัติ"; // ค่าเริ่มต้น
      const desc = event.description?.trim() || "";
      console.log("🔍 ตรวจสอบรายละเอียด:", desc); // ✅ Debug ตรวจสอบค่าจริง

      const statusMatch = desc.match(/สถานะ:\s*(อนุมัติ|ปฏิเสธ|รอชำระเงิน)/);
      if (statusMatch) {
        status = statusMatch[1];
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

    if (event.status === "รอชำระเงิน") {
      backgroundColor = "#FFA500"; // สีส้ม ✅
    } else if (event.status === "รออนุมัติ") {
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
        color: 'black',
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

    if (stadiumZone.length === 0) {
      console.log("ตรวจสอบค่าที่เลือก:", stadiumZone); // Debug ดูค่า
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

      summary: "จองอาคารนนทบุรียิมเนเซียม",
      description: `📌 **รายละเอียดการจอง**  
👤 ชื่อผู้จอง: ${eventName}  
📞 เบอร์โทรศัพท์: ${phone}  
📧 Email: ${email}  
🏢 องค์กร: ${organization}  
🎯 วัตถุประสงค์: ${purpose}  

⚽ **สนามแข่งขัน:** ${stadiumZone.length > 0 ? stadiumZone.join(", ") : "ไม่ได้เลือก"}  

🔌 **ระบบที่ต้องใช้:** ${selectedSystems.length > 0 ? selectedSystems.join(", ") : "ไม่ได้เลือก"}  

🏢 **ห้องที่ใช้:** ${selectedRooms.length > 0 ? selectedRooms.join(", ") : "ไม่ได้เลือก"}  

🧹 **การทำความสะอาด:** ${cleaningOption}  

✅ **สถานะ: รออนุมัติ**`,

      start: {
        dateTime: newStart.toISOString(), // ใช้ ISOString เพื่อให้แน่ใจว่าเป็นรูปแบบ UTC
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // ใช้ time zone ของเครื่องผู้ใช้
      },
      end: {
        dateTime: newEnd.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    };

    await fetch("https://www.googleapis.com/calendar/v3/calendars/c_4fcb3687bff68bd0cc4b8f394d9ca95edfcbfc6808249100a2ed3ee913d5fa01@group.calendar.google.com/events", {
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
          setStadiumZones([]); // ล้างค่าที่เลือก
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
              ยินดีต้อนรับ, {session.user.email} เข้าสู่การจองอาคารนนทบุรียิมเนเซียม
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
                ปฏิทินการจองอาคารนนทบุรียิมเนเซียม
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
                  fontSize: "15px",
                  textAlign: "center",
                  width: "160px"
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
                width: "100%",
                marginTop: "10px"
              }}>
                {/* 🕒 ส่วนเวลา */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  width: "100%",
                  marginBottom: "20px"
                }}>
                  <div>
                    <label style={{ fontWeight: "bold" }}>⏰ เวลาเริ่มจอง:</label>
                    <select value={startHour} onChange={e => setStartHour(parseInt(e.target.value))} style={inputStyle}>
                      {[...Array(11)].map((_, index) => (
                        <option key={index} value={index + 8}>{index + 8}:00</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: "bold" }}>⌛ เวลาสิ้นสุดจอง:</label>
                    <select value={endHour} onChange={e => setEndHour(parseInt(e.target.value))} style={inputStyle}>
                      {[...Array(11)].map((_, index) => (
                        <option key={index} value={index + 9}>{index + 9}:00</option>
                      ))}
                    </select>
                  </div>
                </div>



                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  padding: "20px",
                  backgroundColor: "#F9F9F9",
                  borderRadius: "10px"
                }}>


                  {/* สนามแข่งขัน */}
                  <div style={styles.card}>
                    <h3>🏟️ สนามแข่งขัน</h3>
                    <div style={styles.cardContent}>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" checked={stadiumZone.includes("สนามแข่งขัน")} onChange={() => toggleZone("สนามแข่งขัน")} />
                        สนามแข่งขัน
                      </label>
                    </div>
                  </div>

                  {/* อัฒจันทร์ */}
                  <div style={styles.card}>
                    <h3>🏟️ อัฒจันทร์</h3>
                    <div style={styles.cardContent}>
                      {["โซน A ฝั่งประธาน", "โซน B ฝั่งตรงข้ามประธาน", "โซน C ฝั่งบริเวณเวที", "โซน D ฝั่งตรงข้ามเวที"].map(zone => (
                        <label key={zone} style={styles.checkboxLabel}>
                          <input type="checkbox" checked={stadiumZone.includes(zone)} onChange={() => toggleZone(zone)} />
                          {zone}
                        </label>
                      ))}

                    </div>
                  </div>

                  {/* ระบบต่างๆ */}
                  <div style={styles.card}>
                    <h3>🔧 ระบบที่ต้องใช้</h3>
                    <div style={styles.cardContent}>
                      {Object.keys(systems).map(key => (
                        <div key={key}>
                          <label style={styles.checkboxLabel}>
                            <input type="checkbox" checked={systems[key].active} onChange={() => toggleSystem(key)} />
                            {key.replace(/([A-Z])/g, ' $1')}
                          </label>
                          {systems[key].active && (
                            <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ห้องกิจกรรม */}
                  <div style={styles.card}>
                    <h3>🏢 ห้องกิจกรรม</h3>
                    <div style={styles.cardContent}>
                      {Object.keys(rooms).map(roomKey => (
                        <div key={roomKey}>
                          <label style={styles.checkboxLabel}>
                            <input type="checkbox" checked={!!rooms[roomKey]} onChange={e => updateRoomTime(roomKey, e.target.checked ? "1" : "")} />
                            {roomKey.replace(/([A-Z])/g, ' $1')}
                          </label>
                          {rooms[roomKey] && (
                            <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                            </div>
                          )}
                        </div>
                      ))}
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
                    เข้าสู่ระบบเพื่อจองอาคารนนทบุรียิมเนเซียม
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

        )
        }
      </div >
    </div >
  );
}

export default Room1;
