
const g_request = require( "request" );

var exports = module.exports = {};

exports.oauth = function( response )
{
    var func_name = "my_mural.oauth";
    
    console.log( func_name + " ..." );
    
    // https://developers.mural.co/public/docs/oauth#authenticate-users-authorization-request

    var oauthURL = process.env.MURALOAUTHURL +
                   "?client_id="    + process.env.MURALCLIENTID +
                   "&redirect_uri=" + process.env.MURALREDIRECT +
                   "&scope=murals:read murals:write" +
                   "&response_type=code";
    
    console.log( func_name + " redirecting to:\n" + oauthURL );
    
    response.redirect( oauthURL );
        
}


exports.getAccessToken = function( code, callback )
{
    var func_name = "my_mural.getAccessToken";
    
    console.log( func_name + " ..." );

    // https://developers.mural.co/public/docs/oauth#authenticate-users-access-token-request
    
    var tokenURL = process.env.MURALOAUTHURL + "/token";
    
    var options = { method  : "POST",
                    url     : tokenURL,
                    form    : { "client_id"     : process.env.MURALCLIENTID, 
                                "client_secret" : process.env.MURALCLIENTSECRET, 
                                "redirect_uri"  : process.env.MURALREDIRECT,
                                "code"          : code,
                                "grant_type"    : "authorization_code"
                              }
                  };
    
    g_request( options, function( error, response, body )
    {
        //console.log( func_name + ": options:\n" + JSON.stringify( options, null, 3 ) );
        //console.log( func_name + ": error:\n" + error );
        //console.log( func_name + ": body:\n" + body );
        //console.log( func_name + ": response:\n" + JSON.stringify( response, null, 3 ) );

        if( error )
        {
            var msg = "Request failed:\n" + error.message;
            console.log( func_name + msg );
            callback( msg, "", "" );
            return;
        }

        try
        {
            var body_json = {};
            if( body )
            {
                body_json = JSON.parse( body );
            }
        }
        catch( e )
        {
            var msg = "Processing body caught error:\n";
            if( body.toString().match( /\<html/i ) )
            {
                msg += g_html.convert( body, { wordwrap : 75 } );
            }
            else
            {
                msg += e.stack + "\nbody:\n" + body;
            }
            
            console.log( func_name + ": " + msg );
            callback( msg, "", "" );
            return;
        }
        
        if( !( "access_token" in body_json ) || ( "undefined" === typeof body_json["access_token"] ) )
        {
            var msg = "access_token not found in response body";
            console.log( func_name + ": " + msg );
            callback( msg, "", "" );
            return;
        }
        
        if( !( "refresh_token" in body_json ) || ( "undefined" === typeof body_json["refresh_token"] ) )
        {
            var msg = "refresh_token not found in response body";
            console.log( func_name + ": " + msg );
            callback( msg, "", "" );
            return;
        }
        
        callback( "", body_json["access_token"], body_json["refresh_token"] );
        
    } );

}


