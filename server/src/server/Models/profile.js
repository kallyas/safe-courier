const {  Schema } = require('mongoose')

const ProfileSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    address: {
        city: {
            type: String
        },
        district: {
            type: String
        }
    },
    profileImg: {
        type: String,
    }
})