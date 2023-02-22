const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://ks_smmart:aPZAsutyIsa8@kssmart-acluster.hkgsj.mongodb.net/mploydatasksa', { useNewUrlParser: true }).then(() => console.log('mongo connected')).catch(err => console.log(err));


mongoose.connect('mongodb+srv://ks_smmart:aPZAsutyIsa8@kssmart-acluster.hkgsj.mongodb.net/test?authSource=admin&replicaSet=atlas-9a5w2t-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', {
    
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database')
})
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');


const schema = mongoose.Schema;
const signupschema = new schema({
    username: {
        type: String,

        required:[true, 'please enter username']
    },
    // mnumber: ,

    email: {
        type: String,
        required: [true, 'please enter email'],
        unique: true, 
        lowercase: true,
        validate: [ isEmail, 'please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'please enter password'],
        minlength: [8, 'Minimum password length is 8 characters'],
        validate: [(val)=> {/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/}, 'alphanumerical atleast one alpha upper one alpha lower spcl character and number']
    },
    // passwordsam: String,
    image: String,

    verified: Boolean
})

// fire a fn after doc saves to db mongoose hooks

    signupschema.post('save', function (doc, next) {
        console.log('new user was created and savea', doc);
        next();
    })
    signupschema.pre('save', async function (next) {
            
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
        console.log('user abt to be created and savaa', this);
        next();
    });

// static method to login user
signupschema.statics.login = async function (email, password) {

    const user = await this.findOne({ email });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');

    }

var signupdata = mongoose.model('signupdata', signupschema);
module.exports = signupdata;