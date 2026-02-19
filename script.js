const formPage = document.getElementById('formPage');
const schedulePage = document.getElementById('schedulePage');
const babyForm = document.getElementById('babyForm');
const displayName = document.getElementById('displayName');
const vaccineCardsContainer = document.getElementById('vaccineCards');
const backBtn = document.getElementById('backBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');

const vaccineList = [
  {name:"BCG", month:0, advantage:"Protects against tuberculosis", consequence:"Severe TB infection"},
  {name:"Hepatitis B", month:0, advantage:"Prevents liver disease", consequence:"Chronic hepatitis"},
  {name:"Polio 1", month:2, advantage:"Prevents polio", consequence:"Paralysis"},
  {name:"DTP 1", month:2, advantage:"Prevents diphtheria, tetanus, pertussis", consequence:"Severe illness"},
  {name:"Polio 2", month:4, advantage:"Booster immunity", consequence:"Incomplete immunity"},
  {name:"DTP 2", month:4, advantage:"Booster dose", consequence:"Reduced protection"},
  {name:"Measles", month:9, advantage:"Prevents measles", consequence:"Severe measles complications"},
  {name:"MMR", month:12, advantage:"Prevents measles, mumps, rubella", consequence:"High risk of infection"},
];

let babyData = JSON.parse(localStorage.getItem('babyData')) || null;
let vaccineStatus = JSON.parse(localStorage.getItem('vaccineStatus')) || {};

if(babyData) showSchedule(babyData);

// Form submit
babyForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('babyName').value;
  const dob = document.getElementById('dob').value;
  babyData = {name,dob};
  localStorage.setItem('babyData', JSON.stringify(babyData));
  formPage.classList.add('hidden');
  schedulePage.classList.remove('hidden');
  showSchedule();
  checkUpcomingNotifications();
});

function showSchedule(){
  displayName.textContent = babyData.name;
  updateCards();
}

function updateCards(){
  vaccineCardsContainer.innerHTML='';
  let doneCount=0;
  vaccineList.forEach(vaccine=>{
    const dob = new Date(babyData.dob);
    const dueDate = new Date(dob.setMonth(dob.getMonth()+vaccine.month));
    const dueStr = dueDate.toISOString().split('T')[0];
    const status = vaccineStatus[vaccine.name]? 'Done':'Pending';
    if(status==='Done') doneCount++;

    const card = document.createElement('div');
    card.className='vaccine-card';
    if(status==='Done') card.classList.add('completed');
    card.innerHTML=`
      <h3>${vaccine.name}</h3>
      <p><strong>Due Date:</strong> ${dueStr}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Advantage:</strong> ${vaccine.advantage}</p>
      <p><strong>Consequence if Skipped:</strong> ${vaccine.consequence}</p>
      <button onclick="markDone('${vaccine.name}', this)" ${status==='Done'?'disabled':''}>Mark Done</button>
    `;
    vaccineCardsContainer.appendChild(card);
  });
  let percent = Math.round((doneCount/vaccineList.length)*100);
  progressBar.style.width = percent+'%';
}

function markDone(vaccineName, btn){
  vaccineStatus[vaccineName]=true;
  localStorage.setItem('vaccineStatus', JSON.stringify(vaccineStatus));
  updateCards();
}

backBtn.addEventListener('click', ()=>{
  schedulePage.classList.add('hidden');
  formPage.classList.remove('hidden');
});

resetBtn.addEventListener('click', ()=>{
  if(confirm('Reset all vaccine progress?')){
    vaccineStatus={};
    localStorage.removeItem('vaccineStatus');
    updateCards();
  }
});

// Notifications 1 week before due
function checkUpcomingNotifications(){
  const today = new Date();
  vaccineList.forEach(vaccine=>{
    if(vaccineStatus[vaccine.name]) return;
    const dob = new Date(babyData.dob);
    const dueDate = new Date(dob.setMonth(dob.getMonth()+vaccine.month));
    const oneWeekBefore = new Date(dueDate);
    oneWeekBefore.setDate(oneWeekBefore.getDate()-7);
    if(today >= oneWeekBefore && today < dueDate){
      alert(`Reminder: ${vaccine.name} vaccine is due on ${dueDate.toISOString().split('T')[0]}`);
    }
  });
}
