function loggoutOut(req,res,next){
    //check for session and user id
    if(req.session && req.session.userId){
        return res.redirect('/profile');
    }
    return next();
}

function requiresLogin(req,res,next) {
    if(req.session && req.session.userId){
        return next();
    }else{
        var err = new Error('You must be logged into view this page');
        err.status = 401;
        return next(err);
    }
}

//export function and then require it
module.exports.loggoutOut = loggoutOut;
module.exports.requiresLogin = requiresLogin;