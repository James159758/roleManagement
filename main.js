// ==UserScript==
// @name         roleManagement
// @namespace    http://tampermonkey.net/
// @match        https://anidb.net/episode/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/ag-grid/33.0.3/ag-grid-community.min.js
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
            return this.element.querySelector("span[itemprop='name']")?.textContent;
        }
        get image() {
            return this.element.querySelector("img")?.src;
        }
        get sex(){
            return this.element.querySelector("div[class='general']")?.innerText.includes("female") ? "female" : "male";
        }
    }


    class Table {
        constructor() {
            this.memory = new Object();

            this._iframe = document.createElement("iframe");
            document.body.appendChild(this._iframe);

            this.document = this._iframe.contentWindow.document;
            this.table = this.document.createElement("div");
            this.document.body.appendChild(this.table);



            return this;
        }
        config() {
            this._iframe.style["width"] = "100%";
            this._iframe.style["height"] = "100%";


            return this;
        }
        init() {
            (this.element);


            return this;
        }
        manageData(key, value, flag) {
            if(key == "") return this;
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
            this.table.textContent = "";

            let gridOptions = {
                defaultColDef: {
                    cellStyle: {
                        'text-align': 'center',
                        'display': 'flex',
                        'align-items': 'center',
                        'justify-content': 'center'
                    }
                },
                columnDefs: [{
                    field: "Image",
                    autoHeight: true,
                    cellRenderer: params => {
                        if(params.value === undefined) return undefined
                        const img = document.createElement('img');
                        img.src = params.value;
                        img.style.width = '50%';
                        img.style.height = '50%';
                        img.addEventListener("mouseenter", function(e){
                            console.log(e);
                            let imagePreview = document.createElement("div")
                            imagePreview.setAttribute("id", "imagepreview");
                            imagePreview.setAttribute("class", "g_bubble");
                            imagePreview.setAttribute("style", `top: ${e.pageY}px; left: ${e.pageX+30}px;`);

                            let imgContainer = document.createElement("img");
                            imgContainer.setAttribute("class", "g_image");
                            imgContainer.setAttribute("alt", "Image Prevew");
                            imgContainer.src = e.srcElement.src.replace(".jpg-thumb","");
                            imagePreview.appendChild(imgContainer);


                            document.body.appendChild(imagePreview);
                        });
                        img.addEventListener("mouseout", function(e){
                            console.log("onmouseout", e);
                            document.querySelectorAll("#imagepreview").forEach((e) => e?.remove());
                        });

                        return img;
                    }

                }, {
                    field: "Name of Character",
                }, {
                    field: "Sex"
                }, {
                    field: "Casting"
                }],
                rowData: [],
            };

            for (let nameCasting of Object.keys(this.memory)) {
                Array.from(this.memory[nameCasting]).forEach((element) => {
                    let obj = {
                        "Image": element.image,
                        "Sex": element.sex,
                        "Name of Character": element.name,
                        "Casting": nameCasting,
                    };




                    gridOptions["rowData"].push(obj);
                });

            }

            console.log(gridOptions)


            agGrid.createGrid(this.table, gridOptions);



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
