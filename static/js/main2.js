const socket = io();
const chat = document.getElementById('chatForm');
const messages = document.querySelector('.messages');
const roomUsers = document.getElementById('userList');
const roleContainer = document.querySelector('.roleContainer');
const { name, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
var buttonIsPlaced = false;
var role = 'unknown';
var isNight = false;
socket.emit('joinRoom', {name, room});
//messages
socket.on('message', message => {
  if (!isNight) {
    console.log(message);
    formatMessage(message);
    messages.scrollTop = messages.scrollHeight;
  }
});
//starting game and placing button
socket.on('gameStart', () => {
  if(!buttonIsPlaced) {
    createButton();
    buttonIsPlaced = true;
  }
})
socket.on('roomUsers', ({users}) => {
  outputUsers(users);
});

socket.on('gameStarted', () => {
  socket.emit('getRole');
  removeButton();
});
socket.on('takeRole', ({userRole}) => {
  role = userRole;
  showRole("test",role);
  console.log('before switch');
  switch (role) {
    case 'burger':
      showRole("Your role is burger. You don't have to do anything at night", role);
      console.log("test");
      break;
    case 'weerwolf':
      showRole("Your role is weerwolf. You can eat one person each night, together with the others. Be sure to talk to the others before killing a person yourself. !You CAN talk at night!", role);
      break;
    case 'slet':
      showRole("Your role is slet. You can sleep with a person each night. If the wolves try to kill you, they'll fail. If they kill the person you're sleeping with, you die as well", role);
      break;
    case 'heks':
      showRole("Once in the game you can kill a person and once in the game you can heal a person. Choose wisely", role);
      break;
    case 'ziener':
      showRole("Each night you can see the role of one person. Choose wisely", role);
      break;
    case 'genezer':
      console.log('during switch');
      showRole("You can heal one person each night. The person who gets healed, cannot die that night.", role);
      break;
    case 'beul':
      showRole("At the beginning of the game, you have to choose one target. Your role is to make sure this target is hanged anywhere in the game", role);
      break;
    default:
      showRole("We couldn't find anything for your role", role);
  }
});

socket.on('rolReveal', ({user, id, urole, status, name}) => {
  document.getElementById(id).innerHTML = `<td>${name}</td>
  <td>${urole}</td>
  <td>${status}</td>`;
});

//night falls
socket.on('nightHasFallen', () => {
  isNight = true;
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

function createButton() {
  var btn = document.createElement("BUTTON");
  btn.classList.add('startGame');
  btn.id = 'startGameButton';
  btn.onclick = function() { socket.emit('gameHasBegun'); };
  document.querySelector('.Button-start').appendChild(btn);
}
function showRole(description, urole) {
  roleContainer.innerHTML = `<h1>${urole}</h1><p>${description}</p>`;
  console.log('in showRole');
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
  roomUsers.innerHTML = "<tr> <th>Username</th> <th>Role</th> <th>Dead/Alive</th> </tr>";
  for (var i = 0; i < users.length; i++) {
    user = users[i];
    roomUsers.innerHTML += `<tr id = "${user.id}">
    <td>${user.name}</td>
    <td>unknown</td>
    <td>${user.status}</td>
    </tr>`;
  }
}
