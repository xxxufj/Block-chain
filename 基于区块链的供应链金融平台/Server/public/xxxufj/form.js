function new_account() {
    buyer_addr = document.getElementsByClassName("buyer_addr")[0].value;
    solder_addr = document.getElementsByClassName("solder_addr")[0].value;
    goods = document.getElementsByClassName("goods")[0].value;
    price = document.getElementsByClassName("price")[0].value;
    due_time = document.getElementsByClassName("due_time")[0].value;
    
	//if (username == "Username") alert("please input username");
	//else if (password == "Password") alert("please input password");
	var body = {
        "buyer" : buyer_addr,
        "solder" : solder_addr,
        "goods" : goods, 
        "price" : price, 
        "due_time" : due_time 
  	};
    post('http://localhost:8080/issue_account', body);
    alert('添加成功！');     
    window.location.href='http://localhost:8080/supplyChain.html'
}

function transfer_account(){
    prev_buyer_addr = document.getElementsByClassName("prev_buyer_addr")[0].value;
    buyer_addr = document.getElementsByClassName("buyer_addr")[0].value;
    solder_addr = document.getElementsByClassName("solder_addr")[0].value;
    goods = document.getElementsByClassName("goods")[0].value;
    price = document.getElementsByClassName("price")[0].value;
    due_time = document.getElementsByClassName("due_time")[0].value;
    
	//if (username == "Username") alert("please input username");
	//else if (password == "Password") alert("please input password");
	var body = {
        "prev_buyer" : prev_buyer_addr,
        "buyer" : buyer_addr,
        "solder" : solder_addr,
        "goods" : goods, 
        "price" : price, 
        "due_time" : due_time 
  	};
    post('http://localhost:8080/account_transfer', body);
    alert('转让成功！');     
    window.location.href='http://localhost:8080/supplyChain.html'
}

function finance(){
    bank = document.getElementsByClassName("bank")[0].value;
    company = document.getElementsByClassName("company")[0].value;
    arrear_party = document.getElementsByClassName("arrear_party")[0].value;
    money = document.getElementsByClassName("money")[0].value;
    due_time = document.getElementsByClassName("due_time")[0].value;
    
	//if (username == "Username") alert("please input username");
	//else if (password == "Password") alert("please input password");
	var body = {
        "bank" : bank,
        "company" : company,
        "arrear_party" : arrear_party,
        "money" : money,  
        "due_time" : due_time 
  	};
    post('http://localhost:8080/financing', body);
    alert('贷款成功！');     
    window.location.href='http://localhost:8080/home.html'
}

function pay_account(){
    company = document.getElementsByClassName("company")[0].value;
    downstream_enterprise = document.getElementsByClassName("downstream_enterprise")[0].value;
    
	//if (username == "Username") alert("please input username");
	//else if (password == "Password") alert("please input password");
	var body = {
        "company" : company,
  	};
    post('http://localhost:8080/payoff', body);
    alert('支付成功！');     
    window.location.href='http://localhost:8080/home.html'
}


function next_page(){
    var body = {
        "method" : "next"
      };
    post('http://localhost:8080/supplyChain', body);
}

function prev_page(){
    var body = {
        "method" : "prev"
      };
    post('http://localhost:8080/supplyChain', body);
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

