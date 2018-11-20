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
//  Copyright a97marbr / HGustavs
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

'use strict';
var headings=["Personnummer","Namn","Kurstillfälle","Tillstånd","Läses inom"];
var students={};

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
}

function gethispart(){
  getpart();
  var hisstudents=$(".participant").each(function(){
			let ssn=$(this).find(".part-ssn").text().trim();
    	$(this).find(".part-info li").each(function(){
        	let email=this.innerText.trim();
        	if(email.indexOf("@student.his.se")!==-1){
          		//console.log(email);
            	//console.log(email.split("@")[0]);
            	//console.log(ssn);
              if(typeof(students[ssn])!=="undefined"){
                  students[ssn]["email"]=email;
                  students[ssn]["username"]=email.split("@")[0];  
              }else{
                  alert(ssn+" not in LADOK list!");
              }
          }
      });    
  });
  //console.log(students)
  renderList(students);
}


function renderList(students){
  let partlist=document.getElementById("partlist");
  partlist.value="";
  // from stackoverflow: https://stackoverflow.com/questions/921789/how-to-loop-through-a-plain-javascript-object-with-the-objects-as-members
  for (var ssn in students) {
    // skip loop if the property is from prototype
    if (!students.hasOwnProperty(ssn)) continue;

    var s = students[ssn];
    let str=ssn;
    
    if (typeof(s.username)==="undefined"){
      	alert(ssn + "not in HIS list!"); 
      	continue;
    }
    
    for (var prop in s) {
      // skip loop if the property is from prototype
      if(!s.hasOwnProperty(prop)) continue;

      // separate with ; instead of ,
      str+="; "+s[prop];
    }            
    partlist.value+=str+"\n";
  }
}

function clearData(){
  localStorage.clear("partlist");
  document.getElementById("partlist").value="";
}

$(document).ready(function(){
    $("body").append("<div style='width:440px;padding:8px;height:600px;top:255px;right:20px;background-color:#def;box-shadow:4x 4px 4px #000;border:1px solid red;position:fixed;z-index:15000'><h3>From Ladok</h3><textarea id='fromladok' style='width:390px;height:200px;'></textarea><h3>Complete list</h3><textarea id='partlist' style='width:390px;height:200px;'></textarea><input id='scraper' type='button' value='Scrape'><input type='button' value='Clear' onclick='clearData();'></div>");  
    $("#scraper").click(gethispart);
});
