// ==UserScript==
// @name         roleManagement
// @namespace    https://github.com/James159758
// @match        https://anidb.net/episode/*
// @require      https://cdn.jsdelivr.net/npm/ag-grid-enterprise@33.0.4/dist/ag-grid-enterprise.js
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
                this.element.setAttribute("list", "suggestions");

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
            changeValue(newValue){
                this.element.value = newValue;


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


                this.dataList = document.createElement("datalist");
                document.body.appendChild(this.dataList);


                return this;
            }
            config() {
                this._iframe.style["width"] = "100%";
                this._iframe.style["height"] = "100%";

                this.dataList.setAttribute("id", "suggestions");


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
                this.refreshTable();
                this.refreshDataList();


                return this;
            }

            refreshTable() {
                this.table.textContent = "";

                let gridOptions = {
                    onCellValueChanged: (event) => {
                        let oldValue = event.oldValue;
                        let newValue = event.newValue;
                        let keyValue = event.data.hiddenField;

                        this.manageData(oldValue, keyValue, "remove");
                        keyValue.input.changeValue(newValue);
                        if(newValue !== null){
                            this.manageData(newValue, keyValue, "update");
                        }

                        


                    },
                    groupDefaultExpanded: 1,
                    defaultColDef: {
                        cellStyle: {
                            'text-align': 'center',
                            'display': 'flex',
                            'align-items': 'center',
                            'justify-content': 'center'
                        },
                        unSortIcon: true,
                    },
                    columnDefs: [{
                        field: "Image",
                        autoHeight: true,
                        comparator: (valueA, valueB) => {
                            return (valueA === undefined) ? -1 : 1;
                        },
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
                                imagePreview.setAttribute("style", `top: ${e.pageY + 30}px; left: ${e.pageX + 50}px;`);

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
                        editable: true,
                        rowGroup: true,
                    }],
                    rowData: [],
                    groupDisplayType: 'singleColumn',
                };



                for (let nameCasting of Object.keys(this.memory)) {
                    Array.from(this.memory[nameCasting]).forEach((element) => {
                        let obj = {
                            "Image": element.image,
                            "Sex": element.sex,
                            "Name of Character": element.name,
                            "Group": element.group,
                            "Casting": nameCasting,
                            hiddenField: element,
                        };




                        gridOptions["rowData"].push(obj);
                    });

                }

                console.log(gridOptions)
                
                agGrid.createGrid(this.table, gridOptions);


                return this;
            }



            refreshDataList(){
                this.dataList.textContent = "";

                for (let nameCasting of Object.keys(this.memory)) {
                    const _option = document.createElement("option");
                    _option.setAttribute("value", nameCasting);

                    this.dataList.appendChild(_option);
                }


                return this;
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
