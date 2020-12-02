//Mijn poging om comments toe te voegen, zodat ik deze ooit nog terug kan lezen

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {addUser, deleteUser, getAllUsers, getCurrentUser, changeUsers, giveRoles, getUsersAlive, changeCurrentUserStatus, getUsersActiveAlive, getOutcomeNight, getUsersActiveAliveNoBeul, getOutcomeDay, checkforwin} = require('./tools/users');
const makeMessage = require('./tools/messages');
app.use(express.static(path.join(__dirname, 'static')));
var gameLeader = 'Game Leader'; //!used once as string in main.js!
var numPlayers = 0;
var gameSendFirst = false;
var gameHasBegun = false;
var isNight = false;
var night1Started = false;
var submitVoteNight = [];
var submitVoteDay = [];


//op het moment dat een user connect, kunnen alle functies hierbinnen gebeuren
io.on('connection', socket => {
  //handles a new user
  socket.on('joinRoom', ({name}) => { //als de gebruiker binnen komt STAP 1S 2T
    if (!gameHasBegun) { //als het spel eenmaal begint kan niemand er meer bijkomen
      numPlayers = numPlayers+1;
      console.log(numPlayers);
      user = addUser(socket.id, name);
      socket.emit('showName'); //vertelt de user dat (als het joinen gelukt is) deze zijn naam kan laten zien 2S 3T
      io.emit('message', makeMessage(gameLeader, `welcome ${user.name}!`,gameLeader)); //stuurt een welkomsbericht aan de nieuwe gebruiker naar iedereen 3S T5
      if (numPlayers > 7 && gameSendFirst == false) { //controleert of er genoeg spelers zijn en of dit niet al bij de vorige nieuwe speler naar alle nieuwe zijn gestuurd
        io.emit('gameStart'); //stuurt bericht naar speler T7 S4
      }
      users = getAllUsers();
      io.emit('roomUsers', {
      users: getAllUsers()
      });
    } else { //als het spel eenmaal begint kan niemand er meer bijkomen
      socket.emit('message', makeMessage(gameLeader, 'Sadly, the game has already begun. Please join another game.', gameLeader));
    }
  });
  //het spel begint nu
  socket.on('gameHasBegun', () => { //ontvangt dat het spel nu gaat beginnen. T10 S4
    console.log('succes');
    if (!gameHasBegun) { //controleert of dit signaal niet al eerder is gegeven
      giveRoles();
      console.log(getAllUsers());
      user = getCurrentUser(socket.id);
      isNight = true;
      io.emit('message', makeMessage(gameLeader, 'The night has fallen, the chat is now disabled.', gameLeader)); //geeft iedereen het bericht dat de chat is geblokkeerd (behalve voor de weerwolven). Wordt gewoon behandelt en daarom niet meegenomen
      io.emit('gameStarted'); //geeft iedereen het bericht dat de chat is gestard. T11 S5
      gameHasBegun = true;
    }
  });
  //handle chatmessages
  socket.on('chatMessage', msg => {
    user = getCurrentUser(socket.id);
    if (user.status == 'Alive') {
      if (!isNight) {
        message = makeMessage(user.name, msg, user.role);
        io.emit('message', message);
      } else if (user.role == 'weerwolf' || user.role == 'weerwolf(nietStemmen)') {
        message = makeMessage(user.name, msg + '--- from weerwolf', user.role);
        io.to('weerwolf').emit('message', message);
      }
    }
  });

  socket.on('getRole', () => {
    user = getCurrentUser(socket.id);
    users = getAllUsers();
    aliveUsers = getUsersAlive();
    urole = user.role
    if (urole == 'weerwolf') {
      socket.join('weerwolf');
    }
    else if (urole == 'weerwolf(nietStemmen)') {
      socket.join('weerwolf');
    }
    socket.emit('takeRole', {
      userRole: urole,
      userID: user.id
    });
    console.log(urole);
  });

  socket.on('startNight1', () => {
    if (!night1Started) {
      io.emit('night1HasFallen', {
        allUsers: users,
        usersAlive: aliveUsers,
        firstNight: true
      });
      night1Started = true;
    }
  });
  socket.on('submitDayVot', ({voteid}) => {
    submitVoteDay.push(voteid);
    console.log(submitVoteDay);
    voters = getUsersAlive();
    users = getAllUsers();
    if (submitVoteDay.length >= voters.length) {
      dood = getOutcomeDay(submitVoteDay);
      io.emit('rolReveal', {
        user: dood,
        id: dood.id,
        urole: dood.role,
        status: dood.status,
        name: dood.name
      });
      win = checkforwin();
      if (win == 'good') {
        io.emit('message', makeMessage(gameLeader, 'GOOD HAS WON', gameLeader));
      } else if (win == 'wolves') {
        io.emit('message', makeMessage(gameLeader, 'WOLVES HAVE WON', gameLeader));
      }
      io.emit('message', makeMessage(gameLeader, 'The voting has ended, the night begins', gameLeader));
      io.emit('night1HasFallen', ({
        allUsers: users,
        usersAlive: voters,
        firstNight: night1Started
      }));
      isNight == true;
    }


  });
  socket.on('submitVot', ({role, vote, voteid, what}) => {
    vote = {roleVoter: role, votedFor: vote, votedForId: voteid, votedWhat: what};
    userVoted = getCurrentUser(voteid);
    submitVoteNight.push(vote);
    console.log(submitVoteNight);
    activeAlive = getUsersActiveAlive();
    activeAliveNoBeul = getUsersActiveAliveNoBeul();
    if (night1Started) {
      if (submitVoteNight.length >= activeAlive.length) {
        doden = getOutcomeNight(submitVoteNight);
        for (var i = 0; i < doden.length; i++) {
          dood = doden[i];
          io.emit('rolReveal', {
            user: dood,
            id: dood.id,
            urole: dood.role,
            status: dood.status,
            name: dood.name
          });
          win = checkforwin();
          if (win == 'good') {
            io.emit('message', makeMessage(gameLeader, 'GOOD HAS WON', gameLeader));
          } else if (win == 'wolves') {
            io.emit('message', makeMessage(gameLeader, 'WOLVES HAVE WON', gameLeader));
          }
        }
        night1Started = false;
        isNight = false;
        allUsersAlive = getUsersAlive();
        io.emit('dayHasBegun', {
          usersAlive: getUsersAlive()
        });
        io.emit('message', makeMessage(gameLeader, 'The night has ended. You can see in the table who has died. You can talk again', gameLeader));
        submitVoteNight = [];
      }
    } else {
      if (submitVoteNight.length == activeAliveNoBeul.length) {
        doden = getOutcomeNight(submitVoteNight);
        for (var i = 0; i < doden.length; i++) {
          dood = doden[i];
          io.emit('rolReveal', {
            user: dood,
            id: dood.id,
            urole: dood.role,
            status: dood.status,
            name: dood.name
          });
          win = checkforwin();
          if (win == 'good') {
            io.emit('message', makeMessage(gameLeader, 'GOOD HAS WON', gameLeader));
          } else if (win == 'wolves') {
            io.emit('message', makeMessage(gameLeader, 'WOLVES HAVE WON', gameLeader));
          }
        }
        isNight = false;
        allUsersAlive = getUsersAlive();
        io.emit('dayHasBegun', {
          usersAlive: getUsersAlive()
        });
        io.emit('message', makeMessage(gameLeader, 'The night has ended. You can see in the table who has died. You can talk again', gameLeader));
        submitVoteNight = [];

      }
    }
    if (role == 'ziener') {
      socket.emit('rolReveal', {
        user: userVoted,
        id: userVoted.id,
        urole: userVoted.role,
        status: userVoted.status,
        name: userVoted.name
      });
      win = checkforwin();
      if (win == 'good') {
        io.emit('message', makeMessage(gameLeader, 'GOOD HAS WON', gameLeader));
      } else if (win == 'wolves') {
        io.emit('message', makeMessage(gameLeader, 'WOLVES HAVE WON', gameLeader));
      }
    }
  });

  //handles disconnect
  socket.on('disconnect', () => {
    userLeaving = getCurrentUser(socket.id);
    if (!gameHasBegun) {
      numPlayers = numPlayers-1;
      console.log(numPlayers);
      console.log(userLeaving);
      if (userLeaving != undefined) {
        io.emit('message', makeMessage(gameLeader, `Sadly, ${userLeaving.name} left the game.`, gameLeader));
        deleteUser(socket.id);
      }
      io.emit('roomUsers', {
      users: getAllUsers()
      });
    } else {
      if (userLeaving != undefined) {
        changeCurrentUserStatus(socket.id, 'Disconnected');
        usersAlive = getUsersAlive();
        if (userLeaving != undefined) {
          io.emit('message', makeMessage(gameLeader, `Sadly, ${userLeaving.name} left the game.`, gameLeader));
        }
        io.emit('roomUsers', {
        users: getAllUsers()
        });
        io.emit('rolReveal', {
          user: userLeaving,
          id: userLeaving.id,
          urole: userLeaving.role,
          status: userLeaving.status,
          name: userLeaving.name
        });
        win = checkforwin();
        if (win == 'good') {
          io.emit('message', makeMessage(gameLeader, 'GOOD HAS WON', gameLeader));
        } else if (win == 'wolves') {
          io.emit('message', makeMessage(gameLeader, 'WOLVES HAVE WON', gameLeader));
        }

        if (isNight) {
          io.emit('updateList', {
            allUsers: users,
            usersAlive: usersAlive
          });
          console.log('update request sent');
        }
      }
    }
    console.log('disconnection');
  });



});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
