var connectURL = "http://kh13.com/forum/interface/ipsconnect/ipsconnect.php";
var connectKey = "85d40b180a4ac5d02b9b815ec333cb0e";

function getCookie(cname)
{
var name = cname + "=";
var ca = document.cookie.split(';');
for(var i=0; i<ca.length; i++) 
  {
  var c = ca[i].trim();
  if (c.indexOf(name)==0) return c.substring(name.length,c.length);
}
return "";
}

var loggedIn = null;
var cookie = getCookie("ipsconnect_" + CryptoJS.MD5(connectURL));