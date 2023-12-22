var Calendar = Calendar || {};

Calendar.createCalendar = function(id,availability,schedule,divCalendar,device,room){

document.getElementById(id).innerHTML +=

`
<div class="flex items-center justify-center py-8 px-4 font-sans">
                <!-- caso precise , incluir isso .max-w-s --> 
                <div class="shadow-lg">
                    <div class="md:p-8 p-5 bg-gray-800 bg-white rounded-t"  style = "background: var(--bg)">
                        <div class="px-4 flex items-center justify-between">
                            <span  tabindex="0" class="focus:outline-none  text-base font-bold dark:text-gray-100 text-gray-800" id = "month-year" >October 2020</span>
                            <div class="flex items-center">
                                <button aria-label="calendar backward" class="focus:text-gray-400 hover:text-gray-400 text-gray-800 dark:text-gray-100" id= "prevMonth">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <polyline points="15 6 9 12 15 18" />
                                </svg>
                            </button>
                            <button aria-label="calendar forward" class="focus:text-gray-400 hover:text-gray-400 ml-3 text-gray-800 dark:text-gray-100" id ="nextMonth"> 
                                  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler  icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <polyline points="9 6 15 12 9 18" />
                                </svg>
                            </button>
    
                            </div>
                        </div>
                        <table class="w-full font-sans" id = "calendar-body">

                        </table>
                    </div>
                </div>
</div>
`
buildCalendar(availability,schedule,divCalendar,device,room)
}

Calendar.createCalendar("mainDiv") // apenas para visualização na pagina html

var year;
var currentMonth;

function buildCalendar(availability, schedule) {
    var date = new Date();
    currentMonth = date.getMonth();
     year = date.getFullYear();
  
    document.getElementById("prevMonth").addEventListener("click", function () {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        year--;
      }
      rebuildCalendar(availability, schedule);
      
    });
  
    document.getElementById("nextMonth").addEventListener("click", function () {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        year++;
      }
      rebuildCalendar(availability, schedule);
      
    });
    
    rebuildCalendar(availability, schedule);
    
    
  }
  function buildDailySchedule(day) {
    var scheduleContainer = document.getElementById("schedule-container");
    scheduleContainer.innerHTML = `
      <div class="clock">
        <div class="clock-face">
          ${generateClockMarks()}
        </div>
      </div>`;
  }
  
  function generateClockMarks() {
    let marksHTML = '';
    for (let i = 1; i <= 12; i++) {
      marksHTML += `<div class="triangle" style="--i: ${i};"><b>${i}</b></div>`;
    }
    return marksHTML;
  }
  
  function generateWeekdayHeader() {
    const weekdays = moment.weekdaysShort(); // Use moment.js to get localized weekdays
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
  
    weekdays.forEach((weekday) => {
      const th = document.createElement("th");
      const div = document.createElement("div");
      const p = document.createElement("p");
  
      div.classList.add("w-full", "flex", "justify-center");
      p.classList.add("text-base", "font-medium", "text-center", "text-gray-800", "dark:text-gray-100");
      p.textContent = weekday;
  
      div.appendChild(p);
      th.appendChild(div);
      tr.appendChild(th);
    });
  
    thead.appendChild(tr);
    return thead;
  }
  
  function rebuildCalendar(availability, schedule) {
    var calendarBody = document.getElementById("calendar-body");
    calendarBody.innerHTML = "";
  
    var date = new Date([year, currentMonth, 1]);
    var currentMonthFirstDay = date.getDay();
    var daysInMonth = new Date(year, currentMonth + 1, 0).getDate();

  
    var prevMonth = new Date(year, currentMonth, 0);
    var daysInPrevMonth = prevMonth.getDate();
    var prevMonthStartDay = prevMonth.getDay();

    var day = 1;
    var row;
  
    var monthYearHeader = document.getElementById("month-year");
    monthYearHeader.innerHTML = getMonthName(currentMonth) + " " + year;
  
    calendarBody.appendChild(generateWeekdayHeader()); // dias da semana
  
    row = calendarBody.insertRow();
    // dias do mes passado
    for (var i = prevMonthStartDay; i >= 0; i--) {
        var cell = row.insertCell();
        var dayToShow = daysInPrevMonth - i;
        var cellDiv = document.createElement("div");
        cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full", "text-transparent","justify-center", "divCell");
        cellDiv.classList.remove("unavailable","available","parcialavailable")
        cellDiv.style.backgroundColor = 'transparent'
        cell.appendChild(cellDiv);
        var pDiv = document.createElement("p")
        pDiv.classList.add("text-base","text-gray-500","text-opacity-80","pCell")
        cellDiv.appendChild(pDiv)
        pDiv.innerHTML = dayToShow
        cell.classList.add("prev-month");
        cell.addEventListener("click", function() {
            currentMonth--;
            if (currentMonth < 0) {
              currentMonth = 11;
              year--;
            }
            rebuildCalendar(availability, schedule);
            
          });
      }
    // dias atuais 
    for (var i = 0; i < daysInMonth; i++) {
      if (row.cells.length === 7) {
        row = calendarBody.insertRow();
      }
      var cell = row.insertCell();
      var cellDiv = document.createElement("div")
      cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full", "justify-center", "divCell","rounded-lg");
      cellDiv.setAttribute("tabindex",0)
      cell.appendChild(cellDiv)
      var pDiv = document.createElement("p")
      pDiv.classList.add("text-base","text-gray-500","dark:text-gray-100","font-semibold","pCell")
      pDiv.style.color = "var(--text-standard)"
      cellDiv.appendChild(pDiv)
      pDiv.innerHTML = day;
      cell.addEventListener("click", function () {
        // buildDailySchedule(parseInt(this.innerHTML));
      });
      day++;
    }
    // dias do mes seguinte
    var nextMonthDay = 1;
    while (row.cells.length < 7) {
      var cell = row.insertCell();
      var cellDiv = document.createElement("div")
      cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full","text-transparent", "justify-center", "divCell");
      cellDiv.classList.remove("unavailable","available","parcialavailable")
      cellDiv.style.backgroundColor = 'transparent'
      cell.appendChild(cellDiv)
      var pDiv = document.createElement("p")
      pDiv.classList.add("text-base","text-gray-500","text-opacity-80","pCell")
      cellDiv.appendChild(pDiv)
      pDiv.innerHTML = nextMonthDay
      cell.classList.add("next-month");
      cell.addEventListener("click", function() {
        currentMonth++; 
        if (currentMonth > 11) {
          currentMonth = 0;
          year++;
        }
        rebuildCalendar(availability, schedule);
      });
      nextMonthDay++;
    }
    var cells = document.querySelectorAll("#calendar-body td div");
    cells.forEach(function (cell) {
      var selectedDate = moment([year, currentMonth, cell.textContent ]);
      var diaDaSemana = selectedDate.format('dddd');
      cell.setAttribute("day-week", diaDaSemana);
  
      var selectedDay = parseInt(cell.textContent);
      var formattedDate = moment(selectedDay + "-" + (currentMonth + 1) + "-" + year, "D-M-YYYY").format("YYYY-MM-DD");
      cell.setAttribute("data-date", formattedDate);
      
      cell.addEventListener("click", function () {
        console.log("Data inicio:" + formattedDate + "T" + "00:00");
        console.log("Data Fim:" + formattedDate +  "T" + "23:59");
        // makeDivConfirmPhoneRecurrentSchedule()
      });
    });
    UpdateAvailability(availability,schedule) // atualizar visualização do calendario
  }
  
  function getMonthName(month) {
    var months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[month];
  }
  
  function getDayName(day) {
    var days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days[day];
  }
  
  //funções de disponibilidade
      
function UpdateAvailability(availability, schedules, recurrent) {
        var cells = document.querySelectorAll("#calendar-body tr td div");
        if (availability.length === 0) {
            cells.forEach(function (td) {
                td.classList.add('unavailable');
            });
        }
        else {
            if(recurrent == "sim"){
                cells = document.querySelectorAll(".recurrentText")
                console.log("recurrent == sim")
            }
            availability.forEach(function (dates) {
                if (dates.type == "recurrentType") {
                    cells.forEach(function (td) {
                        // var dayWeek = td.getAttribute('day-week')
                        // console.log("DAY WEEK " + dayWeek)
                        var dayOfWeek = findDayOfWeek(td.getAttribute('day-week'));
                        var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');

                        var defaultDate = "2000-01-01";
                        console.log("cases of week" + dayOfWeek)
                        switch (dayOfWeek) {
                            case "monday":
                                if (dates.timestart_monday < dates.timeend_monday && dates.timestart_monday != "" && dates.timeend_monday != "") {
                                  
                                    var start = moment(defaultDate + " " + dates.timestart_monday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_monday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                        if (totalHours <= 6) {
                                            td.classList.remove('unavailable');
                                            td.classList.add('text-green-500');
                                            // td.classList.add('parcialavailable');
                                        } else {
                                            td.classList.remove('unavailable');
                                            td.classList.add('text-green-500');
                                        }
                                    
                                } else {
                                    td.classList.add('unavailable');
                                }
                                // console.log("Schedules:" +  schedules)
                                // schedules.forEach(function(dateS){
                                //     var dataSplit = dateS.data_start
                                //     var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //     console.log("Data Split " + dataSplit)
                                //     console.log("Data S " + dataS)

                                //     if(dataDate == dataS ){
                                //         td.classList.remove('parcialavailable');
                                //         td.classList.add('unavailable')
                                //     }
                                // })
                                return
                            case "tuesday":
                                if (dates.timestart_tuesday < dates.timeend_tuesday && dates.timestart_tuesday != "" && dates.timeend_tuesday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_tuesday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_tuesday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    console.log("LENGTH DELE " + dates.timestart_tuesday.length)
                               
                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('text-green-500');
                                        // td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('text-green-500');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)

                                // schedules.forEach(function(dateS){
                                //     var dataSplit = dateS.data_start
                                //     var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //     //console.log("Data Split " + GetDeviceSchedulesResult)
                                //     console.log("Data S " + dataS)

                                //     if(dataDate == dataS ){
                                //         td.classList.remove('parcialavailable');
                                //         td.classList.add('unavailable')
                                //     }
                                // })
                                
                                return
                            case "wednesday":
                                if (dates.timestart_wednesday < dates.timeend_wednesday && dates.timestart_wednesday != "" && dates.timeend_wednesday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_wednesday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_wednesday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                
                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('text-green-500');
                                        // td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('text-green-500');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)

                                schedules.forEach(function(dateS){
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })

                                return
                            case "thursday":
                                if (dates.timestart_thursday < dates.timeend_thursday && dates.timestart_thursday != "" && dates.timeend_thursday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_thursday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_thursday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                             
                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('text-green-500');
                                        // td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('text-green-500');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)

                                schedules.forEach(function(dateS){
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "friday":
                                if (dates.timestart_friday < dates.timeend_friday && dates.timestart_friday != "" && dates.timeend_friday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_friday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_friday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)
                                schedules.forEach(function(dateS){
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "saturday":
                                if (dates.timestart_saturday < dates.timeend_saturday && dates.timestart_saturday != "" && dates.timeend_saturday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_saturday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_saturday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                console.log("Schedules:" +  schedules)

                                schedules.forEach(function(dateS){
                                    var dataSplit = dateS.data_start
                                    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                    console.log("Data Split " + dataSplit)
                                    console.log("Data S " + dataS)

                                    if(dataDate == dataS ){
                                        td.classList.remove('parcialavailable');
                                        td.classList.add('unavailable')
                                    }
                                })
                                return
                            case "sunday":
                                if (dates.timestart_sunday < dates.timeend_sunday && dates.timestart_sunday != "" && dates.timeend_sunday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_sunday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_sunday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (totalHours <= 6) {
                                        td.classList.remove('unavailable');
                                        td.classList.add('parcialavailable');
                                    } else {
                                        td.classList.remove('unavailable');
                                        td.classList.add('available');
                                    }
                                } else {
                                    td.classList.add('unavailable');
                                }
                                // console.log("Schedules:" +  schedules)
                               
                                // schedules.forEach(function(dateS){
                                //     var dataSplit = dateS.data_start
                                //     var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //     console.log("Data Split " + dataSplit)
                                //     console.log("Data S " + dataS)

                                //     if(dataDate == dataS ){
                                //         td.classList.remove('parcialavailable');
                                //         td.classList.add('unavailable')
                                //     }
                                // })

                                return

                            default:
                                td.classList.add('unavailable');
                                
                        }
                    });

                } else if (dates.type == "periodType"){
                    var datastart = moment(dates.data_start).format('YYYY-MM-DD');
                    var dataend = moment(dates.data_end).format('YYYY-MM-DD');
                    cells.forEach(function (td) {
                        var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');
                        if (dataDate >= datastart && dataDate <= dataend) {
                            td.classList.remove("unavailable")
                            td.classList.add("available")


                        } else {
                            td.classList.add('unavailable');
                        }
                    });
                }
            })
        }
        console.log("UpdateAvailability Result Success");
  }

    
  function findDayOfWeek(classes) {
      for (var j = 0; j < classes.length; j++) {
          switch (classes) {
              case "segunda-feira":
                  return "monday";
              case "terça-feira":
                  return "tuesday";
              case "quarta-feira":
                  return "wednesday";
              case "quinta-feira":
                  return "thursday";
              case "sexta":
                  return "friday";
              case "sabado":
                  return "saturday";
              case "domingo":
                  return "sunday";
          }
              
          
      }
      return null; // Retorna null se não encontrar o nome do dia
  }

  // Initialize moment.js with the desired locale
  moment.locale('pt-br');
  
  