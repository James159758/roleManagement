// ==UserScript==
// @name         roleManagement
// @namespace    https://github.com/James159758
// @match        https://anidb.net/episode/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/ag-grid/33.0.3/ag-grid-community.js
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
            this.element.style.setProperty("border-radius", "20px");


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
        constructor(element, id, table, group) {
            this.element = element;
            this.id = id;
            this.table = table;
            this.group = group;
            this.input = new Input(this, this.id, this.table).config().init();


            return this;
        }
        get name() {
            console.log(this.group);
            return this.element.querySelector("span[itemprop='name']")?.textContent;
        }
        get image() {
            return this.element.querySelector("img")?.src;
        }
        get sex(){
            let result = undefined;
            let getSex = this.element.querySelector("div[class='general']")?.innerText;

            if(getSex.includes("female")){
                result = "female";
            } else if(getSex.includes("male")){
                result = "male";
            }

            return result;
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
                    },
                    comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                        //console.log(valueA, valueB, nodeA, nodeB, isDescending);
                        if (valueA == valueB) return 0;
                        return (valueA !== undefined) ? 1 : -1;
                    },
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
                            imagePreview.setAttribute("style", `top: ${e.screenY-(e.screenY*0.75)}px; left: ${e.screenX+(e.screenX * 0.30)}px;`);

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
                    },

                }, {
                    field: "Name of Character",
                }, {
                    field: "Sex",
                }, {
                    field: "Group",
                }, {
                    field: "Casting",
                }],
                rowData: [],
            };

            for (let nameCasting of Object.keys(this.memory)) {
                Array.from(this.memory[nameCasting]).forEach((element) => {
                    let obj = {
                        "Image": element.image,
                        "Sex": element.sex,
                        "Name of Character": element.name,
                        "Group": element.group,
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

    const containerCharacter = document.querySelector("div[class='container ']");

    const groupCharacter = containerCharacter?.querySelectorAll("div[class^='g_section']");

    groupCharacter?.forEach((group) => {
        console.log(group);
        const nameOfGroup = group.querySelector("h6")?.textContent;
        const characters = group.querySelectorAll("div[id^='charid_'], div[id^='crtid_']");
        for (let i = 0; i < characters.length; i++) {
            listOfObjects.push(new Label(characters[i], i, table, nameOfGroup));
        }

    });






})();
