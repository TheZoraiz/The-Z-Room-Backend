let str = 'Hello maam, I am a great guy and dont appreciate this 🙃';
str = str.replace(/'/g, '\\\'');
str = str.replace(/"/g, '\\\"');

console.log(str);