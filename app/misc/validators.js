
exports.validatetime = (inputTime) => {

    var timeformat = /^(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)$/; 

    if(inputTime.match(timeformat))
    {
        return true;
    }
    return false;
}

exports.validatedate = (inputText) => {

    // it works for MM/DD/YYYY or MM-DD-YYYY
    var dateformat = /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/;
    // Match the date format through regular expression
    
    if(inputText.match(dateformat))
    {
        //Test which seperator is used '/' or '-'
        
        var opera1 = inputText.split('/');
        var opera2 = inputText.split('-');
        lopera1 = opera1.length;
        lopera2 = opera2.length;
        
        // Extract the string into month, date and year
        
        if (lopera1>1)
        {
            var pdate = inputText.split('/');
        }
        else if (lopera2>1)
        {
            var pdate = inputText.split('-');
        }
        var mm  = parseInt(pdate[0]);
        var dd = parseInt(pdate[1]);
        var yy = parseInt(pdate[2]);
        
        // Create list of days of a month [assume there is no leap year by default]
        var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
        if (mm==1 || mm>2)
        {
            if (dd>ListofDays[mm-1])
            {
                return false;
            }
        }
        if (mm==2)
        {
            var lyear = false;
            if ( (!(yy % 4) && yy % 100) || !(yy % 400) ) 
            {
                lyear = true;
            }
            if ((lyear==false) && (dd>=29))
            {
                return false;
            }
            if ((lyear==true) && (dd>29))
            {
                return false;
            }
        }
        return true;
    }
    else
    {
        return false;
    }
}

exports.inputvalidation = (instring) => {
    if(!instring.charAt(0).match(/[a-zA-Z]/))
    {
        return [false, "should starts with alpha character!"]
    }
    if(instring.match("^[a-zA-Z0-9-_]*$") == null)
    {
        return [false, "should not contain space,symbols except '-' '_' "]
    }

    if(instring.length < 3)
    {
        return [false, "length should be minimum 3"]
    }
    return [true, "OK"]
}


exports.emailvalidation = (instring) => {
    if(!instring.charAt(0).match(/[a-zA-Z0-9]/))
    {
        return [false, "should starts with alpha numeric character!"]
    }
    if(instring.match("^[a-zA-Z0-9-_@.]*$") == null)
    {
        return [false, "should not contain space,symbols except '-' '_' "]
    }

    if(instring.length < 8)
    {
        return [false, "length should be minimum 8"]
    }
    return [true, "OK"]
}


exports.pwdvalidation = (instring) => {
    if(instring.match("^[a-zA-Z0-9-_@#$*&]*$") == null)
    {
        return [false, "should not contain space,symbols except '@-#$&_' "]
    }

    if(instring.length < 8)
    {
        return [false, "length should be minimum 8"]
    }
    return [true, "OK"]
}

exports.servervalidation = (instring) => {
    if(!instring.charAt(0).match(/[a-zA-Z0-9]/))
    {
        return [false, "should starts with alpha numeric character!"]
    }
    if(instring.match("^[a-zA-Z0-9-_@.*:/\&$]*$") == null)
    {
        return [false, "should not contain space,symbols except ':/\*@.&$.' "]
    }

    if(instring.length < 8)
    {
        return [false, "length should be minimum 8"]
    }
    return [true, "OK"]
}

exports.hwidvalidation = (instring) => {
    if(instring.match("^[a-zA-Z0-9]*$") == null)
    {
        return [false, "should not contain space,symbols"]
    }

    if(instring.length < 16)
    {
        return [false, "length should be minimum 16"]
    }
    return [true, "OK"]
}

exports.lengthvalidation = (instring) => {
    if(instring.length < 3)
    {
        return [false, "length should be minimum 3"]
    }
    return [true, "OK"]
}