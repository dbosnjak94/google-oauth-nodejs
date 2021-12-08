const cookieParser = require('cookie-parser');
const { response } = require('express');
const express = require('express');
const app = express();

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '599601008531-oqq905kro7dq28gd2hr6fdpkh1arhni8.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 3000;


// Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());



app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res)=> {
    let token = req.body.token;
    console.log(token)
    async function verify(){
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    const userId = payload['sub'];
    console.log(payload)
    }
    verify()
    .then(()=> {
        res.cookie('session-token', token);
        res.send('success');
    }).catch(console.error)
})

app.get('/profile', checkAuthenticated, (req, res) => {
    let user = req.user;
    res.render('profile', {user});
})

app.get('/protectedroute', (req, res)=> {
    res.render('protectedroute.js')
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/logout', (req, res) => {
    res.clearCookie('session-token');
    res.redirect('/login');
})

function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/login')
      })

}

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})