const socket = io();
const chat = document.getElementById('chatForm');
const messages = document.querySelector('.messages');
const roomUsers = document.getElementById('userList');
const roleContainer = document.querySelector('.roleContainer');
const nightForm = document.getElementById('NightForm');
const dayForm = document.getElementById('DayForm');
const navBar = document.getElementById('navBar');
const { name } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
var buttonIsPlaced = false;
var role = 'unknown';
var isNight = false;
socket.emit('joinRoom', {name}); //stuurt de gebruiker als deze op de site komt C1 T1
socket.on('showName', () => { //ontvangt dat de naam zichtbaar kan worden. C2 T4
  showName(name);
});
var namesKnown = [];
var myID = '';
var dead = false;
var chemistkill = true;
var chemistsave = true;
//messages
socket.on('message', message => { //ontvangt alle berichten en zet ze in de berichten prompt. C3 T6 (begin), anders Bijpad 1
    console.log(message);
    formatMessage(message);
    messages.scrollTop = messages.scrollHeight;
});
//starting game and placing button
socket.on('gameStart', () => { //ontvangt dat het spel gestard *kan* gaan worden C4 T8
  if(!buttonIsPlaced) {
    createButton(); //maakt een knop en geeft deze een actionlistener ID = startGameButton
    buttonIsPlaced = true;
  }
})
socket.on('roomUsers', ({users}) => {
  outputUsers(users);
});

socket.on('gameStarted', () => {// T12 C5
  socket.emit('getRole');
  removeButton();
});
socket.on('takeRole', ({userRole, userID}) => {
  role = userRole;
  myID = userID;
  switch (role) {
    case 'villager':
      showRole("Your role is villager. You don't have to do anything at night", role, name);
      break;
    case 'alien':
      showRole("Your role is alien. You can eat one person each night, together with the others. Be sure to talk to the others before killing a person yourself. !You CAN talk at night!", role);
      break;
    case 'slut':
      showRole("Your role is slut. You can sleep with a person each night. If the aliens try to kill you, they'll fail. If they kill the person you're sleeping with, you die as well", role);
      break;
    case 'chemist':
      showRole("Once in the game you can kill a person and once in the game you can heal a person. Choose wisely", role);
      break;
    case 'researcher':
      showRole("Each night you can see the role of one person. Choose wisely", role);
      break;
    case 'doctor':
      showRole("You can heal one person each night. The person who gets healed, cannot die that night.", role);
      break;
    case 'beul':
      showRole("At the beginning of the game, you have to choose one target. Your role is to make sure this target is hanged anywhere in the game", role);
      break;
    case 'alien(nietStemmen)':
      showRole("Your role is alien. You can eat one person each night, together with the others. Be sure to talk to the others before killing a person yourself. !You CAN talk at night!, you cannot vote", role);
      break;
    default:
      showRole("We couldn't find anything for your role", role);
  }
  socket.emit('startNight1');
});


socket.on('rolReveal', ({user, id, urole, status, name}) => {
  userCard = `images/${urole}.png`;
  document.getElementById(id).innerHTML = `<div class="card col-4 roleCard YourRoleCard" style="" id = ${id}>
    <img class="card-img-top" src= ${userCard} alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title">${name} ${urole} ${status}</h5>
    </div>
  </div>`;
  namesKnown.push(id);
  if (myID == user.id && status == 'Dead') {
    dead = true;
  }
});

//night falls
socket.on('night1HasFallen', ({allUsers, usersAlive, firstNight}) => {
  changeThemeNight();
  if (!dead) {
    showNightFunction(role, allUsers, usersAlive, firstNight);
    nightForm.style.visibility= 'visible';
  }
});

socket.on('updateList', ({allUsers, usersAlive}) => {
  if (!dead) {
    showNightFunction(role, allUsers, usersAlive);
  }
});

socket.on('nightHasFallen', () => {
});

socket.on('dayHasBegun', ({usersAlive}) => {
  changeThemeDay();
  nightForm.innerHTML = '';
  if (!dead) {
    showDayForm(usersAlive);
    dayForm.style.visibility= 'visible';
  }
});







chat.addEventListener('submit', e => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg){
    return false;
  }
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});
nightForm.addEventListener('submit', e => {
  e.preventDefault();
  vote = document.querySelector('input[name="targetSelect"]:checked').value;
  voteid = document.querySelector('input[name="targetSelect"]:checked').id;
  console.log(vote);
  console.log(voteid);
  if (role == 'researcher') {
    what = document.getElementById("levendDood").value;
  } else {
    what = 'nvt';
  }
  socket.emit('submitVot', {role, vote, voteid, what});
  nightForm.style.visibility= 'hidden';
});
dayForm.addEventListener('submit', e => {
  e.preventDefault();
  vote = document.querySelector('input[name="targetSelect"]:checked').value;
  voteid = document.querySelector('input[name="targetSelect"]:checked').id;
  socket.emit('submitDayVot', {voteid});
  dayForm.style.visibility = 'hidden';
});





function changeThemeNight() {
  navBar.className = "navbar navbar-dark bg-dark";
}
function changeThemeDay() {
  navBar.className = "navbar navbar-light bg-light";
}

function createButton() {
  var btn = document.createElement("BUTTON");
  btn.classList.add('startGame');
  btn.id = 'startGameButton';
  btn.innerHTML = 'Start Game';
  btn.onclick = function() { socket.emit('gameHasBegun'); }; // stuurt event dat het spel is begonnen naar de server. C5 T9
  document.querySelector('.Button-start').appendChild(btn);
}
function showName(userName) {
  roleContainer.innerHTML += `<h1>${userName}</h1>`;
}
function showRole(description, urole) {
  roleContainer.innerHTML += `<h1>${urole}</h1><p>${description}</p>`;
}
function addDescription(description) {
  document.querySelector('.roleContainer').innerHTML += `<h1>${urole}</h1>`;
}
function removeButton() {
  document.querySelector('.Button-start').innerHTML = '';
}

function formatMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = `${message.name}`;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.messages').appendChild(div);
}
function outputUsers(users) {
  console.log(users);
  roomUsers.innerHTML = "";
  for (var i = 0; i < users.length; i++) {
    user = users[i];
    if (namesKnown.includes(user.id)) {
      userCard = `images/${user.role}`;
      userID = `${user.id}`;
      roomUsers.innerHTML += `<div class="card col-4 roleCard YourRoleCard" style="" id = ${user.id}>
        <img class="card-img-top" src= ${userCard} alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title">${user.name} ${user.role} ${user.status}</h5>
        </div>
      </div>`;
    } else {
      roomUsers.innerHTML += `<div class="card col-4 roleCard YourRoleCard" style="" id = ${user.id}>
      <img class="card-img-top" src= "images/backdrop.png" alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title">${user.name} ${user.status}</h5>
        </div>
      </div>`;
    }
  }
}
function showDayForm(usersAlive) {
  dayForm.innerHTML = `<h2>Kies welke speler je wilt vermoorden</h2>`;
  for (var i = 0; i < usersAlive.length; i++) {
    userAlive = usersAlive[i];
    dayForm.innerHTML += `<input type="radio" id="${userAlive.id}" name="targetSelect" value="${userAlive.role}">
    <label for="${userAlive.id}">${userAlive.name}</label><br>`;
  }
  dayForm.innerHTML += `<input type='submit'>`;
}


function showNightFunction(welkeRol, allUsers, allAliveUsers, firstNight) {
  console.log(welkeRol);
  switch (welkeRol) {
    case 'villager':
      //print niets uit
      nightForm.innerHTML = `<h2>Je hebt deze nacht niets te doen</h2>`;
      break;
    case 'alien':
      //print een stem optie
      nightForm.innerHTML = '';
      nightForm.innerHTML= '<h2>Who would you and the other aliens like to kill?</h2>';
      for (var i = 0; i < allAliveUsers.length; i++) {
        formUser = allAliveUsers[i];
        nightForm.innerHTML += `<input type="radio" id="${formUser.id}" name="targetSelect" value="${formUser.role}">
        <label for="${formUser.id}">${formUser.name}</label><br>`;
      }
      nightForm.innerHTML += '<input type="submit">';
      break;
    case 'slut':
      //kiest een optie
      nightForm.innerHTML = '';
      nightForm.innerHTML= '<h2>With whom would you like to spend the night?</h2>';
      for (var i = 0; i < allAliveUsers.length; i++) {
        formUser = allAliveUsers[i];
        nightForm.innerHTML += `<input type="radio" id="${formUser.id}" name="targetSelect" value="${formUser.role}">
        <label for="${formUser.id}">${formUser.name}</label><br>`;
      }
      nightForm.innerHTML += '<input type="submit">';
      break;
    case 'chemist':
      //kiest een optie en houdt bij hoeveel keer de chemist nog over heeft
      nightForm.innerHTML = '';
      nightForm.innerHTML = '<h2>Do you want to either kill or heal someone?</h2>';
      for (var i = 0; i < allAliveUsers.length; i++) {
        formUser = allAliveUsers[i];
        nightForm.innerHTML += `<input type="radio" id="${formUser.id}" name="targetSelect" value="${formUser.role}">
        <label for="${formUser.id}">${formUser.name}</label><br>`;
      }
      nightForm.innerHTML += `<input type="radio" id="noOne" name="targetSelect" value="noOne">
      <label for="noOne">Nobody</label><br>`;
      nightForm.innerHTML += "<select id='levendDood' name='levendDood'><option value='levend'>Redden</option><option value='dood'>Vermoorden</option></select>";
      nightForm.innerHTML += '<input type="submit">';
      break;
    case 'researcher':
      //kiest een optie
      nightForm.innerHTML = '';
      nightForm.innerHTML = '<h2>Of which user do you want to know the role?</h2>';
      for (var i = 0; i < allAliveUsers.length; i++) {
        formUser = allAliveUsers[i];
        nightForm.innerHTML += `<input type="radio" id="${formUser.id}" name="targetSelect" value="${formUser.role}">
        <label for="${formUser.id}">${formUser.name}</label><br>`;
      }
      nightForm.innerHTML += '<input type="submit">';
      break;
    case 'doctor':
      //kiest een optie
      nightForm.innerHTML = '';
      nightForm.innerHTML = '<h2>Which player would you like to heal?</h2>';
      for (var i = 0; i < allAliveUsers.length; i++) {
        formUser = allAliveUsers[i];
        nightForm.innerHTML += `<input type="radio" id="${formUser.id}" name="targetSelect" value="${formUser.role}">
        <label for="${formUser.id}">${formUser.name}</label><br>`;
      }
      nightForm.innerHTML += '<input type="submit">';
      break;
    case 'beul':
      //kiest een target, deze blijft hetzelfde voor de rest van het spel
      if (firstNight) {
        nightForm.innerHTML = '';
        nightForm.innerHTML = '<h2>Who do you want to be your target?</h2>';
        for (var i = 0; i < allAliveUsers.length; i++) {
          formUser = allAliveUsers[i];
          nightForm.innerHTML += `<input type="radio" id="${formUser.id}" name="targetSelect" value="${formUser.role}">
          <label for="${formUser.id}">${formUser.name}</label><br>`;
        }
        nightForm.innerHTML += '<input type="submit">';
      } else {
        nightForm.innerHTML = `<h2>Je hebt deze nacht niets te doen</h2>`;
      }
      break;
    case 'alien(nietStemmen)':
      //print niets uit
      nightForm.innerHTML = `<h2>Overleg met de andere aliens wie er dood moet. Een van jullie kan stemmen</h2>`;
      break;
    default:
      //you have nothing to do this night

  }
}
