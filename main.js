    // ==UserScript==
    // @name         role management
    // @namespace    http://tampermonkey.net/
    // @match        https://anidb.net/episode/*
    // @grant        none
    // ==/UserScript==

  (function() {
    'use strict';


    class Input {
        constructor(parent, id, table) {
            this.parent = parent;
            this.id = id;
            this.element = document.createElement("input");
            this.table = table;


            return this;
        }
        config() {
            this.element.setAttribute("type", "text");
            this.element.addEventListener("focus", () => this.table.manageData(this.value, this.parent, "remove"));
            this.element.addEventListener("focusout", () => this.table.manageData(this.value, this.parent, "update"));
            this.element.style.setProperty("text-align", "center");
            this.element.style.setProperty("font-weight", "bold");
            this.element.style.setProperty("border", "none");
            this.element.style.setProperty("border-radius", "0px");


            return this;
        }
        init() {
            this.parent.element.appendChild(this.element);


            return this;
        }
        get value() {
            return this.element.value;
        }
    }


    class Label {
        constructor(element, id, table) {
            this.element = element;
            this.id = id;
            this.table = table;
            this.input = new Input(this, this.id, this.table).config().init();


            return this;
        }
        get name() {
            return this.element.querySelector("span[itemprop='name']").textContent;
        }
    }


    class Table {
        constructor() {
            this.element = document.createElement("table");
            this.memory = new Object();


            return this;
        }
        config() {
            this.element.style.setProperty("font-family", "arial, sans-serif");
            this.element.style.setProperty("border-collapse", "collapse");
            this.element.style.setProperty("width", "100%");


            return this;
        }
        init() {
            document.body.appendChild(this.element);


            return this;
        }
        manageData(key, value, flag) {
            if (!this.memory.hasOwnProperty(key)) {
                this.memory[key] = new Set();
            }

            if (flag == "update") {
                if (!this.memory[key].has(value)) {
                    this.memory[key].add(value);
                }
            } else if (flag == "remove") {
                if (this.memory[key].has(value)) {
                    this.memory[key].delete(value);
                }
            }
            if (this.memory[key].size == 0) {
                delete this.memory[key];
            }
            console.log(this.memory);
            console.log(this.getMax);
            this.refreshTable();


            return this;
        }

        refreshTable() {
            this.element.textContent = "";
            // let cloneOfMemory = structuredClone(this.memory);
            // Object.keys(cloneOfMemory).forEach((actor) =>{
            //     cloneOfMemory[actor] = Array.from(cloneOfMemory[actor]);
            //     cloneOfMemory[actor].sort((a, b) => a - b);
            // });


            let boldTR = document.createElement("tr");
            for (let actor of Object.keys(this.memory)) {
                let th = document.createElement("th");
                console.log(actor);
                th.textContent = actor;

                let namesOfCast = this.memory[actor]
                th.addEventListener("click", function(){
                    namesOfCast.forEach((e) =>{
                        if(e.element.classList.contains("highlighted")){
                            e.element.classList.remove("highlighted");
                        } else {
                            e.element.classList.add("highlighted");
                            setTimeout(()=>{
                                if(e.element.classList.contains("highlighted")) e.element.classList.remove("highlighted");
                            }, 4000);
                        }
                    });


                });

                boldTR.appendChild(th);
            }
            this.element.appendChild(boldTR);

            for (let i = 0; i < this.getMax; i++) {
                let tr = document.createElement("tr");
                for (let actor of Object.keys(this.memory)) {
                    let td = document.createElement("td");
                    let namesOfCast = Array.from(this.memory[actor]);
                    namesOfCast.sort((a, b) => a.name - b.name);
                    td.textContent = undefined;
                    if(namesOfCast[i] !== undefined){
                        td.textContent = namesOfCast[i].name;
                        

                        td.addEventListener("click", function(){
                            if(namesOfCast[i].element.classList.contains("highlighted")){
                                namesOfCast[i].element.classList.remove("highlighted");
                            } else {
                                namesOfCast[i].element.classList.add("highlighted");
                                setTimeout(()=>{
                                    if(namesOfCast[i].element.classList.contains("highlighted")) namesOfCast[i].element.classList.remove("highlighted");
                                }, 4000);
                            }
                        });


                    }

                    tr.appendChild(td);
                }
                this.element.appendChild(tr);
            }


            return this;
        }

        get getMax() {
            let maxLength = 0;
            for (let key of Object.keys(this.memory)) {
                maxLength = Math.max(maxLength, this.memory[key].size);
            }


            return maxLength;
        }

    }




    var listOfObjects = [];
    let table = new Table()
    table.config().init();

    const characters = document.querySelectorAll("div[id^='charid_'], div[id^='crtid_']");


    for (let i = 0; i < characters.length; i++) {
        listOfObjects.push(new Label(characters[i], i, table));
    }


    let myStyle = document.createElement("style");
    myStyle.innerHTML = `
.highlighted {
    animation: mymove 8s infinite;
    animation-timing-function: linear;
  }
@keyframes mymove {
  0% {box-shadow: 0px 0px 0px 2px white;}
  25% {box-shadow: 0 0 0px 4px black;}
  50% {box-shadow: 0 0 0px 6px white;}
  75% {box-shadow: 0 0 0px 8px black;}
  100% {box-shadow: 0 0 0px 10px white;}
}`
    document.head.appendChild(myStyle);

})();
