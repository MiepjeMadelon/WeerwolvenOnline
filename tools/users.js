
var users = [];
var playerinfo = [];
var numWerewolves = 0;

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
  alivenotburger = alive.filter(user => user.role !== 'burger');
  return alivenotburger.filter(user => user.role !== 'weerwolf(nietStemmen)');
}

function getUsersActiveAliveNoBeul() {
  alive = users.filter(user => user.status === "Alive");
  alivenotburger = alive.filter(user => user.role !== 'burger');
  alivenotburgernotWW = alivenotburger.filter(user => user.role !== 'weerwolf(nietStemmen)');
  return alivenotburgernotWW.filter(user => user.role !== 'beul');
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
  voteW = votes.find(vote => vote.roleVoter === 'weerwolf');
  weerwolfVoted = true;
  const indexW = votes.findIndex(user => user.roleVoter === 'weerwolf');
  if (indexW == -1) {
    weerwolfVoted = false;
  }
  voteH = votes.find(vote => vote.roleVoter === 'heks');
  heksVoted = true;
  const indexH = votes.findIndex(user => user.roleVoter === 'heks');
  if (indexH == -1) {
    heksVoted = false;
  }
  voteZ = votes.find(vote => vote.roleVoter === 'ziener');
  zienerVoted = true;
  const indexZ = votes.findIndex(user => user.roleVoter === 'ziener');
  if (indexZ == -1) {
    zienerVoted = false;
  }
  voteG = votes.find(vote => vote.roleVoter === 'genezer');
  genezerVoted = true;
  const indexG = votes.findIndex(user => user.roleVoter === 'genezer');
  if (indexG == -1) {
    genezerVoted = false;
  }
  voteS = votes.find(vote => vote.roleVoter === 'slet');
  sletVoted = true;
  const indexS = votes.findIndex(user => user.roleVoter === 'slet');
  if (indexS == -1) {
    sletVoted = false;
  }
  console.log('test', weerwolfVoted);
  if (weerwolfVoted) {
    if (genezerVoted) {
      if (voteW.votedForId != voteG.votedForId) {
        console.log(heksVoted);
        if (heksVoted) {
          if (voteH.votedWhat != 'levend' || voteH.votedForId != voteW.votedForId) {
            deadUser = getCurrentUser(voteW.votedForId);
            changeCurrentUserStatus(deadUser.id, 'Dead');
            doden.push(deadUser);
            if (sletVoted) {
              if (voteS.votedForId == voteW.votedForId) {
                deadUser2 = getUserRole('slet');
                changeCurrentUserStatus(deadUser2.id, 'Dead');
                doden.push(deadUser2);
              }
            } //als slet dood is gebeurt er niets
          }
        } else { //heks dood of afwezig
          deadUser = getCurrentUser(voteW.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (sletVoted) {
            if (voteS.votedForId == voteW.votedForId) {
              deadUser2 = getUserRole('slet');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            }
          }
        }



      }
    } else { //genezer dood
      if (heksVoted) {
        if (voteH.votedWhat != 'levend' || voteH.votedForId != voteW.votedForId) {
          deadUser = getCurrentUser(voteW.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (sletVoted) {
            if (voteS.votedForId == voteW.votedForId) {
              deadUser2 = getUserRole('slet');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            }
          } //als slet dood is gebeurt er niets
        }
      } else { //heks dood of afwezig
        deadUser = getCurrentUser(voteW.votedForId);
        changeCurrentUserStatus(deadUser.id, 'Dead');
        doden.push(deadUser);
        if (voteS.votedForId == voteW.votedForId) {
          deadUser2 = getUserRole('slet');
          changeCurrentUserStatus(deadUser2.id, 'Dead');
          doden.push(deadUser2);
        }
      }
    }
    if (heksVoted) {
      if (genezerVoted) {
        if(voteH.voteWhat == 'dood' && voteH.votedForId != voteG.votedForId && voteH.votedForId != 'noOne') {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (sletVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slet');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slet dood is gebeurt er niets
          }
        }
      } else {
        if(voteH.voteWhat == 'dood'&& voteH.votedForId != 'noOne' && voteH.votedForId != voteG.votedForId) {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (sletVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slet');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slet dood is gebeurt er niets
          }
        }
      }

    } //als de heks dood is gebeurt er niets

  } else { //weerwolf dood
    if (heksVoted) {
      if (genezerVoted) {
        if(voteH.voteWhat == 'dood' && voteH.votedForId != voteG.votedForId && voteH.votedForId != 'noOne') {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (sletVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slet');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slet dood is gebeurt er niets
          }
        }
      } else {
        if(voteH.voteWhat == 'dood'&& voteH.votedForId != 'noOne') {
          deadUser = getCurrentUser(voteH.votedForId);
          changeCurrentUserStatus(deadUser.id, 'Dead');
          doden.push(deadUser);
          if (sletVoted) {
            if (voteS.votedForId == voteH.votedForId) {
              deadUser2 = getUserRole('slet');
              changeCurrentUserStatus(deadUser2.id, 'Dead');
              doden.push(deadUser2);
            } //als slet dood is gebeurt er niets
          }
        }
      }

    } //als de heks dood is gebeurt er niets
  }
  // if (voteW.votedForId != voteG.votedForId) {
  //   if (voteH.votedWhat != 'levend' || voteH.votedForId != voteW.votedForId) {
  //     deadUser = getCurrentUser(voteW.votedForId);
  //     changeCurrentUserStatus(deadUser.id, 'Dead');
  //     doden.push(deadUser);
  //     if (voteS.votedForId == voteW.votedForId) {
  //       deadUser2 = getUserRole('slet');
  //       changeCurrentUserStatus(deadUser2.id, 'Dead');
  //       doden.push(deadUser2);
  //     }
  //   }
  // } else if(voteH.voteWhat == 'dood' && voteH.votedForId != voteW.votedForId && voteH.votedForId != voteG.votedForId && voteH.votedForId != 'noOne') {
  //   deadUser = getCurrentUser(voteH.votedForId);
  //   changeCurrentUserStatus(deadUser.id, 'Dead');
  //   doden.push(deadUser);
  //   if (voteS.votedForId == voteH.votedForId) {
  //     deadUser2 = getUserRole('slet');
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
  livingWW = alive.filter(user => user.role === 'weerwolf' || user.role === 'weerwolf(nietStemmen)');
  livingGOODnum = living.length - livingWW.length;
  if (livingGOODnum == 1 || livingGOODnum == 0) {
    win = 'wolves';
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
  numWerewolves = Math.floor(numPlayers/4);
  if (numWerewolves % 2 == 0) {
    numWerewolves++;
  }
  numGoodRoles = numPlayers - numWerewolves;
  goodRoles = ['heks', 'ziener', 'genezer', 'slet', 'beul'];
  numBeginGoodRoles = goodRoles.length;
  for (var i = 0; i < numGoodRoles; i++) {
    if (i >= numBeginGoodRoles) {
      goodRoles.push('burger');
    }
  }
  console.log(goodRoles);
  goodCount = goodRoles.length;
  badCount = numWerewolves;
  werewolveOne = false;
  for (var i = 0; i < numPlayers; i++) {
      var randomNum = Math.random();
    //kijkt voor weerwolf
      if (randomNum < 0.25 && badCount != 0) {
        if (!werewolveOne) {
          players[i].role = 'weerwolf';
          werewolveOne = true;
        } else {
          players[i].role = 'weerwolf(nietStemmen)';
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
            players[i].role = 'weerwolf';
            werewolveOne = true;
          } else {
            players[i].role = 'weerwolf(nietStemmen)';
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
          players[i].role = 'burger';
        }
      }
  }
  console.log('end');
  return players;
  users = players;
}
module.exports = {addUser, deleteUser, getAllUsers, getCurrentUser, changeUsers, giveRoles, getUsersAlive, changeCurrentUserStatus, getUsersActiveAlive, getOutcomeNight, getUsersActiveAliveNoBeul, getOutcomeDay, checkforwin};
