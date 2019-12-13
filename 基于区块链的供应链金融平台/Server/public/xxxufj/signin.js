

function submit() {
    addr = document.getElementsByClassName("addr")[0].value;
    key = document.getElementsByClassName("key")[0].value;
	//if (username == "Username") alert("please input username");
	//else if (password == "Password") alert("please input password");
	var body = {
        "addr" : addr,
        "key" : key,
  	};
    post('http://localhost:8080/signin', body);
}


function post(URL, PARAMS){
    var temp = document.createElement("form");
    temp.action = URL;
    temp.method = "post";
    temp.style.display = "none";
    for (var x in PARAMS){
        var opt = document.createElement("textarea");
        opt.name = x;
        opt.value = PARAMS[x];
        temp.appendChild(opt);
    }
    document.body.appendChild(temp);
    temp.submit();
    return temp;
} 

