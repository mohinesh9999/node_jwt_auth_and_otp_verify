const jwt=require('jsonwebtoken')

module.exports=function(req,res,next){
    const token=req.header('auth-token');
    if(!token){
        return res.status(401).send('access denied')
    }
    try{
        const c=jwt.verify(token," ")
        req.user=c
        next()
    }
    catch(e){
        return res.status(400).send('invalid token')
    }
}