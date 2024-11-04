    // ==UserScript==
    // @name         role management
    // @namespace    http://tampermonkey.net/
    // @match        https://anidb.net/episode/*
    // @grant        none
    // ==/UserScript==

    (function() {
    function inputInformation(event, flag) {
        const inputElement = event.target;
        const nameOfActor = inputElement.value;
        const dataId = inputElement.getAttribute("data-myid");
        const previousElement = elements[dataId];
        const nameOfCharacter = previousElement.querySelector("span[itemprop='name']").textContent;

        if (!dictOfActors.hasOwnProperty(nameOfActor)) {
            dictOfActors[nameOfActor] = new Set();
        }
        if (flag == 'update') {

            if (!dictOfActors[nameOfActor].has(dataId)) {
                dictOfActors[nameOfActor].add(dataId)
            }

        } else if (flag == 'remove') {
            if (dictOfActors[nameOfActor].has(dataId)) {
                dictOfActors[nameOfActor].delete(dataId);
                if (dictOfActors[nameOfActor].size == 0) {
                    delete dictOfActors[nameOfActor];
                }
            }
        }
        refreshInformation();

        return null;
    }


    function getMax(dictOfActors) {
        maxCount = 0;
        for (actor of Object.keys(dictOfActors)) {
            maxCount = Math.max(maxCount, dictOfActors[actor].size);
        }
        return maxCount;
    }

    function refreshInformation() {
        mainDIV.innerHTML = "";
        maxLoop = getMax(dictOfActors);
        table = document.createElement("table");
        table.setAttribute("class", "mytable")
        boldTR = document.createElement("tr");
        for (let actor of Object.keys(dictOfActors)) {
            th = document.createElement("th");
            th.setAttribute("class", "myclass");
            th.textContent = actor;
            th.addEventListener("click", function(){
                let name = this.textContent;
                arrayIDs = Array.from(dictOfActors[name]);
                arrayIDs.sort((a, b) => a - b);
                if(arrayIDs.some(x => elements[x].classList.contains("highlighted"))){
                    arrayIDs.map(x => elements[x].classList.remove("highlighted"));
                } else {
                    arrayIDs.map(x => elements[x].classList.add("highlighted"));
                }
            });
            boldTR.appendChild(th)
        }
        table.appendChild(boldTR);
        for (let i = 0; i < maxLoop; i++) {
            tr = document.createElement("tr");
            for (actor of Object.keys(dictOfActors)) {
                td = document.createElement("td");
                td.setAttribute("class", "myclass");
                nameOfCharacter = "";
                arrayIDs = Array.from(dictOfActors[actor]);
                arrayIDs.sort((a, b) => a - b);
                if (arrayIDs[i] !== undefined) {
                    ID = arrayIDs[i];
                    element = elements[ID];
                    nameOfCharacter = element.querySelector("span[itemprop='name']").textContent;
                    td.setAttribute("data-idch", ID);
                    td.addEventListener("click", function() {
                        let idch = this.getAttribute('data-idch');
                        let mElement = elements[idch];
                        mElement.classList.add("highlighted");
                        setTimeout(function() {
                            console.log(mElement);
                            mElement.classList.remove("highlighted");
                        }, 4000);
                    });
                }
                td.textContent = nameOfCharacter;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        mainDIV.appendChild(table);
    }

    function addingElements() {
        elements = document.querySelectorAll(MODAL_SELECTOR);
        for (let i = 0; i < elements.length; i++) {
            inputE = document.createElement("input");
            inputE.setAttribute('type', 'text');
            inputE.setAttribute("class", "myinput");
            inputE.setAttribute("data-myID", String(i));
            inputE.addEventListener('focus', ((event) => inputInformation(event, "remove")));
            inputE.addEventListener('focusout', ((event) => inputInformation(event, "update")));
            elements[i].appendChild(inputE);
        }
    }

    function changing(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const modalElement = document.querySelector(MODAL_SELECTOR);
                if (modalElement) {
                    observer.disconnect();
                    let myStyle = document.createElement("style");
                    myStyle.innerHTML = `
    .myinput {
        text-align: center;
        font-weight: bold;
        border: none;
        border-radius: 0px;
    }
    .mytable {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }
    .myclass {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
    }
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
}
    `;

                    document.head.appendChild(myStyle);
                    addingElements();
                    break;
                }
            }
        }
    }

    const observer = new MutationObserver(changing);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    var dictOfActors = new Object();
    const myID = "dontlookathere";
    const mainDIV = document.createElement("div");
    mainDIV.setAttribute("data-myID", myID);
    document.body.appendChild(mainDIV);
    const MODAL_SELECTOR = "div[class='g_bubble stripe medium']";
    console.log("Observer started.");
})();
