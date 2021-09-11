setEvents = async () => {
  //select the corresponding UI elements
  const chatForm = document.getElementById('chat-form');
  const chatMessages = document.querySelector('.chat-messages');
  const roomName = document.getElementById('room-name');
  const userList = document.getElementById('users');
  const myName = document.getElementById('me')
  const leaveButton = document.getElementById('leave-btn')

  //obtaining query parameters

  const { username, token, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
  console.log(token)

//   const tokenRequest = {uid: username}; 
 
//   const fetchOptions = {
//     method: 'POST',
//     headers: {
//     'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(tokenRequest),
//     };
//  let token = 'x'; 
// try
// {
//   let response = await fetch('/token/getToken', fetchOptions); 
//   const tokenData = await response.json(); 
//   token = tokenData.message; 
//  console.log(token)
// }
// catch (e)
// {
//    alert(e)

// }
   

  //configuring the SDK 

  let options = {
    uid: username,
    token: token
  }
  const appID = 'bf616ccbaa3a456ca9d76b64e03eb713'
  const client = AgoraRTM.createInstance(appID)

  


  //Authenticate using RTM token and join room 
  try{
    await client.login(options)

  }
  catch(e)
  {
    console.log(e)
  }
  let channel = client.createChannel(room)
  await joinRoom()





 //listen to events 
  channel.on('ChannelMessage', function (message, memberId) {

    outputMessage(message.text, memberId)
    chatMessages.scrollTop = chatMessages.scrollHeight;

  })

  channel.on('MemberJoined', async function (memberId) {

    let users = await channel.getMembers()
    outputMessage("Hello " + memberId + "! Welcome to " + channel.channelId, "CodeChat Bot")
    outputUsers(users)

  })




  leaveButton.addEventListener('click', leaveRoom)


  //functions 
  async function joinRoom() {
    await channel.join().then(async () => {
      myName.innerText = username
      let result = await channel.getMembers()
      outputUsers(result)
      outputRoomName(channel.channelId)
      outputMessage("Hello " + username + "! Welcome to " + channel.channelId, "CodeChat Bot")


    })
  }

  async function leaveRoom() {
    const quit = confirm('Are you sure you want to leave the chatroom?');
  if (quit) {
    if (channel != null) {
      await channel.leave()
      
      window.location = './index.html';
    }

  }
    
  }
  function outputRoomName(room) {
    roomName.innerText = room
  }
  // Output message to DOM
  function outputMessage(messageText, memberId) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = memberId;
    // p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = messageText;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
  }


  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
      return false;
    }

    // Emit message to server
    if (channel != null) {
      await channel.sendMessage({ text: msg }).then(() => {

        outputMessage(msg, options.uid)

      }

      )
    }

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });


  // Add users to DOM
  function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user;
      userList.appendChild(li);
    });
  }











}



window.onload = function () {
  setEvents()
}