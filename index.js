const express = require("express");
const app = express();
const Discord = require("discord.js")
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]});
const { joinVoiceChannel } = require('@discordjs/voice');
const { getVoiceConnection } = require('@discordjs/voice');
const voiceDiscord = require('@discordjs/voice');
let timerOn = false;
let timeout;

// Prefix
const prefix = "a-";
// Black List
const blackList = [];


app.listen(3000, () => {
console.log("Project is running!");
})

app.get("/", (req, res) => {
res.send("Bot is ready!");
})

//Timer
const T = {
  setTimer(message) {
    if (timerOn == true){
      clearTimeout(timeout);
      timeout = undefined;
      timerOn = false;
    }
    else {
      timeout = setTimeout( () => { 
        getVoiceConnection(message.guild.id).destroy();
        message.channel.send('Писна ми от вас!');
      }, 15 * 60 * 1000 );
      timerOn = true;
    }
  }
};


client.on("messageCreate", message => {

  //----- Help -----
  if (!blackList.includes(message.author.username.toString())) {
    if (message.content == prefix + "help") {
    
    const commandList = [];
    const fs = require('fs');
    const files = fs.readdirSync('./sound_files'); 

     files.forEach(file => {
       const name = file.toString().replace(".mp3","");
       commandList.push(name);
           
    })
    message.channel.send(commandList.sort().join('  -  '));
    return;
  }

    //----- Disconnect -----
    if(message.content == prefix + "leave") {
      const connection = getVoiceConnection(message.guild.id)
      if(!connection) {
        return message.channel.send("I'm not in a voice channel!");
      }
      else{
        connection.destroy();
        message.channel.send('Disconnected from voice!');
        clearTimeout(timeout);
        timerOn = false;
      }
    }

    //----- Restriction -----
    //if (message.content == prefix + "ban "){
      //if (message.author.username == "abdi99"){
        //if (!blackList.includes(message.author.username.toString())) {
          //blackList.push();
          //message.channel.send('Banned!');
        //}else {
          //message.channel.send('Already banned!');
        //}
      //}      
    //}

    //----- Play Audio -----
    else if(message.content.startsWith(prefix)) {
      const txt = message.content.substring(prefix.length);    
      const vc = message.member.voice.channel
      
      if(vc) {
        const connection = joinVoiceChannel({
        	channelId: vc.id,
        	guildId: message.guild.id,
        	adapterCreator: message.guild.voiceAdapterCreator,
        });
        const player = voiceDiscord.createAudioPlayer();
  		  const resource = voiceDiscord.createAudioResource('./sound_files/' + txt + ".mp3");
        player.play(resource);
  		  connection.subscribe(player); 
        T.setTimer(message);
      }
      else {  
        message.channel.send("Please connect to a voice channel!");
        return;               
      }
    }       
  }
})

client.login(process.env.token);
//message.author.username != "Dest"