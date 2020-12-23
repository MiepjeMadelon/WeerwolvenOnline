
var users = [];
var playerinfo = [];
var numAliens = 0;

function addUser(id, name) {
  //adds user to the game
  user = {id:id, name:name, role:'normaal', status: 'Alive'};
  users.push(user);
  return user;
}
function deleteUser(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getAllUsers() {
  return users;
}
function changeUsers(newUsers) {
  users = newUsers;
}
function getUsersAlive() {
  return users.filter(user => user.status === "Alive");
}
function changeCurrentUserStatus(id, newStatus) {
  user = users.find(user => user.id === id);
  user.status = newStatus;
}

function getUsersActiveAlive() {
  alive = users.filter(user => user.status === "Alive");
  alivenotvillager = alive.filter(user => user.role !== 'villager');
  return alivenotvillager.filter(user => user.role !== 'alien(nietStemmen)');
}

function getUsersActiveAliveNoBeul() {
  alive = users.filter(user => user.status === "Alive");
  alivenotvillager = alive.filter(user => user.role !== 'villager');
  alivenotvillagernotWW = alivenotvillager.filter(user => user.role !== 'alien(nietStemmen)');
  return alivenotvillagernotWW.filter(user => user.role !== 'beul');
}

function getCurrentUser(id) {
  user = users.find(user => user.id === id);
  return user;
}
function getUserRole(role) {
  user = users.find(user => user.role === role);
  return user;
}
function getOutcomeDay(votes) {
  idDead = getHighest(votes);
  changeCurrentUserStatus(idDead, 'Dead');
  user = getCurrentUser(idDead);
  return user;
}
function getHighest(array) //van https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
function getOutcomeNight(votes) {
  //vote = {roleVoter: role, votedFor: vote, votedForId: voteid, votedWhat: what};
  doden = [];
  voteW = votes.find(vote => vote.roleVoter === 'alien');
  alienVoted = true;
  const indexW = votes.findIndex(user => user.roleVoter === 'alien');
  if (indexW == -1) {
    alienVoted = false;
  }
  voteH = votes.find(vote => vote.roleVoter === 'chemist');
  chemistVoted = true;
  const indexH = votes.findIndex(user => user.roleVoter === 'chemist');
  if (indexH == -1) {
    chemistVoted = false;
  }
  voteZ = votes.find(vote => vote.roleVoter === 'researcher');
  researcherVoted = true;
  const indexZ = votes.findIndex(user => user.roleVoter === 'researcher');
  if (indexZ == -1) {
    researcherVoted = false;
  }
  voteG = votes.find(vote => vote.roleVoter === 'doctor');
  doctorVoted = true;
  const indexG = votes.findIndex(user => user.roleVoter === 'doctor');
  if (indexG == -1) {
    doctorVoted = false;
  }
  voteS = votes.find(vote => vote.roleVoter === 'slut');
  slutVoted = true;
  const indexS = votes.findIndex(user => user.roleVoter === 'slut');
  if (indexS == -1) {
    slutVoted = false;
  }
  console.log('test', alienVoted);
  if (alienVoted) {
    if (doctorVoted) {
      if (voteW.votedForId != voteG.votedForId) {
        console.log(chemistVoted);
        if (chemistVoted) {
          if (voteH.votedWhat != 'levend' || voteH.votedForId != voteW.votedForId) {
            deadUser = getCurrentUser(voteW.votedForId);
            changeCurrentUserStatus(deadUser.id, 'Dead');
            doden.push(deadUser);
            if (slutVoted) {
              if (voteS.votedForId == voteW.votedForId) {
                deadUser2 = getUserRole('slut');
                changeCurrentUserStatus(deadUser2.id, 'Dead');
                doden.push(deadUser2);
              }
            } //als slut dood is gebeurt er niets
          }
        } else { //chemist dood of afwezig
          deadUser = getCurrentUser(voteW.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (slutVoted) {
            if (voteS.votedForId == voteW.votedForId) {
              deadUser2 = getUserRole('slut');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            }
          }
        }



      }
    } else { //doctor dood
      if (chemistVoted) {
        if (voteH.votedWhat != 'levend' || voteH.votedForId != voteW.votedForId) {
          deadUser = getCurrentUser(voteW.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (slutVoted) {
            if (voteS.votedForId == voteW.votedForId) {
              deadUser2 = getUserRole('slut');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            }
          } //als slut dood is gebeurt er niets
        }
      } else { //chemist dood of afwezig
        deadUser = getCurrentUser(voteW.votedForId);
        changeCurrentUserStatus(deadUser.id, 'Dead');
        doden.push(deadUser);
        if (voteS.votedForId == voteW.votedForId) {
          deadUser2 = getUserRole('slut');
          changeCurrentUserStatus(deadUser2.id, 'Dead');
          doden.push(deadUser2);
        }
      }
    }
    if (chemistVoted) {
      if (doctorVoted) {
        if(voteH.voteWhat == 'dood' && voteH.votedForId != voteG.votedForId && voteH.votedForId != 'noOne') {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (slutVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slut');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slut dood is gebeurt er niets
          }
        }
      } else {
        if(voteH.voteWhat == 'dood'&& voteH.votedForId != 'noOne' && voteH.votedForId != voteG.votedForId) {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (slutVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slut');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slut dood is gebeurt er niets
          }
        }
      }

    } //als de chemist dood is gebeurt er niets

  } else { //alien dood
    if (chemistVoted) {
      if (doctorVoted) {
        if(voteH.voteWhat == 'dood' && voteH.votedForId != voteG.votedForId && voteH.votedForId != 'noOne') {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (slutVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slut');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slut dood is gebeurt er niets
          }
        }
      } else {
        if(voteH.voteWhat == 'dood'&& voteH.votedForId != 'noOne') {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (slutVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slut');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slut dood is gebeurt er niets
          }
        }
      }

    } //als de chemist dood is gebeurt er niets
  }
  // if (voteW.votedForId != voteG.votedForId) {
  //   if (voteH.votedWhat != 'levend' || voteH.votedForId != voteW.votedForId) {
  //     deadUser = getCurrentUser(voteW.votedForId);
  //     changeCurrentUserStatus(deadUser.id, 'Dead');
  //     doden.push(deadUser);
  //     if (voteS.votedForId == voteW.votedForId) {
  //       deadUser2 = getUserRole('slut');
  //       changeCurrentUserStatus(deadUser2.id, 'Dead');
  //       doden.push(deadUser2);
  //     }
  //   }
  // } else if(voteH.voteWhat == 'dood' && voteH.votedForId != voteW.votedForId && voteH.votedForId != voteG.votedForId && voteH.votedForId != 'noOne') {
  //   deadUser = getCurrentUser(voteH.votedForId);
  //   changeCurrentUserStatus(deadUser.id, 'Dead');
  //   doden.push(deadUser);
  //   if (voteS.votedForId == voteH.votedForId) {
  //     deadUser2 = getUserRole('slut');
  //     changeCurrentUserStatus(deadUser2.id, 'Dead');
  //     doden.push(deadUser2);
  //   }
  // }
  console.log('overleden +', doden);
  return doden;
}

function checkforwin() {
  win = '';
  living = getUsersAlive();
  alive = users.filter(user => user.status === "Alive");
  livingWW = alive.filter(user => user.role === 'alien' || user.role === 'alien(nietStemmen)');
  livingGOODnum = living.length - livingWW.length;
  if (livingGOODnum == 1 || livingGOODnum == 0) {
    win = 'aliens';
  } else if(livingWW == 0) {
    win = 'good'
  } else {
    win = 'none';
  }
  return win;
}
function giveRoles(){
  players = getAllUsers();
  numPlayers = players.length;
  numAliens = Math.floor(numPlayers/4);
  if (numAliens % 2 == 0) {
    numAliens++;
  }
  numGoodRoles = numPlayers - numAliens;
  goodRoles = ['chemist', 'researcher', 'doctor', 'slut', 'beul'];
  numBeginGoodRoles = goodRoles.length;
  for (var i = 0; i < numGoodRoles; i++) {
    if (i >= numBeginGoodRoles) {
      goodRoles.push('villager');
    }
  }
  console.log(goodRoles);
  goodCount = goodRoles.length;
  badCount = numAliens;
  werewolveOne = false;
  for (var i = 0; i < numPlayers; i++) {
      var randomNum = Math.random();
    //kijkt voor alien
      if (randomNum < 0.25 && badCount != 0) {
        if (!werewolveOne) {
          players[i].role = 'alien';
          werewolveOne = true;
        } else {
          players[i].role = 'alien(nietStemmen)';
        }
        badCount--;
      } else if (randomNum >= 0.25 && goodCount != 0) {
        number = Math.floor(Math.random() * goodRoles.length);
        console.log(number);
        players[i].role = goodRoles[number];
        console.log(players[i].role);
        goodRoles.splice(number, 1);
        console.log(goodRoles);
        console.log(i);
        goodCount--;
      }
      if (players[i].role == "normaal") {
        if (randomNum >= 0.25 && badCount != 0) {
          if (!werewolveOne) {
            players[i].role = 'alien';
            werewolveOne = true;
          } else {
            players[i].role = 'alien(nietStemmen)';
          }
          badCount--;
        } else if (randomNum < 0.25 && goodCount != 0) {
          number = Math.floor(Math.random() * goodRoles.length);
          console.log(number);
          players[i].role = goodRoles[number];
          console.log(players[i].role);
          goodRoles.splice(number, 1);
          console.log(goodRoles);
          console.log(i);
          goodCount--;
        } else {
          players[i].role = 'villager';
        }
      }
  }
  console.log('end');
  return players;
  users = players;
}
module.exports = {addUser, deleteUser, getAllUsers, getCurrentUser, changeUsers, giveRoles, getUsersAlive, changeCurrentUserStatus, getUsersActiveAlive, getOutcomeNight, getUsersActiveAliveNoBeul, getOutcomeDay, checkforwin};
