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
const signupemailschema = new schema({
    userId: String,
    uniqueString: String,
    createdAt: Date,
    expiresAt: Date,

   
})



var sigdata = mongoose.model('sigemdata', signupemailschema);
module.exports = sigdata;