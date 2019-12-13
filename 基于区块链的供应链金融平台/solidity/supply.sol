pragma solidity ^0.4.22;

contract supply {
    
    struct Company{
        string name;
        uint credit;
        address addr;
        string private_key;
    }
    
    struct Reciept{
        address buyer_addr; 
        address solder_addr;
        uint issure_time;
        uint due_time;
        string good;
        uint price;
        bool transfered;
    }

    struct Reciept_chain{
        bool paid;
        Reciept[] reciepts;
    }
    
    struct Finance{
        address bank_addr;
        address company_addr;
        Reciept[] reciepts;
        uint money;
        uint due_time;
    }
    
    event func_transfer(address buyer, address solder, uint index);
    event func_issue_account(address buyer, address solder);
    event func_payoff(address buyer, uint index);
    event func_finance(address company, address bank);
    
    mapping (address => Company) companies;
    mapping (address => uint) public balances;
    Reciept_chain[] reciept_chains;
    Finance[] finances;
    address[] addrs;
    
    function company_signin(address _addr, string _private_key)public view returns(string, string, bool){
        string memory key = companies[_addr].private_key;
        bool flag;
        if(keccak256(key) == keccak256(_private_key))flag = true;
        else flag = false;
        return (key, _private_key, flag);
    }
        
    function company_register(address _addr, string _private_key, string _name, uint _balance, uint _credit)public{
        companies[_addr] = Company({
            name : _name, 
            credit : _credit, 
            addr : _addr,
            private_key : _private_key
        });
        balances[_addr] = _balance;
        addrs.push(_addr);
    }
    
    function get_addrs()public view returns(address[]){
        return addrs;
    }


    function strConcat(string _a, string _b) internal returns (string){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory ret = new string(_ba.length + _bb.length);
        bytes memory bret = bytes(ret);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++)bret[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) bret[k++] = _bb[i];
        return string(ret);
   }  

    function get_names()public returns(string){
        string memory names;
        uint i;
        for(i = 0; i < addrs.length - 1; i++){
            names = strConcat(names, companies[addrs[i]].name);
            names = strConcat(names, ",");
        }
        names = strConcat(names, companies[addrs[i]].name);
        return names;
    }
    
    
    //获取供应链
    function get_reciept_chain_len()public view returns (uint){
         return reciept_chains.length;
    }
    function get_reciepts_len(uint chain_index)public view returns (uint){
         return reciept_chains[chain_index].reciepts.length;
    }
    function get_reciept(uint chain_index, uint reciept_index)public view returns(address,address,uint,uint,string,uint,bool){
        Reciept memory tmp = reciept_chains[chain_index].reciepts[reciept_index];
        return (tmp.buyer_addr, tmp.solder_addr, tmp.issure_time, tmp.due_time, tmp.good, tmp.price, tmp.transfered);
    }
    
    function get_chain_status(uint chain_index)public view returns (bool){
        return reciept_chains[chain_index].paid;
    }
    
    
    function get_user(address addr)public view returns(string name, uint balance, uint credit){
        return (companies[addr].name, balances[addr], companies[addr].credit);
    }
    
    function make_reciept(address _buyer, address _solder, string _good, uint _price, uint _due_time)internal view returns (Reciept){
        Reciept memory new_reciept = Reciept({
            buyer_addr : _buyer,
            solder_addr : _solder,
            good : _good,
            price : _price,
            issure_time : now,
            due_time : _due_time,
            transfered : false
        });
        return new_reciept;
    }
    
    
    //-----------issue an account and create a new chain------------------
    Reciept_chain new_chain;
    
    function issue_account(address _buyer, address _solder, string _good, uint _price, uint _due_time)public returns(bool){
        Reciept memory new_reciept = make_reciept(_buyer, _solder, _good, _price, _due_time);
        delete new_chain.reciepts;
        new_chain.reciepts.length = 0;
        new_chain.paid = false;
        new_chain.reciepts.push(new_reciept);
        reciept_chains.push(new_chain);
        return true;
        emit func_issue_account(_buyer, _solder);
    }
    


    //-------------------------transfer account----------------------------
    function find_reciept_chain(address _buyer, address _solder)internal view returns(uint256){
        for(uint i = 0; i < reciept_chains.length; i++){
            for(uint j = 0; j < reciept_chains[i].reciepts.length; j++){
                if(reciept_chains[i].reciepts[j].buyer_addr == _buyer
                && reciept_chains[i].reciepts[j].solder_addr == _solder
                && reciept_chains[i].paid == false)
                return i;
            }
        }
        return 10000;
    }
    
    function account_transfer(address _prev_buyer, address _buyer, address _solder, string _good, uint _price, uint _due_time)public returns(bool){
        //find chain 
        uint256 index = find_reciept_chain(_prev_buyer, _buyer);
        if(index == 10000)return false;
        
        Reciept_chain memory tmp = reciept_chains[index];
        if(tmp.reciepts[tmp.reciepts.length - 1].solder_addr != _buyer) return false;
        if(tmp.reciepts[tmp.reciepts.length - 1].transfered == true) return false;
        
        
        //add reciept
        reciept_chains[index].reciepts[reciept_chains[index].reciepts.length - 1].transfered = true;
        Reciept memory new_reciept = make_reciept(_buyer, _solder, _good, _price, _due_time);
        reciept_chains[index].reciepts.push(new_reciept);
        return true;
        emit func_transfer(_buyer, _solder, index);
    }
    
    
    //-------------------------finance with bank----------------------------
    
    Reciept blank;
    function find_reciept_unused_and_set(address buyer, address solder) internal returns (Reciept){
        for(uint i = 0; i < reciept_chains.length; i++){
            for(uint j = 0; j < reciept_chains[i].reciepts.length; j++){
                if(reciept_chains[i].reciepts[j].buyer_addr == buyer
                && reciept_chains[i].reciepts[j].solder_addr == solder
                && reciept_chains[i].reciepts[j].transfered == false){
                    reciept_chains[i].reciepts[j].transfered = true;
                    return reciept_chains[i].reciepts[j];
                }
            }
        }
        return blank;
    }
    
    Finance new_finance;
    function financing(address _bank_addr, address _company_addr, address arrear_party, uint _money, uint _due_time)public{
        new_finance.bank_addr = _bank_addr;
        new_finance.company_addr = _company_addr;
        new_finance.money = _money;
        new_finance.due_time = _due_time;
        
        delete new_finance.reciepts;
        
        Reciept memory reciept = find_reciept_unused_and_set(arrear_party, _company_addr);
        if(reciept.buyer_addr == address(0) || reciept.price < _money) return;
        new_finance.reciepts.push(reciept);
        
        finances.push(new_finance);
        balances[_company_addr]+=_money;
        emit func_finance(_company_addr, _bank_addr);
    }
    
    
    
    //-------------------------payoff the load----------------------------
    function payoff(address payer)public{
        //find the tansaction
        uint index = 0;
        for(; index < reciept_chains.length; index++){
            if(reciept_chains[index].paid == false && reciept_chains[index].reciepts[0].buyer_addr == payer)break;
        }
        if(index >= reciept_chains.length) return;
        
        //payoff
        //check if payer has enough money
        if(balances[payer] < reciept_chains[index].reciepts[0].price)return;

        //pay money for all companies on the chain
        uint paid_money = 0;
        uint residue;
        address reciever;
        uint i = 0; 
        uint len = reciept_chains[index].reciepts.length;
        for(; i < len; i++){
            reciever = reciept_chains[index].reciepts[len - i - 1].solder_addr;
            residue = reciept_chains[index].reciepts[len - i - 1].price - paid_money;
            paid_money += residue;
            balances[payer] -= residue;
            balances[reciever] += residue;
        }

        //delete the record of the useless transaction 
        reciept_chains[index].paid = true;
        emit func_payoff(payer, index);
    }


    function issue(address issuer, address receiver, uint amount) internal {
        if(balances[issuer] < amount)return;
        balances[issuer]-=amount;
        balances[receiver]+=amount;
    }
}

