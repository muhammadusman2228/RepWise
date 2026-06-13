import mongoose from 'mongoose'


const exercise = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
        enum:['chest','shoulder','cardio','back','leg','arms','core','olympics','others'],
        default:"others"
    },
    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    }
},{
    timestamps:true
})
const exerciseModel = mongoose.model("Exercise", exercise);
export default exerciseModel;