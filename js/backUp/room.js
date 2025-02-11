import './App.css';
import { useSession, useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';

const localizer = momentLocalizer(moment);

function Room2() {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(9);
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
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/c_c49091981c3b59d31ba1356e5ebe59a1fad27c7c51815737ee3dff56149dce10@group.calendar.google.com/events", {
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
      title: event.summary,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      isBooked: true,
      description: event.description // เก็บ description สำหรับแสดงในปฏิทิน
    }));
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

  const eventPropGetter = (event) => {
    const backgroundColor = getCalendarStatus(event.start);
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  async function createCalendarEvent() {
    if (!eventName.trim()) {
        alert("กรุณาใส่ชื่อผู้จอง");
        return;
    }

    if (!phone.trim()) {
        alert("กรุณาใส่หมายเลขโทรศัพท์");
        return;
    }

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
        alert("มีการจองซ้ำในช่วงเวลานี้ กรุณาเลือกเวลาอื่น");
        return;
    }

    const event = {
        summary: "ห้องประชุมหมายเลข 2",
        description: `${eventName}\nเบอร์โทรศัพท์: ${phone}\n${eventDescription}\nไมโครโฟน: ${additionalItems.microphone}\nโปเจคเตอร์: ${additionalItems.projector}\nพอยเตอร์: ${additionalItems.laserPointer}`,
        start: {
            dateTime: newStart.toISOString(), // ใช้ ISOString เพื่อให้แน่ใจว่าเป็นรูปแบบ UTC
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // ใช้ time zone ของเครื่องผู้ใช้
        },
        end: {
            dateTime: newEnd.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
    };

    await fetch("https://www.googleapis.com/calendar/v3/calendars/c_c49091981c3b59d31ba1356e5ebe59a1fad27c7c51815737ee3dff56149dce10@group.calendar.google.com/events", {
      method: "POST",
        headers: {
            Authorization: 'Bearer ' + session.provider_token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
    })
    .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then((data) => {
        console.log(data);
        alert("จองสำเร็จแล้ว กรุณาตรวจสอบตารางเวลาในปฎิทิน!");

        getCalendarEvents().then(fetchedEvents => {
            setEvents(fetchedEvents);
        });
    })
    .catch(error => {
        console.error('ข้อผิดพลาดในการจอง:', error);
    });
}

  return (
    <div className="App">
      <div className="container">
        {session ? (
          <>
            <h2>ยินดีต้อนรับ, {session.user.email} ห้องหมายเลข 2</h2>

            <div className="calendar-container">
              <h3>ปฏิทินการจองห้องประชุม</h3>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={eventPropGetter}
                defaultView="week"
                formats={{
                  dayFormat: 'DD',
                  dayRangeHeaderFormat: ({ start, end }) =>
                    `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`,
                  timeGutterFormat: (date) => moment(date).format('HH:mm'),
                }}
              />
            </div>

            <hr />
            <div>
              <label>ชื่อผู้จอง:</label>
              <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} />

              <label>เบอร์โทรศัพท์:</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => {
                  const value = e.target.value;
                  // ตรวจสอบให้ใส่เฉพาะตัวเลข
                  if (/^\d*$/.test(value)) {
                    setPhone(value);
                  }
                }} 
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
              />

              <label>วันที่จอง:</label>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
              />

              <label>เวลาเริ่มจอง:</label>
              <select value={startHour} onChange={e => setStartHour(parseInt(e.target.value))}>
                {[...Array(11)].map((_, index) => (
                  <option key={index} value={index + 8}>{index + 8}:00</option>
                ))}
              </select>

              <label>เวลาสิ้นสุดจอง:</label>
              <select value={endHour} onChange={e => setEndHour(parseInt(e.target.value))}>
                {[...Array(11)].map((_, index) => (
                  <option key={index} value={index + 9}>{index + 9}:00</option>
                ))}
              </select>

              <label>อุปกรณ์เสริม:</label>
              <label>ไมโครโฟน:</label>
              <select value={additionalItems.microphone} onChange={e => setAdditionalItems({...additionalItems, microphone: parseInt(e.target.value)})}>
                {[0, 1, 2, 3].map(item => <option key={item} value={item}>{item}</option>)}
              </select>

              <label>โปเจคเตอร์:</label>
              <select value={additionalItems.projector} onChange={e => setAdditionalItems({...additionalItems, projector: parseInt(e.target.value)})}>
                {[0, 1, 2, 3].map(item => <option key={item} value={item}>{item}</option>)}
              </select>

              <label>พอยเตอร์:</label>
              <select value={additionalItems.laserPointer} onChange={e => setAdditionalItems({...additionalItems, laserPointer: parseInt(e.target.value)})}>
                {[0, 1, 2, 3].map(item => <option key={item} value={item}>{item}</option>)}
              </select>
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
          
          <>
          <h2>กรุณาเข้าสู่ระบบเพื่อจองห้องประชุมหมายเลข 2</h2>
          <button onClick={googleSignIn}>เข้าสู่ระบบด้วย Google</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Room2;
