

const validate =(schema) =>{
    return (req,res,next)=>{
        const {error,value} =schema.validate(req.body,{abortEarly:false})
        if(error){
            const errorDetail=error.details.map(detail=>detail.message)
          return  res.status(400).json({
                message:"Invalid inputs",
                error:errorDetail
            })
        }
        req.body=value
        next()
    }
}
export default validate