const Gravitalia = require('../index');
const client = new Gravitalia.Client;

client.on('photoCreate', async (photo) => {
    console.log(`New photo created from ${(await client.getUser(id)).username}: ${photo.id}`)
});

client.on('ready', async () => {
    console.log(`[!] ${client.user.username} is connected!`)
    setInterval(() => console.log(client.ping()), 5000)
    console.log(client.postPhoto("This is a description of my image!", "./test.png"))
});

client.on('error', (e) => {
    console.error(e)
});

client.on('disconnect', async () => {
    console.log(`[!] ${client.user.username} is deconnected!`)
});

client.login('MTE5MTY5NjIzMjYzODA1NDQ=.Mi02MDkyLTA=.MTYxNTY0MzA4MjI4NA==')