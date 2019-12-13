

function getuser() {
    addr = document.getElementsByClassName("companyaddr")[0].value;
	var body = {
        "addr" : addr,
  	};
    post('http://localhost:8080/home.html', body);
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

