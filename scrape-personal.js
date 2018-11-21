// ==UserScript==
// @name        partlistmonkey
// @namespace   rick
// @include     https://personal.his.se/mina-verktyg/kurs/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @version     0.1
// @grant    		none
// ==/UserScript==

// ------------------------------------------------------------------------------------------------------------
// -----------------=============######## Scrape HIS username and email  ########=============-----------------
// ------------------------------------------------------------------------------------------------------------
//  Copyright a97marbr / HGustavs / Zaxmy
//
//        (\ /)
//        (. .)           
//       c(")(")  ∴ 
//-------------------------------------------------------------------------------------------------------------

// Note: In order to comply with the GPL3 License you must publish any code based on this code using the GPL3 license. No exceptions.
// Note: For Now, we strongly advise that you manually confirm that the scraped results is correct

// Usage: 
// 
//   NB! This script is used in tandem with 'ladokpartlistmonkey'
//
//   1. In LADOK, navigate to the course you need a participant list
//   2. Make sure you show all participants, e.g, check "Visa från alla i denna version" and increase number of visable students to 400
//   3. Click "scrape" and copy the content in textview
//   4. Navigate to personal.his.se and the corresponding course
//   5. Paste the content from step 3 in the textview labled From LADOK.
//   6. Click "scrape" and get your complete participants list
//   [7. If you have multiple course versions, e.g., programkurs and friståendekurs click the radio button for all versions and repeate step 6.]

'use strict';
var headings=["Personnummer","Namn","Kurstillfälle","Tillstånd","Läses inom"];
var students={};
var complete_students={};
var unmatched_students={};
var course_occasions=[];
var scraped_occasions=[];
var ladok_list;

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function getpart(){
    let ladoklist=document.getElementById("fromladok").value.split("\n");
    for(let i=0;i<ladoklist.length;i++){
        let sdata=ladoklist[i].split(";");
        let ssn;
        for(let j=0;j<sdata.length;j++){
            if(j===0){
                ssn=sdata[j];
                students[ssn]={}; 

            }else{
                students[ssn][headings[j]]=sdata[j];
            }					
        }
    }
  	localStorage.setItem('ladoklist', JSON.stringify(students));
  	alert(localStorage.getItem('ladoklist'))
}

function gethispart(){  
  if(isEmpty(students)){
    	if(document.getElementById("fromladok").value==""){
    			alert("You need to add LADOK data first!");
  		}else{
        	getpart();
      }
  }
  var hisstudents=$(".participant").each(function(){
			let ssn=$(this).find(".part-ssn").text().trim();
    	$(this).find(".part-info li").each(function(){
        	let email=this.innerText.trim();
        	if(email.indexOf("@student.his.se")!==-1){
              if(typeof(students[ssn])!=="undefined"){
									complete_students[ssn]=JSON.parse(JSON.stringify(students[ssn]));
                  complete_students[ssn]["email"]=email;
                  complete_students[ssn]["username"]=email.split("@")[0];  
              }else{
                  //console.log(ssn+" "+email+" not in LADOK list!");
                  //document.getElementById("unmatchedlist").value+=ssn+" "+email+" not in LADOK list!\n";  
                	unmatched_students[ssn]={email:email,username:email.split("@")[0]};
              }
          }
      });    
  });
  //console.log(students)
  localStorage.setItem('completelist', JSON.stringify(complete_students));
  renderList("partlist",complete_students);
  renderList("unmatchedlist",unmatched_students);
}


function renderList(id,list){
  let txtedit=document.getElementById(id);
  txtedit.value="";
  // from stackoverflow: https://stackoverflow.com/questions/921789/how-to-loop-through-a-plain-javascript-object-with-the-objects-as-members
  for (var ssn in list) {
    // skip loop if the property is from prototype
    if (!list.hasOwnProperty(ssn)) continue;

    var s = list[ssn];
    let str=ssn;
    
    if (typeof(s.username)==="undefined"){
      	//console.log(ssn + " not in HIS list!"); 
      	//document.getElementById("unmatchedlist").value+=ssn + " not in HIS list!\n";
      	unmatched_students[ssn]={Namn:s.Namn};
      	continue;
    }
    
    for (var prop in s) {
      // skip loop if the property is from prototype
      if(!s.hasOwnProperty(prop)) continue;

      // separate with ; instead of ,
      str+="; "+s[prop];
    }            
    txtedit.value+=str+"\n";
  }
}

function clearData(){
    localStorage.clear("ladoklist");
    document.getElementById("fromladok").value="";
    localStorage.clear("completelist");
    document.getElementById("partlist").value="";
  	document.getElementById("unmatchedlist").value="";
}

$(document).ready(function(){
    $("body").append("<div id='partlistmonkeycontainer' style='width:440px;height:850px;top:45px;right:20px;background-color:#def;box-shadow:4px 4px 4px #000;position:fixed;z-index:15000'><div style='background-color:#614875;margin:0;height:30px;display:flex;justify-content:flex-end;'><div id='closebtn' style='width: 30px;background-color: #f00;color: #fff;font-weight: 900;height: 30px;text-align: center;line-height: 30px;'>X</div></div><div style='padding:8px;'><h3>From Ladok</h3><textarea id='fromladok' style='width:390px;height:200px;'></textarea><h3>Complete list</h3><textarea id='partlist' style='width:390px;height:200px;'></textarea><h3>Unmatched students</h3><textarea id='unmatchedlist' style='width:390px;height:200px;'></textarea><input id='scraper' type='button' value='Scrape'><input id='clearer' type='button' value='Clear' ></div></div>");  
    $("#scraper").click(gethispart);
    $("#clearer").click(clearData);
  	$("#closebtn").click(function(){document.getElementById("partlistmonkeycontainer").style.display="none"});
  	console.log("Available course versions:");
  	$("input[name='select-program-occation']").each(function(){
      	//<input checked="checked" class="radio-button" data-val="21195" data-val-required="The select-program-occation field is required." id="select-program-occation_21195" name="select-program-occation" type="radio" value="21195">
    		console.log(this);
      	
    });
  
    let ladok_json=localStorage.getItem('ladoklist');             
    if (ladok_json===null){
	      students={};
      	console.log("No ladok list found!");
    }else{
  	    students=JSON.parse(ladok_json);
    }
                  

    let complete_json=localStorage.getItem('completelist'); 
    if (complete_json===null){
	      complete_students={};
      	console.log("No complete list found!");
    }else{
  	    complete_students=JSON.parse(complete_json);
    }

  	renderList("partlist",complete_students);
 	  renderList("fromladok",students);
  
});
